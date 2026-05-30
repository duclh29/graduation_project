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
public class AdminPosPaymentResponse {
    private String method;
    private BigDecimal amount;
    private BigDecimal cashReceived;
    private BigDecimal changeAmount;
    private String referenceCode;
    private String note;
}
