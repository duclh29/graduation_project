import { useEffect, useState } from "react";
import { BarChart3, Package, ShoppingBag, Users, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { ORDER_STATUS_BADGES, ORDER_STATUS_LABELS, PAYMENT_STATUS_BADGES, PAYMENT_STATUS_LABELS } from "../../constants/adminStatus";
import { useAdminOrderWebSocket } from "../../hooks/useAdminOrderWebSocket";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend } from "recharts";
import { adminDashboardService } from "../../services/adminDashboardService";
import { getProductImage } from "../../services/productImages";
import type { AdminDashboardSummary, AdminRevenueStats, AdminRevenueChartData } from "../../types/admin";

const formatPrice = (value?: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value || 0);
const formatDate = (value?: string) => (value ? new Date(value).toLocaleString("vi-VN") : "-");
const formatAxisMoney = (value: number) => {
  if (value >= 1000000) {
    return `${Number((value / 1000000).toFixed(1)).toLocaleString("vi-VN")}M`;
  }
  if (value >= 1000) {
    return `${Number((value / 1000).toFixed(0)).toLocaleString("vi-VN")}K`;
  }
  return String(value);
};
const PIE_COLORS = ["#E32A15", "#34d399", "#fbbf24", "#f87171", "#a78bfa", "#f472b6", "#fb923c"];

const AdminDashboardPage = () => {
  const [summary, setSummary] = useState<AdminDashboardSummary | null>(null);
  const [revenue, setRevenue] = useState<AdminRevenueStats | null>(null);
  const [chartData, setChartData] = useState<AdminRevenueChartData[]>([]);
  const [categoryStats, setCategoryStats] = useState<any[]>([]);
  const [lowStockVariants, setLowStockVariants] = useState<any[]>([]);
  const [chartDays, setChartDays] = useState(7);
  const [loading, setLoading] = useState(true);
  const { lastEvent } = useAdminOrderWebSocket();

  const load = async (silent = false) => {
    const reportError = (error: unknown, fallback: string) => {
      if (silent) return;
      const err = error as any;
      toast.error(err?.response?.data?.message || fallback);
    };

    try {
      if (!silent) {
        setLoading(true);
      }

      const [summaryResult, revenueResult, chartResult, categoryResult, lowStockResult] = await Promise.allSettled([
        adminDashboardService.getSummary(),
        adminDashboardService.getRevenue(),
        adminDashboardService.getRevenueChart(chartDays),
        adminDashboardService.getCategoryStats(),
        adminDashboardService.getLowStockVariants(10, 10)
      ]);

      if (summaryResult.status === "fulfilled") setSummary(summaryResult.value);
      else reportError(summaryResult.reason, "Không thể tải tổng quan bảng điều khiển");

      if (revenueResult.status === "fulfilled") setRevenue(revenueResult.value);
      else reportError(revenueResult.reason, "Không thể tải doanh thu");

      if (chartResult.status === "fulfilled") setChartData(chartResult.value);
      else reportError(chartResult.reason, "Không thể tải biểu đồ doanh thu");

      if (categoryResult.status === "fulfilled") setCategoryStats(categoryResult.value);
      else reportError(categoryResult.reason, "Không thể tải thống kê danh mục");

      if (lowStockResult.status === "fulfilled") setLowStockVariants(lowStockResult.value);
      else reportError(lowStockResult.reason, "Không thể tải cảnh báo tồn kho");
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    void load();
  }, [chartDays]);

  useEffect(() => {
    if (!lastEvent) return;
    if (lastEvent.eventType === "ORDER_CREATED" || lastEvent.status === "DELIVERED") {
      void load(true);
    }
  }, [lastEvent]);

  const stats = [
    { label: "Doanh thu hôm nay", value: formatPrice(revenue?.todayRevenue), icon: BarChart3, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Doanh thu tháng này", value: formatPrice(revenue?.monthRevenue), icon: BarChart3, color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "Doanh thu năm nay", value: formatPrice(revenue?.yearRevenue), icon: BarChart3, color: "text-sky-600", bg: "bg-sky-50" },
    { label: "Tổng đơn hàng", value: String(summary?.totalOrders || 0), icon: ShoppingBag, color: "text-green-600", bg: "bg-green-50" },
    { label: "Khách đã mua", value: String(summary?.totalCustomersPurchased || 0), icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Sản phẩm đã bán", value: String(summary?.totalProductsSold || 0), icon: Package, color: "text-orange-600", bg: "bg-orange-50" }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                  <p className="mt-2 text-3xl font-bold text-slate-900">{loading ? "..." : stat.value}</p>
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${stat.bg}`}>
                  <Icon size={24} className={stat.color} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="col-span-1 rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-bold text-slate-800">Biểu đồ doanh thu</h3>
            <select
              value={chartDays}
              onChange={(e) => setChartDays(Number(e.target.value))}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 outline-none focus:border-[#E32A15] focus:ring-1 focus:ring-[#E32A15]"
            >
              <option value={7}>7 ngày qua</option>
              <option value={14}>14 ngày qua</option>
              <option value={30}>30 ngày qua</option>
            </select>
          </div>
          <div className="mt-6 h-[300px] w-full">
            {loading ? (
              <div className="flex h-full items-center justify-center text-slate-500">Đang tải biểu đồ...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} dy={10} />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: "#64748b" }} 
                    tickFormatter={(value) => formatAxisMoney(Number(value))}
                  />
                  <Tooltip 
                    cursor={{ fill: "#f1f5f9" }}
                    formatter={(value: any) => [formatPrice(Number(value)), "Doanh thu"]}
                    labelStyle={{ color: "#0f172a", fontWeight: "bold", marginBottom: "8px" }}
                    contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                  />
                  <Bar dataKey="revenue" fill="#E32A15" radius={[4, 4, 0, 0]} maxBarSize={50} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-bold text-slate-800">5 Đơn hàng gần nhất</h3>
            <Link to="/admin/orders" className="text-sm font-semibold text-[#E32A15] hover:underline">Xem tất cả</Link>
          </div>
          <div className="mt-4 space-y-3">
            {loading ? (
              <p className="text-slate-500">Đang tải dữ liệu...</p>
            ) : !summary?.recentOrders.length ? (
              <p className="text-slate-500">Chưa có dữ liệu đơn hàng.</p>
            ) : (
              summary.recentOrders.map((order) => (
                <Link key={order.id} to={`/admin/orders?orderId=${order.id}`} className="block rounded-lg border border-slate-200 p-3 transition hover:border-[#E32A15]/40 hover:bg-slate-50">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">{order.orderCode}</p>
                      <p className="text-xs text-slate-500">{order.customerName} | {formatDate(order.createdAt)}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`rounded-full px-2 py-1 text-xs font-semibold ${ORDER_STATUS_BADGES[order.status] || "bg-slate-100 text-slate-700"}`}>
                        {ORDER_STATUS_LABELS[order.status] || order.status}
                      </span>
                      <span className={`rounded-full px-2 py-1 text-xs font-semibold ${PAYMENT_STATUS_BADGES[order.paymentStatus || ""] || "bg-slate-100 text-slate-700"}`}>
                        {PAYMENT_STATUS_LABELS[order.paymentStatus || ""] || order.paymentStatus || "-"}
                      </span>
                    </div>
                  </div>
                  <p className="mt-2 text-sm font-medium text-slate-700">{formatPrice(order.finalPrice)}</p>
                </Link>
              ))
            )}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-bold text-slate-800">Top 5 sản phẩm bán chạy</h3>
            <Link to="/admin/products" className="text-sm font-semibold text-[#E32A15] hover:underline">Xem tất cả</Link>
          </div>
          <div className="mt-4 space-y-3">
            {loading ? (
              <p className="text-slate-500">Đang tải dữ liệu...</p>
            ) : !summary?.topSellingProducts.length ? (
              <p className="text-slate-500">Chưa có dữ liệu sản phẩm.</p>
            ) : (
              summary.topSellingProducts.map((product, index) => (
                <Link key={product.productId} to={`/admin/products?productId=${product.productId}`} className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 transition hover:border-[#E32A15]/40 hover:bg-slate-50">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-700">#{index + 1}</div>
                  <img src={getProductImage(product.productId, product.imageUrl)} alt={product.productName} className="h-14 w-14 rounded-lg border border-slate-200 object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-slate-900">{product.productName}</p>
                    <p className="text-xs text-slate-500">Đã bán: {product.soldQuantity} | Doanh thu: {formatPrice(product.revenue)}</p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-bold text-slate-800">Tỉ trọng Danh mục</h3>
          </div>
          <div className="mt-6 h-[300px] w-full">
            {loading ? (
              <div className="flex h-full items-center justify-center text-slate-500">Đang tải biểu đồ...</div>
            ) : !categoryStats.length ? (
              <div className="flex h-full items-center justify-center text-slate-500">Chưa có dữ liệu danh mục.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryStats}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryStats.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any) => [value, "Sản phẩm"]}
                    contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-red-200 bg-red-50/50 p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="text-red-500" size={24} />
              <h3 className="text-lg font-bold text-slate-800">Cảnh báo sắp hết hàng</h3>
            </div>
            <Link to="/admin/products" className="text-sm font-semibold text-red-600 hover:underline">Nhập hàng ngay</Link>
          </div>
          <div className="mt-4 space-y-3">
            {loading ? (
              <p className="text-slate-500">Đang tải dữ liệu...</p>
            ) : !lowStockVariants.length ? (
              <div className="flex flex-col items-center justify-center py-6 text-slate-500">
                <Package size={40} className="mb-2 text-slate-300" />
                <p>Tồn kho đang ở mức an toàn.</p>
              </div>
            ) : (
              lowStockVariants.map((variant) => (
                <div key={variant.variantId} className="flex items-center justify-between rounded-lg border border-red-100 bg-white p-3 shadow-sm transition hover:border-red-300">
                  <div className="flex items-center gap-3">
                    <img src={getProductImage(variant.productId, variant.imageUrl)} alt={variant.productName} className="h-12 w-12 rounded-lg border border-slate-200 object-cover" />
                    <div>
                      <p className="font-semibold text-slate-900">{variant.productName}</p>
                      <p className="text-xs text-slate-500">SKU: {variant.sku} | Màu: {variant.color} {variant.size ? `| Size: ${variant.size}` : ""}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-bold text-red-700">Còn {variant.stockQuantity}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
