package com.cropdeal.request.controller;

import com.cropdeal.request.dto.ReceiptDTO;
import com.cropdeal.request.entity.CropRequest;
import com.cropdeal.request.service.RequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/requests")
@RequiredArgsConstructor
public class RequestController {

    private final RequestService service;

    // Dealer creates a new request (dealer sends X-User-Id header)
    @PostMapping
    public ResponseEntity<?> create(
            @RequestHeader("X-User-Id") String userId,
            @RequestBody Map<String, Object> body) {
        try {
            Long cropId = Long.valueOf(body.get("cropId").toString());
            Double quantity = Double.valueOf(body.get("quantity").toString());
            Double offeredPrice = body.get("offeredPrice") != null
                    ? Double.valueOf(body.get("offeredPrice").toString())
                    : 0.0;

            CropRequest saved = service.createRequest(userId, cropId, quantity, offeredPrice);
            return ResponseEntity.ok(Map.of("message", "Request created", "request", saved));
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }
    }

    // Role-aware: fetch requests for current user
    @GetMapping("/my")
    public ResponseEntity<?> getMyRequests(
            @RequestHeader("X-User-Role") String role,
            @RequestHeader("X-User-Id") String userId) {

        try {
            Long id = Long.valueOf(userId);
            List<CropRequest> result;

            switch (role.toUpperCase()) {
                case "FARMER":
                    result = service.findByFarmerId(id);
                    break;
                case "DEALER":
                    result = service.findByDealerId(id);
                    break;
                case "ADMIN":
                    result = service.findAll();
                    break;
                default:
                    return ResponseEntity.status(403)
                            .body(Map.of("message", "Unsupported role: " + role));
            }

            return ResponseEntity.ok(result);
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }
    }

    // Update request status (e.g., APPROVED, REJECTED)
    @PutMapping("/{id}/status/{status}")
    public ResponseEntity<?> updateStatusPath(@PathVariable Long id, @PathVariable String status) {
        try {
            CropRequest updated = service.updateStatus(id, status);
            return ResponseEntity.ok(Map.of("message", "Updated", "request", updated));
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }
    }

    // Mark request as complete (finalized by farmer/dealer)
    @PutMapping("/{id}/complete")
    public ResponseEntity<?> complete(
            @PathVariable Long id,
            @RequestParam double pricePerUnit,
            @RequestHeader(value = "X-User-Role", required = false) String role,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        try {
            CropRequest saved = service.complete(id, pricePerUnit, role, userId);
            return ResponseEntity.ok(saved);
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }
    }

    // Generate receipt for completed request
    @GetMapping("/{id}/receipt")
    public ResponseEntity<?> receipt(@PathVariable Long id) {
        try {
            ReceiptDTO dto = service.receipt(id);
            return ResponseEntity.ok(dto);
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }
    }

    // Get single request by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getRequest(@PathVariable Long id) {
        return service.findById(id)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(404).body(Map.of("message", "Not found")));
    }

    // Farmer-based list
    @GetMapping("/farmer/{farmerId}")
    public ResponseEntity<?> forFarmer(@PathVariable Long farmerId) {
        return ResponseEntity.ok(service.findByFarmerId(farmerId));
    }

    // Dealer-based list
    @GetMapping("/dealer/{dealerId}")
    public ResponseEntity<?> forDealer(@PathVariable Long dealerId) {
        return ResponseEntity.ok(service.findByDealerId(dealerId));
    }

    // JSON-body based status update
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        try {
            String status = body.get("status");
            CropRequest updated = service.updateStatus(id, status);
            return ResponseEntity.ok(Map.of("message", "Updated", "request", updated));
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }
    }
}
