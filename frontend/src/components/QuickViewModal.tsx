import { Heart, ShoppingBag, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../hooks/useAuth";
import { useCart } from "../hooks/useCart";
import { useFavorite } from "../hooks/useFavorite";
import { getProductImage, normalizeImageUrl } from "../services/productImages";
import { productService } from "../services/productService";
import type { Product, Variant } from "../types/product";

const formatPrice = (v: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(v);

interface QuickViewModalProps {
  productId: number | null;
  onClose: () => void;
}

const QuickViewModal = ({ productId, onClose }: QuickViewModalProps) => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { addToCart, loading } = useCart();
  const { isFavorite, toggleFavorite } = useFavorite();

  const [product, setProduct] = useState<Product | null>(null);
  const [fetching, setFetching] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [imgIndex, setImgIndex] = useState(0);

  useEffect(() => {
    if (!productId) { setProduct(null); return; }
    setFetching(true);
    productService.getProductById(productId)
      .then((data) => {
        setProduct(data);
        const firstInStock = (data.variants || []).find((v) => (v.stockQuantity || 0) > 0);
        setSelectedVariant(firstInStock || null);
        setSelectedSize(firstInStock?.size?.trim() || "");
        setImgIndex(0);
      })
      .catch(() => toast.error("Không thể tải sản phẩm"))
      .finally(() => setFetching(false));
  }, [productId]);

  // Lock body scroll
  useEffect(() => {
    if (productId) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [productId]);

  if (!productId) return null;

  const images = product
    ? Array.from(new Set([
        getProductImage(product.id, product.imageUrl, product.thumbnailUrl),
        ...(product.variants || []).map((v) => normalizeImageUrl(v.imageUrl)).filter(Boolean) as string[],
      ]))
    : [];

  const sellingPrice = product?.salePrice || product?.price || 0;
  const originalPrice = product?.price || 0;
  const discountPct = sellingPrice && originalPrice > sellingPrice
    ? Math.round(((originalPrice - sellingPrice) / originalPrice) * 100) : 0;

  const sizes = Array.from(new Map(
    (product?.variants || [])
      .filter((v) => v.size?.trim())
      .sort((a, b) => parseFloat(a.size!) - parseFloat(b.size!))
      .map((v) => [v.size!.trim(), v])
  ).values());

  const handleAddToCart = async () => {
    if (!isAuthenticated) { toast.info("Vui lòng đăng nhập"); navigate("/login"); return; }
    if (!selectedVariant) { toast.warning("Vui lòng chọn size"); return; }
    if (!user?.userId) return;
    await addToCart(user.userId, selectedVariant.id, 1);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed left-1/2 top-1/2 z-50 w-[min(92vw,860px)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-3xl bg-white shadow-2xl animate-scale-in">
        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/10 text-slate-600 transition hover:bg-black/20"
        >
          <X size={18} />
        </button>

        {fetching || !product ? (
          <div className="flex h-80 items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#E32A15] border-t-transparent" />
          </div>
        ) : (
          <div className="grid md:grid-cols-2">
            {/* Left: Image */}
            <div className="relative flex items-center justify-center bg-[#f6f6f6] p-8">
              <img
                src={images[imgIndex]}
                alt={product.name}
                className="h-72 w-full object-contain transition-all duration-300"
              />
              {images.length > 1 && (
                <>
                  <button onClick={() => setImgIndex((i) => (i - 1 + images.length) % images.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow">
                    <ChevronLeft size={18} />
                  </button>
                  <button onClick={() => setImgIndex((i) => (i + 1) % images.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow">
                    <ChevronRight size={18} />
                  </button>
                  <div className="absolute bottom-4 flex gap-1.5">
                    {images.map((_, i) => (
                      <button key={i} onClick={() => setImgIndex(i)}
                        className={`h-1.5 rounded-full transition-all ${i === imgIndex ? "w-5 bg-[#E32A15]" : "w-1.5 bg-slate-300"}`} />
                    ))}
                  </div>
                </>
              )}
              {discountPct > 0 && (
                <div className="absolute left-4 top-4 rounded-lg bg-[#E32A15] px-2.5 py-1 text-xs font-bold text-white shadow">
                  -{discountPct}%
                </div>
              )}
            </div>

            {/* Right: Info */}
            <div className="flex flex-col gap-4 p-6">
              {product.brand && (
                <span className="w-fit rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  {product.brand}
                </span>
              )}
              <h2 className="text-xl font-extrabold leading-snug text-[#111]">{product.name}</h2>

              {/* Price */}
              <div className="flex items-center gap-3">
                <span className="text-2xl font-black text-[#E32A15]">{formatPrice(sellingPrice)}</span>
                {originalPrice > sellingPrice && (
                  <span className="text-sm text-slate-400 line-through">{formatPrice(originalPrice)}</span>
                )}
              </div>

              {/* Sizes */}
              {sizes.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                    Kích thước: <span className="text-[#111]">{selectedSize}</span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map((v) => (
                      <button
                        key={v.size}
                        type="button"
                        onClick={() => { setSelectedSize(v.size!.trim()); setSelectedVariant(v); }}
                        disabled={(v.stockQuantity || 0) === 0}
                        className={`min-w-[44px] rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                          selectedSize === v.size?.trim()
                            ? "border-[#E32A15] bg-[#E32A15] text-white"
                            : (v.stockQuantity || 0) === 0
                            ? "border-slate-100 bg-slate-50 text-slate-300 line-through cursor-not-allowed"
                            : "border-slate-200 text-slate-700 hover:border-[#E32A15]"
                        }`}
                      >
                        {v.size?.trim()}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="mt-auto flex gap-3">
                <button
                  type="button"
                  onClick={() => void handleAddToCart()}
                  disabled={!selectedVariant || loading}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#111] py-3 text-sm font-bold text-white transition hover:bg-[#E32A15] disabled:opacity-50"
                >
                  <ShoppingBag size={16} />
                  Thêm vào giỏ
                </button>
                <button
                  type="button"
                  onClick={() => toggleFavorite(product)}
                  className={`flex h-12 w-12 items-center justify-center rounded-xl border transition ${
                    isFavorite(product.id)
                      ? "border-[#E32A15] bg-[#E32A15] text-white"
                      : "border-slate-200 text-[#E32A15] hover:border-[#E32A15]"
                  }`}
                >
                  <Heart size={18} className={isFavorite(product.id) ? "fill-white" : ""} />
                </button>
              </div>

              <Link
                to={`/products/${product.id}`}
                onClick={onClose}
                className="text-center text-xs text-slate-400 underline-offset-2 hover:text-[#E32A15] hover:underline"
              >
                Xem trang chi tiết sản phẩm →
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default QuickViewModal;
