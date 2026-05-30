package com.example.graduationproject.payment.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CreatePaymentResponse {
    private String provider;
    private String paymentUrl;
    private String transactionCode;
}
