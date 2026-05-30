import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./useAuth";
import { couponService } from "../services/couponService";
import type { Coupon } from "../types/coupon";

export const useSavedCoupons = () => {
  const { user, isAuthenticated } = useAuth();
  const userId = user?.userId;
  
  const [savedCoupons, setSavedCoupons] = useState<string[]>([]);
  const [savedCouponDetails, setSavedCouponDetails] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(false);

  // Load from DB when user changes
  const fetchCoupons = useCallback(async () => {
    if (isAuthenticated && userId) {
      setLoading(true);
      try {
        const coupons = await couponService.getSavedCoupons(userId);
        setSavedCoupons(coupons.map(c => c.code));
        setSavedCouponDetails(coupons);
      } catch (err) {
        console.error("Failed to fetch saved coupons", err);
      } finally {
        setLoading(false);
      }
    } else {
      setSavedCoupons([]);
      setSavedCouponDetails([]);
    }
  }, [isAuthenticated, userId]);

  useEffect(() => {
    void fetchCoupons();
  }, [fetchCoupons]);

  const saveCoupon = async (code: string) => {
    if (!isAuthenticated || !userId) return false;
    
    try {
      await couponService.saveCoupon(code, userId);
      // refetch to get the full details if needed, or just append code for now
      void fetchCoupons();
      return true;
    } catch (err) {
      console.error("Failed to save coupon to DB", err);
      throw err;
    }
  };

  const hasSavedCoupon = (code: string) => {
    return savedCoupons.includes(code);
  };

  return {
    savedCoupons,
    savedCouponDetails,
    saveCoupon,
    hasSavedCoupon,
    loading
  };
};
