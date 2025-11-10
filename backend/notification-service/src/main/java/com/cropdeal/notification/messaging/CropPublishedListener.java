package com.cropdeal.notification.messaging;

import com.cropdeal.notification.config.RabbitConfig;
import com.cropdeal.notification.domain.Notification;
import com.cropdeal.notification.events.CropPublishedEvent;
import com.cropdeal.notification.repository.DealerSubscriptionRepository;
import com.cropdeal.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.List;

@Component
@RequiredArgsConstructor
public class CropPublishedListener {

    private final DealerSubscriptionRepository subscriptionRepo;
    private final NotificationRepository notificationRepo;

    @RabbitListener(queues = RabbitConfig.NOTIFY_QUEUE)
    public void onCropPublished(CropPublishedEvent event) {
        System.out.println("📩 Received crop published event for: " + event.getName());

        List<com.cropdeal.notification.domain.DealerSubscription> subscriptions =
            subscriptionRepo.findByCropNameIgnoreCase(event.getName());

        if (subscriptions == null || subscriptions.isEmpty()) {
            System.out.println("ℹ️ No subscribers for crop: " + event.getName());
            return;
        }

        for (var sub : subscriptions) {
            Notification n = Notification.builder()
                .dealerId(sub.getDealerId())
                .title("New crop available: " + event.getName())
                .body("Type: " + event.getType()
                    + " | Location: " + event.getLocation()
                    + " | Price: ₹" + event.getPricePerUnit()
                    + " | Qty: " + event.getQuantity())
                .createdAt(Instant.now())
                .readFlag(false)
                .build();
            notificationRepo.save(n);
        }

        System.out.println("📢 Notified " + subscriptions.size() + " dealers for crop: " + event.getName());
    }
}
