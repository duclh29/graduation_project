import api from "./axios";
import type { ApiResponse } from "../types/api";
import type {
  CouponApplyRequest,
  CouponApplyResponse,
  OrderDetail,
  OrderPricingResult,
  OrderRequest,
  OrderResponse,
  OrderListResponse,
  ReturnOrderRequest
} from "../types/order";

export const orderService = {
  async createOrder(payload: OrderRequest) {
    const response = await api.post<ApiResponse<OrderResponse>>("/api/orders", payload);
    return response.data.data;
  },
  async applyCoupon(payload: CouponApplyRequest) {
    const response = await api.post<ApiResponse<CouponApplyResponse>>("/api/coupons/apply", payload);
    return response.data.data;
  },
  async previewOrder(payload: OrderRequest) {
    const response = await api.post<ApiResponse<OrderPricingResult>>("/api/orders/preview", payload);
    return response.data.data;
  },
  async getById(id: number | string) {
    const response = await api.get<ApiResponse<OrderDetail>>(`/api/orders/${id}`);
    return response.data.data;
  },
  async getMyOrders(userId: number) {
    const response = await api.get<ApiResponse<OrderListResponse[]>>(`/api/orders/user/${userId}`);
    return response.data.data;
  },
  async cancelOrder(orderId: number, userId: number) {
    const response = await api.put<ApiResponse<void>>(`/api/orders/${orderId}/cancel`, null, {
      params: { userId }
    });
    return response.data;
  },
  async returnOrder(orderId: number, userId: number) {
    const response = await api.put<ApiResponse<void>>(`/api/orders/${orderId}/return`, null, {
      params: { userId }
    });
    return response.data;
  },
  async returnOrderItems(orderId: number, payload: ReturnOrderRequest) {
    const response = await api.put<ApiResponse<OrderDetail>>(`/api/orders/${orderId}/return-items`, payload);
    return response.data.data;
  }
};
