package com.example.graduationproject.admin.pos.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminPosCashierSessionResponse {
    private String id;
    private String cashierName;
    private String status;
    private LocalDateTime openedAt;
    private LocalDateTime closedAt;
    private BigDecimal openingCash;
    private BigDecimal cashSales;
    private BigDecimal expectedCash;
    private BigDecimal closingCash;
    private BigDecimal cashDifference;
    private String note;
}
