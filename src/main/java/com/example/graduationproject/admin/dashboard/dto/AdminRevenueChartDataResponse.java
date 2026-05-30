package com.example.graduationproject.admin.dashboard.dto;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
public class AdminRevenueChartDataResponse {
    private final String date;
    private final BigDecimal revenue;
}
