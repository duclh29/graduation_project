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
public class AdminPosOrderItemResponse {
    private String orderItemId;
    private String variantId;
    private String productName;
    private String sku;
    private String size;
    private String color;
    private Integer quantity;
    private Integer returnedQuantity;
    private Integer availableReturnQuantity;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
}
