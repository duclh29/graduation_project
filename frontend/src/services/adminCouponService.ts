import api from "./axios";
import type { ApiResponse, PageResponse } from "../types/api";
import type { AdminCoupon, AdminCouponUpsertRequest, AdminId } from "../types/admin";

export const adminCouponService = {
  async getCoupons(params: { keyword?: string; status?: string; page?: number; size?: number }) {
    const response = await api.get<ApiResponse<PageResponse<AdminCoupon>>>("/api/admin/coupons", { params });
    return response.data.data;
  },
  async getCoupon(id: AdminId) {
    const response = await api.get<ApiResponse<AdminCoupon>>(`/api/admin/coupons/${id}`);
    return response.data.data;
  },
  async createCoupon(payload: AdminCouponUpsertRequest) {
    const response = await api.post<ApiResponse<AdminCoupon>>("/api/admin/coupons", payload);
    return response.data.data;
  },
  async updateCoupon(id: AdminId, payload: AdminCouponUpsertRequest) {
    const response = await api.put<ApiResponse<AdminCoupon>>(`/api/admin/coupons/${id}`, payload);
    return response.data.data;
  },
  async updateStatus(id: AdminId, status: string) {
    const response = await api.patch<ApiResponse<AdminCoupon>>(`/api/admin/coupons/${id}/status`, { status });
    return response.data.data;
  }
};
