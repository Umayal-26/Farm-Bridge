package com.cropdeal.notification.web;

import com.cropdeal.notification.repository.NotificationRepository;
import com.cropdeal.notification.service.NotificationService;
import com.cropdeal.notification.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationRepository repo;
    private final NotificationService service;
    private final JwtUtil jwt;

    private Long userIdFromAuth(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) return null;
        String token = authHeader.substring(7);
        return jwt.extractUserId(token);
    }

    @GetMapping
    public ResponseEntity<?> list(@RequestHeader("Authorization") String auth) {
        Long uid = userIdFromAuth(auth);
        if (uid == null) return ResponseEntity.status(401).body("Unauthorized");
        return ResponseEntity.ok(repo.findByDealerIdOrderByCreatedAtDesc(uid));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<?> markRead(@PathVariable Long id,
                                      @RequestHeader("Authorization") String auth) {
        Long uid = userIdFromAuth(auth);
        if (uid == null) return ResponseEntity.status(401).body("Unauthorized");
        service.markAsRead(id, uid);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/unread")
    public ResponseEntity<?> unread(@RequestHeader("Authorization") String auth) {
        Long uid = userIdFromAuth(auth);
        if (uid == null) return ResponseEntity.status(401).body("Unauthorized");
        var unread = repo.findByDealerIdOrderByCreatedAtDesc(uid)
            .stream().filter(n -> !n.isReadFlag()).toList();
        return ResponseEntity.ok(unread);
    }
}
