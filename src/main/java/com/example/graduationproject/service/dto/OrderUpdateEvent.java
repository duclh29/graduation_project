package com.example.graduationproject.service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderUpdateEvent {
    private String orderId;
    private String orderCode;
    private String status;
    private String paymentStatus;
    private java.time.LocalDateTime createdAt;
    private String customerName;
    private java.math.BigDecimal finalPrice;
    private String message;
    private String eventType;
}
