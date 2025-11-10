package com.cropdeal.notification.service;

import com.cropdeal.notification.domain.Notification;
import com.cropdeal.notification.repository.NotificationRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository repo;

    public NotificationService(NotificationRepository repo) {
        this.repo = repo;
    }

    public List<Notification> getForDealer(Long dealerId) {
        return repo.findByDealerIdOrderByCreatedAtDesc(dealerId);
    }

    public void markAsRead(Long id, Long dealerId) {
        Notification n = repo.findById(id)
            .orElseThrow(() -> new RuntimeException("Notification not found"));
        if (!n.getDealerId().equals(dealerId)) {
            throw new RuntimeException("Not your notification");
        }
        n.setReadFlag(true);
        repo.save(n);
    }
}
