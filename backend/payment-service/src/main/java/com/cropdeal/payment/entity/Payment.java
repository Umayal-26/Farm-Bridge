package com.cropdeal.payment.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "payment")
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long requestId;         // <-- NEW
    private Long dealerId;
    private Long farmerId;
    private Long cropId;
    private Double amount;
    private String status; // SUCCESS, FAILED, PENDING
    private LocalDateTime paymentDate = LocalDateTime.now();
}
