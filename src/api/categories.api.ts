import { apiClient } from "./client";
import { Category, CategorySuggestion } from "../types";

// User-facing active categories feed
export const getCategories = async () => {
  const response = await apiClient.get<{ success: boolean; data: Category[] }>("/categories");
  return response.data;
};

// Admin categories list (includes active and inactive)
export const getAdminCategories = async (params?: any) => {
  const response = await apiClient.get<{ success: boolean; data: Category[] | { items: Category[]; pagination?: any } }>("/admin/categories", { params });
  return response.data;
};

// Create category
export const createCategory = async (data: { name: string }) => {
  const response = await apiClient.post<{ success: boolean; data: Category }>("/categories", data);
  return response.data;
};

// Edit category
export const updateCategory = async (id: string, data: { name: string }) => {
  const response = await apiClient.patch<{ success: boolean; data: Category }>(`/categories/${id}`, data);
  return response.data;
};

// Enable / Disable category status
export const updateCategoryStatus = async (id: string, isActive: boolean) => {
  const response = await apiClient.patch<{ success: boolean; data: Category }>(`/categories/${id}/status`, { isActive });
  return response.data;
};

// Soft-deactivate category (DELETE /categories/:id with fallback to /admin/categories/:id)
export const deleteCategory = async (id: string) => {
  try {
    const response = await apiClient.delete<{ success: boolean; data: Category }>(`/categories/${id}`);
    return response.data;
  } catch (err: any) {
    if (err.response?.status === 404 || err.response?.status === 405) {
      const response = await apiClient.delete<{ success: boolean; data: Category }>(`/admin/categories/${id}`);
      return response.data;
    }
    throw err;
  }
};

// AI Category Suggestions list
export const getCategorySuggestions = async (params?: any) => {
  const response = await apiClient.get<{ success: boolean; data: CategorySuggestion[] | { items: CategorySuggestion[]; pagination?: any } }>("/admin/categories/suggestions", { params });
  return response.data;
};

// Accept AI Category Suggestion
export const acceptCategorySuggestion = async (id: string) => {
  try {
    const response = await apiClient.patch<{ success: boolean; data: CategorySuggestion }>(`/admin/categories/suggestions/${id}/accept`);
    return response.data;
  } catch (err: any) {
    if (err.response?.status === 404 || err.response?.status === 405) {
      const response = await apiClient.post<{ success: boolean; data: CategorySuggestion }>(`/admin/categories/suggestions/${id}/accept`);
      return response.data;
    }
    throw err;
  }
};

// Reject AI Category Suggestion
export const rejectCategorySuggestion = async (id: string) => {
  try {
    const response = await apiClient.patch<{ success: boolean; data: CategorySuggestion }>(`/admin/categories/suggestions/${id}/reject`);
    return response.data;
  } catch (err: any) {
    if (err.response?.status === 404 || err.response?.status === 405) {
      const response = await apiClient.post<{ success: boolean; data: CategorySuggestion }>(`/admin/categories/suggestions/${id}/reject`);
      return response.data;
    }
    throw err;
  }
};
