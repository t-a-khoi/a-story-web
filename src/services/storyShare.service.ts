import { apiClient } from '@/lib/axios';
import { 
  StorySharesResponse, 
  StorySharesCreateRequest, 
  StorySharesUpdateRequest, 
  PageResponse,
  StorySharesQueryRequest 
} from '@/types/storyShare';

export const StoryShareService = {
  getStoryShares: async (page = 0, size = 10): Promise<PageResponse<StorySharesResponse>> => {
    const response = await apiClient.get<PageResponse<StorySharesResponse>>('/story-shares', {
      params: { page, size }
    });
    return response.data;
  },

  getStoryShareById: async (id: number): Promise<StorySharesResponse> => {
    const response = await apiClient.get<StorySharesResponse>(`/story-shares/${id}`);
    return response.data;
  },

  createStoryShare: async (data: StorySharesCreateRequest): Promise<StorySharesResponse> => {
    const response = await apiClient.post<StorySharesResponse>('/story-shares', data);
    return response.data;
  },

  updateStoryShare: async (id: number, data: StorySharesUpdateRequest): Promise<StorySharesResponse> => {
    const response = await apiClient.put<StorySharesResponse>(`/story-shares/${id}`, data);
    return response.data;
  },

  deleteStoryShare: async (id: number): Promise<void> => {
    await apiClient.delete(`/story-shares/${id}`);
  },

  searchStoryShares: async (body: StorySharesQueryRequest): Promise<PageResponse<StorySharesResponse>> => {
    const response = await apiClient.post<PageResponse<StorySharesResponse>>('/story-shares/search', body);
    return response.data;
  }
};
