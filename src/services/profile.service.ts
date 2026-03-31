// src/services/profile.service.ts

import { apiClient } from '@/lib/axios';
import { ProfilesResponse, ProfilesCreateRequest, ProfilesUpdateRequest} from '@/types/profile';
import { PageResponse, QueryRequest } from '@/types/common';

export const ProfileService = {
  // Lấy danh sách phân trang
  getProfiles: async (page = 0, size = 10): Promise<PageResponse<ProfilesResponse>> => {
    const response = await apiClient.get<PageResponse<ProfilesResponse>>('/ph-story-mvp-service/api/v1/profiles', {
      params: { page, size }
    });
    return response.data;
  },

  // Lấy Profile của chính mình
  getMyProfile: async (): Promise<ProfilesResponse> => {
    const response = await apiClient.get<ProfilesResponse>('/ph-story-mvp-service/api/v1/profiles/me');
    return response.data;
  },

  // Lấy chi tiết 1 Profile
  getProfileById: async (id: number): Promise<ProfilesResponse> => {
    const response = await apiClient.get<ProfilesResponse>(`/ph-story-mvp-service/api/v1/profiles/${id}`);
    return response.data;
  },

  // Tạo mới
  createProfile: async (data: ProfilesCreateRequest): Promise<ProfilesResponse> => {
    const response = await apiClient.post<ProfilesResponse>('/ph-story-mvp-service/api/v1/profiles', data);
    return response.data;
  },

  // Cập nhật (KHÔNG gửi userId)
  updateProfile: async (id: number, data: ProfilesUpdateRequest): Promise<ProfilesResponse> => {
    const response = await apiClient.put<ProfilesResponse>(`/ph-story-mvp-service/api/v1/profiles/${id}`, data);
    return response.data;
  },

  deleteProfile: async (id: number): Promise<void> => {
    await apiClient.delete(`/ph-story-mvp-service/api/v1/profiles/${id}`);
  },

  // Tìm kiếm bằng QueryRequest tùy biến
  searchProfiles: async (body: QueryRequest): Promise<PageResponse<ProfilesResponse>> => {
    const response = await apiClient.post<PageResponse<ProfilesResponse>>('/ph-story-mvp-service/api/v1/profiles/search', body);
    return response.data;
  }
};
