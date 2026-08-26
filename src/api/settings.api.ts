import { apiClient } from "./client";

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
