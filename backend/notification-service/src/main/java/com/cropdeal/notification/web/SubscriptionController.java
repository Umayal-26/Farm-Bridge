package com.cropdeal.notification.web;

import com.cropdeal.notification.domain.DealerSubscription;
import com.cropdeal.notification.dto.SubscriptionRequest;
import com.cropdeal.notification.repository.DealerSubscriptionRepository;
import com.cropdeal.notification.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/subscriptions")
@RequiredArgsConstructor
public class SubscriptionController {

    private final DealerSubscriptionRepository repo;
    private final JwtUtil jwt;

    private Long userIdFromAuth(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) return null;
        return jwt.extractUserId(authHeader.substring(7));
    }

    @PostMapping
    public ResponseEntity<?> subscribe(@RequestHeader("Authorization") String auth,
                                       @RequestBody SubscriptionRequest req) {
        Long dealerId = userIdFromAuth(auth);
        if (dealerId == null) return ResponseEntity.status(401).body("Unauthorized");

        String name = req.getCropName().trim().toLowerCase();
        if (repo.existsByDealerIdAndCropNameIgnoreCase(dealerId, name)) {
            return ResponseEntity.ok().build();
        }
        var saved = repo.save(DealerSubscription.builder().dealerId(dealerId).cropName(name).build());
        return ResponseEntity.ok(saved);
    }

    @GetMapping
    public ResponseEntity<?> mySubscriptions(@RequestHeader("Authorization") String auth) {
        Long dealerId = userIdFromAuth(auth);
        if (dealerId == null) return ResponseEntity.status(401).body("Unauthorized");
        return ResponseEntity.ok(repo.findByDealerId(dealerId));
    }
}
