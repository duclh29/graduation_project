import api from "./axios";
import type { ApiResponse, PageResponse } from "../types/api";
import type { AdminId, AdminPromotion, AdminPromotionUpsertRequest } from "../types/admin";

export const adminPromotionService = {
  async getPromotions(params: { keyword?: string; status?: string; page?: number; size?: number }) {
    const response = await api.get<ApiResponse<PageResponse<AdminPromotion>>>("/api/admin/promotions", { params });
    return response.data.data;
  },
  async getPromotion(id: AdminId) {
    const response = await api.get<ApiResponse<AdminPromotion>>(`/api/admin/promotions/${id}`);
    return response.data.data;
  },
  async createPromotion(payload: AdminPromotionUpsertRequest) {
    const response = await api.post<ApiResponse<AdminPromotion>>("/api/admin/promotions", payload);
    return response.data.data;
  },
  async updatePromotion(id: AdminId, payload: AdminPromotionUpsertRequest) {
    const response = await api.put<ApiResponse<AdminPromotion>>(`/api/admin/promotions/${id}`, payload);
    return response.data.data;
  },
  async updateStatus(id: AdminId, status: string) {
    const response = await api.patch<ApiResponse<AdminPromotion>>(`/api/admin/promotions/${id}/status`, { status });
    return response.data.data;
  }
};
