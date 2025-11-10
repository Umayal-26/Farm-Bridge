package com.cropdeal.notification.events;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CropPublishedEvent {
    private Long cropId;        // ✅ matches crop-service
    private String name;
    private String type;
    private Double quantity;
    private String location;
    private Double pricePerUnit;
    private Long farmerId;
    private Instant publishedAt;
}
