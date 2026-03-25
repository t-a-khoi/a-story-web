import { apiClient } from '@/lib/axios';

export interface StorySharesCreateRequest {
    storyId: number;
    sharedUserId: number;
}

export interface StorySharesResponse {
    id: number;
    storyId: number;
    sharedUserId: number;
    deleted: boolean;
    createdDate: string;
    modifiedDate: string;
}

export const storyService = {
    /**
     * API Chia sẻ câu chuyện cho một User khác trong hệ thống
     * Endpoint: POST /api/v1/story-shares
     */
    shareStory: async (data: StorySharesCreateRequest): Promise<StorySharesResponse> => {
        const response = await apiClient.post<StorySharesResponse>('/story-shares', data);
        return response.data;
    }
};