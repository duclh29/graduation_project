import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Clock, Eye, Package, ShieldCheck, RefreshCcw, XCircle, Home, Truck, CheckCircle2 } from "lucide-react";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../hooks/useAuth";
import { useOrderWebSocket } from "../hooks/useOrderWebSocket";
import { orderService } from "../services/orderService";
import type { OrderListResponse } from "../types/order";

const formatPrice = (value: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);
const formatDate = (dateString: string) => new Date(dateString).toLocaleString("vi-VN", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });

const MyOrdersPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<OrderListResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<number | null>(null);
  const { lastEvent } = useOrderWebSocket();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const fetchOrders = async () => {
      try {
        if (user?.userId) {
          const data = await orderService.getMyOrders(user.userId);
          setOrders(data);
        }
      } catch (error) {
        console.error("Failed to load orders", error);
      } finally {
        setLoading(false);
      }
    };

    void fetchOrders();
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    if (!lastEvent) return;
    setOrders(prevOrders => prevOrders.map(o => o.id === lastEvent.orderId ? { ...o, status: lastEvent.status, paymentStatus: lastEvent.paymentStatus || o.paymentStatus } : o));
  }, [lastEvent]);

  if (loading) return <LoadingSpinner label="Đang tải lịch sử mua hàng..." />;

  const handleCancelOrder = async (orderId: number) => {
    if (!user?.userId) return;
    if (!window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này không? Quá trình này không thể hoàn tác.")) return;
    setCancelling(orderId);
    try {
      await orderService.cancelOrder(orderId, user.userId);
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: "CANCELLED", paymentStatus: "FAILED" } : o));
    } finally {
      setCancelling(null);
    }
  };

  const handleReturnOrder = async (orderId: number) => {
    if (!user?.userId) return;
    if (!window.confirm("Bạn có chắc chắn muốn gửi yêu cầu trả đơn hàng này không?")) return;
    setCancelling(orderId);
    try {
      await orderService.returnOrder(orderId, user.userId);
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: "RETURN_REQUESTED" } : o));
      alert("Đã gửi yêu cầu trả hàng. Admin sẽ duyệt trước khi hoàn tiền.");
    } catch (error: any) {
      alert(error?.response?.data?.message || "Không thể gửi yêu cầu trả/hoàn hóa đơn");
    } finally {
      setCancelling(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] py-10">
      <div className="page-shell">
        <div className="mb-4 text-xs text-slate-500"><Link to="/" className="hover:text-[#E32A15]">Trang chủ</Link><span className="mx-2">/</span><span className="font-semibold text-black">Lịch sử mua hàng</span></div>
        <div className="mb-8 flex items-end justify-between"><div><h1 className="text-3xl font-black text-slate-900">Đơn hàng của bạn</h1><p className="mt-2 text-sm text-slate-600">Quản lý và theo dõi trạng thái các hóa đơn mua sắm.</p></div></div>

        {!orders.length ? (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm"><Package className="mx-auto h-16 w-16 text-slate-300" /><p className="mt-4 text-lg font-semibold text-slate-700">Bạn chưa có đơn hàng nào.</p><p className="mt-2 text-sm text-slate-500">Hãy tiếp tục khám phá các sản phẩm tuyệt vời của chúng tôi nhé!</p><Link to="/" className="btn-primary mt-6 inline-block">Bắt đầu mua sắm</Link></div>
        ) : (
          <div className="grid gap-6">
            {orders.map((order) => (
              <div key={order.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
                <div className="flex flex-col items-start justify-between border-b border-slate-100 bg-slate-50 px-6 py-4 sm:flex-row sm:items-center">
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                    <div><p className="text-slate-500">Mã đơn hàng</p><p className="font-bold text-slate-900">#{order.orderCode}</p></div>
                    <div><p className="text-slate-500">Ngày đặt</p><p className="font-medium text-slate-900">{formatDate(order.createdAt)}</p></div>
                    <div><p className="text-slate-500">Tổng tiền</p><p className="font-bold text-[#E32A15]">{formatPrice(order.finalPrice)}</p></div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-end gap-2 sm:mt-0">
                    {order.paymentStatus === "PAID" && order.status !== "RETURNED" && order.status !== "CANCELLED" && order.status !== "RETURN_REQUESTED" && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700 ring-1 ring-inset ring-green-600/20"><ShieldCheck size={14} />Đã thanh toán</span>
                    )}
                    {order.status === "RETURN_REQUESTED" ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700 ring-1 ring-inset ring-orange-600/20"><RefreshCcw size={14} />Chờ duyệt trả hàng</span>
                    ) : order.status === "RETURNED" ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700 ring-1 ring-inset ring-cyan-600/20"><RefreshCcw size={14} />Đã hoàn hàng</span>
                    ) : order.status === "CANCELLED" ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 ring-1 ring-inset ring-red-600/20"><XCircle size={14} />Đã hủy</span>
                    ) : order.status === "DELIVERED" ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700 ring-1 ring-inset ring-green-600/20"><Home size={14} />Giao thành công</span>
                    ) : order.status === "SHIPPING" ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-[#E32A15] ring-1 ring-inset ring-[#E32A15]/20"><Truck size={14} />Đang giao hàng</span>
                    ) : order.status === "PROCESSING" ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-[#E32A15] ring-1 ring-inset ring-[#E32A15]/20"><Package size={14} />Đang xử lý</span>
                    ) : order.status === "CONFIRMED" ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-[#E32A15] ring-1 ring-inset ring-[#E32A15]/20"><CheckCircle2 size={14} />Đã xác nhận</span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-600/20"><Clock size={14} />Chờ xác nhận</span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-center justify-between gap-6 px-6 py-5 sm:flex-row">
                  <div className="flex w-full flex-1 items-center gap-4">
                    <div className="flex -space-x-3">
                      {order.imageUrls.map((url, idx) => <div key={idx} className="h-16 w-16 overflow-hidden rounded-lg border-2 border-white shadow-sm"><img src={url} alt="Product" className="h-full w-full object-cover" /></div>)}
                      {order.totalItems > 3 && <div className="flex h-16 w-16 items-center justify-center rounded-lg border-2 border-white bg-slate-100 shadow-sm text-xs font-bold text-slate-500">+{order.totalItems - 3}</div>}
                    </div>
                    <div><h3 className="font-bold text-slate-800 line-clamp-1">{order.firstProductName}</h3><p className="text-sm text-slate-500">{order.totalItems > 1 ? `và ${order.totalItems - 1} sản phẩm khác` : "1 sản phẩm"}</p></div>
                  </div>

                  <div className="flex w-full shrink-0 flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
                    <Link to={`/orders/${order.id}`} className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"><Eye size={16} />Chi tiết</Link>
                    {order.status === "PENDING" && <button type="button" onClick={() => handleCancelOrder(order.id)} disabled={cancelling === order.id} className="inline-flex items-center justify-center rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50">{cancelling === order.id ? "Đang xử lý..." : "Hủy đơn hàng"}</button>}
                    {order.status === "DELIVERED" && <button type="button" onClick={() => handleReturnOrder(order.id)} disabled={cancelling === order.id} className="inline-flex items-center justify-center rounded-lg border border-orange-200 bg-white px-4 py-2.5 text-sm font-semibold text-orange-600 transition hover:bg-orange-50 disabled:opacity-50">{cancelling === order.id ? "Đang xử lý..." : "Gửi yêu cầu trả hàng"}</button>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrdersPage;
