// src/services/settings.service.ts

import { apiClient } from '@/lib/axios';
import { 
  SettingsResponse, 
  SettingsCreateRequest, 
  SettingsUpdateRequest, 
  PageResponse,
  SettingsQueryRequest 
} from '@/types/settings';

export const SettingsService = {
  getSettingsList: async (page = 0, size = 10): Promise<PageResponse<SettingsResponse>> => {
    const response = await apiClient.get<PageResponse<SettingsResponse>>('/settings', {
      params: { page, size }
    });
    return response.data;
  },

  getSettingsById: async (id: number): Promise<SettingsResponse> => {
    const response = await apiClient.get<SettingsResponse>(`/settings/${id}`);
    return response.data;
  },

  createSettings: async (data: SettingsCreateRequest): Promise<SettingsResponse> => {
    const response = await apiClient.post<SettingsResponse>('/settings', data);
    return response.data;
  },

  updateSettings: async (id: number, data: SettingsUpdateRequest): Promise<SettingsResponse> => {
    const response = await apiClient.put<SettingsResponse>(`/settings/${id}`, data);
    return response.data;
  },

  deleteSettings: async (id: number): Promise<void> => {
    await apiClient.delete(`/settings/${id}`);
  },

  searchSettings: async (body: SettingsQueryRequest): Promise<PageResponse<SettingsResponse>> => {
    const response = await apiClient.post<PageResponse<SettingsResponse>>('/settings/search', body);
    return response.data;
  }
};
