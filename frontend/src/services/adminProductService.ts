import api from "./axios";
import type { ApiResponse, PageResponse } from "../types/api";
import type { AdminId, AdminProduct, AdminProductMeta, AdminProductUpsertRequest, UploadResponse } from "../types/admin";

export const adminProductService = {
  async getProducts(params: { keyword?: string; status?: string; brandId?: AdminId; sizeId?: AdminId; page?: number; size?: number; sort?: string }) {
    const response = await api.get<ApiResponse<PageResponse<AdminProduct>>>("/api/admin/products", { params });
    return response.data.data;
  },
  async getAllProductsForExport() {
    const response = await api.get<ApiResponse<PageResponse<AdminProduct>>>("/api/admin/products", { params: { page: 0, size: 10000, sort: "id,desc" } });
    return response.data.data;
  },
  async getProduct(id: AdminId) {
    const response = await api.get<ApiResponse<AdminProduct>>(`/api/admin/products/${id}`);
    return response.data.data;
  },
  async getMeta() {
    const response = await api.get<ApiResponse<AdminProductMeta>>("/api/admin/products/meta");
    return response.data.data;
  },
  async createProduct(payload: AdminProductUpsertRequest) {
    const response = await api.post<ApiResponse<AdminProduct>>("/api/admin/products", payload);
    return response.data.data;
  },
  async updateProduct(id: AdminId, payload: AdminProductUpsertRequest) {
    const response = await api.put<ApiResponse<AdminProduct>>(`/api/admin/products/${id}`, payload);
    return response.data.data;
  },
  async updateStatus(id: AdminId, status: string) {
    const response = await api.patch<ApiResponse<AdminProduct>>(`/api/admin/products/${id}/status`, { status });
    return response.data.data;
  },
  async deleteProduct(id: AdminId) {
    const response = await api.delete<ApiResponse<void>>(`/api/admin/products/${id}`);
    return response.data.data;
  },
  async uploadImage(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post<ApiResponse<UploadResponse>>("/api/admin/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    const data = response.data.data;
    return {
      ...data,
      filePath: data.filePath.startsWith("http") ? data.filePath : `${api.defaults.baseURL}${data.filePath}`
    };
  },
  async createBrand(name: string) {
    const response = await api.post<ApiResponse<{ id: AdminId; name: string }>>("/api/admin/products/brands", { name });
    return response.data.data;
  },
  async createCategory(name: string) {
    const response = await api.post<ApiResponse<{ id: AdminId; name: string }>>("/api/admin/products/categories", { name });
    return response.data.data;
  }
};
