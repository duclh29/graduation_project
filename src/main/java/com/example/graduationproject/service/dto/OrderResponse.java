package com.example.graduationproject.service.dto;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
public class OrderResponse {
    private final String orderId;
    private final String orderCode;
    private final BigDecimal subtotal;
    private final BigDecimal promotionDiscount;
    private final BigDecimal couponDiscount;
    private final BigDecimal shippingFee;
    private final BigDecimal finalPrice;
}
