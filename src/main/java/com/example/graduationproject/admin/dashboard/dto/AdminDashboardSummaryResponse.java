package com.example.graduationproject.admin.dashboard.dto;

import com.example.graduationproject.admin.order.dto.AdminOrderListItemResponse;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Builder
public class AdminDashboardSummaryResponse {
    private final BigDecimal totalRevenue;
    private final long totalOrders;
    private final long totalCustomersPurchased;
    private final long totalProductsSold;
    private final List<AdminOrderListItemResponse> recentOrders;
    private final List<TopSellingProductResponse> topSellingProducts;
}
