package com.example.graduationproject.admin.product.dto;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
public class AdminProductVariantResponse {
    private final String id;
    private final String sku;
    private final String color;
    private final String size;
    private final Integer stockQuantity;
    private final BigDecimal additionalPrice;
    private final BigDecimal price;
    private final String imageUrl;
    private final String status;
}
