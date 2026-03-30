// src/services/stories.service.ts
import { apiClient } from '@/lib/axios';
import { Story, StoryCreateRequest, StoryUpdateRequest, StoryQueryParams, QueryRequest } from '@/types/story';

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export const StoryService = {
  // Lấy chi tiết 1 bài
  getStoryById: async (id: number): Promise<Story> => {
    const response = await apiClient.get<Story>(`/stories/${id}`);
    return response.data;
  },

  // Lấy danh sách chuyện (Phân trang)
  getStories: async (params?: StoryQueryParams): Promise<PageResponse<Story>> => {
    const response = await apiClient.get<PageResponse<Story>>('/stories', { params });
    return response.data;
  },

  // Tạo mới bài viết
  createStory: async (data: StoryCreateRequest): Promise<Story> => {
    // MOCK API: Vì server chưa Push/Deploy Endpoint này, chúng ta giả lập trả về Dữ liệu thật
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

    // Code thực sự của bạn sau này khi Java viết xong API /stories
    // const response = await apiClient.post<Story>('/stories', data);
    // return response.data;
  },

  // Sửa bài viết
  updateStory: async (id: number, data: StoryUpdateRequest): Promise<Story> => {
    const response = await apiClient.put<Story>(`/stories/${id}`, data);
    return response.data;
  },

  // Xóa bài viết
  deleteStory: async (id: number): Promise<void> => {
    await apiClient.delete(`/stories/${id}`);
  },

  // Tìm kiếm nâng cao
  searchStories: async (body: QueryRequest): Promise<PageResponse<Story>> => {

    const response = await apiClient.post<PageResponse<Story>>('/stories/search', body);
    return response.data;
  }
};