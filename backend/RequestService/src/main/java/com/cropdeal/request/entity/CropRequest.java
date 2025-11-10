package com.cropdeal.request.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "crop_requests")
public class CropRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "crop_id")
    private Long cropId;

    @Column(name = "crop_name")
    private String cropName;

    @Column(name = "farmer_id")
    private Long farmerId;

    @Column(name = "dealer_id")
    private Long dealerId;

    // offeredPrice: what dealer offered when creating request
    @Column(name = "offered_price")
    private Double offeredPrice;

    @Column(name = "price_per_unit")
    private Double pricePerUnit;  // agreed price (set on complete)

    private Double quantity;

    // PENDING, ACCEPTED, REJECTED, COMPLETED
    private String status;

    @Column(name = "total_amount")
    private Double totalAmount;       // set on complete

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "completed_at")
    private LocalDateTime completedAt;
}
