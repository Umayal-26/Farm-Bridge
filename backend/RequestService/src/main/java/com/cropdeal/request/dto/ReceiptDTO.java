package com.cropdeal.request.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data @AllArgsConstructor @NoArgsConstructor
public class ReceiptDTO {
    private String receiptNo;
    private Long requestId;
    private Long farmerId;
    private Long dealerId;
    private Long cropId;
    private String cropName;
    private double quantity;
    private double pricePerUnit;
    private double totalAmount;
    private LocalDateTime completedAt;
}
