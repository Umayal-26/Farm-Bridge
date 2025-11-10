package com.cropdeal.payment.controller;

import com.cropdeal.payment.entity.Payment;
import com.cropdeal.payment.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")   // <-- match gateway's forwarded path
@RequiredArgsConstructor
public class PaymentQueryController {

    private final PaymentRepository repo;

    @GetMapping("/dealer/{id}")
    public ResponseEntity<List<Payment>> byDealer(@PathVariable Long id) {
        return ResponseEntity.ok(repo.findByDealerId(id));
    }

    @GetMapping("/farmer/{id}")
    public ResponseEntity<List<Payment>> byFarmer(@PathVariable Long id) {
        return ResponseEntity.ok(repo.findByFarmerId(id));
    }

    // Dealer-friendly endpoint used by Angular
    @GetMapping("/dealer/my")
    public ResponseEntity<?> myDealerPayments(
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        if (userId == null || userId.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Missing X-User-Id header"));
        }
        try {
            Long dealerId = Long.valueOf(userId);
            return ResponseEntity.ok(repo.findByDealerId(dealerId));
        } catch (NumberFormatException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid dealer ID"));
        }
    }

    // Farmer-friendly endpoint (optional)
    @GetMapping("/farmer/my")
    public ResponseEntity<?> myFarmerPayments(
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        if (userId == null || userId.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Missing X-User-Id header"));
        }
        try {
            Long farmerId = Long.valueOf(userId);
            return ResponseEntity.ok(repo.findByFarmerId(farmerId));
        } catch (NumberFormatException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid farmer ID"));
        }
    }
}
