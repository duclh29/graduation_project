package com.example.graduationproject.admin.dashboard.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AdminLowStockVariantResponse {
    private final String variantId;
    private final String productId;
    private final String productName;
    private final String sku;
    private final String color;
    private final String size;
    private final String imageUrl;
    private final int stockQuantity;
}
