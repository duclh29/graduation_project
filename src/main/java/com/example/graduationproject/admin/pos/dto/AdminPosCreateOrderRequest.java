package com.example.graduationproject.admin.pos.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminPosCreateOrderRequest {
    private String customerId;

    private String customerType;

    private String customerName;

    private String customerPhone;

    private String paymentMethod;

    private String couponCode;

    @DecimalMin(value = "0.00", message = "Manual discount must be greater than or equal to 0")
    private BigDecimal manualDiscount;

    @DecimalMin(value = "0.00", message = "Cash received must be greater than or equal to 0")
    private BigDecimal cashReceived;

    private String note;

    @Valid
    private List<AdminPosPaymentRequest> payments;

    @Valid
    @NotEmpty(message = "Order items are required")
    private List<AdminPosOrderItemRequest> items;
}
