package com.example.graduationproject.service.dto;

import java.math.BigDecimal;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class OrderPricingItemResponse {
    private final String variantId;
    private final String productId;
    private final String productName;
    private final String brand;
    private final String sku;
    private final String size;
    private final Integer stockQuantity;
    private final String imageUrl;
    private final Integer quantity;
    private final BigDecimal baseUnitPrice;
    private final BigDecimal finalUnitPrice;
    private final BigDecimal lineTotal;
    private final BigDecimal lineDiscount;
}
