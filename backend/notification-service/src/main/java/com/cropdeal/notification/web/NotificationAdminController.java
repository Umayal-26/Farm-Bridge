// src/main/java/com/cropdeal/notification/web/NotificationAdminController.java
package com.cropdeal.notification.web;

import com.cropdeal.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class NotificationAdminController {

    private final NotificationRepository repo;

   
    @GetMapping("/all")
    public ResponseEntity<?> all() {
        return ResponseEntity.ok(repo.findAll());
    }

    @GetMapping("/user/{dealerId}")
    public ResponseEntity<?> forUser(@PathVariable Long dealerId) {
      return ResponseEntity.ok(repo.findByDealerIdOrderByCreatedAtDesc(dealerId));
    }
}
