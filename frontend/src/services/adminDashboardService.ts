import api from "./axios";
import type { ApiResponse } from "../types/api";
import type { AdminDashboardSummary, AdminRevenueStats, AdminRevenueChartData, AdminCategoryStats, AdminLowStockVariant } from "../types/admin";

export const adminDashboardService = {
  async getSummary() {
    const response = await api.get<ApiResponse<AdminDashboardSummary>>("/api/admin/dashboard");
    return response.data.data;
  },
  async getRevenue() {
    const response = await api.get<ApiResponse<AdminRevenueStats>>("/api/admin/dashboard/revenue");
    return response.data.data;
  },
  async getRevenueChart(days: number = 7) {
    const response = await api.get<ApiResponse<AdminRevenueChartData[]>>(`/api/admin/dashboard/revenue/chart?days=${days}`);
    return response.data.data;
  },
  async getCategoryStats() {
    const response = await api.get<ApiResponse<AdminCategoryStats[]>>("/api/admin/dashboard/category-stats");
    return response.data.data;
  },
  async getLowStockVariants(limit: number = 10, threshold: number = 5) {
    const response = await api.get<ApiResponse<AdminLowStockVariant[]>>(`/api/admin/dashboard/low-stock?limit=${limit}&threshold=${threshold}`);
    return response.data.data;
  }
};