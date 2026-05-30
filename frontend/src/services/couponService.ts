import type { Coupon } from "../types/coupon";
import api from "./axios";

export const couponService = {
  getActiveCoupons: async (): Promise<Coupon[]> => {
    try {
      const response = await api.get<{ data: Coupon[] }>("/api/coupons/active");
      return response.data.data;
    } catch (error) {
      console.error("getActiveCoupons error:", error);
      throw error;
    }
  },
  
  saveCoupon: async (code: string, userId: number): Promise<void> => {
    await api.post(`/api/coupons/${code}/save`, null, {
      params: { userId }
    });
  },

  getSavedCoupons: async (userId: number): Promise<Coupon[]> => {
    const response = await api.get<{ data: Coupon[] }>("/api/coupons/saved", {
      params: { userId }
    });
    return response.data.data;
  }
};
