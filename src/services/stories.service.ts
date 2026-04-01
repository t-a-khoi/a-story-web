// src/services/stories.service.ts
import { apiClient } from '@/lib/axios';
import { Story, StoryCreateRequest, StoryUpdateRequest, StoryQueryParams } from '@/types/story';
import { PageResponse, QueryRequest } from '@/types/common';


export const StoryService = {

  getStoryById: async (id: number): Promise<Story> => {
    const response = await apiClient.get<Story>(`/ph-story-mvp-service/api/v1/stories/${id}`);
    return response.data;
  },

  getStories: async (params?: StoryQueryParams): Promise<PageResponse<Story>> => {
    const response = await apiClient.get<PageResponse<Story>>('/ph-story-mvp-service/api/v1/stories/me', { params });
    return response.data;
  },

  createStory: async (data: StoryCreateRequest): Promise<Story> => {
    const response = await apiClient.post<Story>('/ph-story-mvp-service/api/v1/stories', data);
    return response.data;
  },

  updateStory: async (id: number, data: StoryUpdateRequest): Promise<Story> => {
    const response = await apiClient.put<Story>(`/ph-story-mvp-service/api/v1/stories/${id}`, data);
    return response.data;
  },

  deleteStory: async (id: number): Promise<void> => {
    await apiClient.delete(`/ph-story-mvp-service/api/v1/stories/${id}`);
  },

  searchStories: async (body: QueryRequest): Promise<PageResponse<Story>> => {
    const response = await apiClient.post<PageResponse<Story>>('/ph-story-mvp-service/api/v1/stories/search', body);
    return response.data;
  }
};