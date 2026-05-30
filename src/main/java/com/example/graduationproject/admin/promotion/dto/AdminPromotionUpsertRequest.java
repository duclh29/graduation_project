package com.example.graduationproject.admin.promotion.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
public class AdminPromotionUpsertRequest {
    @NotBlank(message = "Promotion name is required")
    private String name;

    private String code;

    private String description;

    @NotBlank(message = "Promotion type is required")
    private String type;

    @NotNull(message = "Discount value is required")
    @DecimalMin(value = "0.00", message = "Discount value must be >= 0")
    private BigDecimal discountValue;

    private BigDecimal maxDiscountValue;

    @NotNull(message = "Promotion startAt is required")
    private LocalDateTime startAt;

    @NotNull(message = "Promotion endAt is required")
    private LocalDateTime endAt;

    @NotBlank(message = "Promotion status is required")
    private String status;

    @NotEmpty(message = "At least one product is required")
    private List<String> productIds;

    private List<String> variantIds;
}
