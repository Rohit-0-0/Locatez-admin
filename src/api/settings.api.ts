import { apiClient } from "./client";
import { ServiceAreaSettings, ServiceAreaMode, ServiceArea } from "../types";

export interface VideoRequestSettings {
  requireApprovalForAll: boolean;
}

export interface ChatSettings {
  preAcceptanceMessageLimit: number;
}

export const getVideoRequestSettings = async () => {
  const response = await apiClient.get<VideoRequestSettings | { success: boolean; data: VideoRequestSettings }>("/settings/video-requests");
  // Handle both direct object response and wrapped response structure safely
  const resData = response.data as any;
  if (resData && typeof resData.requireApprovalForAll === "boolean") {
    return resData as VideoRequestSettings;
  }
  if (resData && resData.data && typeof resData.data.requireApprovalForAll === "boolean") {
    return resData.data as VideoRequestSettings;
  }
  return { requireApprovalForAll: false };
};

export const updateVideoRequestSettings = async (requireApprovalForAll: boolean) => {
  const response = await apiClient.patch<VideoRequestSettings | { success: boolean; data: VideoRequestSettings }>(
    "/settings/video-requests",
    { requireApprovalForAll }
  );
  const resData = response.data as any;
  if (resData && typeof resData.requireApprovalForAll === "boolean") {
    return resData as VideoRequestSettings;
  }
  if (resData && resData.data && typeof resData.data.requireApprovalForAll === "boolean") {
    return resData.data as VideoRequestSettings;
  }
  return { requireApprovalForAll };
};

export const getChatSettings = async (): Promise<ChatSettings> => {
  const response = await apiClient.get<ChatSettings | { success: boolean; data: ChatSettings }>("/settings/chat");
  const resData = response.data as any;
  if (resData && typeof resData.preAcceptanceMessageLimit === "number") {
    return resData as ChatSettings;
  }
  if (resData && resData.data && typeof resData.data.preAcceptanceMessageLimit === "number") {
    return resData.data as ChatSettings;
  }
  return { preAcceptanceMessageLimit: 50 };
};

export const updateChatSettings = async (preAcceptanceMessageLimit: number): Promise<ChatSettings> => {
  const response = await apiClient.patch<ChatSettings | { success: boolean; data: ChatSettings }>(
    "/settings/chat",
    { preAcceptanceMessageLimit }
  );
  const resData = response.data as any;
  if (resData && typeof resData.preAcceptanceMessageLimit === "number") {
    return resData as ChatSettings;
  }
  if (resData && resData.data && typeof resData.data.preAcceptanceMessageLimit === "number") {
    return resData.data as ChatSettings;
  }
  return { preAcceptanceMessageLimit };
};

/**
 * Service Area Restriction System API (ADMIN ONLY)
 * GET /api/v1/admin/service-area
 * PATCH /api/v1/admin/service-area
 */
export const getServiceAreaSettings = async (): Promise<ServiceAreaSettings> => {
  const response = await apiClient.get<ServiceAreaSettings | { success: boolean; data: ServiceAreaSettings }>("/admin/service-area");
  const resData = response.data as any;

  if (resData && (resData.mode === "PAN_INDIA" || resData.mode === "RESTRICTED")) {
    return {
      mode: resData.mode,
      areas: Array.isArray(resData.areas) ? resData.areas : [],
    };
  }

  if (resData && resData.data && (resData.data.mode === "PAN_INDIA" || resData.data.mode === "RESTRICTED")) {
    return {
      mode: resData.data.mode,
      areas: Array.isArray(resData.data.areas) ? resData.data.areas : [],
    };
  }

  throw new Error("Invalid response format from service area API");
};

export const updateServiceAreaSettings = async (payload: {
  mode: ServiceAreaMode;
  areas?: { id: string; enabled: boolean }[] | ServiceArea[];
}): Promise<ServiceAreaSettings> => {
  const response = await apiClient.patch<ServiceAreaSettings | { success: boolean; data: ServiceAreaSettings }>(
    "/admin/service-area",
    payload
  );
  const resData = response.data as any;

  if (resData && (resData.mode === "PAN_INDIA" || resData.mode === "RESTRICTED")) {
    return {
      mode: resData.mode,
      areas: Array.isArray(resData.areas) ? resData.areas : [],
    };
  }

  if (resData && resData.data && (resData.data.mode === "PAN_INDIA" || resData.data.mode === "RESTRICTED")) {
    return {
      mode: resData.data.mode,
      areas: Array.isArray(resData.data.areas) ? resData.data.areas : [],
    };
  }

  return {
    mode: payload.mode,
    areas: (payload.areas as any) || [],
  };
};
