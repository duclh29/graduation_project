import { CircleCheck, HandCoins, Heart, Minus, PackageCheck, Plus, ShoppingBag, Truck, ArrowRight, Ruler, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import LoadingSpinner from "../components/LoadingSpinner";
import ProductCard from "../components/ProductCard";
import QuickViewModal from "../components/QuickViewModal";
import { useAuth } from "../hooks/useAuth";
import { useCart } from "../hooks/useCart";
import { useFavorite } from "../hooks/useFavorite";
import { getProductImage, getProductImages, normalizeImageUrl } from "../services/productImages";
import { productService } from "../services/productService";
import { couponService } from "../services/couponService";
import { useSavedCoupons } from "../hooks/useSavedCoupons";
import { useRecentlyViewed } from "../hooks/useRecentlyViewed";
import type { Product, Variant } from "../types/product";
import type { Coupon } from "../types/coupon";

const formatPrice = (value: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);

const normalizeSize = (size?: string) => size?.trim() || "";

const parseProductSizes = (sizes?: string) =>
  sizes
    ?.split(",")
    .map((size) => normalizeSize(size))
    .filter(Boolean) || [];

const sortSizeVariants = (variants: Variant[]) =>
  [...variants].sort((left, right) => {
    const leftSize = Number.parseFloat(normalizeSize(left.size));
    const rightSize = Number.parseFloat(normalizeSize(right.size));

    if (Number.isNaN(leftSize) || Number.isNaN(rightSize)) {
      return normalizeSize(left.size).localeCompare(normalizeSize(right.size));
    }

    return leftSize - rightSize;
  });

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const currentUserId = user?.userId ?? 0;
  const { addToCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorite();

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedImage, setSelectedImage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [quickViewId, setQuickViewId] = useState<number | null>(null);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [zoomStyle, setZoomStyle] = useState<React.CSSProperties>({});
  const [zooming, setZooming] = useState(false);
  const buyBtnRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const { saveCoupon, hasSavedCoupon } = useSavedCoupons();
  const { addRecentlyViewed } = useRecentlyViewed();

  const getInitialVariant = (variants: Variant[]) => {
    if (!variants.length) return null;
    return variants.find((variant) => (variant.stockQuantity || 0) > 0) || variants[0];
  };

  useEffect(() => {
    const loadProduct = async () => {
      if (!id) return;

      setLoading(true);
      try {
        const data = await productService.getProductById(id);
        setProduct(data);
        addRecentlyViewed(data);

        productService.getProducts({ brand: data.brandName || data.brand, size: 5, page: 0 })
          .then(res => setRelatedProducts(res.content.filter(p => String(p.id) !== String(data.id)).slice(0, 4)))
          .catch(console.error);

        const uniqueVariants = Array.from(
          new Map(
            sortSizeVariants(data.variants || [])
              .filter((variant) => normalizeSize(variant.size))
              .map((variant) => [normalizeSize(variant.size), { ...variant, size: normalizeSize(variant.size) }])
          ).values()
        );

        const initialVariant = getInitialVariant(uniqueVariants);
        setSelectedVariant(initialVariant);
        setSelectedSize(
          normalizeSize(initialVariant?.size) ||
          (data.sizeOptions || []).map((size) => normalizeSize(size)).filter(Boolean)[0] ||
          parseProductSizes(data.sizes)[0] ||
          ""
        );
        setSelectedImage(normalizeImageUrl(initialVariant?.imageUrl) || getProductImage(data.id, data.imageUrl, data.thumbnailUrl));
        setQuantity(1);
      } finally {
        setLoading(false);
      }
    };

    const loadCoupons = async () => {
      try {
        const data = await couponService.getActiveCoupons();
        setCoupons(data);
      } catch (error) {
        console.error("Failed to load coupons", error);
      }
    };

    void loadProduct();
    void loadCoupons();
  }, [id]);

  // Sticky bar: show when buy buttons scroll out of view
  useEffect(() => {
    const sentinel = buyBtnRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyBar(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loading]);

  // Image zoom lens
  const handleImageMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomStyle({ transformOrigin: `${x}% ${y}%`, transform: "scale(2.2)" });
  }, []);

  const uniqueSizeVariants = useMemo(
    () =>
      Array.from(
        new Map(
          sortSizeVariants(product?.variants || [])
            .filter((variant) => normalizeSize(variant.size))
            .map((variant) => [normalizeSize(variant.size), { ...variant, size: normalizeSize(variant.size) }])
        ).values()
      ),
    [product]
  );

  const displaySizes = useMemo(() => {
    const apiSizeOptions = (product?.sizeOptions || []).map((size) => normalizeSize(size)).filter(Boolean);
    if (apiSizeOptions.length > 0) return apiSizeOptions;

    const productSizes = parseProductSizes(product?.sizes);
    if (productSizes.length > 0) return productSizes;

    return uniqueSizeVariants.map((variant) => normalizeSize(variant.size)).filter(Boolean);
  }, [product?.sizeOptions, product?.sizes, uniqueSizeVariants]);

  const displayPrice = useMemo(
    () => selectedVariant?.salePrice || product?.salePrice || selectedVariant?.price || product?.price || 0,
    [product, selectedVariant]
  );

  const originalPrice = useMemo(
    () => selectedVariant?.price || product?.price || 0,
    [product, selectedVariant]
  );
  const availableStock = selectedVariant?.stockQuantity || 0;
  const inStock = availableStock > 0;
  const skuText = selectedVariant?.sku || "";

  const galleryImages = useMemo(() => {
    if (!product) return [];

    const baseImages = getProductImages(product.id, product.imageUrl, product.thumbnailUrl);
    const variantImages = (product.variants || [])
      .map((variant) => normalizeImageUrl(variant.imageUrl))
      .filter((image): image is string => Boolean(image));

    return Array.from(new Set([...baseImages, ...variantImages]));
  }, [product]);

  const selectedImageIndex = useMemo(() => {
    const index = galleryImages.findIndex((image) => image === selectedImage);
    return index >= 0 ? index : 0;
  }, [galleryImages, selectedImage]);

  const handleSelectSize = (size: string) => {
    setSelectedSize(size);
    setQuantity(1);

    const matchedVariants = uniqueSizeVariants.filter((variant) => normalizeSize(variant.size) === size);
    const matchedVariant = getInitialVariant(matchedVariants);

    if (matchedVariant) {
      setSelectedVariant(matchedVariant);
      const variantImage = normalizeImageUrl(matchedVariant.imageUrl);
      if (variantImage) setSelectedImage(variantImage);
    } else {
      setSelectedVariant(null);
    }
  };

  const handlePrevImage = () => {
    if (galleryImages.length === 0) return;
    const nextIndex = selectedImageIndex === 0 ? galleryImages.length - 1 : selectedImageIndex - 1;
    setSelectedImage(galleryImages[nextIndex]);
  };

  const handleNextImage = () => {
    if (galleryImages.length === 0) return;
    const nextIndex = selectedImageIndex === galleryImages.length - 1 ? 0 : selectedImageIndex + 1;
    setSelectedImage(galleryImages[nextIndex]);
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập trước khi thêm vào giỏ hàng");
      return;
    }
    if (!selectedVariant) {
      toast.error("Vui lòng chọn size sản phẩm");
      return;
    }
    if (!currentUserId) {
      toast.error("Không xác định được tài khoản. Vui lòng đăng nhập lại!");
      return;
    }
    if (!inStock) {
      toast.error("Sản phẩm đang tạm hết hàng!");
      return;
    }
    if (quantity > availableStock) {
      toast.error(`Bạn chỉ có thể thêm tối đa ${availableStock} sản phẩm`);
      setQuantity(Math.max(1, availableStock));
      return;
    }

    try {
      await addToCart(currentUserId, selectedVariant.id, quantity);
      navigate("/cart");
    } catch (error: any) {
      const message = error?.response?.data?.message || "Thêm vào giỏ hàng thất bại. Vui lòng thử lại !";
      toast.error(message);
    }
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập trước khi mua ngay");
      return;
    }
    if (!selectedVariant) {
      toast.error("Vui lòng chọn size sản phẩm");
      return;
    }
    if (!currentUserId) {
      toast.error("Không xác định được tài khoản. Vui lòng đăng nhập lại!");
      return;
    }
    if (!inStock) {
      toast.error("Sản phẩm đang tạm hết hàng!");
      return;
    }
    if (quantity > availableStock) {
      toast.error(`Bạn chỉ có thể mua tối đa ${availableStock} sản phẩm`);
      setQuantity(Math.max(1, availableStock));
      return;
    }

    if (!product) return;

    navigate("/checkout", {
      state: {
        buyNowItem: {
          variantId: selectedVariant.id,
          quantity,
          productName: product.name,
          price: selectedVariant.price || product.price,
          imageUrl: selectedVariant.imageUrl || product.imageUrl,
          size: selectedVariant.size
        }
      }
    });
  };

  const handleQuantityInputChange = (rawValue: string) => {
    if (rawValue.trim() === "") {
      setQuantity(1);
      return;
    }

    const parsed = Number.parseInt(rawValue, 10);
    if (Number.isNaN(parsed) || parsed <= 0) {
      setQuantity(1);
      return;
    }

    if (availableStock > 0 && parsed > availableStock) {
      toast.error(`Bạn chỉ có thể mua tối đa ${availableStock} sản phẩm`);
      setQuantity(availableStock);
      return;
    }

    setQuantity(parsed);
  };

  const formatDiscountDisplay = (coupon: Coupon) => {
    if (coupon.type === "FREE_SHIPPING") return "FS";
    if (coupon.type === "PERCENTAGE") return `${coupon.discountValue}%`;

    const value = Number(coupon.discountValue);
    if (value >= 1000000) return `${(value / 1000000).toFixed(0)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
    return value.toString();
  };

  const handleSaveCoupon = async (code: string) => {
    try {
      const success = await saveCoupon(code);
      if (success) {
        toast.success("Lưu mã giảm giá thành công");
      } else {
        toast.error("Vui lòng đăng nhập để lưu mã giảm giá");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Lưu mã thất bại, vui lòng thử lại.");
    }
  };

  if (loading) return <LoadingSpinner label="Đang tải sản phẩm..." />;

  if (!product) {
    return (
      <div className="page-shell py-16">
        <div className="panel p-10 text-center text-slate-500">Không tìm thấy sản phẩm.</div>
      </div>
    );
  }

  return (
    <>
    <div className="bg-white py-6 page-transition">
      <div className="page-shell">
        <div className="mb-5 text-xs text-slate-600">
          <Link to="/" className="hover:text-[#E32A15]">Trang chủ</Link>
          <span className="mx-2">/</span>
          <Link to="/danh-muc?brand=Nike" className="hover:text-[#E32A15]">
            {product.brandName || product.brand || "Sản phẩm"}
          </Link>
          <span className="mx-2">/</span>
          <span className="font-semibold text-black">{product.name}</span>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
          {/* ─── Image gallery with zoom ─── */}
          <section className="flex flex-col gap-4">
            <div
              className="relative overflow-hidden rounded-[32px] bg-[#f4f4f4] cursor-zoom-in flex items-center justify-center p-8 lg:p-12"
              onMouseMove={handleImageMouseMove}
              onMouseEnter={() => setZooming(true)}
              onMouseLeave={() => { setZooming(false); setZoomStyle({}); }}
            >
              <img
                ref={imgRef}
                src={selectedImage}
                alt={product.name}
                className="mx-auto aspect-[4/3] w-full max-w-[600px] object-contain mix-blend-multiply transition-transform duration-150"
                style={zooming ? zoomStyle : {}}
              />
              {galleryImages.length > 1 && (
                <>
                  <button type="button" onClick={handlePrevImage}
                    className="absolute left-6 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white text-black shadow-md transition-all hover:scale-105">
                    <span className="text-xl font-bold leading-none -ml-0.5">‹</span>
                  </button>
                  <button type="button" onClick={handleNextImage}
                    className="absolute right-6 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white text-black shadow-md transition-all hover:scale-105">
                    <span className="text-xl font-bold leading-none -mr-0.5">›</span>
                  </button>
                </>
              )}
              {zooming && <div className="pointer-events-none absolute right-6 top-6 rounded-full bg-black/40 px-3 py-1.5 text-[11px] font-medium text-white backdrop-blur-md">🔍 Hover để zoom</div>}
            </div>

            <div className="flex flex-wrap gap-3">
              {galleryImages.map((image) => (
                <button
                  key={image} type="button" onClick={() => setSelectedImage(image)}
                  className={`overflow-hidden rounded-2xl border-2 transition-all duration-200 bg-[#f4f4f4] flex items-center justify-center ${
                    selectedImage === image 
                      ? "border-[#E32A15] shadow-md scale-105" 
                      : "border-transparent opacity-60 hover:opacity-100 hover:border-slate-300"
                  }`}
                >
                  <img src={image} alt="thumbnail" className="h-20 w-20 object-contain mix-blend-multiply p-2" />
                </button>
              ))}
            </div>
          </section>

          <div className="space-y-4">
            <section className="rounded-md bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <h1 className="text-xl font-black text-black lg:text-[32px] lg:leading-tight">{product.name}</h1>
                <span className={`rounded px-3 py-1 text-xs font-bold text-white ${inStock ? "bg-[#57c84d]" : "bg-[#ff1d00]"}`}>
                  {inStock ? "Còn hàng" : "Hết hàng"}
                </span>
              </div>

              <div className="mt-3 flex items-center gap-2 text-xs">
                <CircleCheck className="text-[#1d7cff]" size={18} />
                <span>Authentic 100%</span>
              </div>

              <div className="mt-3 flex flex-wrap gap-6 text-xs">
                <p>Thương hiệu: <span className="font-bold text-[#1d7cff]">{product.brandName || product.brand || "Nike"}</span></p>
                <p>Loại: <span className="font-bold text-[#E32A15]">Hàng có sẵn</span></p>
                {skuText && <p>MSP: <span className="font-bold text-[#E32A15]">{skuText}</span></p>}
              </div>

              <div className="mt-4 flex items-center gap-4">
                <span className="text-3xl font-black text-[#ff0000]">{formatPrice(displayPrice)}</span>
                {originalPrice > 0 && <span className="text-xl font-semibold text-slate-400 line-through">{formatPrice(originalPrice)}</span>}
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-4">
                <span className="text-sm font-semibold text-black">Kích thước:{selectedSize ? ` ${selectedSize}` : ""}</span>
                <button
                  type="button"
                  onClick={() => setShowSizeGuide(true)}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-black underline-offset-4 transition hover:text-[#E32A15] hover:underline"
                >
                  <Ruler size={16} />
                  Hướng dẫn chọn size
                </button>
              </div>

              <div className="mt-3 flex flex-wrap gap-3">
                {displaySizes.map((size) => {
                  const variantForSize = uniqueSizeVariants.find((variant) => normalizeSize(variant.size) === size);
                  const disabled = variantForSize ? (variantForSize.stockQuantity || 0) <= 0 : false;

                  return (
                  <button
                    key={size}
                    type="button"
                    disabled={disabled}
                    onClick={() => handleSelectSize(size)}
                    className={`min-w-14 rounded border px-4 py-2.5 text-xs transition ${
                      selectedSize === size
                        ? "border-[#ff4d4f] bg-white text-black shadow-[inset_0_0_0_1px_#ff4d4f]"
                        : "border-slate-200 bg-white text-slate-700 hover:border-[#ff4d4f]"
                    } ${disabled ? "cursor-not-allowed bg-slate-100 text-slate-300 line-through hover:border-slate-200" : ""}`}
                  >
                    {size}
                  </button>
                )})}
              </div>
              {selectedVariant && (
                <p className="mt-2 text-xs text-slate-500">Còn {availableStock} sản phẩm cho size {selectedSize}.</p>
              )}

              <div ref={buyBtnRef} className="mt-7 flex flex-wrap items-center gap-4">
                <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden">
                  <button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))} className="px-4 py-3 hover:bg-slate-50"><Minus size={18} /></button>
                  <input type="number" min={1} max={Math.max(1, availableStock)} value={quantity} onChange={(event) => handleQuantityInputChange(event.target.value)} className="h-full w-16 border-x border-slate-300 px-2 py-3 text-center text-base font-bold outline-none" />
                  <button type="button" onClick={() => {
                    if (!availableStock) { toast.error("Sản phẩm đang tạm hết hàng"); return; }
                    setQuantity((value) => Math.min(availableStock, value + 1));
                  }} className="px-4 py-3 hover:bg-slate-50"><Plus size={18} /></button>
                </div>

                <button type="button" onClick={() => void handleAddToCart()} disabled={!inStock}
                  className={`min-w-[200px] rounded-xl px-8 py-3.5 text-sm font-bold text-white transition duration-200 ${inStock ? "bg-[#111] hover:bg-[#E32A15] active:scale-95 shadow-md" : "cursor-not-allowed bg-slate-300"}`}>
                  {inStock ? "Thêm vào giỏ" : "Hết hàng"}
                </button>

                {inStock && (
                  <button type="button" onClick={() => void handleBuyNow()}
                    className="min-w-[200px] rounded-xl border-2 border-[#E32A15] bg-white px-8 py-3.5 text-sm font-bold text-[#E32A15] transition hover:bg-[#E32A15] hover:text-white">
                    Mua ngay
                  </button>
                )}

                <button type="button" onClick={() => toggleFavorite(product)}
                  className={`flex h-12 w-12 items-center justify-center rounded-xl border-2 transition ${isFavorite(product.id) ? "border-[#E32A15] bg-[#E32A15] text-white" : "border-[#E32A15] bg-white text-[#E32A15] hover:bg-[#E32A15] hover:text-white"}`}>
                  <Heart size={20} className={isFavorite(product.id) ? "fill-white" : ""} />
                </button>
              </div>
            </section>


            {coupons.length > 0 && (
              <section className="rounded-md bg-white p-4">
                <div className="flex flex-wrap gap-4 overflow-x-auto pb-2 scrollbar-hide">
                  {coupons.map((coupon) => (
                    <div key={coupon.id} className="min-w-[320px] max-w-md flex-1 overflow-hidden rounded-xl border border-slate-200 shadow-sm transition-transform hover:scale-[1.02]">
                      <div className="grid grid-cols-[100px_1fr]">
                        <div className="flex items-center justify-center bg-[#E32A15] text-4xl font-black text-white">
                          {formatDiscountDisplay(coupon)}
                        </div>
                        <div className="p-4">
                          <h3 className="line-clamp-1 text-lg font-bold text-black">{coupon.description || "Ưu đãi hấp dẫn"}</h3>
                          <p className="mt-1 text-xs text-slate-600">
                            {coupon.minimumOrderAmount
                              ? `Đơn hàng từ ${formatPrice(Number(coupon.minimumOrderAmount))}`
                              : "Mọi đơn hàng"}
                          </p>
                          <div className="mt-3 flex items-end justify-between gap-3">
                            <div className="text-[10px] text-slate-500">
                              <p>Mã: <span className="font-bold text-black">{coupon.code}</span></p>
                              <p>HSD: {new Date(coupon.endAt).toLocaleDateString("vi-VN")}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => !hasSavedCoupon(coupon.code) && handleSaveCoupon(coupon.code)}
                              className={`rounded-full px-4 py-1.5 text-xs font-bold text-white transition-colors ${
                                hasSavedCoupon(coupon.code) ? "bg-green-600 cursor-default" : "bg-black hover:bg-slate-800"
                              }`}
                            >
                              {hasSavedCoupon(coupon.code) ? "Đã lưu ✓" : "Lưu mã"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>

      {/* ─── Related Products ─── */}
      {relatedProducts.length > 0 && (
        <div className="bg-slate-50 py-16">
          <div className="page-shell">
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-2xl font-black text-black">SẢN PHẨM LIÊN QUAN</h2>
              <Link to={`/danh-muc?brand=${product.brandName || product.brand}`} className="inline-flex items-center gap-1.5 text-sm font-bold text-[#E32A15] hover:underline">
                Xem thêm <ArrowRight size={16} />
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map((p, i) => (
                <ProductCard key={p.id} product={p} onQuickView={setQuickViewId} style={{ animationDelay: `${i * 100}ms` }} className="card-appear" />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── Quick View Modal ─── */}
      <QuickViewModal productId={quickViewId} onClose={() => setQuickViewId(null)} />

      {showSizeGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div className="flex items-center gap-2">
                <Ruler className="text-[#E32A15]" size={20} />
                <h3 className="text-lg font-bold text-slate-900">Hướng dẫn chọn size</h3>
              </div>
              <button type="button" onClick={() => setShowSizeGuide(false)} className="rounded-full p-2 text-slate-500 hover:bg-slate-100">
                <X size={18} />
              </button>
            </div>
            <div className="p-6">
              <div className="grid gap-4 md:grid-cols-[1fr_1.2fr]">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                  <p className="font-semibold text-slate-900">Cách đo nhanh</p>
                  <p className="mt-2">Đặt chân lên giấy, đánh dấu điểm gót và đầu ngón dài nhất, sau đó đo chiều dài. Nên đo vào cuối ngày và cộng thêm khoảng 0.5 cm nếu thích mang thoải mái.</p>
                </div>
                <table className="w-full overflow-hidden rounded-xl border border-slate-200 text-sm">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th className="px-4 py-2 text-left">Chiều dài chân</th>
                      <th className="px-4 py-2 text-left">Size gợi ý</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {[
                      ["22.5 - 23.0 cm", "36"],
                      ["23.1 - 23.5 cm", "37"],
                      ["23.6 - 24.0 cm", "38"],
                      ["24.1 - 24.5 cm", "39"],
                      ["24.6 - 25.0 cm", "40"],
                      ["25.1 - 25.5 cm", "41"],
                      ["25.6 - 26.0 cm", "42"],
                      ["26.1 - 26.5 cm", "43"]
                    ].map(([length, size]) => (
                      <tr key={size}>
                        <td className="px-4 py-2 text-slate-700">{length}</td>
                        <td className="px-4 py-2 font-bold text-slate-900">{size}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Sticky Add-to-Cart Bar ─── */}
      {showStickyBar && product && (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-100 bg-white/95 px-4 py-3 shadow-2xl backdrop-blur-md animate-fade-in">
          <div className="page-shell flex items-center gap-4">
            <img
              src={getProductImage(product.id, product.imageUrl, product.thumbnailUrl)}
              alt={product.name}
              className="h-14 w-14 rounded-xl object-contain bg-[#f4f4f4] p-1 shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="line-clamp-1 text-sm font-bold text-[#111]">{product.name}</p>
              <p className="text-base font-extrabold text-[#E32A15]">
                {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
                  selectedVariant?.salePrice || product.salePrice || selectedVariant?.price || product.price || 0
                )}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              {selectedSize && (
                <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700">
                  Size: {selectedSize}
                </span>
              )}
              <button
                type="button"
                onClick={() => void handleAddToCart()}
                disabled={!inStock}
                className={`inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white transition ${inStock ? "bg-[#E32A15] hover:bg-[#b31f0e] shadow-lg" : "bg-slate-300 cursor-not-allowed"}`}
              >
                <ShoppingBag size={16} />
                {inStock ? "Thêm vào giỏ" : "Hết hàng"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductDetailPage;
