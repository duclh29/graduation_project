package com.example.graduationproject.admin.product.dto;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class AdminProductResponse {
    private final String id;
    private final String name;
    private final String slug;
    private final String brandId;
    private final String brandName;
    private final String categoryId;
    private final String categoryName;
    private final String description;
    private final BigDecimal basePrice;
    private final Integer totalQuantity;
    private final String sizes;
    private final String status;
    private final String imageUrl;
    private final LocalDateTime createdAt;
    private final LocalDateTime updatedAt;
    private final List<AdminProductVariantResponse> variants;
}
