package com.example.graduationproject.admin.pos.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminPosOrderResponse {
    private String orderId;
    private String orderCode;
    private String customerName;
    private String customerPhone;
    private String status;
    private String paymentStatus;
    private String paymentMethod;
    private String couponCode;
    private BigDecimal subtotalAmount;
    private BigDecimal discountAmount;
    private BigDecimal finalPrice;
    private BigDecimal cashReceived;
    private BigDecimal changeAmount;
    private String qrPaymentPayload;
    private LocalDateTime createdAt;
    private List<AdminPosPaymentResponse> payments;
    private List<AdminPosOrderItemResponse> items;
}
