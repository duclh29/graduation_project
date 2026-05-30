import { ChevronDown, Heart, LogOut, Menu, Search, ShoppingBag, ShoppingCart, User, X } from "lucide-react";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useCart } from "../hooks/useCart";
import { useFavorite } from "../hooks/useFavorite";

const menuItems = [
  { label: "Trang chủ", href: "/", children: [] },
  {
    label: "Giày Nike",
    href: "/",
    children: [
      { label: "Giày Nike Air Force 1", href: "/" },
      { label: "Giày Nike Air Jordan 1", href: "/" },
      { label: "Giày Nike Nữ Chính Hãng", href: "/" },
      { label: "Giày Nike Nam Chính Hãng", href: "/" },
    ],
  },
  { label: "Giày Puma", href: "/", children: [] },
  { label: "Giày New Balance", href: "/", children: [] },
  { label: "Giày Khác", href: "/", children: [] },
  { label: "Tin tức", href: "/", children: [] },
];

const topBrands = [
  "ADIDAS", "PUMA", "MLB", "FILA", "NEW BALANCE", 
  "CONVERSE", "VANS", "REEBOK", "UNDER ARMOUR", "SKECHERS", "NIKE"
];

const Header = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { cart, fetchCart } = useCart();
  const { favorites } = useFavorite();
  const [searchParams] = useSearchParams();
  const [keyword, setKeyword] = useState(searchParams.get("keyword") || "");
  const [activeBrandDropdown, setActiveBrandDropdown] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setKeyword(searchParams.get("keyword") || "");
  }, [searchParams]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const itemCount = cart?.items.reduce((total, item) => total + item.quantity, 0) || 0;
  const favoriteCount = favorites.length;
  const currentUserId = user?.userId ?? 0;

  useEffect(() => {
    if (!isAuthenticated || !currentUserId) return;
    void fetchCart(currentUserId);
  }, [isAuthenticated, currentUserId, fetchCart]);

  const nikeChildren = useMemo(
    () => menuItems.find((item) => item.label === "Giày Nike")?.children ?? [],
    []
  );

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    navigate(`/?keyword=${encodeURIComponent(keyword)}`);
    setMobileOpen(false);
  };

  return (
    <>
      {/* ─── Top announcement bar ─── */}
      <div className="hidden lg:block bg-[#E32A15] text-white text-xs text-center py-2 font-medium tracking-wide">
        🚚 Miễn phí vận chuyển đơn hàng từ 500.000đ &nbsp;|&nbsp; 🎁 Hàng chính hãng 100% &nbsp;|&nbsp; 🔄 Đổi trả trong 30 ngày
      </div>

      {/* ─── Main header ─── */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-slate-100/95 backdrop-blur-xl shadow-[0_2px_24px_rgba(0,0,0,0.10)]"
            : "bg-slate-100"
        }`}
      >
        <div className="page-shell flex h-16 items-center justify-between gap-4 lg:gap-8">
          {/* Logo */}
          <Link to="/" className="flex flex-col items-center group shrink-0">
            <svg viewBox="0 0 100 45" className="h-8 w-24 transition-transform duration-300 group-hover:scale-105" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <defs>
                <linearGradient id="shoeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#FACC15" />
                  <stop offset="40%" stopColor="#1E3A8A" />
                  <stop offset="100%" stopColor="#E32A15" />
                </linearGradient>
              </defs>
              <path
                d="M 15,40 C 15,20 18,15 26,20 C 32,24 35,26 38,17 C 43,5 50,10 65,21 C 80,32 95,37 90,45"
                stroke="url(#shoeGradient)"
              />
            </svg>
            <div className="flex flex-col items-center -mt-1">
              <div className="text-xl font-black tracking-[0.2em] text-slate-900 leading-none pl-1">SHOES</div>
              <div className="text-[7px] font-bold uppercase tracking-[0.5em] text-slate-500 mt-1 pl-1">SLOGAN</div>
            </div>
          </Link>

          {/* Search bar – desktop */}
          <form onSubmit={handleSearch} className="hidden flex-1 lg:flex items-center max-w-xl">
            <div className="flex w-full items-center overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm ring-0 transition-all duration-200 focus-within:border-[#E32A15] focus-within:ring-2 focus-within:ring-[#E32A15]/20">
              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Tìm kiếm sản phẩm..."
                className="w-full bg-transparent px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none"
              />
              <button
                type="submit"
                className="flex h-10 w-12 items-center justify-center border-l border-slate-100 text-slate-500 transition hover:text-[#E32A15]"
              >
                <Search size={18} strokeWidth={2.5} />
              </button>
            </div>
          </form>

          {/* Right actions */}
          <div className="hidden lg:flex items-center gap-1">
            {/* Favorites */}
            <Link
              to="/yeu-thich"
              className="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-700 transition-all hover:bg-slate-200 hover:text-[#E32A15]"
              title="Yêu thích"
            >
              <Heart size={20} strokeWidth={2} />
              {favoriteCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#E32A15] px-1 text-[10px] font-bold text-white">
                  {favoriteCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link
              to="/cart"
              className="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-700 transition-all hover:bg-slate-200 hover:text-[#E32A15]"
              title="Giỏ hàng"
            >
              <ShoppingCart size={20} strokeWidth={2} />
              {itemCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#E32A15] px-1 text-[10px] font-bold text-white">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* Divider */}
            <div className="mx-2 h-6 w-px bg-slate-200" />

            {/* Auth */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/orders"
                  className="flex items-center gap-2 rounded-xl bg-white/60 border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-800 transition hover:bg-white hover:border-[#E32A15]/40 hover:text-[#E32A15]"
                >
                  <User size={14} strokeWidth={2.5} />
                  <span className="max-w-[120px] truncate">{user?.email}</span>
                </Link>
                <button
                  type="button"
                  onClick={() => void logout()}
                  title="Đăng xuất"
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-200 hover:text-[#E32A15]"
                >
                  <LogOut size={16} strokeWidth={2} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-200"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="rounded-xl bg-[#E32A15] px-4 py-2 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:bg-[#b31f0e] hover:scale-[1.02]"
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </div>

          {/* Mobile: cart icon + hamburger */}
          <div className="flex items-center gap-2 lg:hidden">
            <Link to="/cart" className="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-800">
              <ShoppingCart size={22} />
              {itemCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#E32A15] px-1 text-[10px] font-bold text-white">
                  {itemCount}
                </span>
              )}
            </Link>
            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-800 transition hover:bg-slate-200"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>



        {/* ─── Top Brands Bar with Mega Menu ─── */}
        <div className="hidden lg:block bg-[#161616] relative" ref={dropdownRef}>
          <div className="page-shell flex items-center justify-between py-3">
            {topBrands.map((brand) => (
              <div
                key={brand}
                className="group/brand relative"
                onMouseEnter={() => setActiveBrandDropdown(brand)}
                onMouseLeave={() => setActiveBrandDropdown(null)}
              >
                <Link
                  to={`/?keyword=${encodeURIComponent(brand)}`}
                  className={`flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.1em] transition-colors ${
                    activeBrandDropdown === brand ? "text-white" : "text-[#a0a0a0] hover:text-white"
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-sm bg-[#E32A15] transition-transform duration-300 ${activeBrandDropdown === brand ? "scale-125" : "group-hover/brand:scale-125"}`} />
                  {brand}
                </Link>

                {/* Mega Menu Dropdown */}
                {activeBrandDropdown === brand && (
                  <div className="absolute left-1/2 top-full z-50 mt-3 w-[600px] -translate-x-1/2 overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-2xl animate-fade-in cursor-default">
                    {/* Invisible hover bridge */}
                    <div className="absolute -top-3 left-0 h-3 w-full" />
                    
                    <div className="grid grid-cols-3 gap-8">
                      {/* Cột 1: Danh mục nổi bật */}
                      <div className="col-span-1 space-y-4">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Danh mục {brand}</h3>
                        <div className="flex flex-col gap-3">
                          <Link to={`/?keyword=${brand} Nam`} className="text-sm font-semibold text-slate-700 hover:text-[#E32A15]">Giày {brand} Nam</Link>
                          <Link to={`/?keyword=${brand} Nữ`} className="text-sm font-semibold text-slate-700 hover:text-[#E32A15]">Giày {brand} Nữ</Link>
                          <Link to={`/?keyword=${brand} Cổ Cao`} className="text-sm font-semibold text-slate-700 hover:text-[#E32A15]">Phiên bản Cổ Cao</Link>
                          <Link to={`/?keyword=${brand} Cổ Thấp`} className="text-sm font-semibold text-slate-700 hover:text-[#E32A15]">Phiên bản Cổ Thấp</Link>
                          <Link to={`/?keyword=${brand} Thể Thao`} className="text-sm font-semibold text-slate-700 hover:text-[#E32A15]">Dòng Thể Thao</Link>
                        </div>
                      </div>

                      {/* Cột 2 & 3: Hình ảnh nổi bật (New Arrivals) */}
                      <div className="col-span-2 grid grid-cols-2 gap-4">
                        <Link to={`/?keyword=${brand}`} className="group relative block overflow-hidden rounded-xl">
                          <img 
                            src={brand === "NIKE" ? "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80" : "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=400&q=80"} 
                            alt={`${brand} New Arrival`} 
                            className="h-40 w-full object-cover transition-transform duration-500 group-hover:scale-105" 
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                          <div className="absolute bottom-3 left-3">
                            <span className="rounded bg-[#E32A15] px-2 py-0.5 text-[10px] font-bold uppercase text-white">New</span>
                            <h4 className="mt-1 text-sm font-bold text-white">Bộ sưu tập mới</h4>
                          </div>
                        </Link>
                        <Link to={`/?keyword=${brand}`} className="group relative block overflow-hidden rounded-xl">
                          <img 
                            src={brand === "NIKE" ? "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=400&q=80" : "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=400&q=80"} 
                            alt={`${brand} Best Seller`} 
                            className="h-40 w-full object-cover transition-transform duration-500 group-hover:scale-105" 
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                          <div className="absolute bottom-3 left-3">
                            <span className="rounded bg-white px-2 py-0.5 text-[10px] font-bold uppercase text-black">Hot</span>
                            <h4 className="mt-1 text-sm font-bold text-white">Best Sellers</h4>
                          </div>
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ─── Mobile drawer ─── */}
        {mobileOpen && (
          <div className="border-t border-slate-200/50 bg-slate-100/98 backdrop-blur-xl lg:hidden">
            <div className="page-shell space-y-4 py-5">
              {/* Mobile search */}
              <form onSubmit={handleSearch} className="flex overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <input
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Tìm kiếm sản phẩm..."
                  className="w-full bg-transparent px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none"
                />
                <button type="submit" className="px-4 text-slate-500 border-l border-slate-100">
                  <Search size={18} />
                </button>
              </form>

              {/* Mobile nav links */}
              <div className="space-y-0.5">
                {menuItems.map((item) => (
                  <Link
                    key={item.label}
                    to={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-lg px-3 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-200/60 hover:text-[#E32A15]"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>

              {/* Mobile auth */}
              <div className="border-t border-slate-200/50 pt-4">
                {isAuthenticated ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-slate-700">
                      <User size={16} />
                      <span className="max-w-[200px] truncate">{user?.email}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => { void logout(); setMobileOpen(false); }}
                      className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-[#E32A15]"
                    >
                      <LogOut size={14} />
                      Đăng xuất
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <Link
                      to="/login"
                      onClick={() => setMobileOpen(false)}
                      className="flex-1 rounded-xl border border-slate-200 py-2.5 text-center text-sm font-semibold text-slate-800 bg-white/60"
                    >
                      Đăng nhập
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMobileOpen(false)}
                      className="flex-1 rounded-xl bg-[#E32A15] py-2.5 text-center text-sm font-semibold text-white shadow-md"
                    >
                      Đăng ký
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
};

export default Header;
