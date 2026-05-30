package com.example.graduationproject.payment.dto;

import com.example.graduationproject.entity.enums.OrderStatus;
import com.example.graduationproject.entity.enums.PaymentStatus;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class PaymentStatusResponse {
    private String orderId;
    private String provider;
    private PaymentStatus paymentStatus;
    private OrderStatus orderStatus;
    private String transactionCode;
}
