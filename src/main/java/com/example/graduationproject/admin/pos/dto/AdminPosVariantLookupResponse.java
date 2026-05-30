package com.example.graduationproject.admin.pos.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminPosVariantLookupResponse {
    private String productId;
    private String productName;
    private String variantId;
    private String sku;
    private String size;
    private String color;
    private Integer stockQuantity;
    private String status;
    private BigDecimal price;
    private String imageUrl;
}
