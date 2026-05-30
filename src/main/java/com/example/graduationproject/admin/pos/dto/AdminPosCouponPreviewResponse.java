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
public class AdminPosCouponPreviewResponse {
    private String couponCode;
    private BigDecimal subtotalAmount;
    private BigDecimal manualDiscount;
    private BigDecimal couponDiscount;
    private BigDecimal discountAmount;
    private BigDecimal finalPrice;
}
