package com.example.graduationproject.admin.pos.dto;

import jakarta.validation.constraints.DecimalMin;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminPosCashierSessionRequest {
    private String cashierName;

    @DecimalMin(value = "0.00", message = "Opening cash must be greater than or equal to 0")
    private BigDecimal openingCash;

    @DecimalMin(value = "0.00", message = "Closing cash must be greater than or equal to 0")
    private BigDecimal closingCash;

    private String note;
}
