import { Minus, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";
import Pagination from "../components/Pagination";
import ProductCard from "../components/ProductCard";
import { heroShoeImage } from "../services/productImages";
import { productService } from "../services/productService";
import type { Product, ProductFilters } from "../types/product";

const defaultFilters: ProductFilters = {
  keyword: "",
  minPrice: "",
  maxPrice: "",
  brand: "",
  category: "",
  page: 0,
  size: 15,
  sort: "name,asc"
};

const categoryOptions = [
  { label: "Giày Nike", value: "Nike" },
  { label: "Giày Adidas", value: "Adidas" },
  { label: "Giày MLB", value: "MLB" },
  { label: "Giày Puma", value: "Puma" },
  { label: "Giày Fila", value: "FILA" },
  { label: "Giày Chính Hãng Khác", value: "" },
  { label: "Quần Áo/ Phụ Kiện", value: "Accessories" }
];

const brandOptions = ["Nike", "Adidas", "MLB", "Puma", "FILA", "New Balance", "Jeep"];

const priceRanges = [
  { label: "Dưới 500,000đ", minPrice: "", maxPrice: "500000" },
  { label: "500,000đ - 1,000,000đ", minPrice: "500000", maxPrice: "1000000" },
  { label: "1,000,000đ - 2,000,000đ", minPrice: "1000000", maxPrice: "2000000" },
  { label: "2,000,000đ - 3,000,000đ", minPrice: "2000000", maxPrice: "3000000" },
  { label: "Trên 3,000,000đ", minPrice: "3000000", maxPrice: "" }
];

const sizes = ["35", "35.5", "36", "36.5", "37", "38", "39", "40", "41", "42", "43"];

type FilterSection = "category" | "brand" | "price" | "size";

const ProductCatalogPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState<ProductFilters>({
    ...defaultFilters,
    brand: searchParams.get("brand") || ""
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState("");
  const [openSections, setOpenSections] = useState<Record<FilterSection, boolean>>({
    category: true,
    brand: false,
    price: false,
    size: false
  });

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const data = await productService.getProducts(filters);
        setProducts(data.content);
        setTotalPages(data.totalPages);
      } finally {
        setLoading(false);
      }
    };

    void loadProducts();
  }, [filters]);

  useEffect(() => {
    const loadAllProducts = async () => {
      const data = await productService.getProducts({
        ...defaultFilters,
        size: 200
      });
      setAllProducts(data.content);
    };

    void loadAllProducts();
  }, []);

  const counts = useMemo(() => {
    const byBrand = allProducts.reduce<Record<string, number>>((acc, product) => {
      const key = product.brand || "OTHER";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    return {
      byBrand,
      other:
        allProducts.filter(
          (product) => !["Nike", "Adidas", "MLB", "Puma", "FILA", "Accessories"].includes(product.brand || "")
        ).length,
      accessories: allProducts.filter((product) => product.category === "Accessories").length
    };
  }, [allProducts]);

  const title = useMemo(() => {
    if (!filters.brand) {
      return "Tất cả sản phẩm";
    }
    return `Giày ${filters.brand}`;
  }, [filters.brand]);

  const updateFilters = (partial: Partial<ProductFilters>) => {
    setFilters((previous) => ({
      ...previous,
      ...partial,
      page: partial.page ?? 0
    }));
  };

  const toggleSection = (section: FilterSection) => {
    setOpenSections((previous) => ({
      ...previous,
      [section]: !previous[section]
    }));
  };

  const selectBrand = (brand: string) => {
    const nextBrand = filters.brand === brand ? "" : brand;
    setSearchParams(nextBrand ? { brand: nextBrand } : {});
    updateFilters({ brand: nextBrand, page: 0 });
  };

  const selectPriceRange = (minPrice: string, maxPrice: string) => {
    const isCurrent = filters.minPrice === minPrice && filters.maxPrice === maxPrice;
    updateFilters({
      minPrice: isCurrent ? "" : minPrice,
      maxPrice: isCurrent ? "" : maxPrice,
      page: 0
    });
  };

  const getCategoryCount = (value: string) => {
    if (value === "Accessories") {
      return counts.accessories;
    }
    if (!value) {
      return counts.other;
    }
    return counts.byBrand[value] || 0;
  };

  const renderSectionHeader = (label: string, section: FilterSection) => (
    <button
      type="button"
      onClick={() => toggleSection(section)}
      className="flex w-full items-center justify-between px-4 py-3 text-left"
    >
      <h3 className="text-[18px] font-bold text-black">{label}</h3>
      {openSections[section] ? <Minus size={18} strokeWidth={3} /> : <Plus size={18} strokeWidth={3} />}
    </button>
  );

  return (
    <div className="bg-white py-6">
      <div className="page-shell">
        <div className="mb-5 text-sm text-slate-600">
          <Link to="/" className="hover:text-[#E32A15]">
            Trang chủ
          </Link>
          <span className="mx-2">/</span>
          <span className="font-semibold text-black">{title}</span>
        </div>

        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="space-y-4">
            <div className="rounded-md border border-slate-200 bg-white">
              {renderSectionHeader("Danh mục sản phẩm", "category")}
              {openSections.category && (
                <div className="space-y-3 border-t border-slate-100 px-4 py-4">
                  {categoryOptions.map((category) => (
                    <label key={category.label} className="flex items-center justify-between gap-3 text-[15px]">
                      <span className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={filters.brand === category.value}
                          onChange={() => selectBrand(category.value)}
                          className="h-4 w-4 accent-[#E32A15]"
                        />
                        <span>{category.label}</span>
                      </span>
                      <span className="text-slate-700">({getCategoryCount(category.value)})</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-md border border-slate-200 bg-white">
              {renderSectionHeader("Thương hiệu", "brand")}
              {openSections.brand && (
                <div className="space-y-3 border-t border-slate-100 px-4 py-4">
                  {brandOptions.map((brand) => (
                    <label key={brand} className="flex items-center justify-between gap-3 text-[15px]">
                      <span className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={filters.brand === brand}
                          onChange={() => selectBrand(brand)}
                          className="h-4 w-4 accent-[#E32A15]"
                        />
                        <span>{brand}</span>
                      </span>
                      <span className="text-slate-700">({counts.byBrand[brand] || 0})</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-md border border-slate-200 bg-white">
              {renderSectionHeader("Lọc giá", "price")}
              {openSections.price && (
                <div className="space-y-3 border-t border-slate-100 px-4 py-4">
                  {priceRanges.map((range) => (
                    <label key={range.label} className="flex items-center gap-3 text-[15px]">
                      <input
                        type="checkbox"
                        checked={filters.minPrice === range.minPrice && filters.maxPrice === range.maxPrice}
                        onChange={() => selectPriceRange(range.minPrice, range.maxPrice)}
                        className="h-4 w-4 accent-[#E32A15]"
                      />
                      <span>{range.label}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-md border border-slate-200 bg-white">
              {renderSectionHeader("Kích thước", "size")}
              {openSections.size && (
                <div className="max-h-60 space-y-3 overflow-y-auto border-t border-slate-100 px-4 py-4">
                  {sizes.map((size) => (
                    <label key={size} className="flex items-center gap-3 text-[15px]">
                      <input
                        type="checkbox"
                        checked={selectedSize === size}
                        onChange={() => setSelectedSize((current) => (current === size ? "" : size))}
                        className="h-4 w-4 accent-[#E32A15]"
                      />
                      <span>{size}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </aside>

          <div>
            <div className="mb-6 overflow-hidden rounded-md border border-slate-200">
              <div
                className="relative min-h-[300px] bg-cover bg-center"
                style={{ backgroundImage: `url('${heroShoeImage}')` }}
              >
                <div className="absolute inset-0 bg-white/75" />
                <div className="absolute inset-x-0 bottom-8 grid grid-cols-4 divide-x divide-dashed divide-black/40 bg-[#E32A15] text-center text-white">
                  <div className="px-4 py-5 text-xl font-black uppercase">Shopping Online</div>
                  <div className="px-4 py-5 text-xl font-black uppercase">Thông Minh</div>
                  <div className="px-4 py-5 text-xl font-black uppercase">An Toàn</div>
                  <div className="px-4 py-5 text-xl font-black uppercase">Tiện Lợi</div>
                </div>
              </div>
            </div>

            <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
              <h1 className="text-4xl font-black text-black">{title}</h1>
              <div className="flex items-center gap-3">
                <span className="font-semibold text-black">Sắp xếp:</span>
                <select
                  value={filters.sort}
                  onChange={(event) => updateFilters({ sort: event.target.value })}
                  className="rounded-none border border-black bg-white px-4 py-3 text-[15px] font-medium"
                >
                  <option value="name,asc">Tên: A-Z</option>
                  <option value="name,desc">Tên: Z-A</option>
                  <option value="price,asc">Giá: Thấp đến cao</option>
                  <option value="price,desc">Giá: Cao đến thấp</option>
                </select>
              </div>
            </div>

            {loading ? (
              <LoadingSpinner label="Đang tải sản phẩm..." />
            ) : (
              <>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
                {products.length === 0 && (
                  <div className="rounded-md border border-slate-200 bg-[#f8f8f8] p-10 text-center text-slate-500">
                    Không tìm thấy sản phẩm phù hợp.
                  </div>
                )}
                <Pagination
                  currentPage={filters.page ?? 0}
                  totalPages={totalPages}
                  onPageChange={(page) => updateFilters({ page })}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCatalogPage;
