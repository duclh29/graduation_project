export const ORDER_STATUS_OPTIONS = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "PENDING", label: "Chờ xác nhận" },
  { value: "CONFIRMED", label: "Đã xác nhận" },
  { value: "PROCESSING", label: "Đang xử lý" },
  { value: "SHIPPING", label: "Đang giao" },
  { value: "DELIVERED", label: "Đã giao" },
  { value: "RETURN_REQUESTED", label: "Chờ duyệt trả hàng" },
  { value: "RETURNED", label: "Đã hoàn hàng" },
  { value: "CANCELLED", label: "Đã hủy" }
] as const;

export const PRODUCT_STATUS_OPTIONS = [
  { value: "DRAFT", label: "Bản nháp" },
  { value: "ACTIVE", label: "Kinh doanh" },
  { value: "INACTIVE", label: "Ngưng kinh doanh" }
] as const;

export const VARIANT_STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Đang hoạt động" },
  { value: "OUT_OF_STOCK", label: "Hết hàng" },
  { value: "DISCONTINUED", label: "Ngừng kinh doanh" }
] as const;

export const PROMOTION_STATUS_OPTIONS = [
  { value: "UPCOMING", label: "Sắp diễn ra" },
  { value: "ACTIVE", label: "Đang áp dụng" },
  { value: "ENDED", label: "Đã kết thúc" },
  { value: "DISABLED", label: "Tạm dừng" }
] as const;

export const PROMOTION_TYPE_OPTIONS = [
  { value: "PERCENTAGE", label: "Phần trăm" },
  { value: "FIXED_AMOUNT", label: "Số tiền cố định" }
] as const;

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: "Chờ thanh toán",
  UNPAID: "Chưa thanh toán",
  PAID: "Đã thanh toán",
  FAILED: "Thanh toán lỗi",
  REFUNDED: "Đã hoàn tiền",
  PARTIALLY_REFUNDED: "Hoàn tiền một phần",
  CANCELLED: "Đã hủy"
};

export const ORDER_STATUS_LABELS = Object.fromEntries(ORDER_STATUS_OPTIONS.filter((item) => item.value).map((item) => [item.value, item.label])) as Record<string, string>;
export const PRODUCT_STATUS_LABELS = Object.fromEntries(PRODUCT_STATUS_OPTIONS.map((item) => [item.value, item.label])) as Record<string, string>;
export const VARIANT_STATUS_LABELS = Object.fromEntries(VARIANT_STATUS_OPTIONS.map((item) => [item.value, item.label])) as Record<string, string>;
export const PROMOTION_STATUS_LABELS = Object.fromEntries(PROMOTION_STATUS_OPTIONS.map((item) => [item.value, item.label])) as Record<string, string>;
export const PROMOTION_TYPE_LABELS = Object.fromEntries(PROMOTION_TYPE_OPTIONS.map((item) => [item.value, item.label])) as Record<string, string>;

export const ORDER_STATUS_BADGES: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  CONFIRMED: "bg-sky-100 text-sky-700",
  PROCESSING: "bg-indigo-100 text-indigo-700",
  SHIPPING: "bg-violet-100 text-violet-700",
  DELIVERED: "bg-emerald-100 text-emerald-700",
  RETURN_REQUESTED: "bg-orange-100 text-orange-700",
  RETURNED: "bg-cyan-100 text-cyan-700",
  CANCELLED: "bg-rose-100 text-rose-700"
};

export const PRODUCT_STATUS_BADGES: Record<string, string> = {
  DRAFT: "bg-slate-100 text-slate-700",
  ACTIVE: "bg-emerald-100 text-emerald-700",
  INACTIVE: "bg-amber-100 text-amber-700"
};

export const PAYMENT_STATUS_BADGES: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  UNPAID: "bg-slate-100 text-slate-700",
  PAID: "bg-emerald-100 text-emerald-700",
  FAILED: "bg-rose-100 text-rose-700",
  REFUNDED: "bg-sky-100 text-sky-700",
  PARTIALLY_REFUNDED: "bg-cyan-100 text-cyan-700",
  CANCELLED: "bg-slate-200 text-slate-700"
};
