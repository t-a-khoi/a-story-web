import { apiClient } from '@/lib/axios';
import { useAuthStore } from '@/store/useAuthStore';

export interface FileUploadResponse {
    bucket: string;
    key: string;
    eTag: string;
    size: number;
    contentType: string;
}

export const FileUploadService = {
    /**
     * Upload định dạng multipart
     */
    uploadFile: async (file: File, prefix: string = 'story-assets'): Promise<FileUploadResponse> => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await apiClient.post<FileUploadResponse>('ph-story-seaweedfs-service/api/v1/files/upload', formData, {
            params: { prefix },
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    /**
     * Dùng Fetch để tải file dạng Blob an toàn với Authentication header,
     * trả về URL an toàn kiểu blob:http://... để nạp vào img src.
     */
    fetchImageBlobUrl: async (fileKey: string): Promise<string> => {
        const token = useAuthStore.getState().accessToken || localStorage.getItem("accessToken");
        const url = `${apiClient.defaults.baseURL}/ph-story-seaweedfs-service/api/v1/files/download?key=${encodeURIComponent(fileKey)}`;

        try {
            const response = await fetch(url, {
                method: "GET",
                headers: {
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                }
            });

            const blob = await response.blob();
            return URL.createObjectURL(blob);
        } catch (error) {
            console.error("Error fetching image blob:", error);
            return "";
        }
    },

    /**
     * Xóa file trên hệ thống S3 thông qua backend gateway
     */
    deleteFile: async (fileKey: string): Promise<void> => {
        await apiClient.delete('/ph-story-seaweedfs-service/api/v1/files', {
            params: { key: fileKey }
        });
    }
};
