import api from "./axios";
import type { ApiResponse, PageResponse } from "../types/api";
import type { AdminId, AdminUserDetail, AdminUserListItem } from "../types/admin";

export const adminUserService = {
  async getUsers(params: { keyword?: string; status?: string; page?: number; size?: number }) {
    const response = await api.get<ApiResponse<PageResponse<AdminUserListItem>>>("/api/admin/users", { params });
    return response.data.data;
  },
  async getUser(id: AdminId) {
    const response = await api.get<ApiResponse<AdminUserDetail>>(`/api/admin/users/${id}`);
    return response.data.data;
  },
  async updateStatus(id: AdminId, status: string) {
    const response = await api.patch<ApiResponse<AdminUserDetail>>(`/api/admin/users/${id}/status`, { status });
    return response.data.data;
  }
};
