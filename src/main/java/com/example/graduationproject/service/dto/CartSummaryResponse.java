package com.example.graduationproject.service.dto;

import java.math.BigDecimal;
import java.util.List;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CartSummaryResponse {
    private final String cartId;
    private final String userId;
    private final String couponCode;
    private final BigDecimal subtotal;
    private final BigDecimal promotionDiscount;
    private final BigDecimal couponDiscount;
    private final BigDecimal finalPrice;
    private final List<OrderPricingItemResponse> items;
}
