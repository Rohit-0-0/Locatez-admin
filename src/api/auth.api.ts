import { apiClient } from "./client";
import { AuthResponse } from "../types";

export const login = async (credentials: any): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>("/auth/login", credentials);
  return response.data;
};

export const logout = async (refreshToken: string): Promise<any> => {
  const response = await apiClient.post("/auth/logout", { refreshToken });
  return response.data;
};
