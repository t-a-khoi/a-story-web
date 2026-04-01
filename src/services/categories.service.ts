// src/services/categories.service.ts
import { apiClient } from '@/lib/axios';
import { PageResponse, QueryRequest } from '@/types/common';
import { Category, CategoriesCreateRequest, CategoriesUpdateRequest } from '@/types/story';

export const CategoriesService = {
  getCategoryById: async (id: number): Promise<Category> => {
    const response = await apiClient.get<Category>(`/ph-story-mvp-service/api/v1/categoriess/${id}`);
    return response.data;
  },

  getCategories: async (page = 0, size = 100): Promise<PageResponse<Category>> => {
    const response = await apiClient.get<PageResponse<Category>>('/ph-story-mvp-service/api/v1/categoriess', { 
        params: { page, size } 
    });
    return response.data;
  },

  searchCategories: async (body: QueryRequest): Promise<PageResponse<Category>> => {
    const response = await apiClient.post<PageResponse<Category>>('/ph-story-mvp-service/api/v1/categoriess/search', body);
    return response.data;
  },

  createCategory: async (data: CategoriesCreateRequest): Promise<Category> => {
    const response = await apiClient.post<Category>('/ph-story-mvp-service/api/v1/categoriess', data);
    return response.data;
  },

  updateCategory: async (id: number, data: CategoriesUpdateRequest): Promise<Category> => {
    const response = await apiClient.put<Category>(`/ph-story-mvp-service/api/v1/categoriess/${id}`, data);
    return response.data;
  },

  deleteCategory: async (id: number): Promise<void> => {
    await apiClient.delete(`/ph-story-mvp-service/api/v1/categoriess/${id}`);
  }
};
