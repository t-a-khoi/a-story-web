// src/services/profile.service.ts

import { apiClient } from '@/lib/axios';
import { 
  ProfilesResponse, 
  ProfilesCreateRequest,
  ProfilesUpdateRequest, 
  PageResponse,
  ProfileQueryRequest 
} from '@/types/profile';

export const ProfileService = {
  // Lấy danh sách phân trang
  getProfiles: async (page = 0, size = 10): Promise<PageResponse<ProfilesResponse>> => {
    const response = await apiClient.get<PageResponse<ProfilesResponse>>('/profiles', {
      params: { page, size }
    });
    return response.data;
  },

  // Lấy chi tiết 1 Profile
  getProfileById: async (id: number): Promise<ProfilesResponse> => {
    const response = await apiClient.get<ProfilesResponse>(`/profiles/${id}`);
    return response.data;
  },

  // Tạo mới
  createProfile: async (data: ProfilesCreateRequest): Promise<ProfilesResponse> => {
    const response = await apiClient.post<ProfilesResponse>('/profiles', data);
    return response.data;
  },

  // Cập nhật (KHÔNG gửi userId)
  updateProfile: async (id: number, data: ProfilesUpdateRequest): Promise<ProfilesResponse> => {
    const response = await apiClient.put<ProfilesResponse>(`/profiles/${id}`, data);
    return response.data;
  },

  // Xóa mềm Profile
  deleteProfile: async (id: number): Promise<void> => {
    await apiClient.delete(`/profiles/${id}`);
  },

  // Tìm kiếm bằng QueryRequest tùy biến
  searchProfiles: async (body: ProfileQueryRequest): Promise<PageResponse<ProfilesResponse>> => {
    const response = await apiClient.post<PageResponse<ProfilesResponse>>('/profiles/search', body);
    return response.data;
  }
};
