import { apiClient } from '@/lib/axios';
import { SettingsResponse, SettingsCreateRequest, SettingsUpdateRequest, } from '@/types/settings';
import { PageResponse, QueryRequest } from '@/types/common';

export const SettingsService = {
  getSettingsList: async (page = 0, size = 10): Promise<PageResponse<SettingsResponse>> => {
    const response = await apiClient.get<PageResponse<SettingsResponse>>('/ph-story-mvp-service/api/v1/settings', {
      params: { page, size }
    });
    return response.data;
  },

  getSettingsById: async (id: number): Promise<SettingsResponse> => {
    const response = await apiClient.get<SettingsResponse>(`/ph-story-mvp-service/api/v1/settings/${id}`);
    return response.data;
  },

  createSettings: async (data: SettingsCreateRequest): Promise<SettingsResponse> => {
    const response = await apiClient.post<SettingsResponse>('/ph-story-mvp-service/api/v1/settings', data);
    return response.data;
  },

  updateSettings: async (id: number, data: SettingsUpdateRequest): Promise<SettingsResponse> => {
    const response = await apiClient.put<SettingsResponse>(`/ph-story-mvp-service/api/v1/settings/${id}`, data);
    return response.data;
  },

  deleteSettings: async (id: number): Promise<void> => {
    await apiClient.delete(`/ph-story-mvp-service/api/v1/settings/${id}`);
  },

  searchSettings: async (body: QueryRequest): Promise<PageResponse<SettingsResponse>> => {
    const response = await apiClient.post<PageResponse<SettingsResponse>>('/ph-story-mvp-service/api/v1/settings/search', body);
    return response.data;
  }
};
