import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { ORDER_STATUS_BADGES, ORDER_STATUS_LABELS, PAYMENT_STATUS_BADGES, PAYMENT_STATUS_LABELS } from "../../constants/adminStatus";
import { adminUserService } from "../../services/adminUserService";
import type { AdminId, AdminUserDetail, AdminUserListItem } from "../../types/admin";

const USER_STATUS_OPTIONS = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "ACTIVE", label: "Đang hoạt động" },
  { value: "INACTIVE", label: "Tạm ngưng" },
  { value: "BLOCKED", label: "Đã khóa" }
];

const USER_STATUS_BADGES: Record<string, string> = {
  ACTIVE: "bg-emerald-100 text-emerald-700",
  INACTIVE: "bg-amber-100 text-amber-700",
  BLOCKED: "bg-rose-100 text-rose-700"
};

const USER_STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Đang hoạt động",
  INACTIVE: "Tạm ngưng",
  BLOCKED: "Đã khóa"
};

const formatPrice = (value?: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value || 0);
const formatDate = (value?: string) => (value ? new Date(value).toLocaleString("vi-VN") : "-");

const AdminUsersPage = () => {
  const [users, setUsers] = useState<AdminUserListItem[]>([]);
  const [selectedUser, setSelectedUser] = useState<AdminUserDetail | null>(null);
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const page = await adminUserService.getUsers({ keyword: keyword || undefined, status: statusFilter || undefined, page: 0, size: 100 });
      setUsers(page.content);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Không thể tải danh sách khách hàng");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectUser = async (userId: AdminId) => {
    try {
      setDetailLoading(true);
      const detail = await adminUserService.getUser(userId);
      setSelectedUser(detail);
      setSearchParams({ userId: String(userId) });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Không thể tải chi tiết khách hàng");
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    void fetchUsers();
  }, []);

  useEffect(() => {
    const userIdParam = searchParams.get("userId");
    if (!userIdParam) return;
    void handleSelectUser(userIdParam);
  }, [searchParams]);

  const handleStatusChange = async (status: string) => {
    if (!selectedUser) return;
    try {
      setSavingStatus(true);
      const updated = await adminUserService.updateStatus(selectedUser.id, status);
      setSelectedUser(updated);
      setUsers((prev) => prev.map((user) => (user.id === updated.id ? { ...user, status: updated.status } : user)));
      toast.success("Cập nhật trạng thái khách hàng thành công");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Không thể cập nhật trạng thái khách hàng");
    } finally {
      setSavingStatus(false);
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1.15fr,0.95fr]">
      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Quản lý khách hàng</h2>
          <p className="text-sm text-slate-500">Tìm kiếm khách đã mua hàng, xem giá trị đơn hàng và kiểm soát trạng thái tài khoản.</p>
        </div>

        <div className="grid gap-3 md:grid-cols-[1fr,220px,auto]">
          <input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="Tìm theo tên, email hoặc số điện thoại" className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#E32A15]" />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#E32A15]">
            {USER_STATUS_OPTIONS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
          <button onClick={() => void fetchUsers()} className="rounded-xl bg-[#E32A15] px-4 py-3 text-sm font-semibold text-white hover:bg-[#247dad]">Lọc</button>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-slate-600">
              <tr>
                <th className="px-4 py-3">Khách hàng</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3">Số đơn</th>
                <th className="px-4 py-3">Tổng chi</th>
                <th className="px-4 py-3">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                <tr><td colSpan={5} className="px-4 py-8 text-slate-500">Đang tải khách hàng...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-slate-500">Chưa có khách hàng phù hợp bộ lọc.</td></tr>
              ) : users.map((user) => (
                <tr key={user.id} className={selectedUser?.id === user.id ? "bg-[#E32A15]/5" : ""}>
                  <td className="px-4 py-3">
                    <div>
                      <div className="font-semibold text-slate-900">{user.fullName}</div>
                      <div className="text-xs text-slate-500">{user.email}</div>
                      <div className="text-xs text-slate-400">{user.phoneNumber} | Tạo lúc: {formatDate(user.createdAt)}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${USER_STATUS_BADGES[user.status] || "bg-slate-100 text-slate-700"}`}>
                      {USER_STATUS_LABELS[user.status] || user.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">{user.totalOrders}</td>
                  <td className="px-4 py-3">{formatPrice(user.totalSpent)}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => void handleSelectUser(user.id)} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">Xem chi tiết</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <aside className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <h3 className="text-xl font-bold text-slate-900">Hồ sơ khách hàng</h3>
          <p className="text-sm text-slate-500">Hiển thị nhanh hành vi mua hàng và 5 đơn gần nhất.</p>
        </div>

        {detailLoading ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">Đang tải chi tiết khách hàng...</div>
        ) : !selectedUser ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">Chọn một khách hàng từ danh sách để xem chi tiết.</div>
        ) : (
          <>
            <div className="space-y-3 rounded-xl border border-slate-200 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-lg font-bold text-slate-900">{selectedUser.fullName}</div>
                  <div className="text-sm text-slate-500">{selectedUser.email}</div>
                  <div className="text-sm text-slate-500">{selectedUser.phoneNumber}</div>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${USER_STATUS_BADGES[selectedUser.status] || "bg-slate-100 text-slate-700"}`}>
                  {USER_STATUS_LABELS[selectedUser.status] || selectedUser.status}
                </span>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-xl bg-slate-50 p-3">
                  <div className="text-xs text-slate-500">Tổng chi tiêu</div>
                  <div className="mt-1 text-lg font-bold text-slate-900">{formatPrice(selectedUser.totalSpent)}</div>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <div className="text-xs text-slate-500">Đơn gần nhất</div>
                  <div className="mt-1 text-sm font-semibold text-slate-900">{formatDate(selectedUser.lastOrderAt)}</div>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <div className="text-xs text-slate-500">Tổng số đơn</div>
                  <div className="mt-1 text-lg font-bold text-slate-900">{selectedUser.totalOrders}</div>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <div className="text-xs text-slate-500">Đã giao / Đã hủy</div>
                  <div className="mt-1 text-lg font-bold text-slate-900">{selectedUser.deliveredOrders} / {selectedUser.cancelledOrders}</div>
                </div>
              </div>

              <select disabled={savingStatus} value={selectedUser.status} onChange={(e) => void handleStatusChange(e.target.value)} className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#E32A15]">
                {USER_STATUS_OPTIONS.filter((item) => item.value).map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
              </select>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-slate-900">5 đơn hàng gần nhất</h4>
              {selectedUser.recentOrders.length === 0 ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">Khách hàng này chưa có đơn hàng nào.</div>
              ) : selectedUser.recentOrders.map((order) => (
                <div key={order.id} className="rounded-xl border border-slate-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold text-slate-900">{order.orderCode}</div>
                      <div className="text-xs text-slate-500">{formatDate(order.createdAt)}</div>
                      <div className="mt-1 text-sm font-medium text-slate-700">{formatPrice(order.finalPrice)} | {order.totalItems} sản phẩm</div>
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
                </div>
              ))}
            </div>
          </>
        )}
      </aside>
    </div>
  );
};

export default AdminUsersPage;
