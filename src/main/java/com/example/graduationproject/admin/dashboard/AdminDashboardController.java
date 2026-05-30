package com.example.graduationproject.admin.dashboard;

import com.example.graduationproject.admin.dashboard.dto.AdminDashboardSummaryResponse;
import com.example.graduationproject.admin.dashboard.dto.AdminRevenueChartDataResponse;
import com.example.graduationproject.admin.dashboard.dto.AdminRevenueStatsResponse;
import com.example.graduationproject.admin.dashboard.dto.AdminCategoryStatsResponse;
import com.example.graduationproject.admin.dashboard.dto.AdminLowStockVariantResponse;
import com.example.graduationproject.common.api.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
public class AdminDashboardController {

    private final AdminDashboardService adminDashboardService;

    @GetMapping
    public ResponseEntity<ApiResponse<AdminDashboardSummaryResponse>> getSummary() {
        return ResponseEntity.ok(ApiResponse.success("Admin dashboard fetched successfully", adminDashboardService.getSummary()));
    }

    @GetMapping("/revenue")
    public ResponseEntity<ApiResponse<AdminRevenueStatsResponse>> getRevenueStats() {
        return ResponseEntity.ok(ApiResponse.success("Admin revenue fetched successfully", adminDashboardService.getRevenueStats()));
    }

    @GetMapping("/revenue/chart")
    public ResponseEntity<ApiResponse<List<AdminRevenueChartDataResponse>>> getRevenueChart(
            @RequestParam(name = "days", defaultValue = "7") int days) {
        return ResponseEntity.ok(ApiResponse.success("Admin revenue chart data fetched successfully", adminDashboardService.getRevenueChart(days)));
    }

    @GetMapping("/category-stats")
    public ResponseEntity<ApiResponse<List<AdminCategoryStatsResponse>>> getCategoryStats() {
        return ResponseEntity.ok(ApiResponse.success("Admin category stats fetched successfully", adminDashboardService.getCategoryStats()));
    }

    @GetMapping("/low-stock")
    public ResponseEntity<ApiResponse<List<AdminLowStockVariantResponse>>> getLowStockVariants(
            @RequestParam(name = "limit", defaultValue = "10") int limit,
            @RequestParam(name = "threshold", defaultValue = "5") int threshold) {
        return ResponseEntity.ok(ApiResponse.success("Admin low stock variants fetched successfully", adminDashboardService.getLowStockVariants(limit, threshold)));
    }
}
