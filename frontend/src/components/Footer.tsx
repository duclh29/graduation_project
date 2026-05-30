import { Facebook, Instagram, Mail, MapPin, Phone, Send, Youtube } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const policyLinks = [
  "Chính sách bảo mật thông tin",
  "Chính sách thanh toán",
  "Chính sách vận chuyển và giao nhận",
  "Chính sách kiểm hàng",
  "Chính sách đổi trả",
  "Chính sách xử lý khiếu nại",
  "Chính sách bảo hành",
];

const guideLinks = [
  "Hướng dẫn order",
  "Hướng dẫn mua hàng",
  "Điều khoản dịch vụ",
  "Tất cả sản phẩm",
  "Liên hệ",
];

const socialLinks = [
  { Icon: Facebook, label: "Facebook", href: "#" },
  { Icon: Instagram, label: "Instagram", href: "#" },
  { Icon: Youtube, label: "YouTube", href: "#" },
];

const Footer = () => {
  const [email, setEmail] = useState("");

  return (
    <footer className="mt-16 bg-slate-100">
      {/* ─── Newsletter strip ─── */}
      <div className="bg-[#E32A15]">
        <div className="page-shell flex flex-col items-center justify-between gap-5 py-7 sm:flex-row">
          <div>
            <h3 className="text-lg font-extrabold uppercase tracking-wide text-white">Nhận ưu đãi độc quyền</h3>
            <p className="mt-0.5 text-sm text-red-100/80">Đăng ký để nhận thông tin về sản phẩm mới &amp; khuyến mãi</p>
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); setEmail(""); }}
            className="flex w-full max-w-md overflow-hidden rounded-xl border border-white/30 bg-white/15 backdrop-blur"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email của bạn..."
              className="flex-1 bg-transparent px-4 py-3 text-sm text-white placeholder-white/60 outline-none"
            />
            <button
              type="submit"
              className="inline-flex items-center gap-2 bg-white/20 px-5 text-sm font-bold text-white transition hover:bg-white/30"
            >
              <Send size={14} />
              <span className="hidden sm:inline">Đăng ký</span>
            </button>
          </form>

          <div className="flex items-center gap-2">
            {socialLinks.map(({ Icon, label, href }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white/20 text-white transition hover:bg-white hover:text-[#E32A15]"
              >
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Main footer content ─── */}
      <div className="page-shell grid gap-10 py-14 lg:grid-cols-4">
        {/* Brand */}
        <div className="lg:col-span-1">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E32A15] shadow-md">
              <span className="text-xs font-black text-white leading-none">SS</span>
            </div>
            <div>
              <div className="text-base font-extrabold tracking-tight text-slate-900 leading-none">SHOE STORE</div>
              <div className="text-[10px] font-semibold uppercase tracking-widest text-[#4a6057]">Giày chính hãng</div>
            </div>
          </div>

          <p className="mt-5 text-sm leading-6 text-slate-700">
            Chuyên cung cấp giày authentic 100% từ các hãng Nike, Adidas, Puma, New Balance, MLB và nhiều thương hiệu quốc tế khác.
          </p>

          <div className="mt-6 space-y-3">
            <div className="flex items-start gap-2.5 text-sm text-slate-700">
              <MapPin size={14} className="mt-0.5 shrink-0 text-[#E32A15]" />
              <span>Số nhà 11B, hẻm 8, ngách 17, ngõ 322 Mỹ Đình, Nam Từ Liêm, Hà Nội</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm text-slate-700">
              <Phone size={14} className="shrink-0 text-[#E32A15]" />
              <a href="tel:0868099315" className="transition hover:text-[#E32A15]">0868 099 315</a>
            </div>
            <div className="flex items-center gap-2.5 text-sm text-slate-700">
              <Mail size={14} className="shrink-0 text-[#E32A15]" />
              <a href="mailto:shoestore15@gmail.com" className="transition hover:text-[#E32A15]">shoestore15@gmail.com</a>
            </div>
          </div>
        </div>

        {/* Policy */}
        <div>
          <h4 className="relative mb-5 text-sm font-extrabold uppercase tracking-widest text-slate-900 after:absolute after:-bottom-2 after:left-0 after:h-0.5 after:w-8 after:rounded-full after:bg-[#E32A15] after:content-['']">
            Chính sách
          </h4>
          <ul className="space-y-2.5">
            {policyLinks.map((item) => (
              <li key={item}>
                <Link
                  to="/"
                  className="group flex items-center gap-2 text-sm text-[#4a6057] transition-colors hover:text-[#E32A15]"
                >
                  <span className="h-px w-3 bg-[#E32A15]/40 transition-all group-hover:w-5 group-hover:bg-[#E32A15]" />
                  {item}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Guide */}
        <div>
          <h4 className="relative mb-5 text-sm font-extrabold uppercase tracking-widest text-slate-900 after:absolute after:-bottom-2 after:left-0 after:h-0.5 after:w-8 after:rounded-full after:bg-[#E32A15] after:content-['']">
            Hướng dẫn
          </h4>
          <ul className="space-y-2.5">
            {guideLinks.map((item) => (
              <li key={item}>
                <Link
                  to="/"
                  className="group flex items-center gap-2 text-sm text-[#4a6057] transition-colors hover:text-[#E32A15]"
                >
                  <span className="h-px w-3 bg-[#E32A15]/40 transition-all group-hover:w-5 group-hover:bg-[#E32A15]" />
                  {item}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Trust badges */}
        <div>
          <h4 className="relative mb-5 text-sm font-extrabold uppercase tracking-widest text-slate-900 after:absolute after:-bottom-2 after:left-0 after:h-0.5 after:w-8 after:rounded-full after:bg-[#E32A15] after:content-['']">
            Cam kết
          </h4>
          <div className="space-y-3">
            {[
              { icon: "✅", title: "Hàng chính hãng 100%", desc: "Cam kết authentic, có tem kiểm định" },
              { icon: "🔄", title: "Đổi trả trong 30 ngày", desc: "Không cần lý do, hoàn tiền nhanh" },
              { icon: "🚚", title: "Giao hàng toàn quốc", desc: "Miễn phí với đơn hàng từ 500K" },
              { icon: "🔒", title: "Thanh toán bảo mật", desc: "VNPAY, MoMo, COD" },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="flex items-start gap-3 rounded-xl bg-white/50 border border-slate-200/60 p-3 transition hover:bg-white/80 hover:shadow-sm">
                <span className="text-lg leading-none">{icon}</span>
                <div>
                  <div className="text-xs font-bold text-slate-900">{title}</div>
                  <div className="mt-0.5 text-xs text-[#4a6057]">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Bottom bar ─── */}
      <div className="border-t border-slate-200/70 bg-slate-200/40">
        <div className="page-shell flex flex-col items-center justify-between gap-3 py-5 sm:flex-row">
          <p className="text-xs text-[#4a6057]">
            © 2026 <span className="font-semibold text-slate-900">ShoeStore.vn</span>. Tất cả quyền được bảo lưu.
          </p>
          <div className="flex items-center gap-4 text-xs text-[#4a6057]">
            <Link to="/" className="transition hover:text-[#E32A15]">Điều khoản sử dụng</Link>
            <span className="text-slate-200">|</span>
            <Link to="/" className="transition hover:text-[#E32A15]">Bảo mật</Link>
            <span className="text-slate-200">|</span>
            <Link to="/" className="transition hover:text-[#E32A15]">Cookie</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
