package com.example.graduationproject.admin.dashboard.dto;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
public class AdminRevenueStatsResponse {
    private final BigDecimal todayRevenue;
    private final BigDecimal monthRevenue;
    private final BigDecimal yearRevenue;
}