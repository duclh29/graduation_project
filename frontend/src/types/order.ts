export interface OrderItemRequest {
  variantId: number;
  quantity: number;
}

export interface OrderRequest {
  userId: number;
  addressId?: number;
  couponCode?: string;
  items: OrderItemRequest[];
  recipientName?: string;
  phoneNumber?: string;
  addressLine?: string;
  ward?: string;
  district?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  paymentMethod?: string;
  shippingMethod?: string;
  note?: string;
}

export interface OrderResponse {
  orderId: number;
  orderCode: string;
  subtotal: number;
  promotionDiscount: number;
  couponDiscount: number;
  shippingFee: number;
  finalPrice: number;
}

export interface CouponApplyRequest {
  userId: number;
  couponCode: string;
  subtotal: number;
}

export interface CouponApplyResponse {
  discountAmount: number;
  finalPrice: number;
}

export interface OrderPricingItemResponse {
  variantId: number;
  productId: number;
  productName: string;
  brand?: string;
  sku: string;
  size?: string;
  stockQuantity: number;
  imageUrl?: string;
  quantity: number;
  baseUnitPrice: number;
  finalUnitPrice: number;
  lineTotal: number;
  lineDiscount: number;
}

export interface OrderPricingResult {
  subtotal: number;
  promotionDiscount: number;
  couponDiscount: number;
  finalPrice: number;
  couponCode?: string;
  items: OrderPricingItemResponse[];
}

export interface ReturnOrderItemRequest {
  orderItemId: number;
  quantity: number;
}

export interface ReturnOrderRequest {
  userId: number;
  note?: string;
  items: ReturnOrderItemRequest[];
}

export interface OrderItemDetail {
  id: number;
  productName: string;
  sku: string;
  size?: string;
  color?: string;
  quantity: number;
  returnedQuantity?: number;
  requestedReturnQuantity?: number;
  remainingQuantity?: number;
  unitPrice: number;
  totalPrice: number;
  remainingTotalPrice?: number;
  imageUrl?: string;
}

export interface OrderDetail {
  orderId: number;
  orderCode: string;
  createdAt: string;
  status: string;
  subtotal: number;
  shippingFee: number;
  discount: number;
  promotionDiscount: number;
  couponDiscount: number;
  finalPrice: number;
  couponCode?: string;
  note?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  recipientName: string;
  recipientPhone: string;
  shippingAddress: string;
  shippingMethod: string;
  shippingStatus: string;
  paymentMethod: string;
  paymentStatus: string;
  paymentAmount: number;
  items: OrderItemDetail[];
}

export interface OrderListResponse {
  id: number;
  orderCode: string;
  createdAt: string;
  status: string;
  finalPrice: number;
  paymentMethod: string;
  paymentStatus: string;
  imageUrls: string[];
  firstProductName: string;
  totalItems: number;
}
