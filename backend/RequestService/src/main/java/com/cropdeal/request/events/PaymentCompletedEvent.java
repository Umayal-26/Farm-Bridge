package com.cropdeal.request.events;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.Instant;

@Data @AllArgsConstructor @NoArgsConstructor
public class PaymentCompletedEvent {
    private Long paymentId;
    private Long requestId;
    private Long dealerId;
    private Long farmerId;
    private Long cropId;
    private Double amount;
    private String status;
    private Instant occurredAt;
}
