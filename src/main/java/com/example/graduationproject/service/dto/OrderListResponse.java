package com.example.graduationproject.service.dto;

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
public class OrderListResponse {
    private String id;
    private String orderCode;
    private LocalDateTime createdAt;
    private String status;
    private BigDecimal finalPrice;
    private String paymentMethod;
    private String paymentStatus;
    private List<String> imageUrls;
    private String firstProductName;
    private int totalItems;
}
