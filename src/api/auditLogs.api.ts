import { apiClient } from "./client";
import { PaginatedResponse, AuditLog } from "../types";

export const getAuditLogs = async (params: any) => {
  const response = await apiClient.get<PaginatedResponse<AuditLog>>("/audit-logs", { params });
  return response.data;
};
