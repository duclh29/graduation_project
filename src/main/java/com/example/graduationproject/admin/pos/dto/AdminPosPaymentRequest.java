package com.example.graduationproject.admin.pos.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminPosPaymentRequest {
    @NotBlank(message = "Payment method is required")
    private String method;

    @NotNull(message = "Payment amount is required")
    @DecimalMin(value = "0.00", inclusive = false, message = "Payment amount must be greater than 0")
    private BigDecimal amount;

    @DecimalMin(value = "0.00", message = "Cash received must be greater than or equal to 0")
    private BigDecimal cashReceived;

    private String referenceCode;

    private String note;
}
