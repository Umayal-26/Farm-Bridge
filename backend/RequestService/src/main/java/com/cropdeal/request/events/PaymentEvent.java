package com.cropdeal.request.events;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.Instant;

@Data @AllArgsConstructor @NoArgsConstructor
public class PaymentEvent {
    private Long requestId;
    private Long farmerId;
    private Long dealerId;
    private Double amount;
    private Instant occurredAt;
}
