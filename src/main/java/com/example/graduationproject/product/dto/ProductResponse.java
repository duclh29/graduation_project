package com.example.graduationproject.product.dto;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Builder
public class ProductResponse {
    private final String id;
    private final String name;
    private final String slug;
    private final String brandId;
    private final String brand;
    private final String brandName;
    private final String categoryId;
    private final String category;
    private final String categoryName;
    private final String description;
    private final BigDecimal basePrice;
    private final BigDecimal price;
    private final BigDecimal salePrice;
    private final Integer totalQuantity;
    private final String sizes;
    private final List<String> sizeOptions;
    private final String imageUrl;
    private final String thumbnailUrl;
    private final List<ProductVariantResponse> variants;
}
