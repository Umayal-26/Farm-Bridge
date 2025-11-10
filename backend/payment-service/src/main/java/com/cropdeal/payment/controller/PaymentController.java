package com.cropdeal.payment.controller;

import com.cropdeal.payment.entity.Payment;
import com.cropdeal.payment.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService service;
    private final Logger log = LoggerFactory.getLogger(PaymentController.class);

    /**
     * Accepts either:
     *  - Authorization: Bearer <token>
     *  - OR X-User-Id: <id> (dev fallback)
     *
     * We forward both to the service; the service will prefer JWT when present,
     * and fall back to xUserId when JWT is absent.
     */
    @PostMapping
    public ResponseEntity<?> makePayment(@RequestBody Payment payment,
                                         @RequestHeader(value = "Authorization", required = false) String authHeader,
                                         @RequestHeader(value = "X-User-Id", required = false) String xUserIdHeader) {
        try {
            log.info("POST /api/payments - payload={} authHeaderPresent={} xUserId={}",
                    payment, authHeader != null, xUserIdHeader);
            Map<String, Object> result = service.makePayment(payment, authHeader, xUserIdHeader);
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException iae) {
            log.warn("Payment validation failed: {}", iae.getMessage());
            return ResponseEntity.badRequest().body(Map.of("message", iae.getMessage()));
        } catch (RuntimeException re) {
            String msg = re.getMessage() == null ? "Payment processing failed" : re.getMessage();
            log.error("Payment processing error: {}", msg, re);
            if (msg.toLowerCase().contains("amount") || msg.toLowerCase().contains("required")) {
                return ResponseEntity.badRequest().body(Map.of("message", msg));
            }
            if (msg.toLowerCase().contains("only dealer")) {
                return ResponseEntity.status(403).body(Map.of("message", msg));
            }
            return ResponseEntity.status(500).body(Map.of("message", "Payment processing failed: " + msg));
        } catch (Exception ex) {
            log.error("Unexpected error while processing payment", ex);
            return ResponseEntity.status(500).body(Map.of("message", "Payment processing failed"));
        }
    }

    @GetMapping("/all")
    public ResponseEntity<?> allPayments() {
        return ResponseEntity.ok(service.getAllPayments());
    }
}
