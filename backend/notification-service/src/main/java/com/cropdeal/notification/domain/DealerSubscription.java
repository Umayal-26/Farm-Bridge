package com.cropdeal.notification.domain;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "dealer_subscriptions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DealerSubscription {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long dealerId;

    @Column(nullable = false)
    private String cropName; // lowercased key (e.g., "tomato")
}
