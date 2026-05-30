import { Minus, Plus, ShoppingBag, Trash2, Tag, ArrowRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../hooks/useAuth";
import { useCart } from "../hooks/useCart";
import { useSavedCoupons } from "../hooks/useSavedCoupons";

const formatPrice = (value: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);

const CartPage = () => {
  const { user } = useAuth();
  const { cart, loading, fetchCart, updateQuantity, removeItem } = useCart();
  const { savedCouponDetails } = useSavedCoupons();
  const currentUserId = user?.userId ?? 0;

  const [orderNote, setOrderNote] = useState("");
  const [couponCodeInput, setCouponCodeInput] = useState("");
  const [appliedCouponCode, setAppliedCouponCode] = useState("");
  const [selectedVariantIds, setSelectedVariantIds] = useState<number[]>([]);
  const [activeCoupons, setActiveCoupons] = useState<import("../types/coupon").Coupon[]>([]);

  useEffect(() => {
    import("../services/couponService").then(module => {
      module.couponService.getActiveCoupons().then(setActiveCoupons).catch(console.error);
    });
  }, []);

  useEffect(() => {
    if (!currentUserId) return;
    void fetchCart(currentUserId);
  }, [currentUserId, fetchCart]);

  useEffect(() => {
    if (cart?.couponCode) {
      setAppliedCouponCode(cart.couponCode);
      setCouponCodeInput(cart.couponCode);
    }
  }, [cart?.couponCode]);

  useEffect(() => {
    if (!cart?.items.length) {
      setSelectedVariantIds([]);
      return;
    }
    setSelectedVariantIds((prev) => {
      const validIds = prev.filter((variantId) => cart.items.some((item) => item.variantId === variantId));
      return validIds.length ? validIds : cart.items.map((item) => item.variantId);
    });
  }, [cart?.items]);

  const selectedItems = useMemo(
    () => (cart?.items || []).filter((item) => selectedVariantIds.includes(item.variantId)),
    [cart?.items, selectedVariantIds]
  );

  const totalItems = useMemo(
    () => selectedItems.reduce((sum, item) => sum + item.quantity, 0),
    [selectedItems]
  );

  const selectedTotal = useMemo(
    () => selectedItems.reduce((sum, item) => sum + Number(item.lineTotal ?? (item.finalUnitPrice ?? item.price ?? 0) * item.quantity), 0),
    [selectedItems]
  );

  const allSelected = cart?.items.length ? selectedVariantIds.length === cart.items.length : false;

  const toggleSelectedItem = (variantId: number) => {
    setSelectedVariantIds((prev) => prev.includes(variantId) ? prev.filter((id) => id !== variantId) : [...prev, variantId]);
  };

  const toggleSelectAll = () => {
    if (!cart?.items.length) return;
    setSelectedVariantIds(allSelected ? [] : cart.items.map((item) => item.variantId));
  };

  const handleApplyCoupon = async () => {
    if (!currentUserId) {
      toast.error("Vui lòng đăng nhập lại");
      return;
    }
    const normalized = couponCodeInput.trim().toUpperCase();
    try {
      await fetchCart(currentUserId, normalized || undefined);
      setAppliedCouponCode(normalized);
      toast.success(normalized ? "Áp dụng mã khuyến mãi thành công" : "Đã bỏ mã khuyến mãi");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Mã khuyến mãi không hợp lệ");
    }
  };

  if (loading && !cart?.items.length) {
    return <LoadingSpinner label="Đang tải giỏ hàng..." />;
  }

  if (!currentUserId) {
    return (
      <div className="min-h-[60vh] bg-slate-50 py-10 flex items-center justify-center">
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm w-full max-w-md mx-4">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
            <ShoppingBag className="text-slate-400" size={32} />
          </div>
          <h2 className="text-xl font-bold text-slate-800">Vui lòng đăng nhập</h2>
          <p className="mt-2 text-sm text-slate-500">Đăng nhập để xem và quản lý giỏ hàng của bạn.</p>
          <Link to="/login" className="mt-6 block rounded-xl bg-[#E32A15] px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-[#c92411]">
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 text-slate-800">
      <div className="page-shell">
        <div className="mb-6 flex items-center gap-2 text-sm text-slate-500">
          <Link to="/" className="transition hover:text-[#E32A15]">Trang chủ</Link>
          <span className="text-slate-300">/</span>
          <span className="font-semibold text-slate-800">Giỏ hàng của bạn</span>
        </div>

        {!cart?.items.length ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-20 shadow-sm">
            <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-[#E32A15]/10">
              <ShoppingBag className="text-[#E32A15]" size={40} />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">Giỏ hàng trống</h2>
            <p className="mt-2 max-w-sm text-center text-slate-500">
              Bạn chưa có sản phẩm nào trong giỏ hàng. Khám phá các mẫu giày mới nhất ngay!
            </p>
            <Link to="/" className="mt-8 flex items-center gap-2 rounded-xl bg-[#E32A15] px-8 py-3.5 font-bold text-white shadow-sm transition hover:bg-[#c92411]">
              Tiếp tục mua sắm
              <ArrowRight size={18} />
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_380px] items-start">
            {/* CART ITEMS SECTION */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-4">
                <h1 className="text-2xl font-bold text-slate-800">Giỏ hàng</h1>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  {cart.items.length} sản phẩm
                </span>
              </div>

              <label className="mb-4 flex cursor-pointer items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
                <input 
                  type="checkbox" 
                  checked={allSelected} 
                  onChange={toggleSelectAll} 
                  className="h-5 w-5 rounded border-slate-300 accent-[#E32A15] transition" 
                />
                Chọn tất cả ({cart.items.length} sản phẩm)
              </label>

              <div className="flex flex-col">
                {cart.items.map((item) => {
                  const unitPrice = Number(item.finalUnitPrice ?? item.price ?? 0);
                  const lineTotal = Number(item.lineTotal ?? unitPrice * item.quantity);
                  const stockQuantity = Number(item.stockQuantity ?? 0);
                  const maxQuantity = Math.max(1, stockQuantity || item.quantity || 1);

                  return (
                    <div key={item.variantId} className="group flex flex-col gap-4 border-b border-slate-100 py-6 last:border-b-0 sm:flex-row sm:items-center">
                      <div className="flex items-center gap-4 sm:items-start">
                        <input
                          type="checkbox"
                          checked={selectedVariantIds.includes(item.variantId)}
                          onChange={() => toggleSelectedItem(item.variantId)}
                          className="h-5 w-5 rounded border-slate-300 accent-[#E32A15] transition"
                        />
                        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
                          <img
                            src={item.imageUrl || "https://placehold.co/120x120?text=Shoe"}
                            alt={item.productName}
                            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                          />
                        </div>
                      </div>

                      <div className="flex flex-1 flex-col justify-between sm:h-24 sm:py-1">
                        <div>
                          <h3 className="text-base font-bold text-slate-800 line-clamp-2 hover:text-[#E32A15]">
                            <Link to={`/product/${item.productId}`}>{item.productName}</Link>
                          </h3>
                          <div className="mt-1 flex items-center gap-2 text-xs font-medium text-slate-500">
                            {item.size && <span className="rounded bg-slate-100 px-2 py-0.5">Size: {item.size}</span>}
                          </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between sm:mt-auto">
                          <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50">
                            <button
                              type="button"
                              onClick={() => void updateQuantity(currentUserId, item.variantId, Math.max(1, item.quantity - 1), appliedCouponCode || undefined)}
                              className="flex h-8 w-8 items-center justify-center text-slate-500 transition hover:text-slate-800"
                            >
                              <Minus size={14} />
                            </button>
                            <input
                              type="number"
                              min={1}
                              max={maxQuantity}
                              value={item.quantity}
                              onChange={(event) => {
                                const parsed = Number.parseInt(event.target.value, 10);
                                if (Number.isNaN(parsed) || parsed <= 0) return;
                                if (parsed > maxQuantity) {
                                  toast.error(`Bạn chỉ có thể mua tối đa ${maxQuantity} sản phẩm`);
                                  return;
                                }
                                void updateQuantity(currentUserId, item.variantId, parsed, appliedCouponCode || undefined);
                              }}
                              className="h-8 w-10 bg-transparent text-center text-sm font-semibold text-slate-800 outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (stockQuantity > 0 && item.quantity >= stockQuantity) {
                                  toast.error(`Bạn chỉ có thể mua tối đa ${stockQuantity} sản phẩm`);
                                  return;
                                }
                                void updateQuantity(currentUserId, item.variantId, item.quantity + 1, appliedCouponCode || undefined);
                              }}
                              className="flex h-8 w-8 items-center justify-center text-slate-500 transition hover:text-slate-800"
                            >
                              <Plus size={14} />
                            </button>
                          </div>

                      <div className="flex flex-col items-end gap-1">
                        <span className="text-lg font-bold text-[#E32A15]">{formatPrice(lineTotal)}</span>
                        {unitPrice < Number(item.baseUnitPrice ?? item.price ?? unitPrice) && (
                          <span className="text-xs text-slate-400 line-through">
                            {formatPrice(Number(item.baseUnitPrice ?? item.price ?? unitPrice) * item.quantity)}
                          </span>
                        )}
                      </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => void removeItem(currentUserId, item.variantId, appliedCouponCode || undefined)}
                        className="absolute right-0 top-0 rounded-lg p-2 text-slate-400 opacity-0 transition hover:bg-red-50 hover:text-red-500 sm:relative sm:opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
                        title="Xóa sản phẩm"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* SUMMARY SECTION */}
            <aside className="sticky top-24 space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-bold text-slate-800">Tổng quan đơn hàng</h2>
                
                <div className="mb-4 space-y-3 border-b border-slate-100 pb-4 text-sm text-slate-600">
                  <div className="flex justify-between">
                    <span>Số lượng sản phẩm:</span>
                    <span className="font-semibold text-slate-800">{totalItems}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold">
                    <span className="text-slate-800">Tạm tính:</span>
                    <span className="text-[#E32A15]">{formatPrice(selectedTotal)}</span>
                  </div>
                </div>

                <div className="mb-5">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Ghi chú đơn hàng (Tùy chọn)</label>
                  <textarea
                    value={orderNote}
                    onChange={(event) => setOrderNote(event.target.value)}
                    placeholder="Bạn có muốn nhắn gửi điều gì?"
                    className="h-24 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none transition focus:border-[#E32A15] focus:bg-white focus:ring-1 focus:ring-[#E32A15]/50"
                  />
                </div>

                <div className="mb-6">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Mã khuyến mãi</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input
                        type="text"
                        value={couponCodeInput}
                        onChange={(event) => setCouponCodeInput(event.target.value)}
                        placeholder="Nhập mã voucher"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm font-medium uppercase outline-none transition focus:border-[#E32A15] focus:bg-white"
                      />
                    </div>
                    <button 
                      type="button" 
                      onClick={() => void handleApplyCoupon()} 
                      className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800 active:scale-95"
                    >
                      ÁP DỤNG
                    </button>
                  </div>
                </div>

                <Link
                  to="/checkout"
                  state={{
                    note: orderNote,
                    couponCode: appliedCouponCode,
                    selectedVariantIds,
                    selectedCartItems: selectedItems
                  }}
                  onClick={(event) => {
                    if (!selectedItems.length) {
                      event.preventDefault();
                      toast.error("Vui lòng chọn ít nhất 1 sản phẩm để thanh toán");
                    }
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#E32A15] px-4 py-3.5 text-center text-sm font-bold text-white shadow-md shadow-[#E32A15]/20 transition hover:bg-[#c92411] hover:shadow-lg active:scale-[0.98]"
                >
                  TIẾN HÀNH THANH TOÁN
                  <ArrowRight size={18} />
                </Link>
                <p className="mt-4 text-center text-xs text-slate-500">Bạn có thể chọn phương thức thanh toán và nhập địa chỉ ở bước tiếp theo.</p>
              </div>

              {/* Active Coupons Section */}
              {activeCoupons.length > 0 && (
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="mb-4 flex items-center gap-2 text-slate-800">
                    <Tag size={18} className="text-[#E32A15]" />
                    <h3 className="font-bold">Mã giảm giá của bạn</h3>
                  </div>
                  <div className="flex max-h-[300px] flex-col gap-3 overflow-y-auto pr-2 custom-scrollbar">
                    {activeCoupons.map((coupon) => (
                      <div key={coupon.code} className="group flex flex-col gap-3 rounded-xl border border-dashed border-[#E32A15]/40 bg-[#E32A15]/5 p-3 transition hover:border-[#E32A15] hover:bg-[#E32A15]/10">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="inline-block rounded-md bg-[#E32A15] px-2 py-0.5 text-xs font-bold text-white">{coupon.code}</span>
                            <p className="mt-1.5 text-xs text-slate-600 line-clamp-2">{coupon.description}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setCouponCodeInput(coupon.code);
                            if (!currentUserId) {
                              toast.error("Vui lòng đăng nhập lại");
                              return;
                            }
                            fetchCart(currentUserId, coupon.code).then(() => {
                              setAppliedCouponCode(coupon.code);
                              toast.success("Áp dụng mã khuyến mãi thành công");
                            }).catch((error: any) => {
                              toast.error(error?.response?.data?.message || "Mã khuyến mãi không hợp lệ");
                            });
                          }}
                          className="w-full rounded-lg bg-white border border-[#E32A15]/20 py-2 text-xs font-bold text-[#E32A15] transition hover:bg-[#E32A15] hover:text-white"
                        >
                          Sử dụng ngay
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
