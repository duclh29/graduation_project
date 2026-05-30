package com.example.graduationproject.service.dto;

import java.math.BigDecimal;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class OrderItemDetailResponse {
    private String id;
    private String productName;
    private String sku;
    private String size;
    private String color;
    private Integer quantity;
    private Integer returnedQuantity;
    private Integer requestedReturnQuantity;
    private Integer remainingQuantity;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
    private BigDecimal remainingTotalPrice;
    private String imageUrl;
}
