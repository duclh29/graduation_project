import { Eye, Heart, ShoppingBag } from "lucide-react";
import { useState, useMemo, MouseEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../hooks/useAuth";
import { useCart } from "../hooks/useCart";
import { useFavorite } from "../hooks/useFavorite";
import { getProductImage } from "../services/productImages";
import type { Product } from "../types/product";

interface ProductCardProps {
  product: Product;
  staggerIndex?: number;
  revealed?: boolean;
  onQuickView?: (id: number) => void;
  className?: string;
  style?: React.CSSProperties;
}

const formatPrice = (value: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);

const ProductCard = ({ product, staggerIndex = 0, revealed = true, onQuickView, className, style }: ProductCardProps) => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { addToCart, loading } = useCart();
  const { isFavorite, toggleFavorite } = useFavorite();
  const [hoverImage, setHoverImage] = useState<string | null>(null);
  const [isAnimatingCart, setIsAnimatingCart] = useState(false);
  const [clickPos, setClickPos] = useState({ x: 0, y: 0 });

  const uniqueColors = useMemo(() => {
    const colors = new Map<string, string>();
    (product.variants || []).forEach(v => {
      if (v.color && !colors.has(v.color)) {
        colors.set(v.color, v.imageUrl || product.imageUrl || "");
      }
    });
    return Array.from(colors.entries()).map(([color, imageUrl]) => ({ color, imageUrl }));
  }, [product.variants, product.imageUrl]);

  const sellingPrice = product.salePrice || product.price;
  const discountPercent =
    product.salePrice && product.price > product.salePrice
      ? Math.round(((product.price - product.salePrice) / product.price) * 100)
      : 0;
  const isNew = !discountPercent && product.id % 3 === 0;

  const totalStock = product.totalQuantity ?? (product.variants || []).reduce(
    (total, variant) => total + (variant.stockQuantity || 0), 0
  );
  const firstAvailableVariant = (product.variants || []).find((v) => (v.stockQuantity || 0) > 0);
  const canAddToCart = totalStock > 0 && !!firstAvailableVariant;

  const handleAddToCart = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault(); event.stopPropagation();
    if (!canAddToCart || !firstAvailableVariant) { toast.error("Sản phẩm đã hết hàng"); return; }
    if (!isAuthenticated || !user?.userId) {
      toast.info("Vui lòng đăng nhập để thêm vào giỏ hàng");
      navigate("/login"); return;
    }
    
    // Bắt tọa độ click để hiệu ứng bay mượt hơn
    setClickPos({ x: event.clientX, y: event.clientY });
    setIsAnimatingCart(true);

    try { 
      await addToCart(user.userId, firstAvailableVariant.id, 1); 
      setTimeout(() => setIsAnimatingCart(false), 800);
    }
    catch (error: any) { 
      setIsAnimatingCart(false);
      toast.error(error?.response?.data?.message || "Không thể thêm vào giỏ hàng"); 
    }
  };

  const staggerClass = `stagger-${Math.min(staggerIndex + 1, 10)}`;

  return (
    <article
      style={style}
      className={`group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:ring-[#E32A15]/20 ${
        revealed ? `reveal-visible ${staggerClass}` : "reveal-hidden"
      } ${className || ""}`}
    >
      <Link to={`/products/${product.id}`} className="block">
        {/* ── Image area ── */}
        <div className="relative overflow-hidden bg-[#f6f6f6]" style={{ aspectRatio: "1 / 1.05" }}>
          <img
            src={hoverImage || getProductImage(product.id, product.imageUrl, product.thumbnailUrl)}
            alt={product.name}
            className="h-full w-full object-contain p-4 transition-transform duration-500 group-hover:scale-[1.07]"
          />

          {isAnimatingCart && (
            <img
              src={hoverImage || getProductImage(product.id, product.imageUrl, product.thumbnailUrl)}
              alt=""
              className="animate-fly-to-cart rounded-xl object-contain shadow-2xl"
              style={{ width: "100px", height: "100px", left: clickPos.x, top: clickPos.y }}
            />
          )}

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/0 transition-all duration-300 group-hover:bg-black/5" />

          {/* Badges */}
          {discountPercent > 0 && (
            <div className="animate-badge-pulse absolute left-3 top-3 rounded-lg bg-[#E32A15] px-2.5 py-1 text-xs font-bold text-white shadow-md">
              -{discountPercent}%
            </div>
          )}
          {isNew && (
            <div className="absolute left-3 top-3 rounded-lg bg-[#111] px-2.5 py-1 text-xs font-bold text-white">
              NEW
            </div>
          )}
          {totalStock === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[1px]">
              <span className="rounded-full bg-slate-800/80 px-4 py-1.5 text-xs font-bold text-white">Hết hàng</span>
            </div>
          )}

          {/* Action buttons — slide up on hover */}
          <div className="absolute bottom-3 right-3 flex flex-col gap-2 translate-y-3 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            {/* Quick view */}
            {onQuickView && (
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onQuickView(product.id); }}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-700 shadow-lg transition hover:bg-[#111] hover:text-white"
                title="Xem nhanh"
              >
                <Eye size={15} />
              </button>
            )}
            {/* Favorite */}
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFavorite(product); }}
              className={`flex h-9 w-9 items-center justify-center rounded-xl shadow-lg transition-colors ${
                isFavorite(product.id) ? "bg-[#E32A15] text-white" : "bg-white text-[#E32A15] hover:bg-[#E32A15] hover:text-white"
              }`}
            >
              <Heart size={15} className={isFavorite(product.id) ? "fill-white" : ""} />
            </button>
            {/* Add to cart */}
            <button
              type="button"
              onClick={(e) => void handleAddToCart(e)}
              disabled={!canAddToCart || loading}
              className={`flex h-9 w-9 items-center justify-center rounded-xl shadow-lg transition-colors ${
                canAddToCart ? "bg-[#111] text-white hover:bg-[#E32A15]" : "bg-slate-200 text-slate-400 cursor-not-allowed"
              }`}
              title={canAddToCart ? "Thêm vào giỏ hàng" : "Hết hàng"}
            >
              <ShoppingBag size={15} />
            </button>
          </div>
        </div>

        {/* ── Info area ── */}
        <div className="flex flex-1 flex-col gap-2 p-4">
          {product.brand && (
            <span className="w-fit rounded-md bg-[#f0f0f0] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              {product.brand}
            </span>
          )}
          <h3 className="line-clamp-2 flex-1 text-sm font-semibold leading-snug text-[#111] min-h-[40px]">
            {product.name}
          </h3>
          <div className="flex items-center gap-2 pt-1">
            <span className="text-base font-extrabold text-[#E32A15]">{formatPrice(sellingPrice)}</span>
            {product.salePrice && product.price > product.salePrice && (
              <span className="text-xs text-slate-400 line-through">{formatPrice(product.price)}</span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <div className={`h-1.5 w-1.5 rounded-full ${totalStock > 10 ? "bg-emerald-500" : totalStock > 0 ? "bg-amber-400" : "bg-red-400"}`} />
            <span className={`text-xs font-medium ${totalStock > 10 ? "text-emerald-600" : totalStock > 0 ? "text-amber-600" : "text-red-500"}`}>
              {totalStock > 10 ? "Còn hàng" : totalStock > 0 ? `Còn ${totalStock} sản phẩm` : "Hết hàng"}
            </span>
          </div>

          {/* Color Swatches */}
          {uniqueColors.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {uniqueColors.slice(0, 4).map((c, idx) => (
                <div
                  key={idx}
                  onMouseEnter={() => c.imageUrl && setHoverImage(getProductImage(product.id, c.imageUrl))}
                  onMouseLeave={() => setHoverImage(null)}
                  onClick={(e) => e.preventDefault()}
                  className="h-4 w-4 cursor-pointer rounded-full border border-slate-200 ring-1 ring-transparent hover:ring-[#E32A15] transition-all"
                  style={{ backgroundColor: c.color.toLowerCase() }}
                  title={c.color}
                />
              ))}
              {uniqueColors.length > 4 && (
                <div className="flex h-4 items-center justify-center rounded-full bg-slate-100 px-1.5 text-[9px] font-bold text-slate-500">
                  +{uniqueColors.length - 4}
                </div>
              )}
            </div>
          )}
        </div>
      </Link>
    </article>
  );
};

export default ProductCard;
