// request-service/src/main/java/com/cropdeal/request/listener/PaymentEventListener.java
package com.cropdeal.request.listener;

import com.cropdeal.request.config.RabbitConfig;
import com.cropdeal.request.entity.CropRequest;
import com.cropdeal.request.events.PaymentCompletedEvent;
import com.cropdeal.request.repository.CropRequestRepository;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Map;

@Component
public class PaymentEventListener {

    private final CropRequestRepository repo;
    private final RestTemplate rest;
    // service base - same as RequestService uses
    private final String cropBase = "http://CROP-SERVICE";

    public PaymentEventListener(CropRequestRepository repo, RestTemplate restTemplate) {
        this.repo = repo;
        this.rest = restTemplate;
    }

    /**
     * Listen on the queue defined in RabbitConfig
     * When payment event arrives:
     *  - mark the request as COMPLETED
     *  - call Crop Service to reduce the crop quantity
     */
    @RabbitListener(queues = RabbitConfig.PAYMENT_QUEUE)
    @Transactional
    public void onPaymentCompleted(PaymentCompletedEvent event) {
        System.out.println("🎯 Received PaymentCompletedEvent: " + event);

        Long requestId = event.getRequestId();
        Double amount = event.getAmount();

        if (requestId == null) {
            System.err.println("⚠️ Payment event missing requestId, skipping update");
            return;
        }

        Optional<CropRequest> optional = repo.findById(requestId);
        if (optional.isPresent()) {
            CropRequest request = optional.get();

            // mark completed on request
            request.setStatus("COMPLETED");
            request.setTotalAmount(amount);
            request.setCompletedAt(LocalDateTime.now());
            repo.save(request);
            System.out.println("✅ Request " + requestId + " marked as COMPLETED.");

            // now reduce crop quantity in Crop Service
            Long cropId = request.getCropId();
            Double qty = request.getQuantity() == null ? 0.0 : request.getQuantity();

            if (cropId == null) {
                System.err.println("⚠️ Request " + requestId + " has null cropId; cannot reduce crop quantity.");
                return;
            }

            if (qty <= 0) {
                System.out.println("ℹ️ Request " + requestId + " quantity is zero; nothing to reduce.");
                return;
            }

            try {
                // call Crop Service: POST /crops/{id}/reduce?qty={qty}
                String url = cropBase + "/crops/" + cropId + "/reduce?qty=" + qty;
                Map res = rest.postForObject(url, null, Map.class);
                System.out.println("➡️ Crop service reduce response: " + res);
            } catch (RestClientException rex) {
                // Do not throw — just log. The request is already saved as COMPLETED.
                System.err.println("❌ Failed to call Crop Service to reduce quantity for cropId="
                        + cropId + ": " + rex.getMessage());
            }
        } else {
            System.err.println("❌ No matching request found for requestId " + requestId);
        }
    }
}
