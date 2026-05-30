import { useEffect, useMemo, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import jsQR from "jsqr";
import { toast } from "react-toastify";
import { Camera, Minus, PauseCircle, Plus, Printer, QrCode, Receipt, RotateCcw, Search, ShoppingCart, Trash2 } from "lucide-react";
import { adminProductService } from "../../services/adminProductService";
import { adminPosService } from "../../services/adminPosService";
import { adminUserService } from "../../services/adminUserService";
import { couponService } from "../../services/couponService";
import type { AdminId, AdminPosCashierSession, AdminPosCouponPreviewResponse, AdminPosCreateOrderRequest, AdminPosOrderResponse, AdminProduct, AdminProductVariant, AdminUserListItem } from "../../types/admin";
import type { Coupon } from "../../types/coupon";
import { ReceiptPrinter } from "../../components/admin/ReceiptPrinter";

type PosCartItem = {
  productId: AdminId;
  productName: string;
  variant: AdminProductVariant;
};

type HeldPosOrder = {
  id: string;
  name: string;
  createdAt: string;
  cartItems: PosCartItem[];
  customerMode: "WALK_IN" | "EXISTING" | "GUEST";
  customerId: AdminId;
  customerName: string;
  customerPhone: string;
  paymentMethod: string;
  couponCode: string;
  manualDiscount: number;
  cashReceived: number;
  note: string;
};

type PosPaymentLine = {
  id: string;
  method: string;
  amount: number;
  cashReceived: number;
  referenceCode: string;
};

type NativeBarcodeDetector = {
  detect: (source: CanvasImageSource) => Promise<Array<{ rawValue?: string }>>;
};

declare global {
  interface Window {
    BarcodeDetector?: new (options?: { formats?: string[] }) => NativeBarcodeDetector;
  }
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(value || 0);

const formatCouponValue = (coupon: Coupon) => {
  if (coupon.type === "PERCENTAGE") {
    return `Giảm ${coupon.discountValue}%${coupon.maxDiscountValue ? ` tối đa ${formatCurrency(coupon.maxDiscountValue)}` : ""}`;
  }
  if (coupon.type === "FIXED_AMOUNT") {
    return `Giảm ${formatCurrency(coupon.discountValue)}`;
  }
  return "Miễn phí vận chuyển";
};

const PRODUCT_QR_CODE_KEYS = ["productId", "product_id", "product"];
const QR_CODE_KEYS = ["sku", "variantId", "variant_id", "variant", "code", "id"];

const extractQrCode = (rawValue: string) => {
  const value = rawValue.trim().replace(/^["']|["']$/g, "");
  if (!value) return "";

  const findCodeInObject = (input: unknown): string => {
    if (!input || typeof input !== "object") return "";
    const record = input as Record<string, unknown>;
    for (const key of PRODUCT_QR_CODE_KEYS) {
      const matchedKey = Object.keys(record).find((candidate) => candidate.toLowerCase() === key.toLowerCase());
      const matchedValue = matchedKey ? record[matchedKey] : undefined;
      if (matchedValue !== undefined && matchedValue !== null && String(matchedValue).trim()) {
        return `PRODUCT:${String(matchedValue).trim()}`;
      }
    }
    for (const key of QR_CODE_KEYS) {
      const matchedKey = Object.keys(record).find((candidate) => candidate.toLowerCase() === key.toLowerCase());
      const matchedValue = matchedKey ? record[matchedKey] : undefined;
      if (matchedValue !== undefined && matchedValue !== null && String(matchedValue).trim()) {
        return String(matchedValue).trim();
      }
    }
    for (const child of Object.values(record)) {
      const nestedCode = findCodeInObject(child);
      if (nestedCode) return nestedCode;
    }
    return "";
  };

  try {
    const parsed = JSON.parse(value);
    const jsonCode = findCodeInObject(parsed);
    if (jsonCode) return jsonCode;
  } catch {
    // QR labels can be raw SKU, variant id, or a URL that carries a code parameter.
  }

  try {
    const url = new URL(value);
    for (const key of PRODUCT_QR_CODE_KEYS) {
      const queryValue = url.searchParams.get(key);
      if (queryValue?.trim()) return `PRODUCT:${queryValue.trim()}`;
    }
    for (const key of QR_CODE_KEYS) {
      const queryValue = url.searchParams.get(key);
      if (queryValue?.trim()) return queryValue.trim();
    }
    const hashParams = new URLSearchParams(url.hash.replace(/^#/, ""));
    for (const key of PRODUCT_QR_CODE_KEYS) {
      const hashValue = hashParams.get(key);
      if (hashValue?.trim()) return `PRODUCT:${hashValue.trim()}`;
    }
    for (const key of QR_CODE_KEYS) {
      const hashValue = hashParams.get(key);
      if (hashValue?.trim()) return hashValue.trim();
    }
    const lastPathSegment = url.pathname.split("/").filter(Boolean).pop();
    if (lastPathSegment) return decodeURIComponent(lastPathSegment).trim();
  } catch {
    // Not an absolute URL.
  }

  const prefixMatch = value.match(/^(?:qr:)?(product|product_id|productid|sku|variant|variant_id|variantid|code|id)\s*[:=#-]\s*(.+)$/i);
  if (prefixMatch?.[1] && prefixMatch?.[2]) {
    return prefixMatch[1].toLowerCase().startsWith("product")
      ? `PRODUCT:${prefixMatch[2].trim()}`
      : prefixMatch[2].trim();
  }

  return value;
};

const HELD_POS_ORDERS_KEY = "admin-pos-held-orders";

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  CASH: "Tiền mặt",
  COD: "Tiền mặt",
  BANK_TRANSFER: "Chuyển khoản",
  CREDIT_CARD: "Thẻ",
  E_WALLET: "Ví điện tử",
  MIXED: "Nhiều phương thức"
};

const POS_PRODUCT_PAGE_SIZE = 15;

const AdminPosPage = () => {
  const [keyword, setKeyword] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [scannerStatus, setScannerStatus] = useState("");
  const [lastScannedRaw, setLastScannedRaw] = useState("");

  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [customers, setCustomers] = useState<AdminUserListItem[]>([]);
  const [posOrders, setPosOrders] = useState<AdminPosOrderResponse[]>([]);
  const [heldOrders, setHeldOrders] = useState<HeldPosOrder[]>([]);
  const [activeCoupons, setActiveCoupons] = useState<Coupon[]>([]);
  const [cartItems, setCartItems] = useState<PosCartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [customerMode, setCustomerMode] = useState<"WALK_IN" | "EXISTING" | "GUEST">("WALK_IN");
  const [customerId, setCustomerId] = useState<AdminId>(0);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [paymentLines, setPaymentLines] = useState<PosPaymentLine[]>([
    { id: "default", method: "CASH", amount: 0, cashReceived: 0, referenceCode: "" }
  ]);
  const [couponCode, setCouponCode] = useState("");
  const [couponPreview, setCouponPreview] = useState<AdminPosCouponPreviewResponse | null>(null);
  const [couponApplying, setCouponApplying] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [manualDiscount, setManualDiscount] = useState(0);
  const [cashReceived, setCashReceived] = useState(0);
  const [note, setNote] = useState("");
  const [historyKeyword, setHistoryKeyword] = useState("");
  const [lastOrder, setLastOrder] = useState<AdminPosOrderResponse | null>(null);
  const [cashierSession, setCashierSession] = useState<AdminPosCashierSession | null>(null);
  const [cashierName, setCashierName] = useState("");
  const [openingCash, setOpeningCash] = useState(0);
  const [closingCash, setClosingCash] = useState(0);
  const [returnOrder, setReturnOrder] = useState<AdminPosOrderResponse | null>(null);
  const [returnQuantities, setReturnQuantities] = useState<Record<string, number>>({});
  const [returnNote, setReturnNote] = useState("");
  const scanLockRef = useRef(false);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const barcodeDetectorRef = useRef<NativeBarcodeDetector | null>(null);
  const qrInputRef = useRef<HTMLInputElement>(null);
  const couponInputRef = useRef<HTMLInputElement>(null);
  const checkoutBtnRef = useRef<HTMLButtonElement>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const scanCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanTimerRef = useRef<number | null>(null);
  const scanReadingRef = useRef(false);
  const scanMissTimerRef = useRef<number>(0);
  const [scanFrameCount, setScanFrameCount] = useState(0);
  const [printTriggered, setPrintTriggered] = useState(false);
  const [posProductPage, setPosProductPage] = useState(1);
  useEffect(() => {
    if (printTriggered && lastOrder) {
      const timer = setTimeout(() => {
        window.print();
        setPrintTriggered(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [printTriggered, lastOrder]);

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F2") {
        e.preventDefault();
        qrInputRef.current?.focus();
      } else if (e.key === "F4") {
        e.preventDefault();
        couponInputRef.current?.focus();
      } else if (e.key === "F8") {
        e.preventDefault();
        checkoutBtnRef.current?.click();
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await adminProductService.getProducts({ keyword: keyword || undefined, status: "ACTIVE", page: 0, size: 100 });
      setProducts(data.content);
      setPosProductPage(1);
    } catch (error) {
      toast.error("Không thể tải sản phẩm bán tại quầy");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchProducts();
    void fetchCustomers();
    void fetchPosOrders();
    void fetchCurrentSession();
    void fetchActiveCoupons();
    loadHeldOrders();
    return () => stopCameraScanner();
  }, []);

  const fetchPosOrders = async () => {
    try {
      const data = await adminPosService.getOrders({ keyword: historyKeyword || undefined, page: 0, size: 10 });
      setPosOrders(data.content);
    } catch (error) {
      toast.error("Không thể tải lịch sử đơn POS");
    }
  };

  const fetchCurrentSession = async () => {
    try {
      setCashierSession(await adminPosService.getCurrentSession());
    } catch (error) {
      toast.error("Không thể tải ca thu ngân hiện tại");
    }
  };

  const fetchActiveCoupons = async () => {
    setCouponLoading(true);
    try {
      const coupons = await couponService.getActiveCoupons();
      setActiveCoupons(coupons.filter((coupon) => coupon.type !== "FREE_SHIPPING"));
    } catch (error) {
      setActiveCoupons([]);
    } finally {
      setCouponLoading(false);
    }
  };

  const loadHeldOrders = () => {
    const rawValue = window.localStorage.getItem(HELD_POS_ORDERS_KEY);
    if (!rawValue) return;

    try {
      setHeldOrders(JSON.parse(rawValue));
    } catch {
      window.localStorage.removeItem(HELD_POS_ORDERS_KEY);
    }
  };

  const saveHeldOrders = (orders: HeldPosOrder[]) => {
    setHeldOrders(orders);
    window.localStorage.setItem(HELD_POS_ORDERS_KEY, JSON.stringify(orders));
  };

  const fetchCustomers = async () => {
    try {
      const data = await adminUserService.getUsers({ status: "ACTIVE", page: 0, size: 100 });
      const purchasedCustomers = data.content.filter((customer) => customer.totalOrders > 0);
      setCustomers(purchasedCustomers.length > 0 ? purchasedCustomers : data.content);
      setCustomerId((purchasedCustomers[0] || data.content[0])?.id || 0);
    } catch (error) {
      toast.error("Không thể tải danh sách khách hàng");
    }
  };

  const subtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + Number(item.variant.price || 0), 0),
    [cartItems]
  );
  const normalizedCouponCode = couponCode.trim().toUpperCase();
  const appliedCouponCode = couponPreview?.couponCode?.trim().toUpperCase() || "";
  const couponBaseAmount = Math.max(0, subtotal - Number(manualDiscount || 0));
  const couponDiscount = normalizedCouponCode && appliedCouponCode === normalizedCouponCode ? Number(couponPreview?.discountAmount || 0) : 0;
  const totalDiscount = Math.min(subtotal, Number(manualDiscount || 0) + couponDiscount);
  const finalPrice = Math.max(0, subtotal - totalDiscount);
  const suggestedCoupons = activeCoupons
    .filter((coupon) => !normalizedCouponCode || coupon.code.toUpperCase().includes(normalizedCouponCode))
    .slice(0, 6);
  const totalPaid = paymentLines.reduce((sum, line) => sum + Number(line.amount || 0), 0);
  const cashChange = paymentLines.reduce((sum, line) => {
    if (line.method !== "CASH" && line.method !== "COD") return sum;
    return sum + Math.max(0, Number(line.cashReceived || 0) - Number(line.amount || 0));
  }, 0);
  const qrPaymentPayload = `POS|${finalPrice}|${couponCode || "NO_COUPON"}`;
  const qrPaymentImage = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(qrPaymentPayload)}`;

  useEffect(() => {
    setPaymentLines((lines) => {
      if (lines.length !== 1 || lines[0].amount === finalPrice) return lines;
      const nextCashReceived = lines[0].method === "CASH" ? Math.max(lines[0].cashReceived || 0, finalPrice) : lines[0].cashReceived;
      return [{ ...lines[0], amount: finalPrice, cashReceived: nextCashReceived }];
    });
  }, [finalPrice]);

  const addVariant = (product: AdminProduct, variant: AdminProductVariant) => {
    if (variant.status !== "ACTIVE" || variant.stockQuantity <= 0) {
      toast.error("Biến thể này không còn bán được");
      return;
    }

    const currentQuantity = cartItems.filter((item) => item.variant.id === variant.id).length;
    if (currentQuantity >= variant.stockQuantity) {
      toast.error("Số lượng trong giỏ đã bằng tồn kho");
      return;
    }

    setCartItems((items) => [...items, { productId: product.id, productName: product.name, variant }]);
  };

  const addVariantByCode = async (rawCode: string) => {
    const code = extractQrCode(rawCode);
    if (!code) {
      toast.error("Mã QR/SKU không hợp lệ");
      return;
    }

    try {
      const result = await adminPosService.lookupVariant(code);
      addVariant(
        { id: result.productId, name: result.productName } as AdminProduct,
        {
          id: result.variantId,
          sku: result.sku,
          size: result.size,
          color: result.color,
          stockQuantity: result.stockQuantity,
          status: result.status,
          price: result.price,
          additionalPrice: 0,
          imageUrl: result.imageUrl
        }
      );
      setQrCode("");
      toast.success(`Đã thêm ${result.sku} vào giỏ`);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Không tìm thấy sản phẩm từ mã quét");
    }
  };

  const changeQuantity = (variantId: AdminId | undefined, delta: number) => {
    if (!variantId) return;
    if (delta < 0) {
      const index = cartItems.findIndex((item) => item.variant.id === variantId);
      if (index >= 0) {
        setCartItems((items) => items.filter((_, itemIndex) => itemIndex !== index));
      }
      return;
    }

    const item = cartItems.find((candidate) => candidate.variant.id === variantId);
    if (item) {
      addVariant({ id: item.productId, name: item.productName } as AdminProduct, item.variant);
    }
  };

  const removeVariant = (variantId: AdminId | undefined) => {
    if (!variantId) return;
    setCartItems((items) => items.filter((item) => item.variant.id !== variantId));
  };

  const groupedCartItems = useMemo(() => {
    const map = new Map<AdminId, { item: PosCartItem; quantity: number }>();
    cartItems.forEach((item) => {
      if (!item.variant.id) return;
      const existing = map.get(item.variant.id);
      map.set(item.variant.id, { item, quantity: (existing?.quantity || 0) + 1 });
    });
    return Array.from(map.values());
  }, [cartItems]);

  const buildCheckoutPayload = (includePayments: boolean, couponCodeOverride?: string): AdminPosCreateOrderRequest => ({
    customerType: customerMode,
    customerId: customerMode === "EXISTING" ? customerId : undefined,
    customerName: customerMode === "GUEST" ? customerName || undefined : undefined,
    customerPhone: customerMode === "GUEST" ? customerPhone || undefined : undefined,
    paymentMethod: paymentLines.length > 1 ? "MIXED" : paymentLines[0]?.method || paymentMethod,
    couponCode: (couponCodeOverride ?? normalizedCouponCode) || undefined,
    manualDiscount: Number(manualDiscount || 0),
    cashReceived,
    payments: includePayments
      ? paymentLines.map((line) => ({
        method: line.method,
        amount: Number(line.amount || 0),
        cashReceived: line.method === "CASH" || line.method === "COD" ? Number(line.cashReceived || line.amount || 0) : undefined,
        referenceCode: line.referenceCode || undefined
      }))
      : undefined,
    note: note || undefined,
    items: groupedCartItems.map(({ item, quantity }) => ({
      variantId: item.variant.id!,
      quantity
    }))
  });

  const applyCoupon = async (options?: { silent?: boolean; code?: string }) => {
    const codeToApply = (options?.code || normalizedCouponCode).trim().toUpperCase();
    if (!codeToApply) {
      setCouponPreview(null);
      setCouponError("");
      if (!options?.silent) toast.error("Nhập mã giảm giá trước khi áp dụng");
      return;
    }
    if (groupedCartItems.length === 0) {
      setCouponPreview(null);
      setCouponError("Thêm sản phẩm vào giỏ trước khi áp mã");
      if (!options?.silent) toast.error("Thêm sản phẩm vào giỏ trước khi áp mã");
      return;
    }
    if (Number(manualDiscount || 0) > subtotal) {
      setCouponPreview(null);
      setCouponError("Giảm giá thủ công không được lớn hơn tạm tính");
      if (!options?.silent) toast.error("Giảm giá thủ công không được lớn hơn tạm tính");
      return;
    }

    setCouponApplying(true);
    try {
      const preview = await adminPosService.previewCoupon(buildCheckoutPayload(false, codeToApply));
      setCouponCode(codeToApply);
      setCouponPreview(preview);
      setCouponError("");
      if (!options?.silent) {
        toast.success(`Đã áp mã ${preview.couponCode}: giảm ${formatCurrency(preview.discountAmount)}`);
      }
    } catch (error: any) {
      setCouponPreview(null);
      const message = error?.response?.data?.message || "Mã giảm giá không hợp lệ hoặc chưa đủ điều kiện";
      setCouponError(message);
      if (!options?.silent) toast.error(message);
    } finally {
      setCouponApplying(false);
    }
  };

  const clearCoupon = () => {
    setCouponCode("");
    setCouponPreview(null);
    setCouponError("");
  };

  const selectSuggestedCoupon = (coupon: Coupon) => {
    const code = coupon.code.trim().toUpperCase();
    setCouponCode(code);
    setCouponPreview(null);
    setCouponError("");
    void applyCoupon({ code });
  };

  useEffect(() => {
    if (!normalizedCouponCode) {
      setCouponPreview(null);
      setCouponError("");
      return;
    }
    if (couponPreview && appliedCouponCode !== normalizedCouponCode) {
      setCouponPreview(null);
      setCouponError("");
    }
  }, [normalizedCouponCode]);

  useEffect(() => {
    if (!couponPreview || appliedCouponCode !== normalizedCouponCode || groupedCartItems.length === 0) return;
    const timer = window.setTimeout(() => {
      void applyCoupon({ silent: true });
    }, 400);
    return () => window.clearTimeout(timer);
  }, [subtotal, manualDiscount, customerMode, customerId, customerName, customerPhone, groupedCartItems.length]);

  const updatePaymentLine = (id: string, patch: Partial<PosPaymentLine>) => {
    setPaymentLines((lines) => lines.map((line) => line.id === id ? { ...line, ...patch } : line));
  };

  const addPaymentLine = () => {
    const remaining = Math.max(0, finalPrice - totalPaid);
    setPaymentLines((lines) => [
      ...lines,
      { id: `${Date.now()}`, method: "BANK_TRANSFER", amount: remaining, cashReceived: 0, referenceCode: "" }
    ]);
  };

  const removePaymentLine = (id: string) => {
    setPaymentLines((lines) => lines.length === 1 ? lines : lines.filter((line) => line.id !== id));
  };

  const resetCheckoutForm = () => {
    setCartItems([]);
    setCustomerMode("WALK_IN");
    setCustomerId(customers[0]?.id || 0);
    setCustomerName("");
    setCustomerPhone("");
    setPaymentMethod("CASH");
    setPaymentLines([{ id: "default", method: "CASH", amount: 0, cashReceived: 0, referenceCode: "" }]);
    setCouponCode("");
    setCouponPreview(null);
    setCouponError("");
    setManualDiscount(0);
    setCashReceived(0);
    setNote("");
  };

  const handleOpenSession = async () => {
    try {
      const session = await adminPosService.openSession({ cashierName: cashierName || undefined, openingCash });
      setCashierSession(session);
      toast.success("Đã mở ca thu ngân");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Mở ca thu ngân thất bại");
    }
  };

  const handleCloseSession = async () => {
    if (!cashierSession) return;
    try {
      const session = await adminPosService.closeSession(cashierSession.id, { closingCash });
      setCashierSession(session);
      toast.success("Đã chốt ca thu ngân");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Chốt ca thu ngân thất bại");
    }
  };

  const openReturnModal = async (order: AdminPosOrderResponse) => {
    try {
      const detail = await adminPosService.getOrder(order.orderId);
      setReturnOrder(detail);
      setReturnQuantities({});
      setReturnNote("");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Không thể tải đơn POS");
    }
  };

  const handleReturnExchange = async () => {
    if (!returnOrder) return;
    const returnItems = Object.entries(returnQuantities)
      .map(([orderItemId, quantity]) => ({ orderItemId, quantity: Number(quantity) }))
      .filter((item) => item.quantity > 0);
    const exchangeItems = groupedCartItems.map(({ item, quantity }) => ({ variantId: item.variant.id!, quantity }));
    if (returnItems.length === 0 && exchangeItems.length === 0) {
      toast.error("Chọn sản phẩm trả hoặc thêm sản phẩm đổi vào giỏ hiện tại");
      return;
    }

    try {
      const result = await adminPosService.returnOrExchange(returnOrder.orderId, {
        returnItems,
        exchangeItems,
        paymentMethod,
        note: returnNote || undefined
      });
      toast.success(result.collectAmount > 0
        ? `Cần thu thêm ${formatCurrency(result.collectAmount)}`
        : result.refundAmount > 0
          ? `Cần hoàn ${formatCurrency(result.refundAmount)}`
          : "Đã xử lý trả/đổi hàng");
      setReturnOrder(null);
      setCartItems([]);
      void fetchProducts();
      void fetchPosOrders();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Xử lý trả/đổi hàng thất bại");
    }
  };

  const handleSubmit = async () => {
    if (!cashierSession || cashierSession.status !== "OPEN") {
      toast.error("Vui lòng mở ca thu ngân trước khi bán hàng");
      return;
    }
    if (groupedCartItems.length === 0) {
      toast.error("Vui lòng thêm sản phẩm vào giỏ");
      return;
    }
    if (manualDiscount > subtotal) {
      toast.error("Giảm giá không được lớn hơn tạm tính");
      return;
    }

    setSubmitting(true);
    try {
      let effectiveCouponDiscount = couponDiscount;
      if (normalizedCouponCode && appliedCouponCode !== normalizedCouponCode) {
        const preview = await adminPosService.previewCoupon(buildCheckoutPayload(false));
        setCouponPreview(preview);
        setCouponError("");
        effectiveCouponDiscount = Number(preview.discountAmount || 0);
      }

      const effectiveFinalPrice = Math.max(0, subtotal - Math.min(subtotal, Number(manualDiscount || 0) + effectiveCouponDiscount));
      const effectivePaymentLines = paymentLines.length === 1
        ? paymentLines.map((line) => ({
          ...line,
          amount: effectiveFinalPrice,
          cashReceived: line.method === "CASH" || line.method === "COD" ? Math.max(Number(line.cashReceived || 0), effectiveFinalPrice) : 0
        }))
        : paymentLines;
      const effectiveTotalPaid = effectivePaymentLines.reduce((sum, line) => sum + Number(line.amount || 0), 0);
      if (Math.round(effectiveTotalPaid) !== Math.round(effectiveFinalPrice)) {
        toast.error("Tổng các phương thức thanh toán phải bằng tổng thanh toán sau giảm giá");
        return;
      }
      const invalidCashLine = effectivePaymentLines.find((line) => (line.method === "CASH" || line.method === "COD") && Number(line.cashReceived || 0) < Number(line.amount || 0));
      if (invalidCashLine) {
        toast.error("Tiền khách đưa không được nhỏ hơn số tiền mặt cần thu");
        return;
      }

      const order = await adminPosService.createOrder({
        ...buildCheckoutPayload(false),
        paymentMethod: effectivePaymentLines.length > 1 ? "MIXED" : effectivePaymentLines[0]?.method || paymentMethod,
        payments: effectivePaymentLines.map((line) => ({
          method: line.method,
          amount: Number(line.amount || 0),
          cashReceived: line.method === "CASH" || line.method === "COD" ? Number(line.cashReceived || line.amount || 0) : undefined,
          referenceCode: line.referenceCode || undefined
        }))
      });
      setLastOrder(order);
      resetCheckoutForm();
      toast.success(`Đã tạo đơn ${order.orderCode}`);
      void fetchProducts();
      void fetchPosOrders();
      void fetchCurrentSession();
      setPrintTriggered(true);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Tạo đơn tại quầy thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  const holdCurrentOrder = () => {
    if (cartItems.length === 0) {
      toast.error("Không có sản phẩm để treo đơn");
      return;
    }

    const orderName = customerMode === "EXISTING"
      ? customers.find((customer) => customer.id === customerId)?.fullName || "Khách đã mua"
      : customerMode === "GUEST"
        ? customerName || customerPhone || "Khách vãng lai"
        : "Khách lẻ";

    const heldOrder: HeldPosOrder = {
      id: `${Date.now()}`,
      name: orderName,
      createdAt: new Date().toISOString(),
      cartItems,
      customerMode,
      customerId,
      customerName,
      customerPhone,
      paymentMethod,
      couponCode,
      manualDiscount,
      cashReceived,
      note
    };

    saveHeldOrders([heldOrder, ...heldOrders].slice(0, 20));
    resetCheckoutForm();
    toast.success("Đã treo đơn");
  };

  const restoreHeldOrder = (heldOrder: HeldPosOrder) => {
    setCartItems(heldOrder.cartItems);
    setCustomerMode(heldOrder.customerMode);
    setCustomerId(heldOrder.customerId);
    setCustomerName(heldOrder.customerName);
    setCustomerPhone(heldOrder.customerPhone);
    setPaymentMethod(heldOrder.paymentMethod);
    setCouponCode(heldOrder.couponCode || "");
    setCouponPreview(null);
    setCouponError("");
    setManualDiscount(heldOrder.manualDiscount);
    setCashReceived(heldOrder.cashReceived || 0);
    setNote(heldOrder.note);
    saveHeldOrders(heldOrders.filter((item) => item.id !== heldOrder.id));
    toast.success("Đã mở lại đơn treo");
  };

  const deleteHeldOrder = (id: string) => {
    saveHeldOrders(heldOrders.filter((item) => item.id !== id));
    toast.success("Đã xóa đơn treo");
  };

  const printReceipt = (order: AdminPosOrderResponse) => {
    setLastOrder(order);
    setPrintTriggered(true);
  };

  const oldPrintReceipt = (order: AdminPosOrderResponse) => {
    const printWindow = window.open("", "_blank", "width=420,height=720");
    if (!printWindow) {
      toast.error("Trình duyệt đã chặn cửa sổ in");
      return;
    }

    const itemRows = order.items.map((item) => `
      <tr>
        <td>
          <strong>${item.productName}</strong><br />
          <small>${item.color} / Size ${item.size} / ${item.sku}</small>
        </td>
        <td class="right">${item.quantity}</td>
        <td class="right">${formatCurrency(item.unitPrice)}</td>
        <td class="right">${formatCurrency(item.totalPrice)}</td>
      </tr>
    `).join("");
    const paymentRows = (order.payments || []).map((payment) => `
      <tr>
        <td>${PAYMENT_METHOD_LABELS[payment.method] || payment.method}</td>
        <td class="right">${formatCurrency(payment.amount)}</td>
      </tr>
    `).join("");

    printWindow.document.write(`
      <html>
        <head>
          <title>Hoa don ${order.orderCode}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 16px; color: #111827; }
            h1 { font-size: 20px; margin: 0 0 4px; text-align: center; }
            .muted { color: #64748b; font-size: 12px; text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 12px; }
            th, td { border-bottom: 1px solid #e5e7eb; padding: 8px 0; vertical-align: top; }
            .right { text-align: right; }
            .total { font-size: 16px; font-weight: 800; }
            .meta { margin-top: 16px; font-size: 12px; line-height: 1.5; }
          </style>
        </head>
        <body>
          <h1>SHOE ADMIN</h1>
          <div class="muted">Hoa don ban hang tai quay</div>
          <div class="meta">
            Ma don: <strong>${order.orderCode}</strong><br />
            Khach hang: ${order.customerName || "Khach le"}<br />
            SDT: ${order.customerPhone || "-"}<br />
            Thoi gian: ${new Date(order.createdAt).toLocaleString("vi-VN")}<br />
            Thanh toan: ${PAYMENT_METHOD_LABELS[order.paymentMethod] || order.paymentMethod}<br />
            Ma giam gia: ${order.couponCode || "-"}
          </div>
          <table>
            <thead>
              <tr><th>San pham</th><th class="right">SL</th><th class="right">Gia</th><th class="right">Tien</th></tr>
            </thead>
            <tbody>${itemRows}</tbody>
          </table>
          <table>
            <tbody>
              <tr><td>Tam tinh</td><td class="right">${formatCurrency(order.subtotalAmount)}</td></tr>
              <tr><td>Giam gia</td><td class="right">-${formatCurrency(order.discountAmount)}</td></tr>
              <tr class="total"><td>Tong thanh toan</td><td class="right">${formatCurrency(order.finalPrice)}</td></tr>
              ${paymentRows}
              <tr><td>Khach dua</td><td class="right">${formatCurrency(order.cashReceived || order.finalPrice)}</td></tr>
              <tr><td>Tien thoi</td><td class="right">${formatCurrency(order.changeAmount || 0)}</td></tr>
            </tbody>
          </table>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const requestCameraStream = async () => {
    try {
      return await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
    } catch {
      return navigator.mediaDevices.getUserMedia({ audio: false, video: true });
    }
  };

  const getNativeBarcodeDetector = () => {
    if (barcodeDetectorRef.current) return barcodeDetectorRef.current;
    if (!window.BarcodeDetector) return null;
    try {
      barcodeDetectorRef.current = new window.BarcodeDetector({ formats: ["qr_code"] });
      return barcodeDetectorRef.current;
    } catch {
      return null;
    }
  };

  const decodeQrFromVideoFrame = async () => {
    const video = videoRef.current;
    const canvas = scanCanvasRef.current;
    if (!video || !canvas || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
      return "";
    }

    const width = video.videoWidth;
    const height = video.videoHeight;
    if (!width || !height) return "";

    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) return "";

    context.drawImage(video, 0, 0, width, height);
    const detector = getNativeBarcodeDetector();
    if (detector) {
      try {
        const barcodes = await detector.detect(canvas);
        const rawValue = barcodes.find((barcode) => barcode.rawValue?.trim())?.rawValue?.trim();
        if (rawValue) return rawValue;
      } catch {
        barcodeDetectorRef.current = null;
      }
    }

    const imageData = context.getImageData(0, 0, width, height);
    return jsQR(imageData.data, width, height, { inversionAttempts: "attemptBoth" })?.data || "";
  };

  const handleDecodedQr = async (rawValue: string) => {
    if (scanLockRef.current) return;
    scanLockRef.current = true;
    setLastScannedRaw(rawValue);
    const code = extractQrCode(rawValue);
    setScannerStatus(`Đã đọc mã: ${code}`);
    setQrCode(code);
    stopCameraScanner();
    await addVariantByCode(code);
  };

  const startCameraScanner = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      toast.error("Trình duyệt không cho phép mở camera. Hãy nhập hoặc dùng máy quét vào ô QR/SKU.");
      return;
    }

    try {
      scanLockRef.current = false;
      scanMissTimerRef.current = Date.now();
      setLastScannedRaw("");
      setScanFrameCount(0);
      setScannerStatus("Đang mở camera...");
      setScanning(true);

      const stream = await requestCameraStream();
      streamRef.current = stream;
      await new Promise((resolve) => window.setTimeout(resolve, 0));

      if (!videoRef.current) {
        throw new Error("Video element is not ready");
      }
      videoRef.current.srcObject = stream;
      videoRef.current.setAttribute("playsinline", "true");
      await videoRef.current.play();
      setScannerStatus("Camera đã mở. Đưa QR vào giữa khung hình.");

      scanTimerRef.current = window.setInterval(() => {
        if (scanLockRef.current || scanReadingRef.current) return;
        scanReadingRef.current = true;
        setScanFrameCount((count) => count + 1);
        void (async () => {
          try {
            const decodedText = await decodeQrFromVideoFrame();
            if (decodedText) {
              await handleDecodedQr(decodedText);
              return;
            }

            const now = Date.now();
            if (now - scanMissTimerRef.current > 2500) {
              scanMissTimerRef.current = now;
              setScannerStatus("Đang quét... giữ QR đủ sáng, không rung, cách camera 15-30cm.");
            }
          } finally {
            scanReadingRef.current = false;
          }
        })();
      }, 180);
    } catch (error) {
      setScanning(false);
      scanLockRef.current = false;
      scanReadingRef.current = false;
      setScannerStatus("");
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      toast.error("Không thể mở camera để quét mã. Kiểm tra quyền camera hoặc dùng máy quét nhập vào ô QR/SKU.");
    }
  };

  const stopCameraScanner = () => {
    if (scanTimerRef.current) {
      window.clearInterval(scanTimerRef.current);
      scanTimerRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
    }
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    scanLockRef.current = false;
    scanReadingRef.current = false;
    setScannerStatus("");
    setScanning(false);
  };

  const handleScanQrFile = async (file: File | null) => {
    if (!file) return;
    try {
      const imageUrl = URL.createObjectURL(file);
      const image = new Image();
      image.src = imageUrl;
      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () => reject(new Error("Image load failed"));
      });
      URL.revokeObjectURL(imageUrl);

      const canvas = scanCanvasRef.current || document.createElement("canvas");
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      if (!context) throw new Error("Canvas is not available");
      context.drawImage(image, 0, 0);
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const rawValue = jsQR(imageData.data, canvas.width, canvas.height, { inversionAttempts: "attemptBoth" })?.data;
      if (!rawValue) throw new Error("QR not found in image");

      const code = extractQrCode(rawValue);
      setLastScannedRaw(rawValue);
      setQrCode(code);
      await addVariantByCode(code);
    } catch (error) {
      toast.error("Không đọc được QR từ ảnh. Hãy dùng ảnh rõ, đủ sáng và không bị cắt mép.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Bán hàng tại quầy</h2>
          <p className="mt-1 text-sm text-slate-500">Tạo đơn trực tiếp, thanh toán ngay và trừ tồn kho. <span className="font-semibold text-slate-700">(F2: Tìm sản phẩm | F4: Áp mã giảm giá | F8: Thanh toán)</span></p>
        </div>
        {lastOrder && (
          <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
            <span>Đơn mới: {lastOrder.orderCode} - {formatCurrency(lastOrder.finalPrice)}</span>
            <button onClick={() => printReceipt(lastOrder)} className="rounded-md p-1 hover:bg-emerald-100" title="In lại hóa đơn">
              <Printer size={16} />
            </button>
          </div>
        )}
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-4">
        {cashierSession?.status === "OPEN" ? (
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-slate-800">Ca thu ngân đang mở: {cashierSession.cashierName}</p>
              <p className="mt-1 text-xs text-slate-500">
                Mở lúc {new Date(cashierSession.openedAt).toLocaleString("vi-VN")} · Tiền đầu ca {formatCurrency(cashierSession.openingCash)} ·
                Tiền mặt dự kiến {formatCurrency(cashierSession.expectedCash)}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <input min={0} type="number" value={closingCash} onChange={(event) => setClosingCash(Number(event.target.value))} placeholder="Tiền cuối ca" className="w-36 rounded-lg border border-slate-300 p-2 text-sm outline-none focus:border-[#E32A15]" />
              <button onClick={() => void handleCloseSession()} className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-bold text-red-700 hover:bg-red-100">
                Chốt ca
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-slate-800">Chưa mở ca thu ngân</p>
              <p className="mt-1 text-xs text-slate-500">Mở ca để theo dõi tiền đầu ca, doanh thu tiền mặt và đối soát cuối ca.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <input value={cashierName} onChange={(event) => setCashierName(event.target.value)} placeholder="Tên thu ngân" className="w-40 rounded-lg border border-slate-300 p-2 text-sm outline-none focus:border-[#E32A15]" />
              <input min={0} type="number" value={openingCash} onChange={(event) => setOpeningCash(Number(event.target.value))} placeholder="Tiền đầu ca" className="w-36 rounded-lg border border-slate-300 p-2 text-sm outline-none focus:border-[#E32A15]" />
              <button onClick={() => void handleOpenSession()} className="rounded-lg bg-[#E32A15] px-4 py-2 text-sm font-bold text-white hover:bg-[#247dad]">
                Mở ca
              </button>
            </div>
          </div>
        )}
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <section className="space-y-4">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void addVariantByCode(qrCode);
            }}
            className="rounded-xl border border-slate-200 bg-white p-4"
          >
            <div className="flex flex-wrap gap-3">
              <div className="relative min-w-64 flex-1">
                <QrCode size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  autoFocus
                  ref={qrInputRef}
                  value={qrCode}
                  onChange={(event) => setQrCode(event.target.value)}
                  placeholder="Quét QR/SKU/URL/JSON sản phẩm rồi nhấn Enter"
                  className="w-full rounded-lg border border-slate-300 py-2 pl-10 pr-3 text-sm outline-none focus:border-[#E32A15]"
                />
              </div>
              <button type="submit" className="rounded-lg bg-[#E32A15] px-4 py-2 text-sm font-semibold text-white hover:bg-[#247dad]">
                Thêm từ mã
              </button>
              <button
                type="button"
                onClick={() => scanning ? stopCameraScanner() : void startCameraScanner()}
                className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                <Camera size={18} />
                {scanning ? "Tắt camera" : "Quét camera"}
              </button>
              <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                Chọn ảnh QR
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={scanning}
                  onChange={(event) => {
                    void handleScanQrFile(event.target.files?.[0] || null);
                    event.target.value = "";
                  }}
                />
              </label>
            </div>
            <div className={scanning ? "mt-4 space-y-2" : "hidden"}>
              <div className="relative flex justify-center overflow-hidden rounded-lg bg-slate-900">
                <video ref={videoRef} className="h-auto w-full max-h-[300px] object-cover" muted playsInline></video>
                <canvas ref={scanCanvasRef} className="hidden"></canvas>
              </div>
              <p className="text-xs text-slate-500">Đưa mã vạch vào ô, giữ đủ sáng, không rung và cách camera 15-30cm.</p>
              {scannerStatus && <p className="text-xs font-semibold text-[#E32A15]">{scannerStatus}</p>}
              {lastScannedRaw && <p className="break-all text-xs text-slate-400">Raw: {lastScannedRaw}</p>}
            </div>
          </form>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              void fetchProducts();
            }}
            className="flex gap-3 rounded-xl border border-slate-200 bg-white p-4"
          >
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="Tìm SKU, tên, màu, size, brand"
                className="w-full rounded-lg border border-slate-300 py-2 pl-10 pr-3 text-sm outline-none focus:border-[#E32A15]"
              />
            </div>
            <button type="submit" className="rounded-lg bg-[#E32A15] px-4 py-2 text-sm font-semibold text-white hover:bg-[#247dad]">
              Tìm
            </button>
          </form>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-slate-600">
                <tr>
                  <th className="px-4 py-3">Sản phẩm</th>
                  <th className="px-4 py-3">Biến thể</th>
                  <th className="px-4 py-3">Giá</th>
                  <th className="px-4 py-3">Tồn</th>
                  <th className="px-4 py-3 text-right">Thêm</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">Đang tải...</td></tr>
                ) : products.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">Không tìm thấy sản phẩm đang bán.</td></tr>
                ) : (() => {
                  const allVariants = products.flatMap((product) =>
                    (product.variants || []).map((variant) => ({ product, variant }))
                  );
                  const totalPages = Math.ceil(allVariants.length / POS_PRODUCT_PAGE_SIZE);
                  const pageVariants = allVariants.slice(
                    (posProductPage - 1) * POS_PRODUCT_PAGE_SIZE,
                    posProductPage * POS_PRODUCT_PAGE_SIZE
                  );
                  return (
                    <>
                      {pageVariants.map(({ product, variant }) => (
                        <tr key={`${product.id}-${variant.id}`}>
                          <td className="px-4 py-3 font-semibold text-slate-900">{product.name}</td>
                          <td className="px-4 py-3 text-slate-600">
                            <div>{variant.color} / Size {variant.size}</div>
                            <div className="text-xs text-slate-400">{variant.sku}</div>
                          </td>
                          <td className="px-4 py-3 font-semibold text-slate-900">{formatCurrency(Number(variant.price || 0))}</td>
                          <td className="px-4 py-3">
                            <span className={variant.stockQuantity <= 5 ? "font-bold text-amber-600" : "text-slate-600"}>{variant.stockQuantity}</span>
                            {variant.stockQuantity > 0 && variant.stockQuantity <= 5 && <div className="text-xs text-amber-600">Sắp hết</div>}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              type="button"
                              onClick={() => addVariant(product, variant)}
                              disabled={variant.status !== "ACTIVE" || variant.stockQuantity <= 0}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#E32A15] hover:bg-[#E32A15]/10 disabled:cursor-not-allowed disabled:text-slate-300"
                              title="Thêm vào giỏ"
                            >
                              <Plus size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {totalPages > 1 && (
                        <tr>
                          <td colSpan={5} className="border-t border-slate-200 px-4 py-3">
                            <div className="flex items-center justify-between">
                              <p className="text-xs text-slate-500">
                                Hiển thị <span className="font-semibold">{(posProductPage - 1) * POS_PRODUCT_PAGE_SIZE + 1}</span>–<span className="font-semibold">{Math.min(posProductPage * POS_PRODUCT_PAGE_SIZE, allVariants.length)}</span> trong <span className="font-semibold">{allVariants.length}</span> biến thể
                              </p>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => setPosProductPage((p) => Math.max(1, p - 1))}
                                  disabled={posProductPage === 1}
                                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                  ←
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1)
                                  .filter((page) => page === 1 || page === totalPages || Math.abs(page - posProductPage) <= 1)
                                  .reduce<(number | "...")[]>((acc, page, idx, arr) => {
                                    if (idx > 0 && typeof arr[idx - 1] === "number" && (page as number) - (arr[idx - 1] as number) > 1) acc.push("...");
                                    acc.push(page);
                                    return acc;
                                  }, [])
                                  .map((page, idx) =>
                                    page === "..." ? (
                                      <span key={`ep-${idx}`} className="px-1 text-xs text-slate-400">…</span>
                                    ) : (
                                      <button
                                        key={page}
                                        onClick={() => setPosProductPage(page as number)}
                                        className={`min-w-[28px] rounded-lg border px-2 py-1.5 text-xs font-semibold ${
                                          posProductPage === page
                                            ? "border-[#E32A15] bg-[#E32A15] text-white"
                                            : "border-slate-200 text-slate-700 hover:bg-slate-50"
                                        }`}
                                      >
                                        {page}
                                      </button>
                                    )
                                  )}
                                <button
                                  onClick={() => setPosProductPage((p) => Math.min(totalPages, p + 1))}
                                  disabled={posProductPage === totalPages}
                                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                  →
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })()}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white">
            <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-3">
              <ShoppingCart size={18} className="text-[#E32A15]" />
              <h3 className="font-bold text-slate-800">Giỏ tại quầy</h3>
            </div>
            <div className="max-h-80 divide-y divide-slate-100 overflow-auto">
              {groupedCartItems.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-slate-500">Chưa có sản phẩm.</div>
              ) : (
                groupedCartItems.map(({ item, quantity }) => (
                  <div key={item.variant.id} className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">{item.productName}</p>
                        <p className="text-xs text-slate-500">{item.variant.color} / Size {item.variant.size}</p>
                        <p className="mt-1 text-sm font-semibold text-slate-800">{formatCurrency(Number(item.variant.price || 0))}</p>
                      </div>
                      <button onClick={() => removeVariant(item.variant.id)} className="text-slate-400 hover:text-red-600" title="Xóa khỏi giỏ">
                        <Trash2 size={17} />
                      </button>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button onClick={() => changeQuantity(item.variant.id, -1)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50">
                          <Minus size={15} />
                        </button>
                        <span className="w-8 text-center text-sm font-semibold">{quantity}</span>
                        <button onClick={() => changeQuantity(item.variant.id, 1)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50">
                          <Plus size={15} />
                        </button>
                      </div>
                      <span className="font-bold text-slate-900">{formatCurrency(Number(item.variant.price || 0) * quantity)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <button type="button" onClick={() => setCustomerMode("WALK_IN")} className={`rounded-lg border px-3 py-2 text-sm font-semibold ${customerMode === "WALK_IN" ? "border-[#E32A15] bg-[#E32A15]/10 text-[#E32A15]" : "border-slate-300 text-slate-600 hover:bg-slate-50"}`}>
                  Khách lẻ
                </button>
                <button type="button" onClick={() => setCustomerMode("EXISTING")} className={`rounded-lg border px-3 py-2 text-sm font-semibold ${customerMode === "EXISTING" ? "border-[#E32A15] bg-[#E32A15]/10 text-[#E32A15]" : "border-slate-300 text-slate-600 hover:bg-slate-50"}`}>
                  Khách đã mua
                </button>
                <button type="button" onClick={() => setCustomerMode("GUEST")} className={`rounded-lg border px-3 py-2 text-sm font-semibold ${customerMode === "GUEST" ? "border-[#E32A15] bg-[#E32A15]/10 text-[#E32A15]" : "border-slate-300 text-slate-600 hover:bg-slate-50"}`}>
                  Vãng lai
                </button>
              </div>
              {customerMode === "EXISTING" && (
                <select value={customerId} onChange={(event) => setCustomerId(event.target.value)} className="w-full rounded-lg border border-slate-300 p-2 text-sm outline-none focus:border-[#E32A15]">
                  {customers.length === 0 && <option value={0}>Chưa có khách hàng đã mua</option>}
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.fullName} - {customer.phoneNumber} ({customer.totalOrders} đơn)
                    </option>
                  ))}
                </select>
              )}
              {customerMode === "GUEST" && (
                <>
                  <input value={customerName} onChange={(event) => setCustomerName(event.target.value)} placeholder="Tên khách vãng lai" className="w-full rounded-lg border border-slate-300 p-2 text-sm outline-none focus:border-[#E32A15]" />
                  <input value={customerPhone} onChange={(event) => setCustomerPhone(event.target.value)} placeholder="Số điện thoại" className="w-full rounded-lg border border-slate-300 p-2 text-sm outline-none focus:border-[#E32A15]" />
                </>
              )}
              <div className="space-y-2 rounded-lg border border-slate-200 bg-white p-3">
                <div className="flex gap-2">
                  <input
                    ref={couponInputRef}
                    value={couponCode}
                    onChange={(event) => setCouponCode(event.target.value.toUpperCase())}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        void applyCoupon();
                      }
                    }}
                    placeholder="Mã giảm giá / coupon"
                    className="min-w-0 flex-1 rounded-lg border border-slate-300 p-2 text-sm outline-none focus:border-[#E32A15]"
                  />
                  <button
                    type="button"
                    onClick={() => void applyCoupon()}
                    disabled={couponApplying || !normalizedCouponCode || groupedCartItems.length === 0}
                    className="rounded-lg bg-[#E32A15] px-3 py-2 text-xs font-bold text-white hover:bg-[#247dad] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {couponApplying ? "Đang áp..." : "Áp mã"}
                  </button>
                  {(couponPreview || couponError || couponCode) && (
                    <button type="button" onClick={clearCoupon} className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50">
                      Bỏ
                    </button>
                  )}
                </div>
                {couponPreview && appliedCouponCode === normalizedCouponCode && (
                  <p className="text-xs font-semibold text-emerald-700">
                    Đã áp {couponPreview.couponCode}: giảm {formatCurrency(couponPreview.discountAmount)}
                  </p>
                )}
                {couponError && <p className="text-xs font-semibold text-red-600">{couponError}</p>}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-600">Mã đang có</p>
                    {couponLoading && <span className="text-[11px] font-semibold text-slate-400">Đang tải...</span>}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {suggestedCoupons.length === 0 && !couponLoading ? (
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">Không có mã phù hợp</span>
                    ) : (
                      suggestedCoupons.map((coupon) => {
                        const minimumAmount = Number(coupon.minimumOrderAmount || 0);
                        const disabled = groupedCartItems.length === 0 || couponBaseAmount < minimumAmount || couponApplying;
                        return (
                          <button
                            key={coupon.id}
                            type="button"
                            onClick={() => selectSuggestedCoupon(coupon)}
                            disabled={disabled}
                            title={minimumAmount > 0 ? `Đơn tối thiểu ${formatCurrency(minimumAmount)}` : undefined}
                            className={`rounded-xl border px-3 py-2 text-left text-xs transition ${
                              disabled
                                ? "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400"
                                : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-300 hover:bg-emerald-100"
                            }`}
                          >
                            <span className="block font-black">{coupon.code}</span>
                            <span className="block text-[11px]">{formatCouponValue(coupon)}</span>
                            {minimumAmount > 0 && <span className="block text-[10px]">Tối thiểu {formatCurrency(minimumAmount)}</span>}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
              <input min={0} type="number" value={manualDiscount} onChange={(event) => setManualDiscount(Math.max(0, Number(event.target.value || 0)))} placeholder="Giảm giá thủ công" className="w-full rounded-lg border border-slate-300 p-2 text-sm outline-none focus:border-[#E32A15]" />
              <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-slate-800">Thanh toán</p>
                  <button type="button" onClick={addPaymentLine} className="text-xs font-bold text-[#E32A15] hover:underline">Thêm phương thức</button>
                </div>
                {paymentLines.map((line) => (
                  <div key={line.id} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                    <select
                      value={line.method}
                      onChange={(event) => {
                        const method = event.target.value;
                        setPaymentMethod(method);
                        updatePaymentLine(line.id, {
                          method,
                          cashReceived: method === "CASH" ? Math.max(line.cashReceived || 0, line.amount || 0) : 0
                        });
                      }}
                      className="rounded-lg border border-slate-300 p-2 text-sm outline-none focus:border-[#E32A15]"
                    >
                      <option value="CASH">Tiền mặt</option>
                      <option value="BANK_TRANSFER">Chuyển khoản</option>
                      <option value="CREDIT_CARD">Thẻ</option>
                      <option value="E_WALLET">Ví điện tử</option>
                    </select>
                    <input min={0} type="number" value={line.amount} onChange={(event) => updatePaymentLine(line.id, { amount: Number(event.target.value) })} placeholder="Số tiền" className="rounded-lg border border-slate-300 p-2 text-sm outline-none focus:border-[#E32A15]" />
                    <button type="button" onClick={() => removePaymentLine(line.id)} className="rounded-lg px-2 text-slate-400 hover:bg-white hover:text-red-600" title="Xóa phương thức">
                      <Trash2 size={16} />
                    </button>
                    {(line.method === "CASH" || line.method === "COD") ? (
                      <div className="col-span-2 space-y-2">
                        <input min={0} type="number" value={line.cashReceived} onChange={(event) => {
                          const value = Number(event.target.value);
                          setCashReceived(value);
                          updatePaymentLine(line.id, { cashReceived: value });
                        }} placeholder="Khách đưa" className="w-full rounded-lg border border-slate-300 p-2 text-sm outline-none focus:border-[#E32A15]" />
                        <div className="flex gap-1 overflow-x-auto pb-1">
                          {[50000, 100000, 200000, 500000].map(amount => (
                            <button
                              key={amount}
                              type="button"
                              onClick={() => {
                                setCashReceived(amount);
                                updatePaymentLine(line.id, { cashReceived: amount });
                              }}
                              className="whitespace-nowrap rounded border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-[#E32A15] hover:text-white"
                            >
                              {amount.toLocaleString("vi-VN")}
                            </button>
                          ))}
                          <button
                            type="button"
                            onClick={() => {
                              const exactAmount = Math.max(0, finalPrice - totalPaid + line.cashReceived);
                              setCashReceived(exactAmount);
                              updatePaymentLine(line.id, { cashReceived: exactAmount });
                            }}
                            className="whitespace-nowrap rounded border border-[#E32A15] bg-[#E32A15]/10 px-2 py-1 text-xs font-bold text-[#E32A15] hover:bg-[#E32A15] hover:text-white"
                          >
                            Vừa đủ
                          </button>
                        </div>
                      </div>
                    ) : (
                      <input value={line.referenceCode} onChange={(event) => updatePaymentLine(line.id, { referenceCode: event.target.value })} placeholder="Mã giao dịch" className="col-span-2 rounded-lg border border-slate-300 p-2 text-sm outline-none focus:border-[#E32A15]" />
                    )}
                  </div>
                ))}
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Đã nhập: {formatCurrency(totalPaid)}</span>
                  <span>Tiền thối: {formatCurrency(cashChange)}</span>
                </div>
              </div>
              {paymentLines.some((line) => line.method === "BANK_TRANSFER" || line.method === "E_WALLET") && (
                <div className="rounded-lg border border-dashed border-[#E32A15]/40 bg-[#E32A15]/5 p-3 text-center">
                  <p className="mb-2 text-xs font-semibold text-slate-600">QR thanh toán theo số tiền đơn</p>
                  <img src={qrPaymentImage} alt="QR thanh toán POS" className="mx-auto h-36 w-36 rounded-lg bg-white p-2" />
                  <p className="mt-2 break-all text-xs text-slate-500">{qrPaymentPayload}</p>
                </div>
              )}
              <textarea rows={2} value={note} onChange={(event) => setNote(event.target.value)} placeholder="Ghi chú" className="w-full rounded-lg border border-slate-300 p-2 text-sm outline-none focus:border-[#E32A15]" />
            </div>
            <div className="mt-4 space-y-2 border-t border-slate-200 pt-4 text-sm">
              <div className="flex justify-between text-slate-600"><span>Tạm tính</span><span>{formatCurrency(subtotal)}</span></div>
              <div className="flex justify-between text-slate-600"><span>Giảm thủ công</span><span>-{formatCurrency(manualDiscount)}</span></div>
              <div className="flex justify-between text-slate-600"><span>Giảm coupon</span><span>-{formatCurrency(couponDiscount)}</span></div>
              <div className="flex justify-between font-semibold text-slate-700"><span>Tổng giảm</span><span>-{formatCurrency(totalDiscount)}</span></div>
              <div className="flex justify-between text-lg font-black text-slate-900"><span>Tổng thanh toán</span><span>{formatCurrency(finalPrice)}</span></div>
              <div className="flex justify-between text-slate-600"><span>Đã nhập thanh toán</span><span>{formatCurrency(totalPaid)}</span></div>
              <div className="flex justify-between text-slate-600"><span>Tiền thối</span><span>{formatCurrency(cashChange)}</span></div>
            </div>
            <button
              ref={checkoutBtnRef}
              onClick={() => void handleSubmit()}
              disabled={submitting || groupedCartItems.length === 0}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#E32A15] px-4 py-3 font-bold text-white hover:bg-[#247dad] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Receipt size={20} />
              {submitting ? "Đang tạo đơn..." : "Hoàn tất bán hàng"}
            </button>
            <button
              onClick={holdCurrentOrder}
              disabled={groupedCartItems.length === 0}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 font-bold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <PauseCircle size={20} />
              Treo đơn
            </button>
          </div>
        </aside>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <h3 className="font-bold text-slate-800">Đơn đang treo</h3>
            <span className="text-xs font-semibold text-slate-500">{heldOrders.length} đơn</span>
          </div>
          <div className="divide-y divide-slate-100">
            {heldOrders.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-slate-500">Chưa có đơn treo.</div>
            ) : (
              heldOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between gap-3 p-4">
                  <div>
                    <p className="font-semibold text-slate-900">{order.name}</p>
                    <p className="text-xs text-slate-500">{order.cartItems.length} sản phẩm - {new Date(order.createdAt).toLocaleString("vi-VN")}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => restoreHeldOrder(order)} className="text-slate-400 hover:text-[#E32A15]" title="Mở lại đơn treo">
                      <RotateCcw size={18} />
                    </button>
                    <button onClick={() => deleteHeldOrder(order.id)} className="text-slate-400 hover:text-red-600" title="Xóa đơn treo">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-4 py-3">
            <form
              onSubmit={(event) => {
                event.preventDefault();
                void fetchPosOrders();
              }}
              className="flex items-center gap-3"
            >
              <h3 className="whitespace-nowrap font-bold text-slate-800">Lịch sử POS</h3>
              <input
                value={historyKeyword}
                onChange={(event) => setHistoryKeyword(event.target.value)}
                placeholder="Tìm mã đơn, khách, SĐT"
                className="min-w-0 flex-1 rounded-lg border border-slate-300 p-2 text-sm outline-none focus:border-[#E32A15]"
              />
              <button type="submit" className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                Tìm
              </button>
            </form>
          </div>
          <div className="divide-y divide-slate-100">
            {posOrders.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-slate-500">Chưa có đơn POS.</div>
            ) : (
              posOrders.map((order) => (
                <div key={order.orderId} className="flex items-center justify-between gap-3 p-4">
                  <div>
                    <p className="font-semibold text-slate-900">{order.orderCode}</p>
                    <p className="text-xs text-slate-500">{order.customerName} - {new Date(order.createdAt).toLocaleString("vi-VN")}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-900">{formatCurrency(order.finalPrice)}</span>
                    <button onClick={() => void openReturnModal(order)} className="text-slate-400 hover:text-amber-600" title="Trả/đổi hàng">
                      <RotateCcw size={18} />
                    </button>
                    <button onClick={() => printReceipt(order)} className="text-slate-400 hover:text-[#E32A15]" title="In hóa đơn">
                      <Printer size={18} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {returnOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <h3 className="text-lg font-black text-slate-900">Trả/đổi hàng tại quầy</h3>
                <p className="text-sm text-slate-500">Đơn {returnOrder.orderCode} · {returnOrder.customerName}</p>
              </div>
              <button onClick={() => setReturnOrder(null)} className="rounded-lg px-3 py-1 text-slate-500 hover:bg-slate-100">Đóng</button>
            </div>
            <div className="space-y-4 p-5">
              <div className="overflow-hidden rounded-xl border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead className="bg-slate-50 text-left text-slate-600">
                    <tr>
                      <th className="px-4 py-3">Sản phẩm đã mua</th>
                      <th className="px-4 py-3">Có thể trả</th>
                      <th className="px-4 py-3">Số lượng trả</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {returnOrder.items.map((item) => (
                      <tr key={item.orderItemId}>
                        <td className="px-4 py-3">
                          <p className="font-semibold text-slate-900">{item.productName}</p>
                          <p className="text-xs text-slate-500">{item.color} / Size {item.size} / {item.sku}</p>
                        </td>
                        <td className="px-4 py-3 text-slate-600">{item.availableReturnQuantity}</td>
                        <td className="px-4 py-3">
                          <input
                            min={0}
                            max={item.availableReturnQuantity}
                            type="number"
                            value={returnQuantities[String(item.orderItemId)] || 0}
                            onChange={(event) => setReturnQuantities((values) => ({
                              ...values,
                              [String(item.orderItemId)]: Math.min(item.availableReturnQuantity, Number(event.target.value))
                            }))}
                            className="w-28 rounded-lg border border-slate-300 p-2 text-sm outline-none focus:border-[#E32A15]"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                Nếu là đổi hàng, hãy thêm sản phẩm đổi vào giỏ hiện tại trước khi bấm xử lý. Hệ thống sẽ tự tính tiền hoàn hoặc tiền cần thu thêm.
              </div>
              <textarea rows={2} value={returnNote} onChange={(event) => setReturnNote(event.target.value)} placeholder="Ghi chú trả/đổi" className="w-full rounded-lg border border-slate-300 p-2 text-sm outline-none focus:border-[#E32A15]" />
              <div className="flex justify-end gap-3">
                <button onClick={() => setReturnOrder(null)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50">Hủy</button>
                <button onClick={() => void handleReturnExchange()} className="rounded-lg bg-[#E32A15] px-4 py-2 text-sm font-bold text-white hover:bg-[#247dad]">Xử lý trả/đổi</button>
              </div>
            </div>
          </div>
        </div>
      )}
      <div id="receipt-printer">
        <ReceiptPrinter order={lastOrder} />
      </div>
    </div>
  );
};

export default AdminPosPage;
