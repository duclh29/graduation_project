package com.example.graduationproject.service.dto;

import java.math.BigDecimal;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.example.graduationproject.entity.Coupon;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class OrderPricingResult {
    private final BigDecimal subtotal;
    private final BigDecimal promotionDiscount;
    private final BigDecimal couponDiscount;
    private final BigDecimal finalPrice;
    private final String couponCode;
    @JsonIgnore
    private final Coupon appliedCoupon;
    private final List<OrderPricingItemResponse> items;
}
