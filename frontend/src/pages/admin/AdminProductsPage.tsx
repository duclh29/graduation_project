import { useEffect, useRef, useState, useMemo } from "react";
import { Plus, Trash2, Upload, Download, Printer, Wand2, UploadCloud, Search } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import { PRODUCT_STATUS_BADGES, PRODUCT_STATUS_LABELS, PRODUCT_STATUS_OPTIONS, VARIANT_STATUS_LABELS, VARIANT_STATUS_OPTIONS } from "../../constants/adminStatus";
import { adminProductService } from "../../services/adminProductService";
import { getProductImage } from "../../services/productImages";
import type { AdminId, AdminProduct, AdminProductMeta, AdminProductUpsertRequest, AdminProductVariant } from "../../types/admin";

const removeAccents = (str: string) => {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D");
};

const sanitizeSkuPart = (value: string, fallback: string) => {
  const normalized = removeAccents(value)
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "")
    .trim();
  return normalized || fallback;
};

const emptyVariant = (): AdminProductVariant => ({ sku: "", color: "", size: "", stockQuantity: 0, additionalPrice: 0, imageUrl: "", status: "ACTIVE" });
const emptyForm = (): AdminProductUpsertRequest => ({ name: "", slug: "", brandId: "", categoryId: "", description: "", basePrice: 0, status: "DRAFT", imageUrl: "", variants: [emptyVariant()] });
const getErrorMessage = (error: any, fallback: string) =>
  error?.response?.data?.message
  || error?.message
  || fallback;

const PRODUCTS_PAGE_SIZE = 10;

const AdminProductsPage = () => {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [meta, setMeta] = useState<AdminProductMeta | null>(null);
  const [form, setForm] = useState<AdminProductUpsertRequest>(emptyForm());
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [brandFilter, setBrandFilter] = useState<AdminId | "">("");
  const [sizeFilter, setSizeFilter] = useState<AdminId | "">("");
  const [editingId, setEditingId] = useState<AdminId | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newLookupName, setNewLookupName] = useState("");
  const [bulkUpdate, setBulkUpdate] = useState({ stockQuantity: "", additionalPrice: "", status: "" });
  const [multiSizeInput, setMultiSizeInput] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [tempImages, setTempImages] = useState<string[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [imageTargetSelect, setImageTargetSelect] = useState<string | null>(null);

  const [selectedProductIds, setSelectedProductIds] = useState<AdminId[]>([]);
  const [stockFilter, setStockFilter] = useState<"" | "LOW_STOCK" | "OUT_OF_STOCK">("");

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCreateBrand = async () => {
    try {
      const brand = await adminProductService.createBrand(newLookupName);
      setMeta(prev => prev ? { ...prev, brands: [...prev.brands, brand] } : prev);
      setForm(prev => ({ ...prev, brandId: brand.id }));
      toast.success("Thêm thương hiệu thành công");
      setIsBrandModalOpen(false);
      setNewLookupName("");
    } catch (error: any) {
      toast.error(getErrorMessage(error, "Không thể thêm thương hiệu"));
    }
  };

  const handleCreateCategory = async () => {
    try {
      const cat = await adminProductService.createCategory(newLookupName);
      setMeta(prev => prev ? { ...prev, categories: [...prev.categories, cat] } : prev);
      setForm(prev => ({ ...prev, categoryId: cat.id }));
      toast.success("Thêm danh mục thành công");
      setIsCategoryModalOpen(false);
      setNewLookupName("");
    } catch (error: any) {
      toast.error(getErrorMessage(error, "Không thể thêm danh mục"));
    }
  };

  const fetchData = async ({ resetPage = true }: { resetPage?: boolean } = {}) => {
    try {
      setLoading(true);
      const [productPage, metaData] = await Promise.all([
        adminProductService.getProducts({ 
          keyword: keyword || undefined, 
          status: statusFilter || undefined, 
          brandId: brandFilter || undefined,
          sizeId: sizeFilter || undefined,
          page: 0, 
          size: 100,
          sort: "id,desc"
        }),
        adminProductService.getMeta()
      ]);
      setProducts(productPage.content);
      if (resetPage) setCurrentPage(1);
      setMeta(metaData);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Không thể tải dữ liệu sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchData();
  }, []);

  useEffect(() => {
    const productIdParam = searchParams.get("productId");
    if (!productIdParam) return;
    void handleEdit(productIdParam);
  }, [searchParams]);

  const resetForm = () => {
    setForm(emptyForm());
    setEditingId(null);
    setTempImages([]);
    setImageTargetSelect(null);
    setBulkUpdate({ stockQuantity: "", additionalPrice: "", status: "" });
    setMultiSizeInput("");
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);

  const handleExportExcel = async () => {
    try {
      const data = await adminProductService.getAllProductsForExport();
      const exportData: any[] = [];
      data.content.forEach((product) => {
        if (product.variants && product.variants.length > 0) {
          product.variants.forEach((v) => {
            exportData.push({
              "Mã SP": product.id,
              "Tên sản phẩm": product.name,
              "Thương hiệu": product.brandName || "",
              "Danh mục": product.categoryName || "",
              "Giá gốc": product.basePrice,
              "SKU": v.sku,
              "Màu sắc": v.color,
              "Kích cỡ": v.size,
              "Tồn kho": v.stockQuantity,
              "Giá biến thể": v.price,
              "Trạng thái": v.status === "ACTIVE" ? "Đang bán" : "Ngừng bán"
            });
          });
        } else {
          exportData.push({
            "Mã SP": product.id,
            "Tên sản phẩm": product.name,
            "Thương hiệu": product.brandName || "",
            "Danh mục": product.categoryName || "",
            "Giá gốc": product.basePrice,
            "SKU": "",
            "Màu sắc": "",
            "Kích cỡ": "",
            "Tồn kho": 0,
            "Giá biến thể": product.basePrice,
            "Trạng thái": product.status === "ACTIVE" ? "Đang bán" : "Ngừng bán"
          });
        }
      });
      
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Products");
      XLSX.writeFile(wb, "DanhSachSanPham.xlsx");
      toast.success("Xuất file Excel thành công!");
    } catch {
      toast.error("Lỗi khi xuất file Excel");
    }
  };

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setImporting(true);
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json<any>(ws);
        
        if (!data.length) {
          toast.error("File Excel không có dữ liệu!");
          setImporting(false);
          return;
        }

        const grouped = new Map<string, any[]>();
        data.forEach(row => {
          const name = row["Tên sản phẩm"];
          if (name) {
            if (!grouped.has(name)) grouped.set(name, []);
            grouped.get(name)!.push(row);
          }
        });

        let successCount = 0;
        let failCount = 0;

        for (const [name, rows] of grouped.entries()) {
          try {
            const brandName = rows[0]["Thương hiệu"];
            const catName = rows[0]["Danh mục"];
            
            const brandId = meta?.brands.find(b => b.name.toLowerCase() === brandName?.toLowerCase())?.id || meta?.brands[0]?.id || 0;
            const categoryId = meta?.categories.find(c => c.name.toLowerCase() === catName?.toLowerCase())?.id || meta?.categories[0]?.id || 0;
            
            const payload: AdminProductUpsertRequest = {
              name,
              slug: removeAccents(name).toLowerCase().replace(/ /g, "-") + "-" + Date.now(),
              brandId,
              categoryId,
              description: "",
              basePrice: Number(rows[0]["Giá gốc"] || 0),
              status: "ACTIVE",
              imageUrl: "",
              variants: rows.map(r => ({
                sku: r["SKU"] || "",
                color: r["Màu sắc"] || "",
                size: r["Kích cỡ"] || "",
                stockQuantity: Number(r["Tồn kho"] || 0),
                additionalPrice: Number(r["Giá biến thể"] || 0) - Number(rows[0]["Giá gốc"] || 0),
                imageUrl: "",
                status: "ACTIVE"
              }))
            };
            
            await adminProductService.createProduct(payload);
            successCount++;
          } catch (err) {
            console.error("Lỗi tạo SP:", name, err);
            failCount++;
          }
        }
        
        toast.success(`Import hoàn tất! Thành công: ${successCount}, Thất bại: ${failCount}`);
        fetchData();
      } catch (err) {
        toast.error("Lỗi đọc file Excel");
      } finally {
        setImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.readAsBinaryString(file);
  };

  const applyBulkUpdate = () => {
    setForm(prev => {
      const newVariants = prev.variants.map(v => ({
        ...v,
        stockQuantity: bulkUpdate.stockQuantity !== "" ? Number(bulkUpdate.stockQuantity) : v.stockQuantity,
        additionalPrice: bulkUpdate.additionalPrice !== "" ? Number(bulkUpdate.additionalPrice) : v.additionalPrice,
        status: bulkUpdate.status || v.status
      }));
      return { ...prev, variants: newVariants };
    });
    toast.success("Đã áp dụng cập nhật hàng loạt");
    setBulkUpdate({ stockQuantity: "", additionalPrice: "", status: "" });
  };

  const addVariantsForMultipleSizes = () => {
    const sizes = multiSizeInput
      .split(/[,;\s]+/)
      .map((size) => size.trim())
      .filter(Boolean);

    if (!sizes.length) {
      toast.warn("Vui lòng nhập ít nhất một size");
      return;
    }

    const uniqueSizes = Array.from(new Set(sizes));
    const existingSizes = new Set(form.variants.map((variant) => variant.size.trim()).filter(Boolean));
    const baseVariant = form.variants.find((variant) => variant.color || variant.stockQuantity || variant.additionalPrice || variant.imageUrl) || emptyVariant();
    const variantsToAdd = uniqueSizes
      .filter((size) => !existingSizes.has(size))
      .map((size) => ({
        ...baseVariant,
        id: undefined,
        size,
        status: baseVariant.status || "ACTIVE",
        sku: buildSkuForVariant({ ...baseVariant, size })
      }));

    if (!variantsToAdd.length) {
      toast.info("Các size này đã có trong danh sách biến thể");
      return;
    }

    const shouldReplaceEmptyFirst =
      form.variants.length === 1 &&
      !form.variants[0].sku &&
      !form.variants[0].color &&
      !form.variants[0].size;

    setForm((prev) => ({
      ...prev,
      variants: shouldReplaceEmptyFirst ? variantsToAdd : [...prev.variants, ...variantsToAdd]
    }));
    setMultiSizeInput("");
    toast.success(`Đã thêm ${variantsToAdd.length} biến thể theo size`);
  };

  const displayedProducts = useMemo(() => {
    let result = products;
    if (stockFilter === "LOW_STOCK") result = result.filter(p => p.totalQuantity !== undefined && p.totalQuantity > 0 && p.totalQuantity < 5);
    if (stockFilter === "OUT_OF_STOCK") result = result.filter(p => p.totalQuantity === 0);
    return result;
  }, [products, stockFilter]);

  const handleBulkStatusUpdate = async (newStatus: "ACTIVE" | "INACTIVE") => {
    if (!selectedProductIds.length) return;
    try {
      let successCount = 0;
      for (const id of selectedProductIds) {
        try {
          await adminProductService.updateStatus(id, newStatus);
          successCount++;
        } catch { }
      }
      toast.success(`Đã cập nhật trạng thái ${successCount} sản phẩm`);
      setSelectedProductIds([]);
      fetchData();
    } catch {
      toast.error("Lỗi cập nhật hàng loạt");
    }
  };

  const toggleSelectProduct = (id: AdminId) => {
    setSelectedProductIds(prev => prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    const displayedIds = displayedProducts.map(p => p.id);
    if (selectedProductIds.length === displayedIds.length && displayedIds.length > 0) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(displayedIds);
    }
  };

  const buildSkuForVariant = (variant: AdminProductVariant) => {
    const brand = meta?.brands.find((b) => b.id === form.brandId);
    const brandPrefix = sanitizeSkuPart(brand?.name || "", "SHO").substring(0, 3);
    const words = removeAccents(form.name).split(" ").filter(Boolean);
    const namePrefix = sanitizeSkuPart(words.map((word) => word[0]).join(""), "PRD").substring(0, 4);
    const colorPrefix = sanitizeSkuPart(variant.color || "", "XXX").substring(0, 3);
    const sizeSuffix = sanitizeSkuPart(variant.size || "", "00");

    return `${brandPrefix}-${namePrefix}-${colorPrefix}-${sizeSuffix}`;
  };

  const generateAllSKUs = () => {
    if (!form.name || !form.brandId) {
      toast.warn("Vui lòng nhập Tên sản phẩm và chọn Thương hiệu trước khi sinh SKU!");
      return;
    }
    setForm(prev => ({
      ...prev,
      variants: prev.variants.map(variant => ({
        ...variant,
        sku: buildSkuForVariant(variant)
      }))
    }));
    toast.success("Đã sinh mã SKU cho tất cả biến thể!");
  };

  const generateSKU = (index: number) => {
    if (!form.name || !form.brandId) {
      toast.warn("Vui lòng nhập Tên sản phẩm và chọn Thương hiệu!");
      return;
    }
    const variant = form.variants[index];
    handleVariantChange(index, "sku", buildSkuForVariant(variant));
  };

  const handlePrintBarcode = (variant: AdminProductVariant) => {
    if (!variant.sku) {
      toast.error("Biến thể chưa có SKU để in mã vạch");
      return;
    }
    const win = window.open("", "_blank");
    if (!win) return;
    const finalPrice = (form.basePrice + (variant.additionalPrice || 0)).toLocaleString("vi-VN") + " đ";
    win.document.write(`
      <html>
        <head>
          <title>In tem - ${variant.sku}</title>
          <style>
            body { font-family: monospace; text-align: center; padding: 20px; }
            .label { border: 2px dashed #ccc; padding: 10px; display: inline-block; width: 220px; }
            img { max-width: 100%; height: auto; }
            h4 { margin: 5px 0 0 0; font-size: 14px; text-transform: uppercase; }
            p { margin: 2px 0; font-size: 12px; color: #333; }
            .price { font-weight: bold; font-size: 16px; margin-top: 5px; }
          </style>
        </head>
        <body>
          <div class="label">
            <h4>${form.name}</h4>
            <p>${variant.color} - Size ${variant.size}</p>
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(variant.sku)}" alt="QR Code" onload="window.print(); window.close();" />
            <p>SKU: ${variant.sku}</p>
            <p class="price">${finalPrice}</p>
          </div>
        </body>
      </html>
    `);
    win.document.close();
  };

  const handleEdit = async (id: AdminId) => {
    try {
      const product = await adminProductService.getProduct(id);
      setEditingId(id);
      setSearchParams({ productId: String(id) });
      setForm({
        name: product.name,
        slug: product.slug,
        brandId: product.brandId,
        categoryId: product.categoryId,
        description: product.description || "",
        basePrice: product.basePrice,
        status: product.status,
        imageUrl: product.imageUrl || "",
        variants: product.variants.map((variant) => ({
          id: variant.id,
          sku: variant.sku,
          color: variant.color,
          size: variant.size,
          stockQuantity: variant.stockQuantity,
          additionalPrice: variant.additionalPrice,
          imageUrl: variant.imageUrl,
          status: variant.status
        }))
      });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Không thể tải chi tiết sản phẩm");
    }
  };

  const handleVariantChange = (index: number, field: keyof AdminProductVariant, value: string | number) => {
    setForm((prev) => ({
      ...prev,
      variants: prev.variants.map((variant, idx) => {
        if (idx !== index) return variant;

        const nextVariant = { ...variant, [field]: value };
        if (field === "color" || field === "size") {
          const currentAutoSku = buildSkuForVariant(variant);
          if (!variant.sku.trim() || variant.sku === currentAutoSku) {
            return { ...nextVariant, sku: buildSkuForVariant(nextVariant) };
          }
        }

        return nextVariant;
      })
    }));
  };

  const removeVariant = (index: number) => {
    setForm((prev) => {
      const next = prev.variants.filter((_, idx) => idx !== index);
      return { ...prev, variants: next.length > 0 ? next : [emptyVariant()] };
    });
  };

  const handleImageUpload = async (index: number | 'main' | 'collection', file?: File | null) => {
    if (!file) return;
    try {
      const uploaded = await adminProductService.uploadImage(file);
      if (!uploaded?.filePath) throw new Error("Upload failed");
      
      if (index === 'main') {
        setForm((prev) => ({ ...prev, imageUrl: uploaded.filePath }));
      } else if (index === 'collection') {
        setTempImages((prev) => [...prev, uploaded.filePath]);
      } else {
        handleVariantChange(index as number, "imageUrl", uploaded.filePath);
      }
      toast.success("Tải ảnh thành công");
    } catch (error: any) {
      toast.error(getErrorMessage(error, "Không thể tải ảnh lên"));
    }
  };

  const handleDropImages = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    if (!files.length) return;
    
    toast.info(`Đang tải lên ${files.length} ảnh...`);
    let successCount = 0;
    for (const file of files) {
      try {
        const uploaded = await adminProductService.uploadImage(file);
        if (uploaded?.filePath) {
          setTempImages((prev) => [...prev, uploaded.filePath]);
          successCount++;
        }
      } catch (err) {
        console.error(err);
      }
    }
    toast.success(`Đã tải lên ${successCount}/${files.length} ảnh`);
  };

  const assignImageToTarget = (url: string, target: 'main' | number) => {
    if (target === 'main') {
      setForm(prev => ({ ...prev, imageUrl: prev.imageUrl ? `${prev.imageUrl},${url}` : url }));
    } else {
      handleVariantChange(target, "imageUrl", url);
    }
    setImageTargetSelect(null);
    toast.success("Đã gán ảnh thành công!");
  };

  const validateForm = () => {
    if (!form.name.trim()) return "Vui lòng nhập tên sản phẩm";
    if (!form.slug.trim()) return "Vui lòng nhập slug sản phẩm";
    if (!form.brandId) return "Vui lòng chọn thương hiệu";
    if (!form.categoryId) return "Vui lòng chọn danh mục";
    if (form.basePrice < 0) return "Giá gốc phải lớn hơn hoặc bằng 0";
    if (!form.variants.length) return "Vui lòng thêm ít nhất 1 biến thể";

    for (let index = 0; index < form.variants.length; index += 1) {
      const variant = form.variants[index];
      const position = index + 1;
      if (!variant.sku.trim()) return `Vui lòng nhập SKU cho biến thể ${position}`;
      if (!variant.color.trim()) return `Vui lòng nhập màu sắc cho biến thể ${position}`;
      if (!variant.size.trim()) return `Vui lòng nhập kích cỡ cho biến thể ${position}`;
      if (variant.stockQuantity < 0) return `Tồn kho của biến thể ${position} phải lớn hơn hoặc bằng 0`;
      if (variant.additionalPrice < 0) return `Giá cộng thêm của biến thể ${position} phải lớn hơn hoặc bằng 0`;
    }

    const normalizedSkus = form.variants.map((variant) => variant.sku.trim().toLowerCase());
    if (new Set(normalizedSkus).size !== normalizedSkus.length) {
      return "SKU biến thể không được trùng nhau";
    }

    return null;
  };



  const handleSubmit = async () => {
    const validationMessage = validateForm();
    if (validationMessage) {
      toast.error(validationMessage);
      return;
    }

    try {
      setSaving(true);
      const payload: AdminProductUpsertRequest = {
        ...form,
        name: form.name.trim(),
        slug: form.slug.trim(),
        description: form.description?.trim() || "",
        variants: form.variants.map((variant) => ({
          ...variant,
          sku: variant.sku.trim(),
          color: variant.color.trim(),
          size: variant.size.trim(),
          imageUrl: variant.imageUrl?.trim() || ""
        }))
      };

      if (editingId) {
        const updated = await adminProductService.updateProduct(editingId, payload);
        if (!updated?.id) {
          throw new Error("Hệ thống chưa trả về dữ liệu sản phẩm sau khi cập nhật");
        }
        setProducts((prev) => prev.map((product) => product.id === updated.id ? updated : product));
        setForm({
          name: updated.name,
          slug: updated.slug,
          brandId: updated.brandId,
          categoryId: updated.categoryId,
          description: updated.description || "",
          basePrice: updated.basePrice,
          status: updated.status,
          imageUrl: updated.imageUrl || "",
          variants: updated.variants.map((variant) => ({
            id: variant.id,
            sku: variant.sku,
            color: variant.color,
            size: variant.size,
            stockQuantity: variant.stockQuantity,
            additionalPrice: variant.additionalPrice,
            imageUrl: variant.imageUrl,
            status: variant.status
          }))
        });
        toast.success("Cập nhật sản phẩm thành công");
      } else {
        const created = await adminProductService.createProduct(payload);
        if (!created?.id) {
          throw new Error("Hệ thống chưa trả về dữ liệu sản phẩm sau khi tạo");
        }
        toast.success("Tạo sản phẩm thành công");
        resetForm();
        await fetchData();
      }
    } catch (error: any) {
      toast.error(getErrorMessage(error, editingId ? "Cập nhật sản phẩm thất bại" : "Tạo sản phẩm thất bại"));
    } finally {
      setSaving(false);
    }
  };

  const handleSoftDelete = async (product: AdminProduct) => {
    try {
      await adminProductService.updateStatus(product.id, "INACTIVE");
      toast.success("Đã ẩn sản phẩm");
      void fetchData();
    } catch (error: any) {
      toast.error(getErrorMessage(error, "Không thể cập nhật trạng thái sản phẩm"));
    }
  };

  const handleDeleteProduct = async (product: AdminProduct) => {
    const confirmed = window.confirm(`Xóa vĩnh viễn sản phẩm "${product.name}"? Hành động này không thể hoàn tác.`);
    if (!confirmed) return;

    try {
      await adminProductService.deleteProduct(product.id);
      setProducts((prev) => {
        const next = prev.filter((item) => item.id !== product.id);
        setCurrentPage((page) => Math.min(page, Math.max(1, Math.ceil(next.length / PRODUCTS_PAGE_SIZE))));
        return next;
      });
      setSelectedProductIds((prev) => prev.filter((id) => id !== product.id));
      if (editingId === product.id) {
        resetForm();
      }
      toast.success("Đã xóa sản phẩm");
    } catch (error: any) {
      toast.error(getErrorMessage(error, "Không thể xóa sản phẩm"));
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1.2fr,1fr]">
      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Quản lý sản phẩm</h2>
            <p className="text-sm text-slate-500">Bảng điều khiển có thể mở nhanh chế độ sửa từ top sản phẩm bán chạy.</p>
          </div>
          <div className="flex gap-2">
            <div className="flex flex-wrap items-center gap-2">
              {selectedProductIds.length > 0 && (
                <div className="flex items-center gap-2 mr-4 animate-fade-in border-r border-slate-200 pr-4">
                  <span className="text-xs font-semibold text-slate-500">Đã chọn: {selectedProductIds.length}</span>
                  <button onClick={() => handleBulkStatusUpdate("ACTIVE")} className="rounded-lg bg-green-50 px-3 py-2 text-xs font-bold text-green-700 hover:bg-green-100">Mở bán</button>
                  <button onClick={() => handleBulkStatusUpdate("INACTIVE")} className="rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-100">Khóa (Ngừng bán)</button>
                </div>
              )}
              <button onClick={handleExportExcel} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"><Download size={16} /> Tải Excel</button>
              <input type="file" ref={fileInputRef} accept=".xlsx,.xls" onChange={handleImportExcel} className="hidden" />
              <button disabled={importing} onClick={() => fileInputRef.current?.click()} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"><UploadCloud size={16} /> {importing ? "Đang nhập..." : "Nhập Excel"}</button>
            </div>
          </div>
        </div>

        <div className="space-y-3 rounded-xl bg-slate-50/50 p-4 border border-slate-100">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <Search className="text-slate-400" size={18} />
              </div>
              <input 
                value={keyword} 
                onChange={(e) => setKeyword(e.target.value)} 
                onKeyDown={(e) => e.key === 'Enter' && fetchData()} 
                placeholder="Tìm kiếm tên sản phẩm, mã SKU..." 
                className="block w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none focus:border-[#E32A15] focus:ring-1 focus:ring-[#E32A15]/20 shadow-sm transition-shadow" 
              />
            </div>
            <button onClick={() => void fetchData()} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-[#E32A15] bg-[#E32A15] px-8 py-3 text-sm font-bold text-white hover:bg-[#c92512] hover:shadow-md transition-all">
              <Search size={16} /> Lọc dữ liệu
            </button>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <select value={brandFilter} onChange={(e) => setBrandFilter(e.target.value || "")} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#E32A15] focus:ring-1 focus:ring-[#E32A15]/20 shadow-sm transition-shadow cursor-pointer">
              <option value="">Thương hiệu</option>
              {meta?.brands.map((brand) => <option key={brand.id} value={brand.id}>{brand.name}</option>)}
            </select>
            <select value={sizeFilter} onChange={(e) => setSizeFilter(e.target.value || "")} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#E32A15] focus:ring-1 focus:ring-[#E32A15]/20 shadow-sm transition-shadow cursor-pointer">
              <option value="">Kích cỡ</option>
              {meta?.sizes.map((size) => <option key={size.id} value={size.id}>{size.name}</option>)}
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#E32A15] focus:ring-1 focus:ring-[#E32A15]/20 shadow-sm transition-shadow cursor-pointer">
              <option value="">Trạng thái</option>
              {PRODUCT_STATUS_OPTIONS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
            <select value={stockFilter} onChange={(e) => setStockFilter(e.target.value as any)} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#E32A15] focus:ring-1 focus:ring-[#E32A15]/20 shadow-sm transition-shadow cursor-pointer">
              <option value="">Tồn kho: Tất cả</option>
              <option value="LOW_STOCK">Sắp hết hàng (&lt;5)</option>
              <option value="OUT_OF_STOCK">Tạm hết hàng (=0)</option>
            </select>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-slate-600">
              <tr>
                <th className="px-4 py-3 text-center w-10">
                  <input type="checkbox" checked={displayedProducts.length > 0 && selectedProductIds.length === displayedProducts.length} onChange={toggleSelectAll} className="rounded border-slate-300 text-[#E32A15] focus:ring-[#E32A15]" />
                </th>
                <th className="px-4 py-3">Sản phẩm</th>
                <th className="px-4 py-3">Giá gốc</th>
                <th className="px-4 py-3">Tồn kho</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-8 text-slate-500 text-center">Đang tải sản phẩm...</td></tr>
              ) : displayedProducts.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-slate-500 text-center">Chưa có sản phẩm.</td></tr>
              ) : displayedProducts.slice((currentPage - 1) * PRODUCTS_PAGE_SIZE, currentPage * PRODUCTS_PAGE_SIZE).map((product, index) => (
                <tr key={product.id} className={`transition hover:bg-slate-50 ${selectedProductIds.includes(product.id) ? "bg-[#E32A15]/5" : (editingId === product.id ? "bg-slate-50" : "")}`}>
                  <td className="px-4 py-4 text-center">
                    <input type="checkbox" checked={selectedProductIds.includes(product.id)} onChange={() => toggleSelectProduct(product.id)} className="rounded border-slate-300 text-[#E32A15] focus:ring-[#E32A15]" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={getProductImage(product.id, product.imageUrl, product.variants?.[0]?.imageUrl)}
                        alt={product.name}
                        className="h-14 w-14 rounded-xl object-cover ring-1 ring-slate-200"
                      />
                      <div className="min-w-0">
                        <div className="truncate font-semibold text-slate-900">{product.name}</div>
                        <div className="text-xs text-slate-500">{product.slug} | {product.brandName} | {product.categoryName}</div>
                        <div className="mt-1 text-xs text-slate-400">{product.variants?.length || 0} biến thể</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">{product.basePrice.toLocaleString("vi-VN")} đ</td>
                  <td className="px-4 py-3">{product.totalQuantity || 0}</td>
                  <td className="px-4 py-3">
                    {product.totalQuantity === 0 ? (
                      <span className="rounded-full px-2.5 py-1 text-xs font-semibold bg-rose-100 text-rose-700">Tạm hết hàng</span>
                    ) : (
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${PRODUCT_STATUS_BADGES[product.status] || "bg-slate-100 text-slate-700"}`}>
                        {PRODUCT_STATUS_LABELS[product.status] || product.status}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => void handleEdit(product.id)} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">Sửa</button>
                      <button onClick={() => void handleSoftDelete(product)} className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50">Ẩn</button>
                      <button onClick={() => void handleDeleteProduct(product)} className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700">Xóa</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && products.length > PRODUCTS_PAGE_SIZE && (
          <div className="flex items-center justify-between border-t border-slate-200 pt-4">
            <p className="text-sm text-slate-500">
              Hiển thị <span className="font-semibold text-slate-700">{(currentPage - 1) * PRODUCTS_PAGE_SIZE + 1}</span>–<span className="font-semibold text-slate-700">{Math.min(currentPage * PRODUCTS_PAGE_SIZE, products.length)}</span> trong <span className="font-semibold text-slate-700">{products.length}</span> sản phẩm
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                ← Trước
              </button>
              {Array.from({ length: Math.ceil(products.length / PRODUCTS_PAGE_SIZE) }, (_, i) => i + 1)
                .filter((page) => page === 1 || page === Math.ceil(products.length / PRODUCTS_PAGE_SIZE) || Math.abs(page - currentPage) <= 2)
                .reduce<(number | "...")[]>((acc, page, idx, arr) => {
                  if (idx > 0 && typeof arr[idx - 1] === "number" && (page as number) - (arr[idx - 1] as number) > 1) acc.push("...");
                  acc.push(page);
                  return acc;
                }, [])
                .map((page, idx) =>
                  page === "..." ? (
                    <span key={`ellipsis-${idx}`} className="px-2 text-slate-400">…</span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page as number)}
                      className={`min-w-[36px] rounded-lg border px-3 py-2 text-sm font-semibold ${
                        currentPage === page
                          ? "border-[#E32A15] bg-[#E32A15] text-white"
                          : "border-slate-200 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}
              <button
                onClick={() => setCurrentPage((p) => Math.min(Math.ceil(products.length / PRODUCTS_PAGE_SIZE), p + 1))}
                disabled={currentPage === Math.ceil(products.length / PRODUCTS_PAGE_SIZE)}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Sau →
              </button>
            </div>
          </div>
        )}
      </section>

      <aside className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-900">{editingId ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm"}</h3>
          <button onClick={resetForm} type="button" className="inline-flex items-center gap-1.5 rounded-lg border border-[#E32A15] px-3 py-1.5 text-xs font-semibold text-[#E32A15] hover:bg-[#E32A15] hover:text-white transition">
            <Plus size={14} /> Thêm sản phẩm mới
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">Tên sản phẩm <span className="text-[#E32A15]">*</span></label>
            <input value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} placeholder="VD: Giày Thể Thao Nam Nike Air Force 1" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[#E32A15] focus:ring-1 focus:ring-[#E32A15]/20" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">Đường dẫn (Slug) <span className="text-[#E32A15]">*</span></label>
            <input value={form.slug} onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))} placeholder="VD: nike-air-force-1 (viết liền không dấu)" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[#E32A15] focus:ring-1 focus:ring-[#E32A15]/20" />
          </div>
          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-700">Thương hiệu <span className="text-[#E32A15]">*</span></label>
              <button type="button" onClick={() => setIsBrandModalOpen(true)} className="text-[10px] font-bold text-[#E32A15] hover:underline">+ Thêm mới</button>
            </div>
            <select value={form.brandId} onChange={(e) => setForm((prev) => ({ ...prev, brandId: e.target.value }))} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[#E32A15] focus:ring-1 focus:ring-[#E32A15]/20">
              <option value="">-- Vui lòng chọn thương hiệu --</option>
              {meta?.brands.map((brand) => <option key={brand.id} value={brand.id}>{brand.name}</option>)}
            </select>
          </div>
          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-700">Danh mục <span className="text-[#E32A15]">*</span></label>
              <button type="button" onClick={() => setIsCategoryModalOpen(true)} className="text-[10px] font-bold text-[#E32A15] hover:underline">+ Thêm mới</button>
            </div>
            <select value={form.categoryId} onChange={(e) => setForm((prev) => ({ ...prev, categoryId: e.target.value }))} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[#E32A15] focus:ring-1 focus:ring-[#E32A15]/20">
              <option value="">-- Vui lòng chọn danh mục --</option>
              {meta?.categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">Giá gốc chung (VND) <span className="text-[#E32A15]">*</span></label>
            <input type="number" value={form.basePrice} onChange={(e) => setForm((prev) => ({ ...prev, basePrice: Number(e.target.value) }))} placeholder="VD: 1500000" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[#E32A15] focus:ring-1 focus:ring-[#E32A15]/20" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">Trạng thái sản phẩm <span className="text-[#E32A15]">*</span></label>
            <select value={form.status} onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[#E32A15] focus:ring-1 focus:ring-[#E32A15]/20">
              {PRODUCT_STATUS_OPTIONS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700">Mô tả sản phẩm</label>
          <textarea value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} placeholder="Nhập mô tả chi tiết về chất liệu, kiểu dáng, ưu điểm nổi bật..." rows={3} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[#E32A15] focus:ring-1 focus:ring-[#E32A15]/20" />
        </div>

        {/* DRAG AND DROP COLLECTION */}
        <div className="space-y-3">
          <h4 className="font-semibold text-slate-900">Bộ sưu tập ảnh (Drag & Drop)</h4>
          <div 
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDropImages}
            className={`flex min-h-[100px] flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors ${dragOver ? "border-[#E32A15] bg-[#E32A15]/5" : "border-slate-300 bg-slate-50"} p-4`}
          >
            <UploadCloud size={24} className={dragOver ? "text-[#E32A15]" : "text-slate-400"} />
            <p className="mt-2 text-xs font-semibold text-slate-600">Kéo thả ảnh vào đây để tải lên kho lưu trữ tạm</p>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-[10px] text-slate-400">hoặc</span>
              <label className="cursor-pointer text-[10px] font-bold text-[#E32A15] hover:underline">
                chọn file
                <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => {
                  Array.from(e.target.files || []).forEach(f => handleImageUpload('collection', f));
                }} />
              </label>
            </div>
          </div>
          
          {tempImages.length > 0 && (
            <div className="flex flex-wrap gap-3 rounded-xl border border-slate-200 bg-white p-3">
              {tempImages.map((url, idx) => (
                <div key={idx} className="relative group">
                  <img src={url} alt="temp" className="h-16 w-16 cursor-pointer rounded-lg object-cover ring-1 ring-slate-200 hover:ring-[#E32A15] transition" onClick={() => setImageTargetSelect(url === imageTargetSelect ? null : url)} />
                  <button type="button" onClick={() => setTempImages(prev => prev.filter((_, i) => i !== idx))} className="absolute -right-2 -top-2 hidden h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600 group-hover:flex shadow-sm"><Trash2 size={10} /></button>
                  
                  {imageTargetSelect === url && (
                    <div className="absolute left-0 top-full z-10 mt-1 w-48 rounded-lg border border-slate-200 bg-white p-1 shadow-xl">
                      <div className="mb-1 px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Gán ảnh này cho:</div>
                      <button type="button" onClick={() => assignImageToTarget(url, 'main')} className="w-full rounded px-2 py-1.5 text-left text-xs font-medium text-slate-700 hover:bg-[#E32A15]/10 hover:text-[#E32A15]">Ảnh đại diện SP</button>
                      {form.variants.map((v, vi) => (
                        <button key={vi} type="button" onClick={() => assignImageToTarget(url, vi)} className="w-full rounded px-2 py-1.5 text-left text-xs font-medium text-slate-700 hover:bg-[#E32A15]/10 hover:text-[#E32A15]">
                          Biến thể: {v.color || "Trống"} - {v.size || "Trống"}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label className="block text-xs font-semibold text-slate-700">Ảnh sản phẩm (Có thể chọn nhiều ảnh cùng lúc)</label>
          <div className="flex flex-wrap gap-3">
             {form.imageUrl?.split(",").filter(Boolean).map((img, i) => (
                <div key={i} className="relative group">
                   <img src={img} alt="product" className="h-20 w-20 rounded-xl object-cover ring-1 ring-slate-200" />
                   <button type="button" onClick={() => setForm(p => ({ ...p, imageUrl: p.imageUrl?.split(",").filter((_, idx) => idx !== i).join(",") }))} className="absolute -right-2 -top-2 hidden h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600 group-hover:flex shadow-sm"><Trash2 size={12} /></button>
                </div>
             ))}
             <div className="flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-slate-300 hover:bg-slate-50 transition cursor-pointer relative bg-slate-50/50">
               <Upload size={18} className="text-[#E32A15]" />
               <span className="text-[10px] font-semibold text-slate-500 text-center px-1">Tải ảnh lên</span>
               <input type="file" multiple accept="image/*" onChange={async (e) => {
                  const files = Array.from(e.target.files || []);
                  if (!files.length) return;
                  toast.info(`Đang tải lên ${files.length} ảnh...`);
                  let newUrls: string[] = [];
                  for (const f of files) {
                    try {
                      const res = await adminProductService.uploadImage(f);
                      if (res?.filePath) newUrls.push(res.filePath);
                    } catch (error) {
                      console.error("Upload error:", error);
                    }
                  }
                  if (newUrls.length > 0) {
                     setForm(p => ({ ...p, imageUrl: p.imageUrl ? `${p.imageUrl},${newUrls.join(",")}` : newUrls.join(",") }));
                     toast.success(`Tải thành công ${newUrls.length} ảnh`);
                  }
               }} className="absolute inset-0 opacity-0 w-full cursor-pointer" />
             </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h4 className="font-semibold text-slate-900">Biến thể</h4>
            </div>
            <button type="button" onClick={() => setForm((prev) => {
              const lastVariant = prev.variants.length > 0 ? prev.variants[prev.variants.length - 1] : emptyVariant();
              const newVariant = {
                ...lastVariant,
                id: undefined,
                size: "",
              };
              newVariant.sku = buildSkuForVariant(newVariant);
              return { ...prev, variants: [...prev.variants, newVariant] };
            })} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"><Plus size={14} /> Thêm biến thể</button>
          </div>
          
          {form.variants.length > 1 && (
            <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-dashed border-[#E32A15] bg-[#E32A15]/5 p-4">
              <span className="text-sm font-semibold text-[#E32A15]">Sửa hàng loạt:</span>
              <input type="number" placeholder="Tồn kho" value={bulkUpdate.stockQuantity} onChange={e => setBulkUpdate(p => ({...p, stockQuantity: e.target.value}))} className="w-24 rounded-lg border border-slate-300 p-2 text-sm outline-none" />
              <input type="number" placeholder="Giá cộng" value={bulkUpdate.additionalPrice} onChange={e => setBulkUpdate(p => ({...p, additionalPrice: e.target.value}))} className="w-28 rounded-lg border border-slate-300 p-2 text-sm outline-none" />
              <select value={bulkUpdate.status} onChange={e => setBulkUpdate(p => ({...p, status: e.target.value}))} className="w-32 rounded-lg border border-slate-300 p-2 text-sm outline-none">
                <option value="">Trạng thái</option>
                {VARIANT_STATUS_OPTIONS.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}
              </select>
              <button type="button" onClick={applyBulkUpdate} className="rounded-lg bg-[#E32A15] px-3 py-2 text-sm font-bold text-white hover:bg-[#247dad]">Áp dụng</button>
            </div>
          )}

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-end">
              <div className="flex-1">
                <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-500">Thêm nhiều size cho sản phẩm</label>
                <input
                  value={multiSizeInput}
                  onChange={(e) => setMultiSizeInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addVariantsForMultipleSizes();
                    }
                  }}
                  placeholder="VD: 38, 39, 40, 41, 42"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#E32A15]"
                />
                <p className="mt-1 text-xs text-slate-500">Hệ thống sẽ tạo mỗi size thành một biến thể. Màu, tồn kho, giá cộng và ảnh sẽ sao chép từ biến thể mẫu hiện có.</p>
              </div>
              <button type="button" onClick={addVariantsForMultipleSizes} className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-[#E32A15]">
                <Plus size={16} /> Thêm size
              </button>
            </div>
          </div>

          {form.variants.map((variant, index) => (
            <div key={index} className="space-y-3 rounded-xl border border-slate-200 p-4 relative group">
              <div className="absolute right-2 top-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button type="button" onClick={() => handlePrintBarcode(variant)} className="rounded-md p-1.5 text-slate-400 hover:bg-[#E32A15]/10 hover:text-[#E32A15]" title="In mã vạch (QR)">
                  <Printer size={16} />
                </button>
                {form.variants.length > 1 && (
                  <button type="button" onClick={() => setForm(prev => ({ ...prev, variants: prev.variants.filter((_, i) => i !== index) }))} className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600" title="Xóa biến thể">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
              <div className="grid gap-4 pr-16 md:grid-cols-2 lg:grid-cols-3">
                <div>
                  <div className="mb-1">
                    <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Mã SKU <span className="text-[#E32A15]">*</span></label>
                  </div>
                  <input value={variant.sku || ""} onChange={(e) => handleVariantChange(index, "sku", e.target.value)} placeholder="VD: NKE-AF1-WHT-42" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#E32A15]" />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Màu sắc <span className="text-[#E32A15]">*</span></label>
                  <input value={variant.color || ""} onChange={(e) => handleVariantChange(index, "color", e.target.value)} placeholder="VD: Trắng" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#E32A15]" />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Kích cỡ (Size) <span className="text-[#E32A15]">*</span></label>
                  <input value={variant.size || ""} onChange={(e) => handleVariantChange(index, "size", e.target.value)} placeholder="VD: 42" list={`sizes-${index}`} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#E32A15]" />
                  <datalist id={`sizes-${index}`}>{meta?.sizes.map((size) => <option key={size.id} value={size.name} />)}</datalist>
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Tồn kho <span className="text-[#E32A15]">*</span></label>
                  <input type="number" value={variant.stockQuantity || 0} onChange={(e) => handleVariantChange(index, "stockQuantity", Number(e.target.value))} placeholder="VD: 50" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#E32A15]" />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Giá cộng thêm (VND)</label>
                  <input type="number" value={variant.additionalPrice || 0} onChange={(e) => handleVariantChange(index, "additionalPrice", Number(e.target.value))} placeholder="VD: 50000 (Mặc định 0)" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#E32A15]" />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Trạng thái</label>
                  <select value={variant.status || "ACTIVE"} onChange={(e) => handleVariantChange(index, "status", e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#E32A15]">
                    {VARIANT_STATUS_OPTIONS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex flex-col gap-2 md:flex-row md:items-end">
                <div className="flex-1">
                  <label className="mb-1 block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Đường dẫn ảnh (URL)</label>
                  <input value={variant.imageUrl || ""} onChange={(e) => handleVariantChange(index, "imageUrl", e.target.value)} placeholder="Nhập link ảnh hoặc tải lên file bên cạnh" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#E32A15]" />
                </div>
                <div className="flex w-full md:w-auto items-center gap-2 rounded-xl border border-dashed border-slate-300 px-3 py-1.5 hover:bg-slate-50 transition cursor-pointer relative">
                  <Upload size={16} className="text-[#E32A15]" />
                  <span className="text-xs font-semibold text-slate-600 whitespace-nowrap">Tải ảnh lên</span>
                  <input type="file" accept="image/*" onChange={(e) => void handleImageUpload(index, e.target.files?.[0])} className="absolute inset-0 opacity-0 w-full cursor-pointer" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">{VARIANT_STATUS_LABELS[variant.status] || variant.status}</span>
                <button type="button" onClick={() => removeVariant(index)} className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50">
                  <Trash2 size={14} /> Xóa biến thể
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button disabled={saving} onClick={() => void handleSubmit()} className="rounded-xl bg-[#E32A15] px-5 py-3 text-sm font-semibold text-white hover:bg-[#247dad] disabled:opacity-60">{saving ? "Đang lưu..." : editingId ? "Cập nhật" : "Tạo sản phẩm"}</button>
          <button onClick={resetForm} className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">Làm mới form</button>
        </div>
      </aside>

      {/* MODAL THÊM THƯƠNG HIỆU */}
      {isBrandModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="mb-4 text-lg font-bold text-slate-900">Thêm thương hiệu mới</h3>
            <input
              type="text"
              autoFocus
              value={newLookupName}
              onChange={(e) => setNewLookupName(e.target.value)}
              placeholder="Nhập tên thương hiệu (VD: Nike, Adidas...)"
              className="mb-6 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#E32A15] focus:ring-1 focus:ring-[#E32A15]/20"
            />
            <div className="flex justify-end gap-3">
              <button onClick={() => { setIsBrandModalOpen(false); setNewLookupName(""); }} className="rounded-xl px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition">Hủy bỏ</button>
              <button onClick={() => void handleCreateBrand()} disabled={!newLookupName.trim()} className="rounded-xl bg-[#E32A15] px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50 transition">Lưu thương hiệu</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL THÊM DANH MỤC */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="mb-4 text-lg font-bold text-slate-900">Thêm danh mục mới</h3>
            <input
              type="text"
              autoFocus
              value={newLookupName}
              onChange={(e) => setNewLookupName(e.target.value)}
              placeholder="Nhập tên danh mục (VD: Giày thể thao, Sandals...)"
              className="mb-6 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#E32A15] focus:ring-1 focus:ring-[#E32A15]/20"
            />
            <div className="flex justify-end gap-3">
              <button onClick={() => { setIsCategoryModalOpen(false); setNewLookupName(""); }} className="rounded-xl px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition">Hủy bỏ</button>
              <button onClick={() => void handleCreateCategory()} disabled={!newLookupName.trim()} className="rounded-xl bg-[#E32A15] px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50 transition">Lưu danh mục</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminProductsPage;
