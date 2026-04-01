export interface MediaFilesResponse {
    id: number;
    userId: number;
    categoryId: number;
    mediaType: "IMAGE" | "VIDEO" | "AUDIO";
    urlPath: string;
    thumbnailUrl?: string;
    fileSize: number;
    title: string;
    createdDate?: string;
}

export interface MediaFilesCreateRequest {
    userId: number;
    categoryId?: number | null;
    mediaType: string;
    urlPath: string;
    thumbnailUrl?: string;
    fileSize: number;
    title: string;
}