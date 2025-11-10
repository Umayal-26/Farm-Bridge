package com.example.crop.dto;

import lombok.Data;

@Data
public class CreateRequestDto {
    private Long cropId;
    private Double offeredPrice;
    private Double quantity;
}
