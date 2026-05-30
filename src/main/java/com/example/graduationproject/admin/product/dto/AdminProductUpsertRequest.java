package com.example.graduationproject.admin.product.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
public class AdminProductUpsertRequest {
    @NotBlank(message = "Product name is required")
    private String name;

    @NotBlank(message = "Product slug is required")
    private String slug;

    @NotNull(message = "Brand is required")
    private String brandId;

    @NotNull(message = "Category is required")
    private String categoryId;

    private String description;

    @NotNull(message = "Base price is required")
    @DecimalMin(value = "0.00", message = "Base price must be >= 0")
    private BigDecimal basePrice;

    @NotBlank(message = "Product status is required")
    private String status;

    private String imageUrl;

    @Valid
    @NotEmpty(message = "At least one variant is required")
    private List<AdminProductVariantRequest> variants;
}
