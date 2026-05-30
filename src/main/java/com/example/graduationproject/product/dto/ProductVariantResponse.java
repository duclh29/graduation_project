package com.example.graduationproject.product.dto;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
public class ProductVariantResponse {
    private final String id;
    private final String sku;
    private final String color;
    private final String size;
    private final Integer stockQuantity;
    private final BigDecimal price;
    private final BigDecimal salePrice;
    private final String imageUrl;
}
