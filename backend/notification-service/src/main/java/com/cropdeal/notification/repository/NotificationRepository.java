package com.cropdeal.notification.repository;

import com.cropdeal.notification.domain.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByDealerIdOrderByCreatedAtDesc(Long dealerId);
}
