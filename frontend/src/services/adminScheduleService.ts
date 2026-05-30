import api from "./axios";
import type { ApiResponse } from "../types/api";
import type { AdminId, AdminOpenShift, AdminSchedule, AdminScheduleSwapRequest } from "../types/admin";

export const adminScheduleService = {
  async getSchedules(startDate: string, endDate: string) {
    const response = await api.get<ApiResponse<AdminSchedule[]>>("/api/admin/schedules", {
      params: { startDate, endDate }
    });
    return response.data.data;
  },
  async assignSchedule(data: { userId: AdminId; shiftId: AdminId; workDate: string; note?: string }) {
    const response = await api.post<ApiResponse<AdminSchedule>>("/api/admin/schedules", data);
    return response.data.data;
  },
  async copyWeek(data: { sourceStartDate: string; targetStartDate: string }) {
    const response = await api.post<ApiResponse<AdminSchedule[]>>("/api/admin/schedules/copy-week", data);
    return response.data.data;
  },
  async autoFillWeek(weekStartDate: string) {
    const response = await api.post<ApiResponse<AdminSchedule[]>>("/api/admin/schedules/auto-fill-week", { weekStartDate });
    return response.data.data;
  },
  async publishSchedules(startDate: string, endDate: string) {
    const response = await api.post<ApiResponse<AdminSchedule[]>>("/api/admin/schedules/publish", {
      startDate,
      endDate
    });
    return response.data.data;
  },
  async lockSchedules(startDate: string, endDate: string) {
    const response = await api.post<ApiResponse<AdminSchedule[]>>("/api/admin/schedules/lock", {
      startDate,
      endDate
    });
    return response.data.data;
  },
  async updateAttendance(id: AdminId, data: { status: string; checkInAt?: string; checkOutAt?: string; note?: string }) {
    const response = await api.patch<ApiResponse<AdminSchedule>>(`/api/admin/schedules/${id}/status`, data);
    return response.data.data;
  },
  async getOpenShifts(startDate: string, endDate: string) {
    const response = await api.get<ApiResponse<AdminOpenShift[]>>("/api/admin/schedules/open-shifts", {
      params: { startDate, endDate }
    });
    return response.data.data;
  },
  async createOpenShift(data: { shiftId: AdminId; workDate: string; note?: string }) {
    const response = await api.post<ApiResponse<AdminOpenShift>>("/api/admin/schedules/open-shifts", data);
    return response.data.data;
  },
  async assignOpenShift(id: AdminId, data: { userId: AdminId; note?: string }) {
    const response = await api.post<ApiResponse<AdminOpenShift>>(`/api/admin/schedules/open-shifts/${id}/assign`, data);
    return response.data.data;
  },
  async getSwapRequests(status?: string) {
    const response = await api.get<ApiResponse<AdminScheduleSwapRequest[]>>("/api/admin/schedules/swap-requests", {
      params: status ? { status } : undefined
    });
    return response.data.data;
  },
  async createSwapRequest(data: { scheduleId: AdminId; targetUserId: AdminId; note?: string }) {
    const response = await api.post<ApiResponse<AdminScheduleSwapRequest>>("/api/admin/schedules/swap-requests", data);
    return response.data.data;
  },
  async approveSwapRequest(id: AdminId, reviewNote?: string) {
    const response = await api.post<ApiResponse<AdminScheduleSwapRequest>>(`/api/admin/schedules/swap-requests/${id}/approve`, { reviewNote });
    return response.data.data;
  },
  async rejectSwapRequest(id: AdminId, reviewNote?: string) {
    const response = await api.post<ApiResponse<AdminScheduleSwapRequest>>(`/api/admin/schedules/swap-requests/${id}/reject`, { reviewNote });
    return response.data.data;
  },
  async deleteSchedule(id: AdminId) {
    const response = await api.delete<ApiResponse<void>>(`/api/admin/schedules/${id}`);
    return response.data;
  }
};
