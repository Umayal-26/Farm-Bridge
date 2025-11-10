// payment-service/src/main/java/com/cropdeal/payment/controller/AdminPaymentController.java
package com.cropdeal.payment.controller;

import com.cropdeal.payment.entity.Payment;
import com.cropdeal.payment.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.DateTimeException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payments/admin")
@RequiredArgsConstructor
public class AdminPaymentController {

    private final PaymentRepository repo;

    @GetMapping
    public List<Payment> all() {
        return repo.findAll();
    }

    /**
     * GET /api/payments/admin/range?from=yyyy-MM-ddTHH:mm[:ss]&to=...
     */
    @GetMapping("/range")
    public ResponseEntity<?> byRange(@RequestParam String from, @RequestParam String to) {
        try {
            LocalDateTime f = parseToLocalDateTime(from);
            LocalDateTime t = parseToLocalDateTime(to);

            if (t.isBefore(f)) {
                return ResponseEntity.badRequest().body(Map.of("message", "'to' must be >= 'from'"));
            }

            List<Payment> rows = repo.findByPaymentDateBetween(f, t);
            return ResponseEntity.ok(rows);
        } catch (IllegalArgumentException | DateTimeException ex) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", "Invalid date format. Use yyyy-MM-ddTHH:mm or yyyy-MM-ddTHH:mm:ss", "error", ex.getMessage())
            );
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.internalServerError().body(
                    Map.of("message", "Server error while fetching payments", "error", ex.getMessage())
            );
        }
    }

    private LocalDateTime parseToLocalDateTime(String s) {
        if (s == null || s.isBlank()) throw new IllegalArgumentException("Missing date value");
        // append seconds if client provided only yyyy-MM-ddTHH:mm
        String normalized = s.matches(".*T\\d{2}:\\d{2}$") ? s + ":00" : s;
        return LocalDateTime.parse(normalized);
    }
}
