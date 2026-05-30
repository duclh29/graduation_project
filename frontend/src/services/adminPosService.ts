import api from "./axios";
import type { ApiResponse, PageResponse } from "../types/api";
import type {
  AdminPosCashierSessionResponse,
  AdminPosCouponPreviewResponse,
  AdminPosCreateOrderRequest,
  AdminId,
  AdminPosOrderResponse,
  AdminPosReturnExchangeRequest,
  AdminPosReturnExchangeResponse,
  AdminPosVariantLookup
} from "../types/admin";

export const adminPosService = {
  async lookupVariant(code: string) {
    const response = await api.get<ApiResponse<AdminPosVariantLookup>>("/api/admin/pos/variants/lookup", {
      params: { code }
    });
    return response.data.data;
  },
  async createOrder(payload: AdminPosCreateOrderRequest) {
    const response = await api.post<ApiResponse<AdminPosOrderResponse>>("/api/admin/pos/orders", payload);
    return response.data.data;
  },
  async previewCoupon(payload: AdminPosCreateOrderRequest) {
    const response = await api.post<ApiResponse<AdminPosCouponPreviewResponse>>("/api/admin/pos/coupons/preview", payload);
    return response.data.data;
  },
  async getOrders(params: { keyword?: string; page?: number; size?: number }) {
    const response = await api.get<ApiResponse<PageResponse<AdminPosOrderResponse>>>("/api/admin/pos/orders", { params });
    return response.data.data;
  },
  async getOrder(id: AdminId) {
    const response = await api.get<ApiResponse<AdminPosOrderResponse>>(`/api/admin/pos/orders/${id}`);
    return response.data.data;
  },
  async returnOrExchange(id: AdminId, payload: AdminPosReturnExchangeRequest) {
    const response = await api.post<ApiResponse<AdminPosReturnExchangeResponse>>(`/api/admin/pos/orders/${id}/return-exchange`, payload);
    return response.data.data;
  },
  async getCurrentSession() {
    const response = await api.get<ApiResponse<AdminPosCashierSessionResponse | null>>("/api/admin/pos/cashier-sessions/current");
    return response.data.data;
  },
  async openSession(payload: { cashierName?: string; openingCash?: number; note?: string }) {
    const response = await api.post<ApiResponse<AdminPosCashierSessionResponse>>("/api/admin/pos/cashier-sessions", payload);
    return response.data.data;
  },
  async closeSession(id: AdminId, payload: { closingCash?: number; note?: string }) {
    const response = await api.post<ApiResponse<AdminPosCashierSessionResponse>>(`/api/admin/pos/cashier-sessions/${id}/close`, payload);
    return response.data.data;
  }
};
