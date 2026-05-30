import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { PROMOTION_STATUS_LABELS } from "../../constants/adminStatus";
import { adminCouponService } from "../../services/adminCouponService";
import type { AdminCoupon, AdminCouponUpsertRequest, AdminId } from "../../types/admin";
import { TicketPercent } from "lucide-react";

const COUPON_TYPES = ["PERCENTAGE", "FIXED_AMOUNT", "FREE_SHIPPING"];
const COUPON_STATUSES = ["UPCOMING", "ACTIVE", "ENDED", "DISABLED"];

const COUPON_TYPE_LABELS: Record<string, string> = {
  PERCENTAGE: "Giảm theo %",
  FIXED_AMOUNT: "Giảm tiền mặt",
  FREE_SHIPPING: "Miễn phí vận chuyển"
};

const emptyForm = (): AdminCouponUpsertRequest => ({
  code: "",
  description: "",
  type: "PERCENTAGE",
  status: "ACTIVE",
  discountValue: 0,
  maxDiscountValue: 0,
  minimumOrderAmount: 0,
  usageLimit: 0,
  startAt: new Date(Date.now() - 86400000).toISOString().slice(0, 16),
  endAt: new Date(Date.now() + 864000000).toISOString().slice(0, 16),
});

const AdminCouponsPage = () => {
  const [coupons, setCoupons] = useState<AdminCoupon[]>([]);
  const [form, setForm] = useState<AdminCouponUpsertRequest>(emptyForm());
  const [editingId, setEditingId] = useState<AdminId | null>(null);
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const couponPage = await adminCouponService.getCoupons({ keyword: keyword || undefined, status: statusFilter || undefined, page: 0, size: 100 });
      setCoupons(couponPage.content);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Không thể tải dữ liệu mã giảm giá");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchData();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm());
  };

  const handleEdit = async (id: AdminId) => {
    try {
      const coupon = await adminCouponService.getCoupon(id);
      setEditingId(id);
      setForm({
        code: coupon.code,
        description: coupon.description || "",
        type: coupon.type,
        status: coupon.status,
        discountValue: coupon.discountValue,
        maxDiscountValue: coupon.maxDiscountValue || 0,
        minimumOrderAmount: coupon.minimumOrderAmount || 0,
        usageLimit: coupon.usageLimit || 0,
        startAt: coupon.startAt.slice(0, 16),
        endAt: coupon.endAt.slice(0, 16),
      });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Không thể tải chi tiết mã giảm giá");
    }
  };

  const handleSubmit = async () => {
    const payload = {
      ...form,
      description: form.description || undefined,
      maxDiscountValue: form.maxDiscountValue || undefined,
      minimumOrderAmount: form.minimumOrderAmount || undefined,
      usageLimit: form.usageLimit || undefined
    };

    try {
      if (editingId) {
        await adminCouponService.updateCoupon(editingId, payload);
        toast.success("Cập nhật mã giảm giá thành công");
      } else {
        await adminCouponService.createCoupon(payload);
        toast.success("Tạo mã giảm giá thành công");
      }
      resetForm();
      void fetchData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Không thể lưu mã giảm giá");
    }
  };

  const handleStatusChange = async (couponId: AdminId, nextStatus: string) => {
    try {
      await adminCouponService.updateStatus(couponId, nextStatus);
      toast.success("Cập nhật trạng thái mã thành công");
      void fetchData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Không thể cập nhật trạng thái");
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr,1fr]">
      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <TicketPercent className="w-6 h-6 text-[#E32A15]"/>
              Mã giảm giá (Coupon)
            </h2>
            <p className="text-sm text-slate-500">Quản lý mã nhập giảm giá trên tổng hóa đơn.</p>
          </div>
          <button onClick={resetForm} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Tạo mới</button>
        </div>

        <div className="grid gap-3 md:grid-cols-[1fr,220px,auto]">
          <input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="Tìm mã giảm giá..." className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none" />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none">
            <option value="">Tất cả trạng thái</option>
            {COUPON_STATUSES.map((item) => <option key={item} value={item}>{PROMOTION_STATUS_LABELS[item] || item}</option>)}
          </select>
          <button onClick={() => void fetchData()} className="rounded-xl bg-[#E32A15] px-4 py-3 text-sm font-semibold text-white hover:bg-[#247dad]">Lọc</button>
        </div>

        <div className="space-y-3">
          {loading ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-slate-500">Đang tải mã giảm giá...</div>
          ) : coupons.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-slate-500">Chưa có mã giảm giá nào.</div>
          ) : coupons.map((coupon) => (
            <div key={coupon.id} className="rounded-xl border border-slate-200 p-4 relative overflow-hidden">
              <div className="absolute top-0 bottom-0 left-0 w-1 bg-[#E32A15]" />
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between pl-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-slate-900 px-2 py-0.5 border border-dashed border-slate-400 bg-slate-50 rounded">
                      {coupon.code}
                    </span>
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
                      {PROMOTION_STATUS_LABELS[coupon.status] || coupon.status}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-slate-700">{coupon.description}</p>
                  <p className="text-sm text-slate-500">
                    {COUPON_TYPE_LABELS[coupon.type] || coupon.type} | Giảm {coupon.discountValue}
                    {coupon.type === "PERCENTAGE" ? "%" : " đ"}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">{coupon.startAt} - {coupon.endAt}</p>
                  <p className="mt-1 text-[11px] font-semibold text-[#E32A15]">
                    Đã dùng: {coupon.usedCount || 0} {coupon.usageLimit ? `/ ${coupon.usageLimit}` : ""}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => void handleEdit(coupon.id)} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">Sửa</button>
                  <select value={coupon.status} onChange={(e) => void handleStatusChange(coupon.id, e.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none">
                    {COUPON_STATUSES.map((item) => <option key={item} value={item}>{PROMOTION_STATUS_LABELS[item] || item}</option>)}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <aside className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <h3 className="text-xl font-bold text-slate-900">{editingId ? "Chỉnh sửa mã" : "Tạo mã giảm giá"}</h3>
          <p className="text-sm text-slate-500">Tạo mã áp dụng khi thanh toán.</p>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Thông tin chung</h4>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Mã Coupon (Ví dụ: SUMMER20) <span className="text-red-500">*</span></label>
              <input value={form.code} onChange={(e) => setForm((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))} placeholder="Nhập mã chữ hoa..." className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[#E32A15] font-bold" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Mô tả ngắn</label>
              <input value={form.description || ""} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} placeholder="Mô tả ưu đãi cho khách hàng..." className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[#E32A15]" />
            </div>
            <div className="grid gap-3 grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">Loại mã</label>
                <select value={form.type} onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[#E32A15]">
                  {COUPON_TYPES.map((item) => <option key={item} value={item}>{COUPON_TYPE_LABELS[item] || item}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">Trạng thái</label>
                <select value={form.status} onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[#E32A15]">
                  {COUPON_STATUSES.map((item) => <option key={item} value={item}>{PROMOTION_STATUS_LABELS[item] || item}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Thiết lập Giá trị</h4>
            <div className="grid gap-3 grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">Giá trị giảm {form.type === "PERCENTAGE" ? "(%)" : "(đ)"} <span className="text-red-500">*</span></label>
                <input type="number" value={form.discountValue || ""} disabled={form.type === "FREE_SHIPPING"} onChange={(e) => setForm((prev) => ({ ...prev, discountValue: Number(e.target.value) }))} placeholder="0" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[#E32A15] disabled:bg-slate-100" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">Giảm tối đa (đ)</label>
                <input type="number" disabled={form.type !== "PERCENTAGE"} value={form.maxDiscountValue || ""} onChange={(e) => setForm((prev) => ({ ...prev, maxDiscountValue: Number(e.target.value) }))} placeholder="VD: 50000" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[#E32A15] disabled:bg-slate-100" />
              </div>
            </div>
            <div className="grid gap-3 grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">Đơn hàng tối thiểu (đ)</label>
                <input type="number" value={form.minimumOrderAmount || ""} onChange={(e) => setForm((prev) => ({ ...prev, minimumOrderAmount: Number(e.target.value) }))} placeholder="0" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[#E32A15]" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">Giới hạn số lần dùng</label>
                <input type="number" value={form.usageLimit || ""} onChange={(e) => setForm((prev) => ({ ...prev, usageLimit: Number(e.target.value) }))} placeholder="Bỏ trống: vô hạn" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[#E32A15]" />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Thời gian áp dụng</h4>
            <div className="grid gap-3 grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">Bắt đầu <span className="text-red-500">*</span></label>
                <input type="datetime-local" value={form.startAt} onChange={(e) => setForm((prev) => ({ ...prev, startAt: e.target.value }))} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[#E32A15]" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">Kết thúc <span className="text-red-500">*</span></label>
                <input type="datetime-local" value={form.endAt} onChange={(e) => setForm((prev) => ({ ...prev, endAt: e.target.value }))} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[#E32A15]" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={() => void handleSubmit()} className="rounded-xl bg-[#E32A15] px-5 py-3 text-sm font-semibold text-white hover:bg-[#247dad]">{editingId ? "Cập nhật mã" : "Tạo mã mới"}</button>
          <button onClick={resetForm} className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">Làm mới</button>
        </div>
      </aside>
    </div>
  );
};

export default AdminCouponsPage;
