import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import vnpayLogo from "../assets/vnpay-logo.svg";
import { DISTRICTS_BY_PROVINCE, PROVINCES } from "../data/vietnamAdministrative";
import { useAuth } from "../hooks/useAuth";
import { useCart } from "../hooks/useCart";
import { addressService } from "../services/addressService";
import { orderService } from "../services/orderService";
import { paymentService } from "../services/paymentService";
import { couponService } from "../services/couponService";
import { useSavedCoupons } from "../hooks/useSavedCoupons";
import { Banknote, CreditCard, ShieldCheck, MapPin, Package, ArrowLeft, Tag } from "lucide-react";

import type { Coupon } from "../types/coupon";
import type { CartItem } from "../types/cart";
import type { Address } from "../types/address";

const formatPrice = (value: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);
const getItemUnitPrice = (item: CartItem | any) => Number(item.finalUnitPrice ?? item.price ?? 0);
const getItemLineTotal = (item: CartItem | any) => Number(item.lineTotal ?? getItemUnitPrice(item) * Number(item.quantity || 0));
type Step = "shipping" | "payment";

type CheckoutState = {
  buyNowItem?: any;
  couponCode?: string;
  note?: string;
  selectedVariantIds?: number[];
  selectedCartItems?: CartItem[];
};

const CheckoutPage = () => {
  const { user } = useAuth();
  const { cart, fetchCart } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const currentUserId = user?.userId ?? 0;
  const checkoutState = (location.state as CheckoutState | null) || null;

  const [step, setStep] = useState<Step>("shipping");
  const [submitting, setSubmitting] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<"COD" | "VNPAY">("COD");
  const [couponCode, setCouponCode] = useState("");
  const [paymentNote, setPaymentNote] = useState("");
  const [vnpayProcessing, setVnpayProcessing] = useState(false);
  const [shippingFee, setShippingFee] = useState(30000);

  const buyNowItem = checkoutState?.buyNowItem;
  const selectedVariantIds = useMemo(() => checkoutState?.selectedVariantIds || [], [checkoutState?.selectedVariantIds]);
  const selectedCartItemsFromState = useMemo(() => checkoutState?.selectedCartItems || [], [checkoutState?.selectedCartItems]);
  const [checkoutSummary, setCheckoutSummary] = useState<any>(null);

  const [selectedAddressId, setSelectedAddressId] = useState<number | undefined>(undefined);
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [districts, setDistricts] = useState<string[]>([]);

  const { savedCoupons } = useSavedCoupons();
  const [activeCoupons, setActiveCoupons] = useState<Coupon[]>([]);

  useEffect(() => {
    couponService.getActiveCoupons().then(setActiveCoupons).catch(console.error);
  }, []);

  const availableSavedCoupons = useMemo(() => activeCoupons.filter((c) => savedCoupons.includes(c.code)), [activeCoupons, savedCoupons]);

  useEffect(() => {
    if (checkoutState?.couponCode) setCouponCode(checkoutState.couponCode);
    if (checkoutState?.note) setPaymentNote(checkoutState.note);
  }, [checkoutState]);

  useEffect(() => {
    if (!currentUserId) return;

    const loadCheckoutData = async () => {
      if (buyNowItem) {
        const preview = await orderService.previewOrder({
          userId: currentUserId,
          couponCode: couponCode || undefined,
          items: [{ variantId: buyNowItem.variantId, quantity: buyNowItem.quantity }]
        });
        setCheckoutSummary(preview);
        return;
      }

      if (selectedCartItemsFromState.length) {
        const preview = await orderService.previewOrder({
          userId: currentUserId,
          couponCode: couponCode || undefined,
          items: selectedCartItemsFromState.map((item) => ({ variantId: item.variantId, quantity: item.quantity }))
        });
        setCheckoutSummary(preview);
        return;
      }

      await fetchCart(currentUserId, couponCode || undefined);
    };

    void loadCheckoutData();
  }, [currentUserId, couponCode, fetchCart, buyNowItem, selectedCartItemsFromState]);

  useEffect(() => {
    const loadDefaultAddress = async () => {
      if (!currentUserId) return;
      try {
        const addresses = await addressService.getByUserId(currentUserId);
        setSavedAddresses(addresses);
        if (addresses.length > 0) {
          const defaultAddress = addresses[0];
          setSelectedAddressId(defaultAddress.id);
          setFullName(defaultAddress.recipientName || "");
          setPhone(defaultAddress.phoneNumber || "");
          setAddressLine(defaultAddress.addressLine || "");
          setCity(defaultAddress.city || "");
          setDistrict(defaultAddress.district || "");
        }
      } catch {
        setSavedAddresses([]);
        setSelectedAddressId(undefined);
      }
    };
    void loadDefaultAddress();
  }, [currentUserId]);

  useEffect(() => {
    if (!selectedAddressId || !savedAddresses.length) return;
    const selectedAddress = savedAddresses.find((address) => address.id === selectedAddressId);
    if (!selectedAddress) return;

    setFullName(selectedAddress.recipientName || "");
    setPhone(selectedAddress.phoneNumber || "");
    setAddressLine(selectedAddress.addressLine || "");
    setCity(selectedAddress.city || "");
    setDistrict(selectedAddress.district || "");
  }, [selectedAddressId, savedAddresses]);

  useEffect(() => {
    if (!city) {
      setDistricts([]);
      setShippingFee(30000);
      return;
    }
    setDistricts(DISTRICTS_BY_PROVINCE[city] || []);
    
    // Simulate GHN Express calculation
    const cityLower = city.toLowerCase();
    if (cityLower.includes('hà nội') || cityLower.includes('hồ chí minh')) {
      setShippingFee(25000);
    } else {
      setShippingFee(40000);
    }
  }, [city]);

  const applyCoupon = async () => {
    if (!currentUserId) return;
    if (!couponCode.trim()) {
      toast.error("Vui lòng nhập mã giảm giá");
      return;
    }
    try {
      const preview = await orderService.previewOrder({
        userId: currentUserId,
        couponCode: couponCode.trim(),
        items: checkoutItems.map((item) => ({ variantId: item.variantId, quantity: item.quantity }))
      });
      setCheckoutSummary(preview);
      if (!buyNowItem && !selectedCartItemsFromState.length) {
        await fetchCart(currentUserId, couponCode.trim());
      }
      toast.success("Áp dụng mã giảm giá thành công");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Mã giảm giá không hợp lệ");
    }
  };

  const updateCouponCode = (value: string) => {
    setCouponCode(value);
    setCheckoutSummary(null);
  };

  const removeCoupon = async () => {
    setCouponCode("");
    try {
      if (buyNowItem) {
        const preview = await orderService.previewOrder({
          userId: currentUserId,
          items: [{ variantId: buyNowItem.variantId, quantity: buyNowItem.quantity }]
        });
        setCheckoutSummary(preview);
      } else if (selectedCartItemsFromState.length) {
        const preview = await orderService.previewOrder({
          userId: currentUserId,
          items: selectedCartItemsFromState.map((item) => ({ variantId: item.variantId, quantity: item.quantity }))
        });
        setCheckoutSummary(preview);
      } else if (currentUserId) {
        await fetchCart(currentUserId);
      }
      setCheckoutSummary(null);
      toast.success("Đã bỏ mã giảm giá");
    } catch {
      toast.error("Không thể bỏ mã giảm giá lúc này");
    }
  };

  const checkoutItems = useMemo(() => {
    if (buyNowItem) {
      return [{
        variantId: buyNowItem.variantId,
        productName: buyNowItem.productName,
        quantity: buyNowItem.quantity,
        price: buyNowItem.price,
        imageUrl: buyNowItem.imageUrl,
        size: buyNowItem.size
      }];
    }
    if (selectedCartItemsFromState.length) return selectedCartItemsFromState;
    if (selectedVariantIds.length && cart?.items?.length) return cart.items.filter((item) => selectedVariantIds.includes(item.variantId));
    return cart?.items || [];
  }, [buyNowItem, selectedCartItemsFromState, selectedVariantIds, cart?.items]);

  const totalItems = useMemo(() => checkoutItems.reduce((sum, item) => sum + item.quantity, 0), [checkoutItems]);
  const isPartialCheckout = !buyNowItem && selectedCartItemsFromState.length > 0;
  const summary = checkoutSummary || cart;
  const fallbackSubtotal = useMemo(() => checkoutItems.reduce((sum, item) => sum + getItemLineTotal(item), 0), [checkoutItems]);
  const subtotal = Number(summary?.subtotal ?? fallbackSubtotal);
  const promotionDiscount = summary?.promotionDiscount || 0;
  const couponDiscount = summary?.couponDiscount || summary?.discountAmount || 0;
  const finalPrice = Number(summary?.finalPrice ?? Math.max(0, fallbackSubtotal - promotionDiscount - couponDiscount));
  const totalAmount = finalPrice + shippingFee;
  const appliedCouponCode = summary?.couponCode;
  const hasAppliedCoupon = couponDiscount > 0 || Boolean(appliedCouponCode);

  const submitOrder = async () => {
    if (!currentUserId) {
      toast.error("Vui lòng đăng nhập lại");
      return;
    }

    if (!checkoutItems.length) {
      toast.error("Chưa có sản phẩm nào được chọn để thanh toán");
      return;
    }

    if (!fullName.trim() || !phone.trim() || !addressLine.trim() || !city.trim() || !district.trim()) {
      toast.error("Vui lòng nhập đầy đủ thông tin giao hàng");
      return;
    }

    setSubmitting(true);
    try {
      if (selectedPayment === "VNPAY") {
        toast.info("Vui lòng nhập thông tin thẻ và bấm Thanh toán.");
        return;
      }

      const orderPayload = {
        userId: currentUserId,
        addressId: selectedAddressId || undefined,
        couponCode: couponCode.trim() || undefined,
        recipientName: fullName,
        phoneNumber: phone,
        addressLine,
        district,
        city,
        country: "Viet Nam",
        note: paymentNote.trim() || undefined,
        paymentMethod: selectedPayment,
        shippingFee: shippingFee,
        items: checkoutItems.map((item) => ({ variantId: item.variantId, quantity: item.quantity }))
      };

      const order = await orderService.createOrder(orderPayload);

      toast.success(`Đặt hàng thành công - Tổng tiền: ${formatPrice(order.finalPrice)}`);
      navigate(`/orders/${order.orderId}`, { replace: true });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Không thể hoàn tất đơn hàng");
    } finally {
      setSubmitting(false);
    }
  };

  const submitVnpayTransfer = async () => {
    if (!currentUserId) {
      toast.error("Vui lòng đăng nhập lại");
      return;
    }

    setVnpayProcessing(true);
    try {
      const orderPayload = {
        userId: currentUserId,
        addressId: selectedAddressId || undefined,
        couponCode: couponCode.trim() || undefined,
        recipientName: fullName,
        phoneNumber: phone,
        addressLine,
        district,
        city,
        country: "Viet Nam",
        note: paymentNote.trim() || undefined,
        paymentMethod: "VNPAY" as const,
        shippingFee: shippingFee,
        items: checkoutItems.map((item) => ({ variantId: item.variantId, quantity: item.quantity }))
      };

      const order = await orderService.createOrder(orderPayload);
      await paymentService.createVnpayUrl({ orderId: order.orderId });
      await paymentService.completeVnpayDemo(order.orderId);

      toast.success("Thanh toán thành công. Đơn hàng đang chờ xác nhận.");
      navigate(`/orders/${order.orderId}`, { replace: true });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Không thể hoàn tất thanh toán");
    } finally {
      setVnpayProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 text-slate-800">
      <div className="mx-auto w-full max-w-[1200px] px-4">
        {/* Breadcrumb */}
        <div className="mb-8 flex items-center gap-2 text-sm font-medium">
          <Link to="/cart" className="text-slate-500 transition hover:text-[#E32A15]">Giỏ hàng</Link>
          <span className="text-slate-300">/</span>
          <span className={step === "shipping" ? "text-[#E32A15] font-bold" : "text-slate-500"}>Giao hàng</span>
          <span className="text-slate-300">/</span>
          <span className={step === "payment" ? "text-[#E32A15] font-bold" : "text-slate-500"}>Thanh toán</span>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
          {/* LEFT COLUMN: MAIN CONTENT */}
          <div className="space-y-6">
            {step === "shipping" ? (
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E32A15]/10 text-[#E32A15]">
                    <MapPin size={20} />
                  </div>
                  <h1 className="text-2xl font-bold text-slate-800">Thông tin giao hàng</h1>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">Họ và tên</label>
                    <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Nhập họ và tên người nhận" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#E32A15] focus:ring-2 focus:ring-[#E32A15]/20" />
                  </div>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
                      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Địa chỉ email" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#E32A15] focus:ring-2 focus:ring-[#E32A15]/20" />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">Số điện thoại</label>
                      <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Số điện thoại liên hệ" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#E32A15] focus:ring-2 focus:ring-[#E32A15]/20" />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">Địa chỉ cụ thể</label>
                    <input value={addressLine} onChange={(e) => setAddressLine(e.target.value)} placeholder="Số nhà, tên đường, phường/xã" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#E32A15] focus:ring-2 focus:ring-[#E32A15]/20" />
                  </div>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">Tỉnh / Thành phố</label>
                      <select value={city} onChange={(e) => { setCity(e.target.value); setDistrict(""); }} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#E32A15] focus:ring-2 focus:ring-[#E32A15]/20">
                        <option value="">Chọn tỉnh / thành</option>
                        {PROVINCES.map((province) => <option key={province.code} value={province.name}>{province.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">Quận / Huyện</label>
                      <select value={district} onChange={(e) => setDistrict(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#E32A15] focus:ring-2 focus:ring-[#E32A15]/20">
                        <option value="">Chọn quận / huyện</option>
                        {districts.map((districtName) => <option key={districtName} value={districtName}>{districtName}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between border-t border-slate-100 pt-6">
                  <Link to="/cart" className="flex items-center justify-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-[#E32A15]">
                    <ArrowLeft size={16} /> Quay lại giỏ hàng
                  </Link>
                  <button type="button" onClick={() => setStep("payment")} className="rounded-xl bg-[#E32A15] px-8 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-[#c92411]">
                    Chuyển đến Thanh toán
                  </button>
                </div>
              </section>
            ) : (
              <section className="space-y-6">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="mb-6 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                      <Package size={20} />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800">Phương thức vận chuyển</h2>
                  </div>
                  
                  <div className="flex items-center justify-between rounded-xl border border-[#E32A15] bg-[#E32A15]/5 p-4 ring-1 ring-[#E32A15]/20">
                    <div className="flex items-center gap-3">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full border-[5px] border-[#E32A15] bg-white"></span>
                      <span className="font-semibold text-slate-800">Giao hàng tận nơi tiêu chuẩn</span>
                    </div>
                    <span className="font-bold text-[#E32A15]">{formatPrice(shippingFee)}</span>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                  <div className="mb-6 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                      <ShieldCheck size={20} />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800">Phương thức thanh toán</h2>
                  </div>

                  <p className="mb-4 text-sm text-slate-500">Toàn bộ giao dịch đều được bảo mật và mã hóa.</p>
                  
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className={`relative flex cursor-pointer items-start gap-4 rounded-xl border p-4 transition-all ${selectedPayment === "COD" ? "border-[#E32A15] bg-[#E32A15]/5 ring-1 ring-[#E32A15]" : "border-slate-200 hover:border-[#E32A15]/50 hover:bg-slate-50"}`}>
                      <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-slate-300">
                        {selectedPayment === "COD" && <span className="h-2.5 w-2.5 rounded-full bg-[#E32A15]" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Banknote size={18} className={selectedPayment === "COD" ? "text-[#E32A15]" : "text-slate-500"} />
                          <span className={`font-semibold ${selectedPayment === "COD" ? "text-[#E32A15]" : "text-slate-700"}`}>Thanh toán khi nhận hàng</span>
                        </div>
                        <p className="mt-1 text-xs text-slate-500">Thanh toán bằng tiền mặt khi shipper giao hàng tới.</p>
                      </div>
                      <input type="radio" name="payment" className="hidden" checked={selectedPayment === "COD"} onChange={() => setSelectedPayment("COD")} />
                    </label>

                    <label className={`relative flex cursor-pointer items-start gap-4 rounded-xl border p-4 transition-all ${selectedPayment === "VNPAY" ? "border-[#0f4a8a] bg-[#0f4a8a]/5 ring-1 ring-[#0f4a8a]" : "border-slate-200 hover:border-[#0f4a8a]/50 hover:bg-slate-50"}`}>
                      <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-slate-300">
                        {selectedPayment === "VNPAY" && <span className="h-2.5 w-2.5 rounded-full bg-[#0f4a8a]" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <CreditCard size={18} className={selectedPayment === "VNPAY" ? "text-[#0f4a8a]" : "text-slate-500"} />
                          <span className={`font-semibold ${selectedPayment === "VNPAY" ? "text-[#0f4a8a]" : "text-slate-700"}`}>Chuyển khoản (VNPay)</span>
                        </div>
                        <p className="mt-1 text-xs text-slate-500">Quét mã QR qua ứng dụng ngân hàng hoặc VNPAY.</p>
                      </div>
                      <input type="radio" name="payment" className="hidden" checked={selectedPayment === "VNPAY"} onChange={() => setSelectedPayment("VNPAY")} />
                    </label>
                  </div>

                  {selectedPayment === "VNPAY" && (
                    <div className="mt-6 rounded-xl border border-blue-100 bg-gradient-to-b from-blue-50/50 to-white p-6 shadow-sm">
                      <div className="text-center">
                        <img src={vnpayLogo} alt="VNPay" className="mx-auto mb-3 h-8" />
                        <h3 className="text-sm font-bold text-[#0f4a8a]">Thanh toán qua quét mã QR</h3>
                        <p className="mt-1 text-xs text-slate-500">Mở ứng dụng ngân hàng trên điện thoại để quét mã</p>
                      </div>

                      <div className="mx-auto mt-6 max-w-sm overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
                        <div className="bg-[#0f4a8a] p-3 text-center text-white">
                          <p className="text-sm font-semibold">Vietcombank - NGUYEN VAN A</p>
                        </div>
                        <div className="flex justify-center p-6 pb-2">
                          <div className="rounded-xl border-4 border-blue-50 p-2 shadow-inner">
                            <img src={`https://img.vietqr.io/image/vcb-123456789-compact2.png?amount=${totalAmount}&addInfo=Thanh toan don hang&accountName=NGUYEN VAN A`} alt="QR Code" className="h-48 w-48 object-contain" />
                          </div>
                        </div>
                        <div className="p-4 pt-2 text-center text-sm text-slate-700">
                          <div className="mb-2 rounded-lg bg-slate-50 p-2 text-xs">
                            <p>Số tiền: <strong className="text-base text-[#E32A15]">{formatPrice(totalAmount)}</strong></p>
                            <p className="mt-1 text-slate-500">Nội dung CK: <strong className="text-slate-800">Thanh toan don hang</strong></p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 flex justify-center">
                        <button
                          type="button"
                          onClick={() => void submitVnpayTransfer()}
                          disabled={vnpayProcessing}
                          className="flex items-center gap-2 rounded-xl bg-[#0f4a8a] px-8 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-[#0c3968] disabled:opacity-60"
                        >
                          {vnpayProcessing ? "Đang xử lý..." : "Tôi đã chuyển khoản thành công"}
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="mt-8 flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between border-t border-slate-100 pt-6">
                    <button type="button" onClick={() => setStep("shipping")} className="flex items-center justify-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-[#E32A15]">
                      <ArrowLeft size={16} /> Quay lại thông tin
                    </button>
                    {selectedPayment === "COD" && (
                      <button type="button" onClick={() => void submitOrder()} disabled={submitting} className="rounded-xl bg-[#E32A15] px-8 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-[#c92411] disabled:opacity-60">
                        {submitting ? "Đang xử lý..." : "Hoàn tất đặt hàng"}
                      </button>
                    )}
                  </div>
                </div>
              </section>
            )}
          </div>

          {/* RIGHT COLUMN: ORDER SUMMARY SIDEBAR */}
          <aside className="h-fit">
            <div className="sticky top-24 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                <h2 className="text-lg font-bold text-slate-800">Đơn hàng của bạn ({totalItems})</h2>
              </div>
              
              <div className="p-6">
                {isPartialCheckout && (
                  <div className="mb-4 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800">
                    {hasAppliedCoupon ? "Đang áp mã cho " : "Bạn đang thanh toán "}
                    <strong>{totalItems}</strong> sản phẩm đã chọn.
                    {hasAppliedCoupon && appliedCouponCode ? (
                      <span className="block mt-1">Mã đang dùng: <strong>{appliedCouponCode}</strong></span>
                    ) : null}
                  </div>
                )}

                <div className="max-h-[320px] space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                  {checkoutItems.map((item) => (
                    <div key={item.variantId} className="flex items-start gap-4">
                      <div className="relative">
                        <img src={item.imageUrl || "https://placehold.co/72x72?text=Shoe"} alt={item.productName} className="h-16 w-16 rounded-xl border border-slate-200 object-cover" />
                        <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-slate-500 text-[10px] font-bold text-white">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-800 line-clamp-2">{item.productName}</p>
                        {item.size && <p className="mt-1 text-xs text-slate-500">Size {item.size}</p>}
                        <p className="mt-1 text-sm font-bold text-[#E32A15]">{formatPrice(getItemLineTotal(item))}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 border-t border-slate-100 pt-6">
                  <div className="flex gap-2 mb-4">
                    <div className="relative flex-1">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input type="text" value={couponCode} onChange={(e) => updateCouponCode(e.target.value)} placeholder="Nhập mã giảm giá" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-3 text-sm uppercase outline-none transition focus:border-[#E32A15] focus:bg-white" />
                    </div>
                    <button type="button" onClick={() => void applyCoupon()} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white transition hover:bg-slate-800">Áp dụng</button>
                  </div>
                  
                  {hasAppliedCoupon && (
                    <button type="button" onClick={() => void removeCoupon()} className="mb-4 w-full rounded-xl border border-slate-200 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">
                      Bỏ mã giảm giá
                    </button>
                  )}

                  {activeCoupons.length > 0 && !hasAppliedCoupon && (
                    <div className="mb-4 rounded-xl border border-slate-100 bg-slate-50 p-3">
                      <p className="mb-2 text-[11px] font-bold uppercase text-slate-500">Mã giảm giá khả dụng</p>
                      <div className="flex max-h-[120px] flex-col gap-2 overflow-y-auto pr-1 custom-scrollbar">
                        {activeCoupons.map(coupon => (
                          <button 
                            key={coupon.code} 
                            type="button" 
                            onClick={() => updateCouponCode(coupon.code)}
                            className={`flex items-center justify-between rounded-lg border bg-white p-2 text-left transition ${couponCode === coupon.code ? "border-[#E32A15] ring-1 ring-[#E32A15]" : "border-slate-200 hover:border-[#E32A15]"}`}
                          >
                            <div className="flex-1 min-w-0 pr-2">
                              <p className={`text-xs font-bold ${couponCode === coupon.code ? "text-[#E32A15]" : "text-slate-800"}`}>{coupon.code}</p>
                              <p className="text-[10px] text-slate-500 line-clamp-1">{coupon.description}</p>
                            </div>
                            <span className="shrink-0 rounded bg-[#E32A15] px-1.5 py-0.5 text-[10px] font-bold text-white">
                              {coupon.type === "PERCENTAGE" ? `-${coupon.discountValue}%` : `-${formatPrice(Number(coupon.discountValue))}`}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-2 space-y-3 border-t border-slate-100 pt-4 text-sm">
                  <div className="flex justify-between text-slate-600">
                    <span>Tạm tính</span>
                    <span className="font-medium text-slate-800">{formatPrice(subtotal)}</span>
                  </div>
                  {promotionDiscount > 0 && (
                    <div className="flex justify-between text-[#E32A15]">
                      <span>Giảm giá trực tiếp</span>
                      <span className="font-semibold">-{formatPrice(promotionDiscount)}</span>
                    </div>
                  )}
                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-[#E32A15]">
                      <span>Mã giảm giá {appliedCouponCode ? `(${appliedCouponCode})` : ""}</span>
                      <span className="font-semibold">-{formatPrice(couponDiscount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-600">
                    <span>Phí vận chuyển</span>
                    <span className="font-medium text-slate-800">{shippingFee > 0 ? formatPrice(shippingFee) : "Miễn phí"}</span>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                  <span className="text-base font-bold text-slate-800">Tổng cộng</span>
                  <div className="text-right">
                    <span className="text-2xl font-black text-[#E32A15]">{formatPrice(totalAmount)}</span>
                    <p className="mt-0.5 text-[10px] text-slate-500">(Đã bao gồm VAT nếu có)</p>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
