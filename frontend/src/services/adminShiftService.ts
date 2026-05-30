import api from "./axios";
import type { ApiResponse } from "../types/api";
import type { AdminId, AdminShift } from "../types/admin";

export const adminShiftService = {
  async getAllShifts() {
    const response = await api.get<ApiResponse<AdminShift[]>>("/api/admin/shifts");
    return response.data.data;
  },
  async getShift(id: AdminId) {
    const response = await api.get<ApiResponse<AdminShift>>(`/api/admin/shifts/${id}`);
    return response.data.data;
  },
  async createShift(data: Omit<AdminShift, "id">) {
    const response = await api.post<ApiResponse<AdminShift>>("/api/admin/shifts", data);
    return response.data.data;
  },
  async updateShift(id: AdminId, data: Omit<AdminShift, "id">) {
    const response = await api.put<ApiResponse<AdminShift>>(`/api/admin/shifts/${id}`, data);
    return response.data.data;
  },
  async deleteShift(id: AdminId) {
    const response = await api.delete<ApiResponse<void>>(`/api/admin/shifts/${id}`);
    return response.data;
  }
};
