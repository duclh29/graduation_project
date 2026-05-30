package com.example.graduationproject.admin.order.dto;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Builder
public class AdminOrderListItemResponse {
    private final String id;
    private final String orderCode;
    private final LocalDateTime createdAt;
    private final String status;
    private final String shippingStatus;
    private final String paymentStatus;
    private final String customerName;
    private final String customerEmail;
    private final BigDecimal finalPrice;
    private final Integer totalItems;
}
