export type CouponType = 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_SHIPPING';

export interface Coupon {
  id: number;
  code: string;
  description: string;
  type: CouponType;
  discountValue: number;
  maxDiscountValue?: number;
  minimumOrderAmount?: number;
  startAt: string;
  endAt: string;
}
