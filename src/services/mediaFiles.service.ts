import { apiClient } from '@/lib/axios';
import { MediaFilesCreateRequest, MediaFilesResponse } from '@/types/mediaFile';

export interface MediaFilesUpdateRequest {
    title?: string;
    mediaType?: string;
    urlPath?: string;
    thumbnailUrl?: string;
    fileSize?: number;
}

export const MediaFilesService = {
    createMediaFile: async (data: MediaFilesCreateRequest): Promise<MediaFilesResponse> => {
        const response = await apiClient.post<MediaFilesResponse>('/ph-story-mvp-service/api/v1/media-files', data);
        return response.data;
    },

    updateMediaFile: async (id: number, data: MediaFilesUpdateRequest): Promise<MediaFilesResponse> => {
        const response = await apiClient.put<MediaFilesResponse>(`/ph-story-mvp-service/api/v1/media-files/${id}`, data);
        return response.data;
    },

    deleteMediaFile: async (id: number): Promise<void> => {
        await apiClient.delete(`/ph-story-mvp-service/api/v1/media-files/${id}`);
    },

    getMediaFileById: async (id: number): Promise<MediaFilesResponse> => {
        const response = await apiClient.get<MediaFilesResponse>(`/ph-story-mvp-service/api/v1/media-files/${id}`);
        return response.data;
    },

    searchMediaFiles: async (queryRequest: any): Promise<{ content: MediaFilesResponse[], totalPages: number, number: number, empty: boolean }> => {
        const response = await apiClient.post('/ph-story-mvp-service/api/v1/media-files/search', queryRequest);
        return response.data;
    }
};
