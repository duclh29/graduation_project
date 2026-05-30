import api from "./axios";
import type { ApiResponse } from "../types/api";
import type { Address } from "../types/address";

export const addressService = {
  async getByUserId(userId: number) {
    const response = await api.get<ApiResponse<Address[]>>("/api/addresses", {
      params: { userId }
    });
    return response.data.data;
  }
};

