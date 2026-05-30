import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { PROMOTION_STATUS_LABELS, PROMOTION_TYPE_LABELS } from "../../constants/adminStatus";
import { adminProductService } from "../../services/adminProductService";
import { adminPromotionService } from "../../services/adminPromotionService";
import type { AdminId, AdminProduct, AdminPromotion, AdminPromotionUpsertRequest } from "../../types/admin";

const PROMOTION_TYPES = ["PERCENTAGE", "FIXED_AMOUNT"];
const PROMOTION_STATUSES = ["UPCOMING", "ACTIVE", "ENDED", "DISABLED"];

const emptyForm = (): AdminPromotionUpsertRequest => ({
  name: "",
  code: "",
  description: "",
  type: "PERCENTAGE",
  status: "UPCOMING",
  discountValue: 0,
  maxDiscountValue: 0,
  startAt: new Date().toISOString().slice(0, 16),
  endAt: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
  productIds: [],
  variantIds: []
});

const AdminPromotionsPage = () => {
  const [promotions, setPromotions] = useState<AdminPromotion[]>([]);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [form, setForm] = useState<AdminPromotionUpsertRequest>(emptyForm());
  const [editingId, setEditingId] = useState<AdminId | null>(null);
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [promotionPage, productPage] = await Promise.all([
        adminPromotionService.getPromotions({ keyword: keyword || undefined, status: statusFilter || undefined, page: 0, size: 100 }),
        adminProductService.getProducts({ status: "ACTIVE", page: 0, size: 100 })
      ]);
      setPromotions(promotionPage.content);
      setProducts(productPage.content);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Kh\u00f4ng th\u1ec3 t\u1ea3i d\u1eef li\u1ec7u khuy\u1ebfn m\u00e3i");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchData();
  }, []);

  const selectedProducts = useMemo(() => new Set(form.productIds), [form.productIds]);

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm());
  };

  const handleEdit = async (id: AdminId) => {
    try {
      const promotion = await adminPromotionService.getPromotion(id);
      setEditingId(id);
      setForm({
        name: promotion.name,
        code: promotion.code || "",
        description: promotion.description || "",
        type: promotion.type,
        status: promotion.status,
        discountValue: promotion.discountValue,
        maxDiscountValue: promotion.maxDiscountValue || 0,
        startAt: promotion.startAt.slice(0, 16),
        endAt: promotion.endAt.slice(0, 16),
        productIds: promotion.productIds,
        variantIds: promotion.variantIds
      });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Kh\u00f4ng th\u1ec3 t\u1ea3i chi ti\u1ebft khuy\u1ebfn m\u00e3i");
    }
  };

  const handleSubmit = async () => {
    const payload = {
      ...form,
      code: form.code || undefined,
      description: form.description || undefined,
      maxDiscountValue: form.maxDiscountValue || undefined,
      variantIds: form.variantIds?.length ? form.variantIds : undefined
    };

    try {
      if (editingId) {
        await adminPromotionService.updatePromotion(editingId, payload);
        toast.success("C\u1eadp nh\u1eadt khuy\u1ebfn m\u00e3i th\u00e0nh c\u00f4ng");
      } else {
        await adminPromotionService.createPromotion(payload);
        toast.success("T\u1ea1o khuy\u1ebfn m\u00e3i th\u00e0nh c\u00f4ng");
      }
      resetForm();
      void fetchData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Kh\u00f4ng th\u1ec3 l\u01b0u khuy\u1ebfn m\u00e3i");
    }
  };

  const handleStatusChange = async (promotionId: AdminId, nextStatus: string) => {
    try {
      await adminPromotionService.updateStatus(promotionId, nextStatus);
      toast.success("C\u1eadp nh\u1eadt tr\u1ea1ng th\u00e1i khuy\u1ebfn m\u00e3i th\u00e0nh c\u00f4ng");
      void fetchData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Kh\u00f4ng th\u1ec3 c\u1eadp nh\u1eadt khuy\u1ebfn m\u00e3i");
    }
  };

  const toggleProduct = (productId: AdminId) => {
    setForm((prev) => ({
      ...prev,
      productIds: prev.productIds.includes(productId) ? prev.productIds.filter((id) => id !== productId) : [...prev.productIds, productId]
    }));
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr,1fr]">
      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{"Khuy\u1ebfn m\u00e3i s\u1ea3n ph\u1ea9m"}</h2>
            <p className="text-sm text-slate-500">{"T\u1ea1o v\u00e0 \u00e1p d\u1ee5ng gi\u1ea3m gi\u00e1 cho s\u1ea3n ph\u1ea9m theo th\u1eddi gian."}</p>
          </div>
          <button onClick={resetForm} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">{"T\u1ea1o m\u1edbi"}</button>
        </div>

        <div className="grid gap-3 md:grid-cols-[1fr,220px,auto]">
          <input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder={"T\u00ecm t\u00ean ho\u1eb7c m\u00e3 khuy\u1ebfn m\u00e3i"} className="rounded-xl border border-slate-200 px-4 py-3 text-sm" />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-xl border border-slate-200 px-4 py-3 text-sm">
            <option value="">{"T\u1ea5t c\u1ea3 tr\u1ea1ng th\u00e1i"}</option>
            {PROMOTION_STATUSES.map((item) => <option key={item} value={item}>{PROMOTION_STATUS_LABELS[item] || item}</option>)}
          </select>
          <button onClick={() => void fetchData()} className="rounded-xl bg-[#E32A15] px-4 py-3 text-sm font-semibold text-white hover:bg-[#247dad]">{"L\u1ecdc"}</button>
        </div>

        <div className="space-y-3">
          {loading ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-slate-500">{"\u0110ang t\u1ea3i khuy\u1ebfn m\u00e3i..."}</div>
          ) : promotions.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-slate-500">{"Ch\u01b0a c\u00f3 khuy\u1ebfn m\u00e3i n\u00e0o."}</div>
          ) : promotions.map((promotion) => (
            <div key={promotion.id} className="rounded-xl border border-slate-200 p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900">{promotion.name}</h3>
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
                      {PROMOTION_STATUS_LABELS[promotion.status] || promotion.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500">
                    {promotion.code || "Kh\u00f4ng c\u00f3 m\u00e3"} | {PROMOTION_TYPE_LABELS[promotion.type] || promotion.type} | {promotion.discountValue}
                    {promotion.type === "PERCENTAGE" ? "%" : " \u0111"}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">{promotion.startAt} - {promotion.endAt}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => void handleEdit(promotion.id)} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">{"S\u1eeda"}</button>
                  <select value={promotion.status} onChange={(e) => void handleStatusChange(promotion.id, e.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-xs">
                    {PROMOTION_STATUSES.map((item) => <option key={item} value={item}>{PROMOTION_STATUS_LABELS[item] || item}</option>)}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <aside className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <h3 className="text-xl font-bold text-slate-900">{editingId ? "Ch\u1ec9nh s\u1eeda khuy\u1ebfn m\u00e3i" : "T\u1ea1o khuy\u1ebfn m\u00e3i"}</h3>
          <p className="text-sm text-slate-500">{"Ch\u1ecdn s\u1ea3n ph\u1ea9m v\u00e0 c\u1ea5u h\u00ecnh gi\u1ea3m gi\u00e1."}</p>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Thông tin chung</h4>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Tên chiến dịch khuyến mại <span className="text-red-500">*</span></label>
              <input value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} placeholder="VD: Khuyến mại mùa hè" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[#E32A15] focus:ring-1 focus:ring-[#E32A15]" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Mã chương trình (Tùy chọn)</label>
              <input value={form.code || ""} onChange={(e) => setForm((prev) => ({ ...prev, code: e.target.value }))} placeholder="VD: SUMMER24" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[#E32A15]" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Mô tả nội dung</label>
              <textarea value={form.description || ""} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} placeholder="Chi tiết về đợt giảm giá này..." rows={2} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[#E32A15]" />
            </div>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Cấu hình giảm giá</h4>
            <div className="grid gap-3 grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">Loại giảm giá</label>
                <select value={form.type} onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[#E32A15]">
                  {PROMOTION_TYPES.map((item) => <option key={item} value={item}>{PROMOTION_TYPE_LABELS[item] || item}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">Trạng thái</label>
                <select value={form.status} onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[#E32A15]">
                  {PROMOTION_STATUSES.map((item) => <option key={item} value={item}>{PROMOTION_STATUS_LABELS[item] || item}</option>)}
                </select>
              </div>
            </div>
            <div className="grid gap-3 grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">Giá trị giảm {form.type === "PERCENTAGE" ? "(%)" : "(đ)"} <span className="text-red-500">*</span></label>
                <input type="number" value={form.discountValue || ""} onChange={(e) => setForm((prev) => ({ ...prev, discountValue: Number(e.target.value) }))} placeholder="0" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[#E32A15]" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">Giảm tối đa (đ)</label>
                <input type="number" disabled={form.type !== "PERCENTAGE"} value={form.maxDiscountValue || ""} onChange={(e) => setForm((prev) => ({ ...prev, maxDiscountValue: Number(e.target.value) }))} placeholder="VD: 50000" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[#E32A15] disabled:bg-slate-100 disabled:text-slate-400" />
                <p className="mt-1 text-[10px] text-slate-500">Chỉ dùng khi giảm theo %</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Thời gian</h4>
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

        <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
          <label className="mb-2 block text-xs font-semibold text-slate-700">Sản phẩm áp dụng (Áp dụng giảm trực tiếp trên giá SP)</label>
          <div className="max-h-72 space-y-2 overflow-auto rounded-xl border border-slate-200 p-3">
            {products.map((product) => (
              <label key={product.id} className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-slate-50">
                <input type="checkbox" checked={selectedProducts.has(product.id)} onChange={() => toggleProduct(product.id)} />
                <span className="text-sm text-slate-700">{product.name}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={() => void handleSubmit()} className="rounded-xl bg-[#E32A15] px-5 py-3 text-sm font-semibold text-white hover:bg-[#247dad]">{editingId ? "C\u1eadp nh\u1eadt" : "T\u1ea1o khuy\u1ebfn m\u00e3i"}</button>
          <button onClick={resetForm} className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">{"L\u00e0m m\u1edbi form"}</button>
        </div>
      </aside>
    </div>
  );
};

export default AdminPromotionsPage;
