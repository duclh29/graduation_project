import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { adminShiftService } from "../../services/adminShiftService";
import type { AdminId, AdminShift } from "../../types/admin";
import { Plus, Trash2, Edit } from "lucide-react";

const DEFAULT_FORM_DATA = {
  code: "",
  name: "",
  startTime: "08:00",
  endTime: "12:00",
  crossDay: false,
  breakMinutes: 0,
  paidBreakMinutes: 0,
  minStaff: 1,
  maxStaff: 1,
  status: "ACTIVE",
  description: ""
};

const AdminShiftsPage = () => {
  const [shifts, setShifts] = useState<AdminShift[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<AdminId | null>(null);
  const [formData, setFormData] = useState(DEFAULT_FORM_DATA);

  const fetchShifts = async () => {
    setLoading(true);
    try {
      const data = await adminShiftService.getAllShifts();
      setShifts(data);
    } catch (error) {
      toast.error("Không thể tải danh mục ca làm việc.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchShifts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Append :00 for seconds if not present
      const payload = {
        ...formData,
        code: formData.code.trim().toUpperCase(),
        startTime: formData.startTime.length === 5 ? `${formData.startTime}:00` : formData.startTime,
        endTime: formData.endTime.length === 5 ? `${formData.endTime}:00` : formData.endTime,
      };

      if (editId) {
        await adminShiftService.updateShift(editId, payload);
        toast.success("Cập nhật ca làm việc thành công");
      } else {
        await adminShiftService.createShift(payload);
        toast.success("Thêm ca làm việc thành công");
      }
      setShowModal(false);
      void fetchShifts();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Lỗi thao tác");
    }
  };

  const handleDelete = async (id: AdminId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa ca làm việc này không?")) return;
    try {
      await adminShiftService.deleteShift(id);
      toast.success("Xóa ca làm việc thành công");
      void fetchShifts();
    } catch (error) {
      toast.error("Lỗi khi xóa");
    }
  };

  const openAdd = () => {
    setEditId(null);
    setFormData(DEFAULT_FORM_DATA);
    setShowModal(true);
  };

  const openEdit = (shift: AdminShift) => {
    setEditId(shift.id);
    setFormData({
      code: shift.code || "",
      name: shift.name,
      startTime: shift.startTime.substring(0, 5),
      endTime: shift.endTime.substring(0, 5),
      crossDay: Boolean(shift.crossDay),
      breakMinutes: shift.breakMinutes ?? 0,
      paidBreakMinutes: shift.paidBreakMinutes ?? 0,
      minStaff: shift.minStaff ?? 1,
      maxStaff: shift.maxStaff ?? 1,
      status: shift.status || "ACTIVE",
      description: shift.description || ""
    });
    setShowModal(true);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Cấu hình Ca làm việc</h2>
          <p className="mt-1 text-sm text-slate-500">Định nghĩa các ca làm việc trong ngày (Sáng, Chiều, Tối,...).</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 rounded-xl bg-[#E32A15] px-4 py-2 font-semibold text-white hover:bg-[#247dad]"
        >
          <Plus size={20} />
          Thêm ca mới
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-slate-600">
            <tr>
              <th className="px-4 py-3">Ma ca</th>
              <th className="px-4 py-3">Tên ca</th>
              <th className="px-4 py-3">Giờ bắt đầu</th>
              <th className="px-4 py-3">Giờ kết thúc</th>
              <th className="px-4 py-3">Nghỉ</th>
              <th className="px-4 py-3">Sức chứa</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3">Mô tả</th>
              <th className="px-4 py-3 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={9} className="px-4 py-8 text-center text-slate-500">Đang tải...</td></tr>
            ) : shifts.length === 0 ? (
              <tr><td colSpan={9} className="px-4 py-8 text-center text-slate-500">Chưa có cấu hình ca làm việc nào.</td></tr>
            ) : (
              shifts.map((shift) => (
                <tr key={shift.id}>
                  <td className="px-4 py-3 font-mono text-xs text-slate-600">{shift.code}</td>
                  <td className="px-4 py-3 font-semibold text-slate-900">{shift.name}</td>
                  <td className="px-4 py-3">{shift.startTime.substring(0, 5)}</td>
                  <td className="px-4 py-3">
                    {shift.endTime.substring(0, 5)}
                    {shift.crossDay ? <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">Qua ngày</span> : null}
                  </td>
                  <td className="px-4 py-3 text-slate-500">{shift.breakMinutes} phút</td>
                  <td className="px-4 py-3 text-slate-500">{shift.minStaff} - {shift.maxStaff} người</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${shift.status === "ACTIVE" ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-700"}`}>
                      {shift.status === "ACTIVE" ? "Đang dùng" : "Ngừng dùng"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{shift.description}</td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button onClick={() => openEdit(shift)} className="text-slate-500 hover:text-[#E32A15]"><Edit size={18} /></button>
                    <button onClick={() => handleDelete(shift.id)} className="text-slate-500 hover:text-red-600"><Trash2 size={18} /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-xl font-bold text-slate-800">{editId ? "Sửa ca làm việc" : "Thêm ca mới"}</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Mã ca</label>
                  <input required type="text" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} className="w-full rounded-lg border border-slate-300 p-2 text-sm uppercase outline-none focus:border-[#E32A15]" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Trạng thái</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full rounded-lg border border-slate-300 p-2 text-sm outline-none focus:border-[#E32A15]">
                    <option value="ACTIVE">Đang dùng</option>
                    <option value="INACTIVE">Ngừng dùng</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Tên ca (vd: Ca Sáng)</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full rounded-lg border border-slate-300 p-2 text-sm outline-none focus:border-[#E32A15]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Bắt đầu</label>
                  <input required type="time" value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} className="w-full rounded-lg border border-slate-300 p-2 text-sm outline-none focus:border-[#E32A15]" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Kết thúc</label>
                  <input required type="time" value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} className="w-full rounded-lg border border-slate-300 p-2 text-sm outline-none focus:border-[#E32A15]" />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" checked={formData.crossDay} onChange={e => setFormData({...formData, crossDay: e.target.checked})} />
                Ca qua ngày
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Nghỉ giữa ca (phút)</label>
                  <input required min={0} type="number" value={formData.breakMinutes} onChange={e => setFormData({...formData, breakMinutes: Number(e.target.value)})} className="w-full rounded-lg border border-slate-300 p-2 text-sm outline-none focus:border-[#E32A15]" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Nghỉ tính công (phút)</label>
                  <input required min={0} type="number" value={formData.paidBreakMinutes} onChange={e => setFormData({...formData, paidBreakMinutes: Number(e.target.value)})} className="w-full rounded-lg border border-slate-300 p-2 text-sm outline-none focus:border-[#E32A15]" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Tối thiểu</label>
                  <input required min={0} type="number" value={formData.minStaff} onChange={e => setFormData({...formData, minStaff: Number(e.target.value)})} className="w-full rounded-lg border border-slate-300 p-2 text-sm outline-none focus:border-[#E32A15]" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Tối đa</label>
                  <input required min={1} type="number" value={formData.maxStaff} onChange={e => setFormData({...formData, maxStaff: Number(e.target.value)})} className="w-full rounded-lg border border-slate-300 p-2 text-sm outline-none focus:border-[#E32A15]" />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Mô tả thêm</label>
                <textarea rows={2} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full rounded-lg border border-slate-300 p-2 text-sm outline-none focus:border-[#E32A15]" />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setShowModal(false)} className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100">Hủy</button>
              <button type="submit" className="rounded-lg bg-[#E32A15] px-4 py-2 text-sm font-semibold text-white hover:bg-[#247dad]">Lưu ca làm việc</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminShiftsPage;
