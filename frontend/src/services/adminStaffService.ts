import api from "./axios";
import type { ApiResponse, PageResponse } from "../types/api";
import type { AdminId, AdminStaff, AdminStaffCreateRequest } from "../types/admin";

export const adminStaffService = {
  async getStaffs(params: { keyword?: string; status?: string; page?: number; size?: number }) {
    const response = await api.get<ApiResponse<PageResponse<AdminStaff>>>("/api/admin/staffs", { params });
    return response.data.data;
  },
  async getStaff(id: AdminId) {
    const response = await api.get<ApiResponse<AdminStaff>>(`/api/admin/staffs/${id}`);
    return response.data.data;
  },
  async createStaff(data: AdminStaffCreateRequest) {
    const response = await api.post<ApiResponse<AdminStaff>>("/api/admin/staffs", data);
    return response.data.data;
  },
  async updateStatus(id: AdminId, status: string) {
    const response = await api.patch<ApiResponse<AdminStaff>>(`/api/admin/staffs/${id}/status`, { status });
    return response.data.data;
  }
};
