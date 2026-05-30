import api from "./axios";
import type {
  AuthPayload,
  LoginRequest,
  RefreshTokenRequest,
  RegisterRequest
} from "../types/auth";
import type { ApiResponse } from "../types/api";

export const authService = {
  async register(payload: RegisterRequest) {
    const response = await api.post<ApiResponse<unknown>>("/api/auth/register", payload);
    return response.data;
  },
  async login(payload: LoginRequest) {
    const response = await api.post<ApiResponse<AuthPayload>>("/api/auth/login", payload);
    return response.data.data;
  },
  async refresh(payload: RefreshTokenRequest) {
    const response = await api.post<ApiResponse<AuthPayload>>("/api/auth/refresh", payload);
    return response.data.data;
  },
  async logout(refreshToken: string) {
    const response = await api.post<ApiResponse<null>>("/api/auth/logout", { refreshToken });
    return response.data;
  }
};
