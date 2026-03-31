// src/services/stories.service.ts
import { apiClient } from '@/lib/axios';
import { Story, StoryCreateRequest, StoryUpdateRequest, StoryQueryParams } from '@/types/story';
import { PageResponse, QueryRequest } from '@/types/common';


export const StoryService = {
  // Lấy chi tiết 1 bài
  getStoryById: async (id: number): Promise<Story> => {
    const response = await apiClient.get<Story>(`/ph-story-mvp-service/api/v1/stories/${id}`);
    return response.data;
  },

  // Lấy danh sách chuyện (Phân trang)
  getStories: async (params?: StoryQueryParams): Promise<PageResponse<Story>> => {
    const response = await apiClient.get<PageResponse<Story>>('/ph-story-mvp-service/api/v1/stories', { params });
    return response.data;
  },

  // Tạo mới bài viết
  createStory: async (data: StoryCreateRequest): Promise<Story> => {
    console.log("Mocking createStory for data:", data);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: Math.floor(Math.random() * 10000) + 1,
          userId: data.userId,
          profileId: data.profileId,
          catId: data.catId,
          title: data.title,
          content: data.content,
          deleted: false,
          createdDate: new Date().toISOString(),
          modifiedDate: new Date().toISOString()
        });
      }, 1500);
    });
  },

  // Sửa bài viết
  updateStory: async (id: number, data: StoryUpdateRequest): Promise<Story> => {
    const response = await apiClient.put<Story>(`/ph-story-mvp-service/api/v1/stories/${id}`, data);
    return response.data;
  },

  // Xóa bài viết
  deleteStory: async (id: number): Promise<void> => {
    await apiClient.delete(`/ph-story-mvp-service/api/v1/stories/${id}`);
  },

  // Tìm kiếm nâng cao
  searchStories: async (body: QueryRequest): Promise<PageResponse<Story>> => {
    const response = await apiClient.post<PageResponse<Story>>('/ph-story-mvp-service/api/v1/stories/search', body);
    return response.data;
  }
};