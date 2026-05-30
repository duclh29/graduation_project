package com.example.graduationproject.admin.product.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class AdminProductVariantRequest {
    private String id;

    @NotBlank(message = "Variant SKU is required")
    private String sku;

    @NotBlank(message = "Variant color is required")
    private String color;

    @NotBlank(message = "Variant size is required")
    private String size;

    @NotNull(message = "Variant stock quantity is required")
    @Min(value = 0, message = "Variant stock quantity must be >= 0")
    private Integer stockQuantity;

    @NotNull(message = "Variant additional price is required")
    @DecimalMin(value = "0.00", message = "Variant additional price must be >= 0")
    private BigDecimal additionalPrice;

    private String imageUrl;

    private String status;
}
