package com.example.crop.events;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.Instant;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CropPublishedEvent {

    private Long cropId;
    private String name;           // crop name (e.g. Tomato)
    private String type;           // e.g. Vegetable, Fruit
    private Double quantity;       // available quantity
    private String location;       // farmer location
    private Double pricePerUnit;   // price announced by farmer
    private Long farmerId;         // farmer’s user ID
    private Instant publishedAt = Instant.now();
}
