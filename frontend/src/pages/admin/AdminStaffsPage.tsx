import { type FormEvent, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { adminStaffService } from "../../services/adminStaffService";
import type { AdminId, AdminStaff } from "../../types/admin";
import { Eye, Plus, Search, UserCircle, X } from "lucide-react";

const USER_STATUS_OPTIONS = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "ACTIVE", label: "Đang hoạt động" },
  { value: "INACTIVE", label: "Tạm ngưng" },
  { value: "BLOCKED", label: "Đã khóa" }
];

const USER_STATUS_BADGES: Record<string, string> = {
  ACTIVE: "bg-emerald-100 text-emerald-700",
  INACTIVE: "bg-amber-100 text-amber-700",
  BLOCKED: "bg-red-100 text-red-700"
};

const USER_STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Đang hoạt động",
  INACTIVE: "Tạm ngưng",
  BLOCKED: "Đã khóa"
};

const formatDate = (dateString?: string) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
};

const getInitials = (name?: string) => {
  const parts = (name || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "NV";
  return parts.slice(-2).map((part) => part[0]).join("").toUpperCase();
};

const AdminStaffsPage = () => {
  const [staffs, setStaffs] = useState<AdminStaff[]>([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [savingStaff, setSavingStaff] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<AdminStaff | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [newStaff, setNewStaff] = useState({ fullName: "", email: "", phoneNumber: "", password: "", avatarUrl: "", status: "ACTIVE" });

  const fetchStaffs = async () => {
    setLoading(true);
    try {
      const data = await adminStaffService.getStaffs({ keyword: keyword || undefined, status: statusFilter || undefined, page: 0, size: 100 });
      setStaffs(data.content);
    } catch (error) {
      toast.error("Không thể tải danh sách nhân viên.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchStaffs();
  }, []);

  const handleAddStaff = async (e: FormEvent) => {
    e.preventDefault();
    const payload = {
      fullName: newStaff.fullName.trim(),
      email: newStaff.email.trim().toLowerCase(),
      phoneNumber: newStaff.phoneNumber.trim(),
      password: newStaff.password,
      avatarUrl: newStaff.avatarUrl.trim() || undefined,
      status: newStaff.status
    };
    if (!payload.fullName || !payload.email || !payload.phoneNumber || !payload.password) {
      toast.error("Vui lòng nhập đầy đủ thông tin nhân viên");
      return;
    }

    setSavingStaff(true);
    try {
      await adminStaffService.createStaff(payload);
      toast.success("Thêm nhân viên thành công");
      setShowAddModal(false);
      setNewStaff({ fullName: "", email: "", phoneNumber: "", password: "", avatarUrl: "", status: "ACTIVE" });
      void fetchStaffs();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Thêm nhân viên thất bại");
    } finally {
      setSavingStaff(false);
    }
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    setNewStaff({ fullName: "", email: "", phoneNumber: "", password: "", avatarUrl: "", status: "ACTIVE" });
  };

  const handleViewDetail = async (id: AdminId) => {
    setDetailLoading(true);
    try {
      setSelectedStaff(await adminStaffService.getStaff(id));
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Không thể tải chi tiết nhân viên");
    } finally {
      setDetailLoading(false);
    }
  };

  const handleStatusChange = async (id: AdminId, status: string) => {
    try {
      await adminStaffService.updateStatus(id, status);
      toast.success("Cập nhật trạng thái thành công");
      void fetchStaffs();
    } catch (error) {
      toast.error("Cập nhật trạng thái thất bại");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Quản lý Nhân viên</h2>
          <p className="mt-1 text-sm text-slate-500">Danh sách nhân viên (STAFF) trên hệ thống.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 rounded-xl bg-[#E32A15] px-4 py-2 font-semibold text-white hover:bg-[#247dad]"
        >
          <Plus size={20} />
          Thêm nhân viên
        </button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, email, sđt..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-[#E32A15]"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#E32A15]"
        >
          {USER_STATUS_OPTIONS.map((item) => (
            <option key={item.value} value={item.value}>{item.label}</option>
          ))}
        </select>
        <button
          onClick={() => void fetchStaffs()}
          className="rounded-xl bg-[#E32A15] px-4 py-3 text-sm font-semibold text-white hover:bg-[#247dad]"
        >
          Lọc
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-slate-600">
            <tr>
              <th className="px-4 py-3">Nhân viên</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={3} className="px-4 py-8 text-center text-slate-500">Đang tải...</td></tr>
            ) : staffs.length === 0 ? (
              <tr><td colSpan={3} className="px-4 py-8 text-center text-slate-500">Không tìm thấy nhân viên.</td></tr>
            ) : (
              staffs.map((staff) => (
                <tr key={staff.id}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {staff.avatarUrl ? (
                        <img src={staff.avatarUrl} alt={staff.fullName} className="h-11 w-11 rounded-full border border-slate-200 object-cover" />
                      ) : (
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#E32A15]/10 text-sm font-black text-[#E32A15]">
                          {getInitials(staff.fullName)}
                        </div>
                      )}
                      <div>
                        <div className="font-semibold text-slate-900">{staff.fullName}</div>
                        <div className="text-xs text-slate-500">{staff.email}</div>
                        <div className="text-xs text-slate-400">{staff.phoneNumber} | Tạo lúc: {formatDate(staff.createdAt)}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={staff.status}
                      onChange={(e) => void handleStatusChange(staff.id, e.target.value)}
                      className={`rounded-full px-2 py-1 text-xs font-semibold outline-none border border-transparent hover:border-slate-300 ${USER_STATUS_BADGES[staff.status] || "bg-slate-100 text-slate-700"}`}
                    >
                      {USER_STATUS_OPTIONS.filter(o => o.value).map((opt) => (
                        <option key={opt.value} value={opt.value} className="bg-white text-slate-900">{opt.label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                     <button onClick={() => void handleViewDetail(staff.id)} className="inline-flex items-center gap-1 text-xs font-semibold text-[#E32A15] hover:underline">
                      <Eye size={15} />
                      Xem chi tiết
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={handleAddStaff} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-xl font-bold text-slate-800">Thêm nhân viên mới</h3>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Họ và tên</label>
                <input required type="text" value={newStaff.fullName} onChange={e => setNewStaff({...newStaff, fullName: e.target.value})} className="w-full rounded-lg border border-slate-300 p-2 text-sm outline-none focus:border-[#E32A15]" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
                <input required type="email" value={newStaff.email} onChange={e => setNewStaff({...newStaff, email: e.target.value})} className="w-full rounded-lg border border-slate-300 p-2 text-sm outline-none focus:border-[#E32A15]" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Số điện thoại</label>
                <input required type="text" value={newStaff.phoneNumber} onChange={e => setNewStaff({...newStaff, phoneNumber: e.target.value})} className="w-full rounded-lg border border-slate-300 p-2 text-sm outline-none focus:border-[#E32A15]" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Mật khẩu</label>
                <input required type="password" value={newStaff.password} onChange={e => setNewStaff({...newStaff, password: e.target.value})} className="w-full rounded-lg border border-slate-300 p-2 text-sm outline-none focus:border-[#E32A15]" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Avatar URL</label>
                <input type="url" value={newStaff.avatarUrl} onChange={e => setNewStaff({...newStaff, avatarUrl: e.target.value})} placeholder="https://..." className="w-full rounded-lg border border-slate-300 p-2 text-sm outline-none focus:border-[#E32A15]" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Trạng thái</label>
                <select value={newStaff.status} onChange={e => setNewStaff({...newStaff, status: e.target.value})} className="w-full rounded-lg border border-slate-300 p-2 text-sm outline-none focus:border-[#E32A15]">
                  {USER_STATUS_OPTIONS.filter((item) => item.value).map((item) => (
                    <option key={item.value} value={item.value}>{item.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={closeAddModal} className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100">Hủy</button>
              <button disabled={savingStaff} type="submit" className="rounded-lg bg-[#E32A15] px-4 py-2 text-sm font-semibold text-white hover:bg-[#247dad] disabled:cursor-not-allowed disabled:opacity-60">
                {savingStaff ? "Đang tạo..." : "Tạo nhân viên"}
              </button>
            </div>
          </form>
        </div>
      )}

      {(selectedStaff || detailLoading) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Chi tiết tài khoản nhân viên</h3>
                <p className="mt-1 text-sm text-slate-500">Thông tin tài khoản đã đăng ký trên hệ thống.</p>
              </div>
              <button onClick={() => setSelectedStaff(null)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                <X size={20} />
              </button>
            </div>

            {detailLoading || !selectedStaff ? (
              <div className="p-8 text-center text-sm text-slate-500">Đang tải chi tiết nhân viên...</div>
            ) : (
              <div className="p-6">
                <div className="flex flex-wrap items-center gap-5 rounded-2xl bg-slate-50 p-5">
                  {selectedStaff.avatarUrl ? (
                    <img src={selectedStaff.avatarUrl} alt={selectedStaff.fullName} className="h-24 w-24 rounded-2xl border border-white object-cover shadow-sm" />
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-[#E32A15]/10 text-3xl font-black text-[#E32A15]">
                      {getInitials(selectedStaff.fullName)}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-2xl font-black text-slate-900">{selectedStaff.fullName}</h4>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${USER_STATUS_BADGES[selectedStaff.status] || "bg-slate-100 text-slate-700"}`}>
                        {USER_STATUS_LABELS[selectedStaff.status] || selectedStaff.status}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">{selectedStaff.email}</p>
                    <p className="mt-1 text-sm text-slate-500">{selectedStaff.phoneNumber}</p>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 p-4">
                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Mã tài khoản</div>
                    <div className="mt-1 font-bold text-slate-900">#{selectedStaff.id}</div>
                  </div>
                  <div className="rounded-xl border border-slate-200 p-4">
                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Vai trò</div>
                    <div className="mt-1 font-bold text-slate-900">{selectedStaff.roles?.join(", ") || "STAFF"}</div>
                  </div>
                  <div className="rounded-xl border border-slate-200 p-4">
                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Ngày tạo tài khoản</div>
                    <div className="mt-1 font-bold text-slate-900">{formatDate(selectedStaff.createdAt)}</div>
                  </div>
                  <div className="rounded-xl border border-slate-200 p-4">
                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Cập nhật gần nhất</div>
                    <div className="mt-1 font-bold text-slate-900">{formatDate(selectedStaff.updatedAt)}</div>
                  </div>
                  <div className="rounded-xl border border-slate-200 p-4 md:col-span-2">
                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Avatar URL</div>
                    <div className="mt-1 break-all text-sm font-semibold text-slate-900">{selectedStaff.avatarUrl || "Chưa có avatar, đang dùng avatar chữ cái mặc định."}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStaffsPage;
