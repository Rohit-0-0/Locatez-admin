import { apiClient } from "./client";

export const registerDeviceToken = async (fcmToken: string): Promise<any> => {
  const response = await apiClient.post("/notifications/devices", { fcmToken });
  return response.data;
};

export const unregisterDeviceToken = async (fcmToken: string): Promise<any> => {
  const response = await apiClient.delete(`/notifications/devices/${encodeURIComponent(fcmToken)}`);
  return response.data;
};
