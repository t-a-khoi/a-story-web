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

  // Lấy danh sách chuyện của người dùng đăng nhập
  getMyStories: async (params?: StoryQueryParams): Promise<PageResponse<Story>> => {
    const response = await apiClient.get<PageResponse<Story>>('/stories/me', { params });
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
          modifiedDate: new Date().toISOString(),
          category: {
            id: data.catId,
            name: "Thể Loại Lịch Sử (Mock)",
            color: "#10b981",
            icon: "tag"
          },
          profile: {
            fullname: "Nguyễn Văn Khoa"
          }
        });
      }, 1500); // Trễ 1.5s tạo cảm giác đang gửi file lên máy chủ
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
    // API backend đang mong form POST có data là body chứa QueryRequest
    const response = await apiClient.post<PageResponse<Story>>('/stories/search', body);
    return response.data;
  }
};