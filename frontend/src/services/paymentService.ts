import api from "./axios";
import type { ApiResponse } from "../types/api";
import type { CreatePaymentRequest, CreatePaymentResponse, PaymentStatusResponse } from "../types/payment";

export const paymentService = {
  async createVnpayUrl(payload: CreatePaymentRequest) {
    const response = await api.post<ApiResponse<CreatePaymentResponse>>("/api/payments/vnpay/create", payload);
    return response.data.data;
  },
  async createMomoUrl(payload: CreatePaymentRequest) {
    const response = await api.post<ApiResponse<CreatePaymentResponse>>("/api/payments/momo/create", payload);
    return response.data.data;
  },
  async getOrderPaymentStatus(orderId: number | string) {
    const response = await api.get<ApiResponse<PaymentStatusResponse>>(`/api/payments/orders/${orderId}/status`);
    return response.data.data;
  },
  async completeVnpayDemo(orderId: number | string) {
    const response = await api.post<ApiResponse<PaymentStatusResponse>>(`/api/payments/vnpay/demo-complete?orderId=${orderId}`);
    return response.data.data;
  }
};
