package com.example.graduationproject.admin.coupon.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
public class AdminCouponUpsertRequest {
    @NotBlank(message = "Coupon code is required")
    private String code;

    private String description;

    @NotBlank(message = "Coupon type is required")
    private String type;

    @NotNull(message = "Discount value is required")
    @DecimalMin(value = "0.00", message = "Discount value must be >= 0")
    private BigDecimal discountValue;

    private BigDecimal maxDiscountValue;

    private BigDecimal minimumOrderAmount;

    private Integer usageLimit;

    @NotNull(message = "Coupon startAt is required")
    private LocalDateTime startAt;

    @NotNull(message = "Coupon endAt is required")
    private LocalDateTime endAt;

    @NotBlank(message = "Coupon status is required")
    private String status;
}
