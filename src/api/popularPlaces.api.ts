import { apiClient } from "./client";
import {
  PopularPlace,
  CreatePopularPlacePayload,
  UpdatePopularPlacePayload,
} from "../types";

/**
 * User-facing active Popular Places feed (GET /api/v1/popular-places)
 */
export const getPopularPlaces = async () => {
  const response = await apiClient.get<{ success: boolean; data: PopularPlace[] }>("/popular-places");
  return response.data;
};

/**
 * Admin Popular Places list including active & inactive (GET /api/v1/admin/popular-places)
 */
export const getAdminPopularPlaces = async (params?: any) => {
  const response = await apiClient.get<{ success: boolean; data: PopularPlace[] | { items: PopularPlace[]; pagination?: any } }>(
    "/admin/popular-places",
    { params }
  );
  return response.data;
};

/**
 * Admin get Popular Place by ID (GET /api/v1/admin/popular-places/:id)
 */
export const getAdminPopularPlaceById = async (id: string) => {
  const response = await apiClient.get<{ success: boolean; data: PopularPlace }>(`/admin/popular-places/${id}`);
  return response.data;
};

/**
 * Admin create Popular Place (POST /api/v1/admin/popular-places)
 */
export const createPopularPlace = async (payload: CreatePopularPlacePayload) => {
  const response = await apiClient.post<{ success: boolean; data: PopularPlace }>("/admin/popular-places", payload);
  return response.data;
};

/**
 * Admin update Popular Place (PATCH /api/v1/admin/popular-places/:id)
 */
export const updatePopularPlace = async (id: string, payload: UpdatePopularPlacePayload) => {
  const response = await apiClient.patch<{ success: boolean; data: PopularPlace }>(`/admin/popular-places/${id}`, payload);
  return response.data;
};

/**
 * Admin enable/disable Popular Place status (PATCH /api/v1/admin/popular-places/:id/status)
 */
export const updatePopularPlaceStatus = async (id: string, isActive: boolean) => {
  const response = await apiClient.patch<{ success: boolean; data: PopularPlace }>(`/admin/popular-places/${id}/status`, {
    isActive,
  });
  return response.data;
};

/**
 * Media File Upload (POST /api/v1/media/upload)
 */
export const uploadMedia = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);
  
  const response = await apiClient.post<{ success?: boolean; data?: { url?: string } | string; url?: string }>(
    "/media/upload",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  const resData = response.data;
  if (typeof resData?.data === "string") return resData.data;
  if (typeof resData?.data?.url === "string") return resData.data.url;
  if (typeof resData?.url === "string") return resData.url;
  
  throw new Error("Invalid response format from media upload API");
};
