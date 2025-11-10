package com.cropdeal.payment.service;

import com.cropdeal.payment.config.RabbitConfig;
import com.cropdeal.payment.entity.Payment;
import com.cropdeal.payment.events.PaymentCompletedEvent;
import com.cropdeal.payment.repository.PaymentRepository;
import com.cropdeal.payment.util.JwtUtil;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@Service
public class PaymentService {

    private final PaymentRepository repo;
    private final RabbitTemplate rabbitTemplate;
    private final JwtUtil jwtUtil;

    public PaymentService(PaymentRepository repo, RabbitTemplate rabbitTemplate, JwtUtil jwtUtil) {
        this.repo = repo;
        this.rabbitTemplate = rabbitTemplate;
        this.jwtUtil = jwtUtil;
    }

    /**
     * makePayment:
     * - Accepts either authHeader (preferred) OR xUserIdHeader as fallback.
     * - If JWT present, validates role from token (must be DEALER).
     * - If JWT absent but xUserIdHeader present, trusts that caller as dealerId (dev fallback).
     */
    public Map<String, Object> makePayment(Payment payment, String authHeader, String xUserIdHeader) {
        try {
            Long dealerId = null;
            String role = null;

            // Prefer JWT if provided and non-empty
            if (authHeader != null && !authHeader.isBlank()) {
                String token = authHeader.startsWith("Bearer ") ? authHeader.substring(7) : authHeader;
                dealerId = jwtUtil.extractUserId(token);
                role = jwtUtil.extractRole(token);
            } else if (xUserIdHeader != null && !xUserIdHeader.isBlank()) {
                // dev fallback: accept X-User-Id and treat as dealer
                dealerId = Long.valueOf(xUserIdHeader);
                role = "DEALER";
            }

            if (dealerId == null) {
                throw new IllegalArgumentException("Missing dealer identification: provide Authorization header or X-User-Id.");
            }

            if (!"DEALER".equalsIgnoreCase(role)) {
                throw new RuntimeException("Only DEALER can make payments.");
            }

            // Validate input
            if (payment.getFarmerId() == null) {
                throw new IllegalArgumentException("Farmer ID is required.");
            }
            if (payment.getCropId() == null) {
                throw new IllegalArgumentException("Crop ID is required.");
            }
            if (payment.getAmount() == null || payment.getAmount() <= 0) {
                throw new IllegalArgumentException("Amount must be greater than zero.");
            }

            // Assign dealer ID and status
            payment.setDealerId(dealerId);
            payment.setStatus("SUCCESS");

            Payment saved = repo.save(payment);

            PaymentCompletedEvent event = new PaymentCompletedEvent(
                    saved.getId(),
                    saved.getRequestId(),
                    saved.getDealerId(),
                    saved.getFarmerId(),
                    saved.getCropId(),
                    saved.getAmount(),
                    saved.getStatus(),
                    Instant.now()
            );

            String routingKey = RabbitConfig.PAYMENT_ROUTE_COMPLETED + "." + saved.getId();

            rabbitTemplate.convertAndSend(
                    RabbitConfig.PAYMENT_EXCHANGE,
                    routingKey,
                    event
            );

            return Map.of("message", "Payment successful", "paymentId", saved.getId());

        } catch (IllegalArgumentException iae) {
            // rethrow to controller for 400
            throw iae;
        } catch (RuntimeException re) {
            // rethrow for controller to handle role / business errors
            throw re;
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Payment processing failed: " + e.getMessage());
        }
    }

    public List<Payment> getAllPayments() {
        return repo.findAll();
    }
}
