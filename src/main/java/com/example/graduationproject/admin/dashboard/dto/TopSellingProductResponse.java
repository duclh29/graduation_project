package com.example.graduationproject.admin.dashboard.dto;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
public class TopSellingProductResponse {
    private final String productId;
    private final String productName;
    private final long soldQuantity;
    private final BigDecimal revenue;
    private final String imageUrl;
}
