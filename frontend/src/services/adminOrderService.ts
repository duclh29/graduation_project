import api from "./axios";
import type { ApiResponse, PageResponse } from "../types/api";
import type { AdminId, AdminOrderHistoryItem, AdminOrderListItem, AdminProcessReturnRequest, AdminUpdateOrderStatusRequest } from "../types/admin";
import type { OrderDetail } from "../types/order";

export const adminOrderService = {
  async getOrders(params: { keyword?: string; status?: string; page?: number; size?: number; sort?: string }) {
    const response = await api.get<ApiResponse<PageResponse<AdminOrderListItem>>>("/api/admin/orders", { params });
    return response.data.data;
  },
  async getOrderById(id: AdminId) {
    const response = await api.get<ApiResponse<OrderDetail>>(`/api/admin/orders/${id}`);
    return response.data.data;
  },
  async getOrderHistory(id: AdminId) {
    const response = await api.get<ApiResponse<AdminOrderHistoryItem[]>>(`/api/admin/orders/${id}/history`);
    return response.data.data;
  },
  async updateStatus(id: AdminId, payload: AdminUpdateOrderStatusRequest) {
    const response = await api.put<ApiResponse<OrderDetail>>(`/api/admin/orders/${id}/status`, payload);
    return response.data.data;
  },
  async approveReturnRequest(id: AdminId, payload?: AdminProcessReturnRequest) {
    const response = await api.put<ApiResponse<OrderDetail>>(`/api/admin/orders/${id}/return-request/approve`, payload || {});
    return response.data.data;
  },
  async rejectReturnRequest(id: AdminId, payload?: AdminProcessReturnRequest) {
    const response = await api.put<ApiResponse<OrderDetail>>(`/api/admin/orders/${id}/return-request/reject`, payload || {});
    return response.data.data;
  }
};
