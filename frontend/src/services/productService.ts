import api from "./axios";
import type { ApiResponse, PageResponse } from "../types/api";
import type { Product, ProductFilters } from "../types/product";

const buildProductParams = (filters: ProductFilters) => ({
  page: filters.page,
  size: filters.size,
  sort: filters.sort,
  keyword: filters.keyword || undefined,
  minPrice: filters.minPrice || undefined,
  maxPrice: filters.maxPrice || undefined,
  brandId: filters.brandId || undefined,
  brand: filters.brand || undefined,
  categoryId: filters.categoryId || undefined,
  category: filters.category || undefined
});

export const productService = {
  async getProducts(filters: ProductFilters) {
    const response = await api.get<ApiResponse<PageResponse<Product>>>("/api/products", {
      params: buildProductParams(filters)
    });
    return response.data.data;
  },
  async getProductById(id: number | string) {
    const response = await api.get<ApiResponse<Product>>(`/api/products/${id}`);
    return response.data.data;
  }
};
