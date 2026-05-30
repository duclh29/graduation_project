import axios from "axios";
import { toast } from "react-toastify";
import { storage } from "./storage";

let onUnauthorized: (() => void) | null = null;

export const registerUnauthorizedHandler = (handler: () => void) => {
  onUnauthorized = handler;
};

const api = axios.create({
  baseURL: "http://localhost:8080",
  timeout: 15000
});

api.interceptors.request.use((config) => {
  const token = storage.getAccessToken();
  const requestUrl = config.url || "";
  const normalizedUrl = requestUrl.toLowerCase();
  const isPublicProductApi =
    normalizedUrl.startsWith("/api/products") || normalizedUrl.includes("/api/products");
  if (token && !isPublicProductApi) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      storage.clearAuth();
      onUnauthorized?.();
      toast.error("Phiên bảo đã hết hạn! Vui lòng đăng nhập lại.");
    }
    return Promise.reject(error);
  }
);

export default api;
