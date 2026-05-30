import { Link, Outlet } from "react-router-dom";
import { ShoppingBag, Shield, RefreshCcw, Truck, Star } from "lucide-react";

const AuthLayout = () => (
  <div className="flex min-h-screen">

    {/* ═══ LEFT PANEL — Brand visual ═══ */}
    <div className="relative hidden lg:flex lg:w-[52%] xl:w-[55%] flex-col overflow-hidden">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0f0f0f] via-[#1a1208] to-[#2a0d06]" />

      {/* Geometric accent shapes */}
      <div className="absolute -left-24 -top-24 h-[500px] w-[500px] rounded-full bg-[#E32A15]/10 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-[#E32A15]/15 blur-3xl" />
      <div className="absolute left-1/3 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ff6b35]/8 blur-[80px]" />

      {/* Subtle grid texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Decorative circles – ring pattern */}
      <div className="absolute right-[-80px] top-1/2 -translate-y-1/2">
        <div className="h-[600px] w-[600px] rounded-full border border-white/4" />
        <div className="absolute inset-[60px] rounded-full border border-white/5" />
        <div className="absolute inset-[120px] rounded-full border border-[#E32A15]/10" />
        <div className="absolute inset-[180px] rounded-full border border-[#E32A15]/15" />
        <div className="absolute inset-[240px] rounded-full border border-[#E32A15]/20" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-1 flex-col p-12 xl:p-16">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group w-fit">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E32A15] shadow-lg shadow-[#E32A15]/40 transition group-hover:scale-105">
            <ShoppingBag size={20} className="text-white" strokeWidth={2.5} />
          </div>
          <div>
            <div className="text-base font-extrabold tracking-tight text-white leading-none">SHOE STORE</div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">Giày chính hãng</div>
          </div>
        </Link>

        {/* Main headline */}
        <div className="mt-auto">
          {/* Label */}
          <div className="mb-5 flex items-center gap-2">
            <span className="h-px w-8 bg-[#E32A15]" />
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-[#E32A15]">Premium Sneakers</span>
          </div>

          <h1 className="text-5xl font-black leading-[1.08] tracking-tight text-white xl:text-6xl">
            Giày chính hãng<br />
            <span className="text-[#E32A15]">100%</span> authentic
          </h1>
          <p className="mt-5 max-w-sm text-base leading-relaxed text-white/50">
            Hàng ngàn mẫu sneaker từ Nike, Adidas, Puma, MLB — mua sắm dễ dàng, giao hàng nhanh chóng.
          </p>

          {/* Trust indicators */}
          <div className="mt-10 grid grid-cols-2 gap-3">
            {[
              { icon: Shield, label: "Hàng chính hãng", sub: "Có tem kiểm định" },
              { icon: RefreshCcw, label: "Đổi trả 30 ngày", sub: "Không cần lý do" },
              { icon: Truck, label: "Giao toàn quốc", sub: "Miễn phí từ 500K" },
              { icon: Star, label: "Hơn 10.000+", sub: "Khách hàng hài lòng" },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} className="flex items-start gap-3 rounded-2xl bg-white/5 p-4 ring-1 ring-white/8 backdrop-blur-sm">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#E32A15]/15">
                  <Icon size={15} className="text-[#E32A15]" strokeWidth={2} />
                </div>
                <div>
                  <div className="text-sm font-bold text-white/85">{label}</div>
                  <div className="text-xs text-white/35">{sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom copyright */}
        <p className="mt-12 text-xs text-white/20">© 2026 ShoeStore.vn · All rights reserved</p>
      </div>
    </div>

    {/* ═══ RIGHT PANEL — Form ═══ */}
    <div className="flex flex-1 flex-col bg-[#f8f8f6]">
      {/* Mobile top bar (only visible on small screens) */}
      <div className="flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4 lg:hidden">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E32A15]">
            <ShoppingBag size={14} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="text-sm font-extrabold text-[#111]">SHOE STORE</span>
        </Link>
        <Link to="/" className="text-xs text-slate-500 hover:text-[#E32A15]">
          ← Trang chủ
        </Link>
      </div>

      {/* Centered form area */}
      <div className="flex flex-1 items-center justify-center px-6 py-10 sm:px-10">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>

      {/* Back link – desktop */}
      <div className="hidden border-t border-slate-100 py-4 text-center lg:block">
        <Link to="/" className="text-xs text-slate-400 transition hover:text-[#E32A15]">
          ← Quay về trang chủ
        </Link>
      </div>
    </div>

  </div>
);

export default AuthLayout;
