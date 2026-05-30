package com.example.graduationproject.service.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class OrderDetailResponse {
    private String orderId;
    private String orderCode;
    private LocalDateTime createdAt;
    private String status;
    private BigDecimal subtotal;
    private BigDecimal shippingFee;
    private BigDecimal discount;
    private BigDecimal promotionDiscount;
    private BigDecimal couponDiscount;
    private BigDecimal finalPrice;
    private String couponCode;
    private String note;

    private String customerName;
    private String customerEmail;
    private String customerPhone;

    private String recipientName;
    private String recipientPhone;
    private String shippingAddress;
    private String shippingMethod;
    private String shippingStatus;

    private String paymentMethod;
    private String paymentStatus;
    private BigDecimal paymentAmount;

    private List<OrderItemDetailResponse> items;
}
