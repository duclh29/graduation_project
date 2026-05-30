import api from "./axios";
import type { AddToCartRequest, CartSummary } from "../types/cart";
import type { ApiResponse } from "../types/api";

export const cartService = {
  async add(payload: AddToCartRequest) {
    const response = await api.post<ApiResponse<CartSummary>>("/api/cart/add", payload);
    return response.data.data;
  },
  async get(userId: number, couponCode?: string) {
    const response = await api.get<ApiResponse<CartSummary>>("/api/cart", {
      params: { userId, couponCode: couponCode || undefined }
    });
    return response.data.data;
  },
  async updateQuantity(userId: number, variantId: number, quantity: number, couponCode?: string) {
    const response = await api.patch<ApiResponse<CartSummary>>("/api/cart/items", {
      userId,
      variantId,
      quantity,
      couponCode: couponCode || undefined
    });
    return response.data.data;
  },
  async remove(userId: number, variantId: number, couponCode?: string) {
    const response = await api.delete<ApiResponse<CartSummary>>(`/api/cart/items/${variantId}`, {
      params: { userId, couponCode: couponCode || undefined }
    });
    return response.data.data;
  },
  async clear(userId: number) {
    const response = await api.delete<ApiResponse<null>>("/api/cart", {
      params: { userId }
    });
    return response.data;
  }
};
