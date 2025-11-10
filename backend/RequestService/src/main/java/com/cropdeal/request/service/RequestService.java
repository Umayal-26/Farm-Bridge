package com.cropdeal.request.service;

import com.cropdeal.request.config.RabbitConfig;
import com.cropdeal.request.dto.ReceiptDTO;
import com.cropdeal.request.entity.CropRequest;
import com.cropdeal.request.events.PaymentEvent;
import com.cropdeal.request.repository.CropRequestRepository;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class RequestService {

    private final CropRequestRepository repo;
    private final RestTemplate rest;
    private final RabbitTemplate rabbit;

    // Use Eureka name instead of port
    private final String cropBase = "http://CROP-SERVICE";

    public RequestService(CropRequestRepository repo, RestTemplate restTemplate, RabbitTemplate rabbitTemplate) {
        this.repo = repo;
        this.rest = restTemplate;
        this.rabbit = rabbitTemplate;
    }

    public java.util.List<CropRequest> findAll() { return repo.findAll(); }

    // Backward compatible createRequest without offeredPrice (keeps older clients working)
    public CropRequest createRequest(String xUserId, Long cropId, Double quantity) throws Exception {
        return createRequest(xUserId, cropId, quantity, 0.0);
    }

    // Overload used by controller that includes offeredPrice
    public CropRequest createRequest(String xUserId, Long cropId, Double quantity, Double offeredPrice) throws Exception {
        if (xUserId == null) throw new Exception("Missing X-User-Id header");
        Long dealerId = Long.valueOf(xUserId);

        // fetch crop details
        ResponseEntity<Map> cropRes = rest.getForEntity(cropBase + "/crops/" + cropId, Map.class);
        Map<String, Object> crop = cropRes.getBody();
        if (crop == null || crop.get("farmerId") == null)
            throw new Exception("Crop not found");

        Long farmerId = ((Number) crop.get("farmerId")).longValue();
        String cropName = String.valueOf(crop.get("name"));

        CropRequest r = new CropRequest();
        r.setCropId(cropId);
        r.setCropName(cropName);
        r.setFarmerId(farmerId);
        r.setDealerId(dealerId);
        r.setQuantity(quantity);
        r.setOfferedPrice(offeredPrice);
        r.setStatus("PENDING");
        r.setCreatedAt(LocalDateTime.now());

        return repo.save(r);
    }

    public Optional<CropRequest> findById(Long id) { return repo.findById(id); }
    public java.util.List<CropRequest> findByFarmerId(Long farmerId) { return repo.findByFarmerId(farmerId); }
    public java.util.List<CropRequest> findByDealerId(Long dealerId) { return repo.findByDealerId(dealerId); }

    // Accept both APPROVED and ACCEPTED
    public CropRequest updateStatus(Long id, String status) throws Exception {
        CropRequest r = repo.findById(id).orElseThrow(() -> new Exception("Request not found"));
        String normalized = normalizeStatus(status);
        r.setStatus(normalized);
        return repo.save(r);
    }

    private String normalizeStatus(String status) throws Exception {
        if (status == null) throw new Exception("Status required");
        String s = status.trim().toUpperCase();
        if ("APPROVED".equals(s)) return "ACCEPTED"; // map to internal
        if (List.of("PENDING", "ACCEPTED", "REJECTED", "COMPLETED").contains(s)) return s;
        throw new Exception("Invalid status: " + status);
    }

    /**
     * Mark the request as completed (called by /requests/{id}/complete)
     * This method sets pricePerUnit, totalAmount, status=COMPLETED and
     * publishes a PaymentEvent to RabbitMQ.
     */
    public CropRequest complete(Long id, double pricePerUnit, String xUserRole, String xUserId) throws Exception {
        CropRequest r = repo.findById(id).orElseThrow(() -> new Exception("Request not found"));
        Long callerId = xUserId != null ? Long.valueOf(xUserId) : null;
        if (callerId == null || !(callerId.equals(r.getFarmerId()) || callerId.equals(r.getDealerId()))) {
            throw new Exception("Not authorized to complete this request");
        }

        r.setPricePerUnit(pricePerUnit);
        // if quantity is null, avoid NPE
        double qty = r.getQuantity() == null ? 0.0 : r.getQuantity();
        r.setTotalAmount(pricePerUnit * qty);
        r.setStatus("COMPLETED");
        r.setCompletedAt(LocalDateTime.now());
        CropRequest saved = repo.save(r);

        PaymentEvent evt = new PaymentEvent(saved.getId(), saved.getFarmerId(), saved.getDealerId(),
                saved.getTotalAmount(), Instant.now());
        rabbit.convertAndSend(RabbitConfig.PAYMENT_EXCHANGE, RabbitConfig.PAYMENT_ROUTE_COMPLETED, evt);

        return saved;
    }

    public ReceiptDTO receipt(Long id) throws Exception {
        CropRequest r = repo.findById(id).orElseThrow(() -> new Exception("Request not found"));
        if (!"COMPLETED".equalsIgnoreCase(r.getStatus()))
            throw new Exception("Request not completed yet");

        return new ReceiptDTO(
                "R" + r.getId(),
                r.getId(),
                r.getFarmerId(),
                r.getDealerId(),
                r.getCropId(),
                r.getCropName(),
                r.getQuantity(),
                r.getPricePerUnit() == null ? 0 : r.getPricePerUnit(),
                r.getTotalAmount() == null ? 0 : r.getTotalAmount(),
                r.getCompletedAt()
        );
    }
}
