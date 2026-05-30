import { useEffect, useMemo, useState } from "react";
import { Download, Eye, Printer, RefreshCcw, Search } from "lucide-react";
import { toast } from "react-toastify";
import { ORDER_STATUS_BADGES, ORDER_STATUS_LABELS, PAYMENT_STATUS_BADGES, PAYMENT_STATUS_LABELS } from "../../constants/adminStatus";
import { adminOrderService } from "../../services/adminOrderService";
import type { AdminId, AdminOrderListItem } from "../../types/admin";
import type { OrderDetail } from "../../types/order";

const PAGE_SIZE = 12;

const formatPrice = (value?: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value || 0);
const formatNumber = (value?: number) => new Intl.NumberFormat("vi-VN").format(value || 0);
const formatDate = (value?: string) => (value ? new Date(value).toLocaleString("vi-VN") : "-");
const labelOfOrderStatus = (status?: string) => (status ? ORDER_STATUS_LABELS[status] || status : "-");
const labelOfPaymentStatus = (status?: string) => (status ? PAYMENT_STATUS_LABELS[status] || status : "-");
const badgeOfOrderStatus = (status?: string) => ORDER_STATUS_BADGES[status || ""] || "bg-slate-100 text-slate-700";
const badgeOfPaymentStatus = (status?: string) => PAYMENT_STATUS_BADGES[status || ""] || "bg-slate-100 text-slate-700";

const PAYMENT_STATUS_OPTIONS = [
  { value: "", label: "Tất cả thanh toán" },
  { value: "PAID", label: "Đã thanh toán" },
  { value: "PENDING", label: "Chờ thanh toán" },
  { value: "UNPAID", label: "Chưa thanh toán" },
  { value: "REFUNDED", label: "Đã hoàn tiền" },
  { value: "FAILED", label: "Thanh toán lỗi" }
];

const AdminInvoicesPage = () => {
  const [invoices, setInvoices] = useState<AdminOrderListItem[]>([]);
  const [keyword, setKeyword] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<OrderDetail | null>(null);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<AdminId | null>(null);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const page = await adminOrderService.getOrders({ keyword: keyword || undefined, page: 0, size: 500, sort: "id,desc" });
      setInvoices(page.content);
      setCurrentPage(1);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Không thể tải danh sách hóa đơn");
    } finally {
      setLoading(false);
    }
  };

  const fetchInvoiceDetail = async (id: AdminId) => {
    try {
      setDetailLoading(true);
      setSelectedInvoiceId(id);
      setSelectedInvoice(await adminOrderService.getOrderById(id));
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Không thể tải chi tiết hóa đơn");
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    void fetchInvoices();
  }, []);

  const filteredInvoices = useMemo(() => {
    return invoices.filter((invoice) => !paymentStatus || invoice.paymentStatus === paymentStatus);
  }, [invoices, paymentStatus]);

  const pagedInvoices = filteredInvoices.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(filteredInvoices.length / PAGE_SIZE));

  const summary = useMemo(() => {
    const paidInvoices = filteredInvoices.filter((invoice) => invoice.paymentStatus === "PAID");
    const pendingInvoices = filteredInvoices.filter((invoice) => invoice.paymentStatus !== "PAID");
    return {
      count: filteredInvoices.length,
      revenue: paidInvoices.reduce((sum, invoice) => sum + (invoice.finalPrice || 0), 0),
      pendingAmount: pendingInvoices.reduce((sum, invoice) => sum + (invoice.finalPrice || 0), 0),
      paidCount: paidInvoices.length
    };
  }, [filteredInvoices]);

  const exportCsv = () => {
    const header = ["Ma hoa don", "Ngay tao", "Khach hang", "Email", "Trang thai don", "Trang thai thanh toan", "Tong tien"];
    const rows = filteredInvoices.map((invoice) => [
      invoice.orderCode,
      formatDate(invoice.createdAt),
      invoice.customerName || "",
      invoice.customerEmail || "",
      labelOfOrderStatus(invoice.status),
      labelOfPaymentStatus(invoice.paymentStatus),
      String(invoice.finalPrice || 0)
    ]);
    const csv = [header, ...rows].map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `hoa-don-admin-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const printInvoice = () => {
    if (!selectedInvoice) return;
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Tổng hóa đơn</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{formatNumber(summary.count)}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Doanh thu đã thu</p>
          <p className="mt-2 text-2xl font-bold text-emerald-600">{formatPrice(summary.revenue)}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Chưa ghi nhận thanh toán</p>
          <p className="mt-2 text-2xl font-bold text-amber-600">{formatPrice(summary.pendingAmount)}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Đã thanh toán</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{formatNumber(summary.paidCount)}</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.45fr,0.95fr]">
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Quản lý hóa đơn</h2>
              <p className="text-sm text-slate-500">Tra cứu, xuất danh sách và in hóa đơn từ dữ liệu đơn hàng.</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => void fetchInvoices()} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                <RefreshCcw size={16} /> Làm mới
              </button>
              <button onClick={exportCsv} className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
                <Download size={16} /> Xuất CSV
              </button>
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-[1fr,220px,auto]">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="Tìm mã hóa đơn hoặc mã đơn" className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-[#E32A15]" />
            </div>
            <select value={paymentStatus} onChange={(event) => { setPaymentStatus(event.target.value); setCurrentPage(1); }} className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#E32A15]">
              {PAYMENT_STATUS_OPTIONS.map((option) => <option key={option.value || "ALL"} value={option.value}>{option.label}</option>)}
            </select>
            <button onClick={() => void fetchInvoices()} className="rounded-xl bg-[#E32A15] px-5 py-3 text-sm font-semibold text-white hover:bg-[#c51f10]">Tìm kiếm</button>
          </div>

          <div className="mt-5 overflow-hidden rounded-xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-slate-600">
                <tr>
                  <th className="px-4 py-3">Hóa đơn</th>
                  <th className="px-4 py-3">Khách hàng</th>
                  <th className="px-4 py-3">Đơn hàng</th>
                  <th className="px-4 py-3">Thanh toán</th>
                  <th className="px-4 py-3 text-right">Tổng tiền</th>
                  <th className="px-4 py-3">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {loading ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-slate-500">Đang tải danh sách hóa đơn...</td></tr>
                ) : pagedInvoices.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-slate-500">Không có hóa đơn phù hợp.</td></tr>
                ) : pagedInvoices.map((invoice) => (
                  <tr key={invoice.id} className={selectedInvoiceId === invoice.id ? "bg-[#E32A15]/5" : ""}>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">HD-{invoice.orderCode}</div>
                      <div className="text-xs text-slate-500">{formatDate(invoice.createdAt)}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-800">{invoice.customerName || "Khách lẻ"}</div>
                      <div className="text-xs text-slate-500">{invoice.customerEmail || "-"}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${badgeOfOrderStatus(invoice.status)}`}>{labelOfOrderStatus(invoice.status)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${badgeOfPaymentStatus(invoice.paymentStatus)}`}>{labelOfPaymentStatus(invoice.paymentStatus)}</span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-900">{formatPrice(invoice.finalPrice)}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => void fetchInvoiceDetail(invoice.id)} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                        <Eye size={14} /> Xem
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-slate-500">Trang {currentPage}/{totalPages}</p>
            <div className="flex gap-2">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40">Trước</button>
              <button disabled={currentPage === totalPages} onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40">Sau</button>
            </div>
          </div>
        </section>

        <aside className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          {!selectedInvoice ? (
            <div className="flex min-h-[520px] items-center justify-center text-center text-sm text-slate-500">Chọn một hóa đơn để xem chi tiết và in.</div>
          ) : detailLoading ? (
            <div className="flex min-h-[520px] items-center justify-center text-sm text-slate-500">Đang tải chi tiết hóa đơn...</div>
          ) : (
            <div className="space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-500">Hóa đơn</p>
                  <h3 className="text-xl font-bold text-slate-900">HD-{selectedInvoice.orderCode}</h3>
                  <p className="text-sm text-slate-500">{formatDate(selectedInvoice.createdAt)}</p>
                </div>
                <button onClick={printInvoice} className="inline-flex items-center gap-2 rounded-lg bg-[#E32A15] px-4 py-2 text-sm font-semibold text-white hover:bg-[#c51f10]">
                  <Printer size={16} /> In
                </button>
              </div>

              <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
                <div><span className="font-semibold">Khách hàng:</span> {selectedInvoice.customerName || "Khách lẻ"}</div>
                <div><span className="font-semibold">Email:</span> {selectedInvoice.customerEmail || "-"}</div>
                <div><span className="font-semibold">SĐT:</span> {selectedInvoice.customerPhone || "-"}</div>
                <div><span className="font-semibold">Địa chỉ:</span> {selectedInvoice.shippingAddress || "-"}</div>
              </div>

              <div className="space-y-3">
                {selectedInvoice.items.map((item) => (
                  <div key={item.id} className="rounded-xl border border-slate-200 p-3">
                    <div className="font-semibold text-slate-900">{item.productName}</div>
                    <div className="text-xs text-slate-500">SKU {item.sku} | Size {item.size || "-"} | SL {item.remainingQuantity ?? item.quantity}</div>
                    <div className="mt-1 text-sm font-semibold text-slate-800">{formatPrice(item.remainingTotalPrice ?? item.totalPrice)}</div>
                  </div>
                ))}
              </div>

              <div className="rounded-xl border border-slate-200 p-4 text-sm">
                <div className="flex justify-between py-1"><span>Tạm tính</span><span>{formatPrice(selectedInvoice.subtotal)}</span></div>
                <div className="flex justify-between py-1"><span>Giảm giá</span><span>- {formatPrice(selectedInvoice.discount)}</span></div>
                <div className="flex justify-between py-1"><span>Phí giao hàng</span><span>{formatPrice(selectedInvoice.shippingFee)}</span></div>
                <div className="mt-2 flex justify-between border-t border-slate-200 pt-3 text-base font-bold text-slate-900"><span>Thành tiền</span><span>{formatPrice(selectedInvoice.finalPrice)}</span></div>
              </div>
            </div>
          )}
        </aside>
      </div>

      {selectedInvoice && (
        <div className="hidden print:block print-invoice bg-white p-8 text-black">
          <div className="mx-auto max-w-3xl">
            <div className="border-b border-slate-300 pb-4 text-center">
              <h1 className="text-2xl font-bold uppercase">Hóa đơn bán hàng</h1>
              <p className="mt-1">Cửa hàng Giày Sneaker - 322 Mỹ Đình, Nam Từ Liêm, Hà Nội</p>
              <p>SĐT: 0868099315</p>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p><strong>Mã hóa đơn:</strong> HD-{selectedInvoice.orderCode}</p>
                <p><strong>Ngày lập:</strong> {formatDate(selectedInvoice.createdAt)}</p>
                <p><strong>Trạng thái:</strong> {labelOfPaymentStatus(selectedInvoice.paymentStatus)}</p>
              </div>
              <div>
                <p><strong>Khách hàng:</strong> {selectedInvoice.customerName || "Khách lẻ"}</p>
                <p><strong>SĐT:</strong> {selectedInvoice.customerPhone || "-"}</p>
                <p><strong>Địa chỉ:</strong> {selectedInvoice.shippingAddress || "-"}</p>
              </div>
            </div>
            <table className="mt-6 w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className="border border-slate-300 px-3 py-2 text-left">Sản phẩm</th>
                  <th className="border border-slate-300 px-3 py-2 text-center">SL</th>
                  <th className="border border-slate-300 px-3 py-2 text-right">Đơn giá</th>
                  <th className="border border-slate-300 px-3 py-2 text-right">Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                {selectedInvoice.items.map((item) => (
                  <tr key={item.id}>
                    <td className="border border-slate-300 px-3 py-2">{item.productName}<br /><span className="text-xs">SKU {item.sku}</span></td>
                    <td className="border border-slate-300 px-3 py-2 text-center">{item.remainingQuantity ?? item.quantity}</td>
                    <td className="border border-slate-300 px-3 py-2 text-right">{formatPrice(item.unitPrice)}</td>
                    <td className="border border-slate-300 px-3 py-2 text-right">{formatPrice(item.remainingTotalPrice ?? item.totalPrice)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="ml-auto mt-6 w-80 text-sm">
              <div className="flex justify-between py-1"><span>Tạm tính</span><span>{formatPrice(selectedInvoice.subtotal)}</span></div>
              <div className="flex justify-between py-1"><span>Giảm giá</span><span>- {formatPrice(selectedInvoice.discount)}</span></div>
              <div className="flex justify-between py-1"><span>Phí giao hàng</span><span>{formatPrice(selectedInvoice.shippingFee)}</span></div>
              <div className="mt-2 flex justify-between border-t border-slate-300 pt-3 text-lg font-bold"><span>Tổng thanh toán</span><span>{formatPrice(selectedInvoice.finalPrice)}</span></div>
            </div>
            <p className="mt-10 text-center text-sm italic">Cảm ơn quý khách và hẹn gặp lại.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInvoicesPage;
