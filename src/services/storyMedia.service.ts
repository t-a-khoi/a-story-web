import { apiClient } from '@/lib/axios';
import { StoryMediaCreateRequest, StoryMediaResponse } from '@/types/story';


export const StoryMediaService = {
    createStoryMedia: async (data: StoryMediaCreateRequest): Promise<StoryMediaResponse> => {
        const response = await apiClient.post<StoryMediaResponse>('/ph-story-mvp-service/api/v1/story-media', data);
        return response.data;
    },

    getStoryMediaByStoryId: async (storyId: number): Promise<StoryMediaResponse[]> => {
        const response = await apiClient.post('/ph-story-mvp-service/api/v1/story-media/search', {
            filters: [
                { field: "story.id", operator: "EQUAL", value: storyId },
                { field: "deleted", operator: "EQUAL", value: false }
            ],
            pagination: { page: 0, size: 50 }
        });
        return response.data.content || response.data;
    },

    deleteStoryMedia: async (id: number): Promise<void> => {
        await apiClient.delete(`/ph-story-mvp-service/api/v1/story-media/${id}`);
    }
};
