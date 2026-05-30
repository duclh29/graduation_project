export type AdminId = string | number;

export interface AdminOrderEvent {
  orderId: AdminId;
  orderCode?: string;
  status: string;
  paymentStatus?: string;
  createdAt?: string;
  customerName?: string;
  finalPrice?: number;
  message?: string;
  eventType?: string;
}

export interface AdminOrderListItem {
  id: AdminId;
  orderCode: string;
  createdAt: string;
  status: string;
  shippingStatus?: string;
  paymentStatus?: string;
  customerName?: string;
  customerEmail?: string;
  finalPrice: number;
  totalItems: number;
}

export interface AdminRevenueChartData {
  date: string;
  revenue: number;
}

export interface AdminUpdateOrderStatusRequest {
  status: string;
  note?: string;
}

export interface AdminProcessReturnRequest {
  note?: string;
}

export interface AdminOrderHistoryItem {
  id: AdminId;
  status?: string;
  note?: string;
  actorName?: string;
  changedAt?: string;
}

export interface AdminLookupItem {
  id: AdminId;
  name: string;
}

export interface AdminProductMeta {
  brands: AdminLookupItem[];
  categories: AdminLookupItem[];
  sizes: AdminLookupItem[];
}

export interface AdminProductVariant {
  id?: AdminId;
  sku: string;
  color: string;
  size: string;
  stockQuantity: number;
  additionalPrice: number;
  price?: number;
  imageUrl?: string;
  status: string;
}

export interface AdminProduct {
  id: AdminId;
  name: string;
  slug: string;
  brandId: AdminId;
  brandName?: string;
  categoryId: AdminId;
  categoryName?: string;
  description?: string;
  basePrice: number;
  totalQuantity?: number;
  sizes?: string;
  status: string;
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  variants: AdminProductVariant[];
}

export interface AdminProductUpsertRequest {
  name: string;
  slug: string;
  brandId: AdminId;
  categoryId: AdminId;
  description?: string;
  basePrice: number;
  status: string;
  imageUrl?: string;
  variants: AdminProductVariant[];
}

export interface UploadResponse {
  fileName: string;
  filePath: string;
}

export interface AdminPromotion {
  id: AdminId;
  name: string;
  code?: string;
  description?: string;
  type: string;
  status: string;
  discountValue: number;
  maxDiscountValue?: number;
  startAt: string;
  endAt: string;
  productIds: AdminId[];
  variantIds: AdminId[];
}

export interface AdminPromotionUpsertRequest {
  name: string;
  code?: string;
  description?: string;
  type: string;
  status: string;
  discountValue: number;
  maxDiscountValue?: number;
  startAt: string;
  endAt: string;
  productIds: AdminId[];
  variantIds?: AdminId[];
}

export interface AdminCoupon {
  id: AdminId;
  code: string;
  description?: string;
  type: "PERCENTAGE" | "FIXED_AMOUNT" | "FREE_SHIPPING";
  discountValue: number;
  maxDiscountValue?: number;
  minimumOrderAmount?: number;
  usageLimit?: number;
  usedCount: number;
  status: "UPCOMING" | "ACTIVE" | "ENDED" | "DISABLED";
  startAt: string;
  endAt: string;
}

export interface AdminCouponUpsertRequest {
  code: string;
  description?: string;
  type: string;
  status: string;
  discountValue: number;
  maxDiscountValue?: number;
  minimumOrderAmount?: number;
  usageLimit?: number;
  startAt: string;
  endAt: string;
}

export interface TopSellingProduct {
  productId: AdminId;
  productName: string;
  soldQuantity: number;
  revenue: number;
  imageUrl?: string;
}

export interface AdminCategoryStats {
  name: string;
  value: number;
}

export interface AdminLowStockVariant {
  variantId: AdminId;
  productId: AdminId;
  productName: string;
  sku: string;
  color: string;
  size?: string;
  imageUrl?: string;
  stockQuantity: number;
}
export interface AdminDashboardSummary {
  totalRevenue: number;
  totalOrders: number;
  totalCustomersPurchased: number;
  totalProductsSold: number;
  recentOrders: AdminOrderListItem[];
  topSellingProducts: TopSellingProduct[];
}

export interface AdminRevenueStats {
  todayRevenue: number;
  monthRevenue: number;
  yearRevenue: number;
}

export interface AdminUserListItem {
  id: AdminId;
  fullName: string;
  email: string;
  phoneNumber: string;
  status: string;
  createdAt: string;
  lastOrderAt?: string;
  totalOrders: number;
  totalSpent: number;
}

export interface AdminUserDetail {
  id: AdminId;
  fullName: string;
  email: string;
  phoneNumber: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  totalOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalSpent: number;
  lastOrderAt?: string;
  recentOrders: AdminOrderListItem[];
}

export interface AdminStaff {
  id: AdminId;
  fullName: string;
  email: string;
  phoneNumber: string;
  avatarUrl?: string;
  status: string;
  roles?: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface AdminStaffCreateRequest {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  avatarUrl?: string;
  status?: string;
}

export interface AdminShift {
  id: AdminId;
  code: string;
  name: string;
  startTime: string;
  endTime: string;
  crossDay: boolean;
  breakMinutes: number;
  paidBreakMinutes: number;
  minStaff: number;
  maxStaff: number;
  status: string;
  description?: string;
}

export interface AdminSchedule {
  id: AdminId;
  userId: AdminId;
  userFullName: string;
  shiftId: AdminId;
  shiftName: string;
  startTime: string;
  endTime: string;
  workDate: string;
  status: string;
  publishStatus: string;
  plannedStartAt: string;
  plannedEndAt: string;
  note?: string;
  attendance?: AdminAttendance;
}

export interface AdminAttendance {
  id: AdminId;
  status: string;
  checkInAt?: string;
  checkOutAt?: string;
  actualWorkMinutes: number;
  lateMinutes: number;
  earlyLeaveMinutes: number;
  overtimeMinutes: number;
  note?: string;
}

export interface AdminOpenShift {
  id: AdminId;
  shiftId: AdminId;
  shiftName: string;
  workDate: string;
  plannedStartAt: string;
  plannedEndAt: string;
  status: string;
  assignedUserId?: AdminId;
  assignedUserFullName?: string;
  scheduleId?: AdminId;
  note?: string;
}

export interface AdminScheduleSwapRequest {
  id: AdminId;
  scheduleId: AdminId;
  shiftId: AdminId;
  shiftName: string;
  workDate: string;
  fromUserId: AdminId;
  fromUserFullName: string;
  targetUserId: AdminId;
  targetUserFullName: string;
  status: string;
  note?: string;
  reviewNote?: string;
  reviewedAt?: string;
}

export interface AdminPosCartItemRequest {
  variantId: AdminId;
  quantity: number;
}

export interface AdminPosPaymentRequest {
  method: string;
  amount: number;
  cashReceived?: number;
  referenceCode?: string;
  note?: string;
}

export interface AdminPosCreateOrderRequest {
  customerId?: AdminId;
  customerType?: string;
  customerName?: string;
  customerPhone?: string;
  paymentMethod: string;
  couponCode?: string;
  manualDiscount?: number;
  cashReceived?: number;
  payments?: AdminPosPaymentRequest[];
  note?: string;
  items: AdminPosCartItemRequest[];
}

export interface AdminPosCouponPreviewResponse {
  couponCode?: string;
  subtotalAmount: number;
  discountAmount: number;
  finalPrice: number;
  valid: boolean;
  message?: string;
}

export interface AdminPosCashierSessionRequest {
  cashierName?: string;
  openingCash?: number;
  closingCash?: number;
  note?: string;
}

export interface AdminPosCashierSessionResponse {
  id: AdminId;
  cashierName: string;
  status: string;
  openedAt: string;
  closedAt?: string;
  openingCash: number;
  cashSales: number;
  expectedCash: number;
  closingCash?: number;
  cashDifference?: number;
  note?: string;
}

export interface AdminPosOrderItem {
  orderItemId: AdminId;
  variantId: AdminId;
  productName: string;
  sku: string;
  size: string;
  color: string;
  quantity: number;
  returnedQuantity: number;
  availableReturnQuantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface AdminPosPaymentResponse {
  method: string;
  amount: number;
  cashReceived?: number;
  changeAmount: number;
  referenceCode?: string;
  note?: string;
}

export interface AdminPosOrderResponse {
  orderId: AdminId;
  orderCode: string;
  customerName: string;
  customerPhone: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  couponCode?: string;
  subtotalAmount: number;
  discountAmount: number;
  finalPrice: number;
  cashReceived: number;
  changeAmount: number;
  qrPaymentPayload: string;
  createdAt: string;
  payments: AdminPosPaymentResponse[];
  items: AdminPosOrderItem[];
}

export interface AdminPosCashierSession {
  id: AdminId;
  cashierName: string;
  status: string;
  openedAt: string;
  closedAt?: string;
  openingCash: number;
  cashSales: number;
  expectedCash: number;
  closingCash?: number;
  cashDifference?: number;
  note?: string;
}

export interface AdminPosReturnExchangeRequest {
  returnItems?: { orderItemId: AdminId; quantity: number }[];
  exchangeItems?: AdminPosCartItemRequest[];
  paymentMethod?: string;
  note?: string;
}

export interface AdminPosReturnExchangeResponse {
  logId: AdminId;
  type: string;
  returnedAmount: number;
  exchangeAmount: number;
  refundAmount: number;
  collectAmount: number;
  order: AdminPosOrderResponse;
}

export interface AdminPosVariantLookup {
  productId: AdminId;
  productName: string;
  variantId: AdminId;
  sku: string;
  size: string;
  color: string;
  stockQuantity: number;
  status: string;
  price: number;
  imageUrl?: string;
}
