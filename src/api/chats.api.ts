import { apiClient } from "./client";
import { ChatRoom, ChatMessage } from "../types";

export const createChatRoom = async (videoRequestId: string) => {
  const response = await apiClient.post<{ success: boolean; data: ChatRoom; message: string }>("/chats", {
    videoRequestId,
  });
  return response.data;
};

export const listChatRooms = async () => {
  const response = await apiClient.get<{ success: boolean; data: ChatRoom[] }>("/chats");
  return response.data;
};

export const getChatRoom = async (chatId: string) => {
  const response = await apiClient.get<{ success: boolean; data: ChatRoom }>(`/chats/${chatId}`);
  return response.data;
};

export const getChatMessages = async (chatId: string, page = 1, limit = 50) => {
  const response = await apiClient.get<{ success: boolean; data: ChatMessage[] }>(
    `/chats/${chatId}/messages?page=${page}&limit=${limit}`
  );
  return response.data;
};

export const sendChatMessage = async (
  chatId: string,
  content: string,
  type = "TEXT"
) => {
  const response = await apiClient.post<{
    success: boolean;
    data: {
      message: ChatMessage;
      fulfillerMessagesRemaining: number;
      fulfillerMessageCount: number;
      preAcceptanceMessageLimit: number;
      state: string;
    };
  }>(`/chats/${chatId}/messages`, {
    content,
    type,
  });
  return response.data;
};
