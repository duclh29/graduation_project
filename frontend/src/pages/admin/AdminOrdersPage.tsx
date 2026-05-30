import { useEffect, useMemo, useState } from "react";
import { Eye, RefreshCcw } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { ORDER_STATUS_BADGES, ORDER_STATUS_LABELS, ORDER_STATUS_OPTIONS, PAYMENT_STATUS_BADGES, PAYMENT_STATUS_LABELS } from "../../constants/adminStatus";
import { adminOrderService } from "../../services/adminOrderService";
import { useAdminOrderWebSocket } from "../../hooks/useAdminOrderWebSocket";
import type { AdminId, AdminOrderHistoryItem, AdminOrderListItem } from "../../types/admin";
import type { OrderDetail } from "../../types/order";

const formatPrice = (value?: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value || 0);
const formatDate = (value?: string) => (value ? new Date(value).toLocaleString("vi-VN") : "-");
const labelOfOrderStatus = (status?: string) => (status ? ORDER_STATUS_LABELS[status] || status : "-");
const badgeOfOrderStatus = (status?: string) => ORDER_STATUS_BADGES[status || ""] || "bg-slate-100 text-slate-700";
const labelOfPaymentStatus = (status?: string) => (status ? PAYMENT_STATUS_LABELS[status] || status : "-");
const badgeOfPaymentStatus = (status?: string) => PAYMENT_STATUS_BADGES[status || ""] || "bg-slate-100 text-slate-700";

const actionDescriptions: Record<string, string> = {
  CONFIRMED: "Xác nhận đơn để bắt đầu chuẩn bị hàng.",
  PROCESSING: "Chuyển đơn sang giai đoạn đóng gói và xử lý nội bộ.",
  SHIPPING: "Đánh dấu đơn đã bàn giao cho đơn vị vận chuyển.",
  DELIVERED: "Xác nhận đơn đã giao thành công tới khách hàng.",
  CANCELLED: "Hủy đơn hàng và hoàn lại tồn kho nếu cần.",
  RETURN_REQUESTED_APPROVE: "Duyệt yêu cầu trả hàng và tính lại hóa đơn cho phần hàng còn lại.",
  RETURN_REQUESTED_REJECT: "Từ chối yêu cầu trả hàng và đưa đơn về trạng thái đã giao."
};

const SUMMARY_STATUSES = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPING", "RETURN_REQUESTED", "DELIVERED", "RETURNED", "CANCELLED"] as const;

const ORDERS_PAGE_SIZE = 15;

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState<AdminOrderListItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [summaryOrders, setSummaryOrders] = useState<AdminOrderListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<OrderDetail | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<AdminId | null>(null);
  const [historyItems, setHistoryItems] = useState<AdminOrderHistoryItem[]>([]);
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);
  const [actionNote, setActionNote] = useState("");
  const [submittingAction, setSubmittingAction] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const { lastEvent } = useAdminOrderWebSocket();

  const fetchOrders = async (nextKeyword = keyword, nextStatus = status) => {
    try {
      setLoading(true);
      const data = await adminOrderService.getOrders({ keyword: nextKeyword || undefined, status: nextStatus || undefined, page: 0, size: 100, sort: "id,desc" });
      setOrders(data.content);
      setCurrentPage(1);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Không thể tải đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  const fetchSummaryOrders = async () => {
    try {
      const data = await adminOrderService.getOrders({ page: 0, size: 300, sort: "id,desc" });
      setSummaryOrders(data.content);
    } catch {
      setSummaryOrders([]);
    }
  };

  const fetchHistory = async (id: AdminId) => {
    try {
      setHistoryLoading(true);
      const data = await adminOrderService.getOrderHistory(id);
      setHistoryItems(data);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Không thể tải lịch sử hành động");
    } finally {
      setHistoryLoading(false);
    }
  };

  const fetchOrderDetail = async (id: AdminId) => {
    try {
      setDetailLoading(true);
      const data = await adminOrderService.getOrderById(id);
      setSelectedOrder(data);
      setSelectedOrderId(id);
      setPendingStatus(null);
      setActionNote("");
      await fetchHistory(id);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Không thể tải chi tiết đơn hàng");
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    void fetchOrders();
    void fetchSummaryOrders();
  }, []);

  useEffect(() => {
    const orderIdParam = searchParams.get("orderId");
    if (!orderIdParam) return;
    void fetchOrderDetail(orderIdParam);
  }, [searchParams]);

  useEffect(() => {
    if (!lastEvent) return;
    void fetchOrders();
    void fetchSummaryOrders();
    if (selectedOrderId) {
      void fetchOrderDetail(selectedOrderId);
    }
  }, [lastEvent, selectedOrderId]);

  const summaryCounts = useMemo(() => {
    const counts = Object.fromEntries(SUMMARY_STATUSES.map((item) => [item, 0])) as Record<string, number>;
    for (const order of summaryOrders) {
      counts[order.status] = (counts[order.status] || 0) + 1;
    }
    return counts;
  }, [summaryOrders]);

  const nextStatuses = useMemo(() => {
    switch (selectedOrder?.status) {
      case "PENDING":
        return ["CONFIRMED", "CANCELLED"];
      case "CONFIRMED":
        return ["PROCESSING", "CANCELLED"];
      case "PROCESSING":
        return ["SHIPPING", "CANCELLED"];
      case "SHIPPING":
        return ["DELIVERED"];
      default:
        return [];
    }
  }, [selectedOrder?.status]);

  const openStatusConfirmation = (nextStatus: string) => {
    setPendingStatus(nextStatus);
    setActionNote("");
  };

  const handleStatusSummaryClick = async (nextStatus: string) => {
    setStatus(nextStatus);
    await fetchOrders(keyword, nextStatus);
  };

  const handleBackToStatusActions = async () => {
    setPendingStatus(null);
    setActionNote("");
    if (selectedOrderId) {
      await fetchOrderDetail(selectedOrderId);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrderId || !pendingStatus) return;
    if (!window.confirm(`Bạn có chắc chắn muốn chuyển đơn sang trạng thái "${labelOfOrderStatus(pendingStatus)}" không?`)) return;
    try {
      setSubmittingAction(true);
      const note = actionNote.trim() || `Admin chuyển trạng thái sang ${labelOfOrderStatus(pendingStatus)}`;
      const data = await adminOrderService.updateStatus(selectedOrderId, { status: pendingStatus, note });
      setSelectedOrder(data);
      setSearchParams({ orderId: String(selectedOrderId) });
      setPendingStatus(null);
      setActionNote("");
      toast.success("Cập nhật trạng thái đơn hàng thành công");
      await fetchOrders();
      await fetchSummaryOrders();
      await fetchHistory(selectedOrderId);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Không thể cập nhật trạng thái đơn hàng");
    } finally {
      setSubmittingAction(false);
    }
  };

  const processReturnRequest = async (approved: boolean) => {
    if (!selectedOrderId) return;
    if (!window.confirm(approved ? "Xác nhận duyệt yêu cầu trả hàng này?" : "Xác nhận từ chối yêu cầu trả hàng này?")) return;
    try {
      setSubmittingAction(true);
      const note = actionNote.trim() || (approved ? "Admin duyệt yêu cầu trả hàng" : "Admin từ chối yêu cầu trả hàng");
      const data = approved
        ? await adminOrderService.approveReturnRequest(selectedOrderId, { note })
        : await adminOrderService.rejectReturnRequest(selectedOrderId, { note });
      setSelectedOrder(data);
      setPendingStatus(null);
      setActionNote("");
      toast.success(approved ? "Đã duyệt yêu cầu trả hàng" : "Đã từ chối yêu cầu trả hàng");
      await fetchOrders();
      await fetchSummaryOrders();
      await fetchHistory(selectedOrderId);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Không thể xử lý yêu cầu trả hàng");
    } finally {
      setSubmittingAction(false);
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1.4fr,1fr]">
      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Đơn hàng realtime</h2>
          </div>
          <button onClick={() => { void fetchOrders(); void fetchSummaryOrders(); }} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            <RefreshCcw size={16} /> Làm mới
          </button>
        </div>

        <div className="grid gap-3 md:grid-cols-4 xl:grid-cols-4">
          {SUMMARY_STATUSES.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => void handleStatusSummaryClick(item)}
              className={`rounded-2xl border px-4 py-4 text-left transition ${status === item ? "border-[#E32A15] bg-[#E32A15]/10" : "border-slate-200 bg-white hover:bg-slate-50"}`}
            >
              <div className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${badgeOfOrderStatus(item)}`}>{labelOfOrderStatus(item)}</div>
              <div className="mt-3 text-2xl font-bold text-slate-900">{summaryCounts[item] || 0}</div>
              <div className="mt-1 text-xs text-slate-500">Ấn để xem hóa đơn cần thao tác</div>
            </button>
          ))}
        </div>

        <div className="grid gap-3 md:grid-cols-[1fr,220px,auto,auto]">
          <input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="Tìm theo mã đơn, tên, email" className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#E32A15]" />
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#E32A15]">
            {ORDER_STATUS_OPTIONS.map((item) => <option key={item.value || "ALL"} value={item.value}>{item.label}</option>)}
          </select>
          <button onClick={() => void fetchOrders()} className="rounded-xl bg-[#E32A15] px-4 py-3 text-sm font-semibold text-white hover:bg-[#247dad]">Lọc</button>
          <button onClick={() => { setKeyword(""); setStatus(""); void fetchOrders("", ""); }} className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">Bỏ lọc</button>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-slate-600">
              <tr>
                <th className="px-4 py-3">Mã đơn</th>
                <th className="px-4 py-3">Khách hàng</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3">Thanh toán</th>
                <th className="px-4 py-3">Tổng tiền</th>
                <th className="px-4 py-3">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                <tr><td className="px-4 py-8 text-slate-500" colSpan={6}>Đang tải danh sách đơn hàng...</td></tr>
              ) : orders.length === 0 ? (
                <tr><td className="px-4 py-8 text-slate-500" colSpan={6}>Chưa có hóa đơn cần thao tác với bộ lọc hiện tại.</td></tr>
              ) : orders.slice((currentPage - 1) * ORDERS_PAGE_SIZE, currentPage * ORDERS_PAGE_SIZE).map((order) => (
                <tr key={order.id} className={selectedOrderId === order.id ? "bg-[#E32A15]/5" : ""}>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-900">{order.orderCode}</div>
                    <div className="text-xs text-slate-500">{formatDate(order.createdAt)}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-800">{order.customerName}</div>
                    <div className="text-xs text-slate-500">{order.customerEmail}</div>
                  </td>
                  <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${badgeOfOrderStatus(order.status)}`}>{labelOfOrderStatus(order.status)}</span></td>
                  <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${badgeOfPaymentStatus(order.paymentStatus)}`}>{labelOfPaymentStatus(order.paymentStatus)}</span></td>
                  <td className="px-4 py-3 font-semibold text-slate-900">{formatPrice(order.finalPrice)}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => { setSearchParams({ orderId: String(order.id) }); void fetchOrderDetail(order.id); }} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                      <Eye size={14} /> Xem
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && orders.length > ORDERS_PAGE_SIZE && (
          <div className="flex items-center justify-between border-t border-slate-200 pt-4">
            <p className="text-sm text-slate-500">
              Hiển thị <span className="font-semibold text-slate-700">{(currentPage - 1) * ORDERS_PAGE_SIZE + 1}</span>–<span className="font-semibold text-slate-700">{Math.min(currentPage * ORDERS_PAGE_SIZE, orders.length)}</span> trong <span className="font-semibold text-slate-700">{orders.length}</span> đơn hàng
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                ← Trước
              </button>
              {Array.from({ length: Math.ceil(orders.length / ORDERS_PAGE_SIZE) }, (_, i) => i + 1)
                .filter((page) => page === 1 || page === Math.ceil(orders.length / ORDERS_PAGE_SIZE) || Math.abs(page - currentPage) <= 2)
                .reduce<(number | "...")[]>((acc, page, idx, arr) => {
                  if (idx > 0 && typeof arr[idx - 1] === "number" && (page as number) - (arr[idx - 1] as number) > 1) acc.push("...");
                  acc.push(page);
                  return acc;
                }, [])
                .map((page, idx) =>
                  page === "..." ? (
                    <span key={`ellipsis-${idx}`} className="px-2 text-slate-400">…</span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page as number)}
                      className={`min-w-[36px] rounded-lg border px-3 py-2 text-sm font-semibold ${
                        currentPage === page
                          ? "border-[#E32A15] bg-[#E32A15] text-white"
                          : "border-slate-200 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}
              <button
                onClick={() => setCurrentPage((p) => Math.min(Math.ceil(orders.length / ORDERS_PAGE_SIZE), p + 1))}
                disabled={currentPage === Math.ceil(orders.length / ORDERS_PAGE_SIZE)}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Sau →
              </button>
            </div>
          </div>
        )}
      </section>

      <aside className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {!selectedOrder ? (
          <div className="flex h-full min-h-[480px] items-center justify-center text-center text-slate-500">Chọn một đơn hàng để xem chi tiết và xử lý.</div>
        ) : detailLoading ? (
          <div className="flex h-full min-h-[480px] items-center justify-center text-slate-500">Đang tải chi tiết đơn...</div>
        ) : (
          <div className="space-y-5">
            <div>
              <p className="text-sm text-slate-500">Mã đơn</p>
              <h3 className="text-xl font-bold text-slate-900">{selectedOrder.orderCode}</h3>
              <p className="text-sm text-slate-500">{formatDate(selectedOrder.createdAt)}</p>
            </div>
            <div className="grid gap-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
              <div><span className="font-semibold">Khách:</span> {selectedOrder.customerName}</div>
              <div><span className="font-semibold">Email:</span> {selectedOrder.customerEmail}</div>
              <div><span className="font-semibold">SDT:</span> {selectedOrder.customerPhone}</div>
              <div><span className="font-semibold">Giao đến:</span> {selectedOrder.shippingAddress}</div>
              <div><span className="font-semibold">Trạng thái:</span> {labelOfOrderStatus(selectedOrder.status)}</div>
              <div><span className="font-semibold">Thanh toán:</span> <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${badgeOfPaymentStatus(selectedOrder.paymentStatus)}`}>{labelOfPaymentStatus(selectedOrder.paymentStatus)}</span></div>
              <div><span className="font-semibold">Thành tiền:</span> {formatPrice(selectedOrder.finalPrice)}</div>
            </div>

            <div>
              <p className="mb-2 text-sm font-semibold text-slate-800">Sản phẩm</p>
              <div className="space-y-3">
                {selectedOrder.items.map((item) => (
                  <div key={item.id} className="rounded-xl border border-slate-200 p-3">
                    <div className="font-semibold text-slate-900">{item.productName}</div>
                    <div className="text-xs text-slate-500">SKU {item.sku} | Size {item.size || "-"} | SL gốc {item.quantity} | Yêu cầu trả {item.requestedReturnQuantity || 0} | Đã trả {item.returnedQuantity || 0}</div>
                    <div className="mt-1 text-sm font-medium text-slate-700">{formatPrice(item.remainingTotalPrice ?? item.totalPrice)}</div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-3 text-sm font-semibold text-slate-800">Hành động nhanh</p>
              <div className="flex flex-wrap gap-2">
                {selectedOrder.status === "RETURN_REQUESTED" ? (
                  <>
                    <button onClick={() => openStatusConfirmation("RETURN_REQUESTED_APPROVE")} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">Duyệt trả hàng</button>
                    <button onClick={() => openStatusConfirmation("RETURN_REQUESTED_REJECT")} className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700">Từ chối yêu cầu</button>
                  </>
                ) : nextStatuses.length === 0 ? (
                  <span className="text-sm text-slate-500">Đơn hàng này không còn thao tác tiếp theo.</span>
                ) : nextStatuses.map((nextStatus) => (
                  <button key={nextStatus} onClick={() => openStatusConfirmation(nextStatus)} className={`rounded-lg px-4 py-2 text-sm font-semibold text-white ${nextStatus === "CANCELLED" ? "bg-red-600 hover:bg-red-700" : "bg-[#E32A15] hover:bg-[#247dad]"}`}>
                    {labelOfOrderStatus(nextStatus)}
                  </button>
                ))}
              </div>

              {pendingStatus && (
                <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">Xác nhận thao tác: {pendingStatus === "RETURN_REQUESTED_APPROVE" ? "Duyệt yêu cầu trả hàng" : pendingStatus === "RETURN_REQUESTED_REJECT" ? "Từ chối yêu cầu trả hàng" : labelOfOrderStatus(pendingStatus)}</p>
                      <p className="text-sm text-slate-500">{actionDescriptions[pendingStatus] || "Nhập mô tả để lưu lại lý do thực hiện hành động này."}</p>
                    </div>
                  </div>
                  <textarea value={actionNote} onChange={(e) => setActionNote(e.target.value)} rows={3} placeholder="Nhập mô tả hành động, lý do xử lý hoặc ghi chú cho đơn hàng" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#E32A15]" />
                  <div className="mt-3 flex gap-3">
                    <button type="button" onClick={() => void handleBackToStatusActions()} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">Quay lại</button>
                    <button type="button" disabled={submittingAction} onClick={() => void (pendingStatus === "RETURN_REQUESTED_APPROVE" ? processReturnRequest(true) : pendingStatus === "RETURN_REQUESTED_REJECT" ? processReturnRequest(false) : handleUpdateStatus())} className={`rounded-xl px-4 py-2 text-sm font-semibold text-white ${pendingStatus === "CANCELLED" || pendingStatus === "RETURN_REQUESTED_REJECT" ? "bg-red-600 hover:bg-red-700" : pendingStatus === "RETURN_REQUESTED_APPROVE" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-[#E32A15] hover:bg-[#247dad]"}`}>
                      {submittingAction ? "Đang xử lý..." : "Xác nhận đồng ý"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div>
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-slate-800">Lịch sử hành động</p>
                {selectedOrderId && <button type="button" onClick={() => void fetchHistory(selectedOrderId)} className="text-xs font-semibold text-[#E32A15] hover:underline">Tải lại lịch sử</button>}
              </div>
              <div className="space-y-3">
                {historyLoading ? (
                  <div className="rounded-xl border border-slate-200 p-3 text-sm text-slate-500">Đang tải lịch sử hành động...</div>
                ) : historyItems.length === 0 ? (
                  <div className="rounded-xl border border-slate-200 p-3 text-sm text-slate-500">Chưa có lịch sử hành động.</div>
                ) : historyItems.map((item) => (
                  <div key={item.id} className="rounded-xl border border-slate-200 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${badgeOfOrderStatus(item.status)}`}>{labelOfOrderStatus(item.status)}</span>
                      <span className="text-xs text-slate-500">{formatDate(item.changedAt)}</span>
                    </div>
                    <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Người thao tác: {item.actorName || "Hệ thống"}</p>
                    <p className="mt-2 text-sm text-slate-700">{item.note || "Không có mô tả."}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
};

export default AdminOrdersPage;
