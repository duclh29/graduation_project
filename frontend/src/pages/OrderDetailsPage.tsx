import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { CheckCircle2, Clock, Home, Package, RefreshCcw, Truck, XCircle, User, MapPin, CreditCard } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useCart } from "../hooks/useCart";
import { useOrderWebSocket } from "../hooks/useOrderWebSocket";
import { orderService } from "../services/orderService";
import { paymentService } from "../services/paymentService";
import type { OrderDetail, OrderItemDetail } from "../types/order";

const formatPrice = (price: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
const formatDate = (dateString: string) => new Date(dateString).toLocaleString("vi-VN", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" });

const getOrderStatusText = (status: string) => {
  switch (status) {
    case "DELIVERED": return "Đã giao hàng";
    case "RETURN_REQUESTED": return "Chờ duyệt trả hàng";
    case "RETURNED": return "Đã hoàn hàng";
    case "CANCELLED": return "Đã hủy";
    case "PENDING": return "Chờ xác nhận";
    case "CONFIRMED": return "Đã xác nhận";
    case "SHIPPING": return "Đang giao hàng";
    case "PROCESSING": return "Đang xử lý";
    default: return status;
  }
};

const getPaymentStatusText = (order: OrderDetail) => {
  if (order.status === "RETURN_REQUESTED") return "Chờ duyệt hoàn tiền";
  if (order.status === "RETURNED") return "Đã hoàn tiền";
  if (order.status === "CANCELLED") return "Đã hủy";
  if (order.paymentStatus === "REFUNDED") return "Đã hoàn tiền";
  if (order.paymentStatus === "PAID") return "Đã thanh toán";
  return "Chờ thanh toán";
};

const getShippingMethodText = (shippingMethod?: string) => {
  switch (shippingMethod) {
    case "EXPRESS": return "Giao hàng nhanh";
    case "SAME_DAY": return "Giao hàng trong ngày";
    default: return "Giao hàng tiêu chuẩn";
  }
};

const getShippingMethodNote = (shippingMethod?: string) => {
  switch (shippingMethod) {
    case "EXPRESS": return "Dự kiến nhận hàng trong 1-2 ngày làm việc";
    case "SAME_DAY": return "Dự kiến nhận hàng trong ngày";
    default: return "Dự kiến nhận hàng trong 3-5 ngày làm việc";
  }
};

const getRemainingQuantity = (item: OrderItemDetail) => typeof item.remainingQuantity === "number" ? item.remainingQuantity : Math.max(0, item.quantity - (item.returnedQuantity || 0));

const OrderDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [returning, setReturning] = useState(false);
  const [returningItemId, setReturningItemId] = useState<number | null>(null);
  const [paying, setPaying] = useState(false);
  const { user } = useAuth();
  const { fetchCart } = useCart();
  const { lastEvent } = useOrderWebSocket(id);

  const fetchOrderAndCart = async () => {
    try {
      if (!id) return;
      const data = await orderService.getById(id);
      setOrder(data);
      if (user?.userId) {
        await fetchCart(user.userId);
      }
    } catch (error: any) {
      toast.error("Không thể tải thông tin hóa đơn");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void fetchOrderAndCart(); }, [id, user?.userId, fetchCart]);
  useEffect(() => { if (lastEvent && String(lastEvent.orderId) === String(id)) void fetchOrderAndCart(); }, [lastEvent, id]);

  const trackingSteps = useMemo(() => [
    { id: "PENDING", label: "Chờ xác nhận", icon: Clock },
    { id: "CONFIRMED", label: "Đã xác nhận", icon: CheckCircle2 },
    { id: "PROCESSING", label: "Đang xử lý", icon: Package },
    { id: "SHIPPING", label: "Đang giao", icon: Truck },
    { id: "DELIVERED", label: "Thành công", icon: Home }
  ], []);

  if (loading) return <div className="flex min-h-[60vh] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-[#E32A15] border-t-transparent" /></div>;
  if (!order) return <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4"><h2 className="text-xl font-semibold text-slate-700">Không tìm thấy hóa đơn</h2><Link to="/" className="rounded bg-[#E32A15] px-6 py-2 text-white transition-colors hover:bg-[#b31f0e]">Quay lại trang chủ</Link></div>;

  const currentStepIndex = trackingSteps.findIndex((step) => step.id === order.status);
  const isCancelled = order.status === "CANCELLED";
  const isReturned = order.status === "RETURNED";
  const isReturnRequested = order.status === "RETURN_REQUESTED";
  const promotionDiscount = Number(order.promotionDiscount || 0);
  const couponDiscount = Number(order.couponDiscount && order.couponDiscount > 0 ? order.couponDiscount : order.couponCode && order.discount > promotionDiscount ? order.discount - promotionDiscount : 0);
  const genericDiscount = Number(order.discount || 0) - promotionDiscount - couponDiscount;
  const canReturn = order.status === "DELIVERED";

  const handleCancelOrder = async () => {
    if (!user?.userId) return;
    if (!window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này không?")) return;
    setCancelling(true);
    try {
      await orderService.cancelOrder(order.orderId, user.userId);
      setOrder({ ...order, status: "CANCELLED", paymentStatus: "FAILED" });
      toast.success("Hủy hóa đơn thành công");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Không thể hủy hóa đơn");
    } finally {
      setCancelling(false);
    }
  };

  const handleReturnOrder = async () => {
    if (!user?.userId) return;
    if (!window.confirm("Bạn có chắc chắn muốn gửi yêu cầu trả toàn bộ đơn hàng này không?")) return;
    setReturning(true);
    try {
      await orderService.returnOrder(order.orderId, user.userId);
      await fetchOrderAndCart();
      toast.success("Đã gửi yêu cầu trả hàng cho toàn bộ đơn hàng");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Không thể gửi yêu cầu trả hàng");
    } finally {
      setReturning(false);
    }
  };

  const handleReturnSingleItem = async (item: OrderItemDetail) => {
    if (!user?.userId) return;
    const remainingQuantity = getRemainingQuantity(item) - (item.requestedReturnQuantity || 0);
    if (remainingQuantity <= 0) {
      toast.info("Sản phẩm này không còn số lượng khả dụng để yêu cầu trả");
      return;
    }
    const quantityInput = window.prompt(`Nhập số lượng muốn trả cho ${item.productName} (tối đa ${remainingQuantity})`, "1");
    if (!quantityInput) return;
    const quantity = Number(quantityInput);
    if (!Number.isInteger(quantity) || quantity <= 0 || quantity > remainingQuantity) {
      toast.error("Số lượng trả không hợp lệ");
      return;
    }
    const note = window.prompt("Nhập mô tả hoặc lý do trả hàng", `Khách hàng yêu cầu trả ${quantity} sản phẩm ${item.productName}`) || undefined;
    if (!window.confirm(`Xác nhận gửi yêu cầu trả ${quantity} sản phẩm ${item.productName}?`)) return;
    setReturningItemId(item.id);
    try {
      const updatedOrder = await orderService.returnOrderItems(order.orderId, { userId: user.userId, note, items: [{ orderItemId: item.id, quantity }] });
      setOrder(updatedOrder);
      toast.success("Đã gửi yêu cầu trả sản phẩm. Admin sẽ duyệt trước khi cập nhật hóa đơn.");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Không thể gửi yêu cầu trả sản phẩm này");
    } finally {
      setReturningItemId(null);
    }
  };

  const canPayNow =
    (order.paymentMethod === "VNPAY" || order.paymentMethod === "MOMO") &&
    order.status === "PENDING" &&
    order.paymentStatus !== "PAID" &&
    order.paymentStatus !== "REFUNDED";

  const handlePaymentRetry = async () => {
    if (!order || paying) return;
    setPaying(true);
    try {
      if (order.paymentMethod === "VNPAY") {
        const response = await paymentService.createVnpayUrl({ orderId: order.orderId });
        if (response && response.paymentUrl) {
          window.location.href = response.paymentUrl;
        } else {
          toast.error("Không nhận được URL thanh toán từ VNPAY");
        }
      } else if (order.paymentMethod === "MOMO") {
        const response = await paymentService.createMomoUrl({ orderId: order.orderId });
        if (response && response.paymentUrl) {
          window.location.href = response.paymentUrl;
        } else {
          toast.error("Không nhận được URL thanh toán từ MOMO");
        }
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Không thể khởi tạo thanh toán lúc này");
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] py-12 print:bg-white print:py-0">
      <div className="mx-auto max-w-4xl px-4 print:max-w-none print:px-0">
        <div className="mb-6 flex items-center justify-between print:hidden">
          <Link to="/" className="flex items-center text-sm font-medium text-slate-600 hover:text-[#E32A15]">Quay lại trang chủ</Link>
        </div>
        <div className="overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-slate-200 print:rounded-none print:shadow-none print:ring-0">
          <div className="bg-[#E32A15] px-8 py-10 text-white print:bg-white print:px-8 print:py-6 print:text-slate-900">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
              <div className="print:hidden"><h1 className="text-3xl font-extrabold tracking-tight">HÓA ĐƠN CHI TIẾT</h1><p className="mt-2 text-[#e0f2fe]">Cảm ơn bạn đã tin tưởng mua sắm tại Shoe Store</p></div>
              <div className="print:block md:text-right"><p className="text-sm font-medium uppercase tracking-wider text-[#bae6fd] print:text-[#E32A15]">Mã đơn hàng</p><p className="text-2xl font-bold">#{order.orderCode}</p></div>
            </div>
          </div>

          <div className="border-b border-slate-200 bg-slate-50 px-8 py-8 print:hidden">
            {isCancelled ? <div className="flex items-center justify-center gap-3 text-red-600"><XCircle className="h-8 w-8" /><h3 className="text-xl font-bold">Đơn hàng bị hủy</h3></div> :
              isReturnRequested ? <div className="flex items-center justify-center gap-3 text-orange-600"><RefreshCcw className="h-8 w-8" /><h3 className="text-xl font-bold">Yêu cầu trả hàng đang chờ admin duyệt</h3></div> :
                isReturned ? <div className="flex items-center justify-center gap-3 text-orange-600"><RefreshCcw className="h-8 w-8" /><h3 className="text-xl font-bold">Đơn hàng đã được hoàn trả</h3></div> : (
                  <div className="relative mx-auto flex max-w-3xl items-center justify-between">
                    <div className="absolute left-0 top-1/2 -z-10 h-1 w-full -translate-y-1/2 bg-slate-200"><div className="h-full bg-[#E32A15] transition-all duration-500" style={{ width: currentStepIndex > 0 ? `${(currentStepIndex / (trackingSteps.length - 1)) * 100}%` : "0%" }} /></div>
                    {trackingSteps.map((step, index) => { const Icon = step.icon; const isCompleted = currentStepIndex >= index; const isCurrent = currentStepIndex === index; return <div key={step.id} className="flex flex-col items-center gap-2"><div className={`flex h-12 w-12 items-center justify-center rounded-full border-4 backdrop-blur-sm transition-all duration-300 ${isCompleted ? "border-[#E32A15] bg-[#E32A15] text-white shadow-md" : "border-white bg-slate-200 text-slate-400"}`}><Icon strokeWidth={isCompleted ? 2.5 : 2} size={20} className={isCurrent ? "animate-pulse" : ""} /></div><span className={`text-xs font-bold uppercase tracking-wider ${isCurrent ? "text-[#E32A15]" : isCompleted ? "text-slate-700" : "text-slate-400"}`}>{step.label}</span></div>; })}
                  </div>
                )}
          </div>

          <div className="p-8">
            {/* Information Cards */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {/* Card 1: Khách hàng */}
              <div className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center gap-2 text-[#E32A15]">
                  <User size={18} />
                  <h3 className="text-sm font-bold uppercase tracking-widest">Khách hàng</h3>
                </div>
                <div className="flex-1 text-sm text-slate-600">
                  <p className="mb-1 font-bold text-slate-800">{order.customerName}</p>
                  <p className="mb-1">{order.customerEmail}</p>
                  <p>{order.customerPhone}</p>
                </div>
              </div>

              {/* Card 2: Giao hàng */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center gap-2 text-[#E32A15]">
                  <MapPin size={18} />
                  <h3 className="text-sm font-bold uppercase tracking-widest">Giao hàng tới</h3>
                </div>
                <div className="text-sm text-slate-600">
                  <p className="mb-1 font-bold text-slate-800">{order.recipientName}</p>
                  <p className="mb-1">{order.recipientPhone}</p>
                  <p className="leading-relaxed">
                    {order.shippingAddress?.split(',').map(s => s.trim()).filter(s => s && s.toLowerCase() !== 'null').join(', ') || ''}
                  </p>
                </div>
              </div>

              {/* Card 3: Thanh toán & Vận chuyển */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center gap-2 text-[#E32A15]">
                  <CreditCard size={18} />
                  <h3 className="text-sm font-bold uppercase tracking-widest">Thông tin thanh toán</h3>
                </div>
                <div className="space-y-2 text-sm text-slate-600">
                  <div className="flex justify-between"><span className="text-slate-500">Ngày mua:</span><span className="font-semibold text-slate-800">{formatDate(order.createdAt)}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Hình thức:</span><span className="font-semibold text-slate-800">{order.paymentMethod === "COD" ? "Thanh toán khi nhận hàng" : order.paymentMethod}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Vận chuyển:</span><span className="font-semibold text-slate-800">{getShippingMethodText(order.shippingMethod)}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Trạng thái TT:</span><span className={`font-bold ${order.paymentStatus === "PAID" && !isReturnRequested && !isReturned ? "text-green-600" : isCancelled || isReturned || order.paymentStatus === "REFUNDED" ? "text-red-600" : "text-amber-600"}`}>{getPaymentStatusText(order)}</span></div>
                </div>
              </div>
            </div>

            {/* Actions section */}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end print:hidden">
              {canPayNow && (
                <button
                  type="button"
                  onClick={() => void handlePaymentRetry()}
                  disabled={paying}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-2.5 text-sm font-bold text-white shadow-md hover:from-emerald-600 hover:to-teal-700 transition duration-300 disabled:opacity-50 transform hover:scale-[1.02] sm:w-auto"
                >
                  {paying ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Đang khởi tạo...</span>
                    </>
                  ) : (
                    <span>Thanh toán ngay ({order.paymentMethod})</span>
                  )}
                </button>
              )}
              {order.status === "PENDING" && <button type="button" onClick={() => void handleCancelOrder()} disabled={cancelling} className="inline-flex w-full items-center justify-center rounded-xl border border-red-200 bg-white px-6 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50 sm:w-auto">{cancelling ? "Đang xử lý..." : "Hủy hóa đơn"}</button>}
              {canReturn && <button type="button" onClick={() => void handleReturnOrder()} disabled={returning} className="inline-flex w-full items-center justify-center rounded-xl border border-orange-200 bg-white px-6 py-2.5 text-sm font-semibold text-orange-600 transition hover:bg-orange-50 disabled:opacity-50 sm:w-auto">{returning ? "Đang xử lý..." : "Gửi yêu cầu trả toàn bộ đơn"}</button>}
            </div>

            <div className="mt-12">
              <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-[#E32A15]">Danh sách sản phẩm</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-4 py-3 font-bold">Sản phẩm</th><th className="px-4 py-3 text-center font-bold">Size</th><th className="px-4 py-3 text-center font-bold">Yêu cầu trả</th><th className="px-4 py-3 text-center font-bold">Đã trả</th><th className="px-4 py-3 text-center font-bold">Còn lại</th><th className="px-4 py-3 text-right font-bold">Đơn giá</th><th className="px-4 py-3 text-right font-bold">Thành tiền còn lại</th><th className="px-4 py-3 text-right font-bold print:hidden">Hành động</th></tr></thead>
                  <tbody>
                    {order.items.map((item) => { const remainingQuantity = getRemainingQuantity(item); const availableToRequest = Math.max(0, remainingQuantity - (item.requestedReturnQuantity || 0)); return <tr key={item.id} className="border-b border-slate-100 last:border-0"><td className="px-4 py-4 font-medium text-slate-900"><div className="flex items-center gap-4">{item.imageUrl && <img src={item.imageUrl} alt={item.productName} className="h-12 w-12 rounded object-cover shadow-sm" />}<div><div>{item.productName}</div><div className="mt-1 text-xs text-slate-500">SL gốc: {item.quantity}</div></div></div></td><td className="px-4 py-4 text-center">{item.size || "-"}</td><td className="px-4 py-4 text-center">{item.requestedReturnQuantity || 0}</td><td className="px-4 py-4 text-center">{item.returnedQuantity || 0}</td><td className="px-4 py-4 text-center">{remainingQuantity}</td><td className="px-4 py-4 text-right">{formatPrice(item.unitPrice)}</td><td className="px-4 py-4 text-right font-semibold text-slate-900">{formatPrice(item.remainingTotalPrice ?? item.totalPrice)}</td><td className="px-4 py-4 text-right print:hidden">{canReturn && !isReturnRequested && availableToRequest > 0 ? <button type="button" onClick={() => void handleReturnSingleItem(item)} disabled={returningItemId === item.id} className="rounded border border-orange-200 bg-white px-3 py-2 text-xs font-semibold text-orange-600 transition hover:bg-orange-50 disabled:opacity-50">{returningItemId === item.id ? "Đang xử lý..." : "Gửi yêu cầu trả"}</button> : <span className="text-xs text-slate-400">-</span>}</td></tr>; })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-8 flex justify-end print:hidden"><div className="w-full max-w-sm space-y-3"><div className="flex justify-between text-sm text-slate-600"><span>Tạm tính</span><span>{formatPrice(order.subtotal)}</span></div>{promotionDiscount > 0 && <div className="flex justify-between text-sm text-red-600"><span>Giảm giá sản phẩm</span><span>-{formatPrice(promotionDiscount)}</span></div>}{couponDiscount > 0 && <div className="flex justify-between text-sm text-red-600"><span>{order.couponCode ? `Mã giảm giá (${order.couponCode})` : "Mã giảm giá"}</span><span>-{formatPrice(couponDiscount)}</span></div>}{genericDiscount > 0 && <div className="flex justify-between text-sm text-red-600"><span>Giảm giá</span><span>-{formatPrice(genericDiscount)}</span></div>}<div className="flex justify-between text-sm text-slate-600"><span>Phí giao hàng</span><span>{formatPrice(order.shippingFee)}</span></div><div className="flex justify-between border-t border-slate-200 pt-4 text-lg font-bold text-[#E32A15]"><span>Tổng tiền</span><span>{formatPrice(order.finalPrice)}</span></div></div></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsPage;
