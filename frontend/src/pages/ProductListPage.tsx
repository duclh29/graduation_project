import { TicketPercent, Zap, ArrowRight, TrendingUp, Phone } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Pagination from "../components/Pagination";
import ProductCard from "../components/ProductCard";
import ShoeCarousel from "../components/ShoeCarousel";
import CountdownTimer from "../components/CountdownTimer";
import QuickViewModal from "../components/QuickViewModal";
import { SkeletonGrid } from "../components/SkeletonCard";

import { heroShoeImage, shoeImages } from "../services/productImages";
import { productService } from "../services/productService";
import { couponService } from "../services/couponService";
import { useSavedCoupons } from "../hooks/useSavedCoupons";
import useScrollReveal from "../hooks/useScrollReveal";
import type { Product, ProductFilters } from "../types/product";
import type { Coupon } from "../types/coupon";
import { toast } from "react-toastify";

const defaultFilters: ProductFilters = {
  keyword: "", minPrice: "", maxPrice: "", brand: "", category: "",
  page: 0, size: 10, sort: "createdAt,desc"
};

const brandTabs = [
  { label: "Tất cả", value: "" },
  { label: "Nike", value: "Nike" },
  { label: "Adidas", value: "Adidas" },
  { label: "MLB", value: "MLB" },
  { label: "Puma", value: "Puma" },
  { label: "FILA", value: "FILA" },
];

const brandShowcase = [
  { name: "Nike", emoji: "👟", color: "from-slate-900 to-slate-700" },
  { name: "Adidas", emoji: "⚡", color: "from-black to-slate-800" },
  { name: "MLB", emoji: "⚾", color: "from-blue-900 to-blue-700" },
  { name: "Puma", emoji: "🐆", color: "from-red-900 to-red-700" },
  { name: "FILA", emoji: "🎾", color: "from-indigo-900 to-indigo-700" },
  { name: "New Balance", emoji: "🏃", color: "from-gray-800 to-gray-600" },
];

const ProductListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState<ProductFilters>({
    ...defaultFilters, keyword: searchParams.get("keyword") || ""
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [quickViewId, setQuickViewId] = useState<number | null>(null);
  const [cardsRevealed, setCardsRevealed] = useState(false);

  const { saveCoupon, hasSavedCoupon } = useSavedCoupons();

  // Scroll-reveal refs
  const couponReveal = useScrollReveal();
  const flashReveal = useScrollReveal();
  const brandReveal = useScrollReveal();
  const gridReveal = useScrollReveal();
  const trustReveal = useScrollReveal();

  useEffect(() => {
    const urlKeyword = searchParams.get("keyword") || "";
    setFilters((prev) => {
      if (prev.keyword !== urlKeyword) return { ...prev, keyword: urlKeyword, page: 0 };
      return prev;
    });
  }, [searchParams]);

  useEffect(() => {
    const loadData = async () => {
      if (products.length === 0) setLoading(true);
      else setIsFetching(true);
      
      setCardsRevealed(false);
      try {
        const [productsData, couponsData] = await Promise.all([
          productService.getProducts(filters),
          couponService.getActiveCoupons().catch(() => [])
        ]);
        setProducts(productsData.content);
        setTotalPages(productsData.totalPages);
        
        // Cung cấp dummy coupons nếu API trả về rỗng để không bị mất UI
        if (couponsData && couponsData.length > 0) {
          setCoupons(couponsData);
        } else {
          setCoupons([
            { id: 1, code: "WELCOME10", description: "Giảm giá 10% cho thành viên mới", discountValue: 10, minimumOrderAmount: 0, type: "PERCENTAGE", startAt: new Date().toISOString(), endAt: new Date(Date.now() + 864000000).toISOString() },
            { id: 2, code: "FREESHIP", description: "Miễn phí vận chuyển toàn quốc", discountValue: 0, minimumOrderAmount: 500000, type: "FREE_SHIPPING", startAt: new Date().toISOString(), endAt: new Date(Date.now() + 864000000).toISOString() }
          ] as Coupon[]);
        }
        // Stagger reveal after data loads
        setTimeout(() => setCardsRevealed(true), 80);
      } finally {
        setLoading(false);
        setIsFetching(false);
      }
    };
    void loadData();
  }, [filters]);

  const handleSaveCoupon = async (code: string) => {
    try {
      const success = await saveCoupon(code);
      if (success) toast.success("Lưu mã giảm giá thành công");
      else toast.error("Vui lòng đăng nhập để lưu mã giảm giá");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Lưu mã thất bại.");
    }
  };

  const formatDiscountDisplay = (coupon: Coupon) => {
    if (coupon.type === "FREE_SHIPPING") return "FS";
    if (coupon.type === "PERCENTAGE") return `${coupon.discountValue}%`;
    const value = Number(coupon.discountValue);
    if (value >= 1000000) return `${(value / 1000000).toFixed(0)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
    return value.toString();
  };

  const carouselSlides = useMemo(() => [
    { image: heroShoeImage, title: "Nike Air Force | Jordan 1 | Blazer | Dunk | Court", subtitle: "Bộ sưu tập sneaker chính hãng mới nhất, phong cách định nghĩa thế hệ." },
    { image: shoeImages[0], title: "Siêu khuyến mại cho sneaker hot", subtitle: "Tổng hợp những mẫu giày đang được săn đón nhiều nhất trong tuần." },
    { image: shoeImages[2], title: "Hàng chính hãng mới về", subtitle: "Giá bán minh bạch, hàng authentic 100% có tem kiểm định." }
  ], []);

  const featuredProducts = useMemo(() => products.slice(0, 5), [products]);
  const productGrid = useMemo(() => products.slice(0, 10), [products]);

  const updateFilters = (name: keyof ProductFilters, value: string | number) => {
    setFilters((prev) => ({ ...prev, [name]: value, page: name === "page" ? Number(value) : 0 }));
  };

  return (
    <div className="min-h-screen bg-white py-6 page-transition">
      {/* ─── Hero Carousel (Full Width) ─── */}
      <div className="w-full px-2 sm:px-4 mb-10 max-w-[1920px] mx-auto">
        <ShoeCarousel slides={carouselSlides} />
      </div>

      <div className="page-shell space-y-10">
        {/* ─── Coupon Section ─── */}
        <section
          ref={couponReveal.ref as React.RefObject<HTMLElement>}
          className={`${couponReveal.visible ? "reveal-visible" : "reveal-hidden"} ${coupons.length === 0 ? "hidden" : ""}`}
        >
          {coupons.length > 0 && (
            <>
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E32A15]">
                  <TicketPercent size={16} className="text-white" />
                </div>
                <h2 className="text-lg font-extrabold uppercase tracking-tight text-[#111]">Mã giảm giá</h2>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {coupons.slice(0, 4).map((coupon) => {
                  const isSaved = hasSavedCoupon(coupon.code);
                  return (
                    <article key={coupon.code} className="group relative overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 transition hover:shadow-md">
                      <div className="absolute inset-y-0 left-[100px] border-l-2 border-dashed border-slate-100" />
                      <div className="grid grid-cols-[100px_1fr]">
                        <div className="flex flex-col items-center justify-center bg-gradient-to-br from-[#E32A15] to-[#b31f0e] py-5 text-white">
                          <span className="text-3xl font-black leading-none">{formatDiscountDisplay(coupon)}</span>
                          <span className="mt-1 text-[9px] font-bold uppercase tracking-widest opacity-80">
                            {coupon.type === "FREE_SHIPPING" ? "Freeship" : coupon.type === "PERCENTAGE" ? "Giảm" : "Tiết kiệm"}
                          </span>
                        </div>
                        <div className="p-4">
                          <h3 className="line-clamp-1 font-bold text-[#111]">{coupon.description || "Ưu đãi hấp dẫn"}</h3>
                          <p className="mt-1 text-xs text-slate-500">
                            {coupon.minimumOrderAmount
                              ? `Đơn từ ${new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(Number(coupon.minimumOrderAmount))}`
                              : "Mọi đơn hàng"}
                          </p>
                          <div className="mt-3 flex items-center justify-between gap-2">
                            <div>
                              <p className="text-sm font-bold text-[#111]"><span className="mr-1 text-xs font-normal text-slate-400">Mã:</span>{coupon.code}</p>
                              <p className="text-[11px] text-slate-400">HSD: {new Date(coupon.endAt).toLocaleDateString("vi-VN")}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => !isSaved && void handleSaveCoupon(coupon.code)}
                              className={`rounded-xl px-4 py-2 text-xs font-bold transition ${isSaved ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200" : "bg-[#E32A15] text-white hover:bg-[#b31f0e]"}`}
                            >
                              {isSaved ? "✓ Đã lưu" : "Lưu mã"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </>
          )}
        </section>

        {/* ─── Flash Sale Section ─── */}
        <section
          ref={flashReveal.ref as React.RefObject<HTMLElement>}
          className={`overflow-hidden rounded-3xl bg-gradient-to-br from-[#E32A15] via-[#d12410] to-[#9a1a0a] p-6 shadow-xl md:p-8 ${flashReveal.visible ? "reveal-visible" : "reveal-hidden"}`}
        >
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
                <Zap size={18} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold uppercase tracking-tight text-white">Siêu khuyến mại</h2>
                <p className="text-xs text-white/60">Ưu đãi có giới hạn – đừng bỏ lỡ</p>
              </div>
            </div>
            <CountdownTimer targetHours={6} />
            <Link to="/danh-muc" className="hidden items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-5 py-2 text-xs font-bold text-white transition hover:bg-white/20 sm:flex">
              Xem tất cả <ArrowRight size={13} />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {featuredProducts.map((product, i) => (
              <ProductCard key={product.id} product={product} staggerIndex={i} revealed={flashReveal.visible} onQuickView={setQuickViewId} />
            ))}
          </div>
        </section>

        {/* ─── Brand Showcase Grid ─── */}
        <section
          ref={brandReveal.ref as React.RefObject<HTMLElement>}
          className={brandReveal.visible ? "reveal-visible" : "reveal-hidden"}
        >
          <div className="mb-5 flex items-center gap-3">
            <h2 className="text-lg font-extrabold uppercase tracking-tight text-[#111]">Mua theo thương hiệu</h2>
          </div>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
            {brandShowcase.map(({ name, emoji, color }) => (
              <Link
                key={name}
                to={`/danh-muc?brand=${encodeURIComponent(name)}`}
                className={`group flex flex-col items-center justify-center gap-2 rounded-2xl bg-gradient-to-br ${color} p-5 text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl`}
              >
                <span className="text-3xl">{emoji}</span>
                <span className="text-xs font-bold tracking-wide">{name}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* ─── Product Grid ─── */}
        <section
          ref={gridReveal.ref as React.RefObject<HTMLElement>}
          className={gridReveal.visible ? "reveal-visible" : "reveal-hidden"}
        >
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#111]">
                <TrendingUp size={16} className="text-white" />
              </div>
              <h2 className="text-lg font-extrabold uppercase tracking-tight text-[#111]">Giày Sneaker</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {brandTabs.map((tab) => {
                const isActive = tab.value === filters.brand || (!tab.value && !filters.brand);
                return (
                  <button
                    key={tab.label} type="button"
                    onClick={() => updateFilters("brand", tab.value)}
                    className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${isActive ? "bg-[#E32A15] text-white shadow-md" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-[#E32A15]/40 hover:text-[#E32A15]"}`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div id="product-grid" className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100 relative">
            {loading ? (
              <SkeletonGrid count={10} />
            ) : (
              <>
                {isFetching && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center rounded-3xl bg-white/50 backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#E32A15] border-t-transparent shadow-md" />
                      <span className="text-sm font-bold text-[#111] animate-pulse">Đang tải...</span>
                    </div>
                  </div>
                )}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                  {productGrid.map((product, i) => (
                    <ProductCard
                      key={product.id} product={product}
                      staggerIndex={i} revealed={cardsRevealed}
                      onQuickView={setQuickViewId}
                    />
                  ))}
                </div>
                {productGrid.length === 0 && (
                  <div className="flex flex-col items-center gap-4 py-16 text-center text-slate-400">
                    <span className="text-5xl">👟</span>
                    <p className="font-semibold">Không tìm thấy sản phẩm phù hợp.</p>
                  </div>
                )}
                <div className="mt-8 flex flex-col items-center gap-4">
                  <Link
                    to={`/danh-muc${filters.brand ? `?brand=${encodeURIComponent(filters.brand)}` : ""}`}
                    className="inline-flex items-center gap-2 rounded-full border-2 border-[#111] bg-[#111] px-10 py-3 text-sm font-bold text-white transition hover:bg-[#E32A15] hover:border-[#E32A15]"
                  >
                    Xem tất cả sản phẩm <ArrowRight size={15} />
                  </Link>
                  <Pagination currentPage={filters.page ?? 0} totalPages={totalPages} onPageChange={(page) => updateFilters("page", page)} />
                </div>
              </>
            )}
          </div>
        </section>

        {/* ─── Trust Badges ─── */}
        <section
          ref={trustReveal.ref as React.RefObject<HTMLElement>}
          className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-4 ${trustReveal.visible ? "reveal-visible" : "reveal-hidden"}`}
        >
          {[
            { icon: "🚚", title: "Miễn phí vận chuyển", desc: "Đơn hàng từ 500.000đ" },
            { icon: "✅", title: "Chính hãng 100%", desc: "Có tem kiểm định đầy đủ" },
            { icon: "🔄", title: "Đổi trả 30 ngày", desc: "Không cần lý do" },
            { icon: "🔒", title: "Thanh toán bảo mật", desc: "VNPAY · MoMo · COD" },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="flex items-center gap-4 rounded-2xl bg-white p-5 ring-1 ring-slate-100 transition hover:shadow-md">
              <span className="text-3xl">{icon}</span>
              <div>
                <div className="text-sm font-bold text-[#111]">{title}</div>
                <div className="text-xs text-slate-500">{desc}</div>
              </div>
            </div>
          ))}
        </section>

      </div>

      {/* ─── Floating contact button ─── */}
      <a
        href="tel:0868099315"
        className="animate-bob fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#E32A15] text-white shadow-xl shadow-[#E32A15]/40 ring-4 ring-[#E32A15]/20 transition hover:bg-[#b31f0e] hover:scale-110"
        title="Gọi ngay"
      >
        <Phone size={22} strokeWidth={2.5} />
      </a>

      {/* ─── Quick View Modal ─── */}
      {quickViewId !== null && (
        <QuickViewModal productId={quickViewId} onClose={() => setQuickViewId(null)} />
      )}
    </div>
  );
};

export default ProductListPage;
