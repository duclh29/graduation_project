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
public class AdminPosReturnExchangeResponse {
    private String logId;
    private String type;
    private BigDecimal returnedAmount;
    private BigDecimal exchangeAmount;
    private BigDecimal refundAmount;
    private BigDecimal collectAmount;
    private AdminPosOrderResponse order;
}
