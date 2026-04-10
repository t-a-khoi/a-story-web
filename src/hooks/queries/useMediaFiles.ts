import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MediaFilesService } from "@/services/mediaFiles.service";
import { FileUploadService } from "@/services/fileUpload.service";
import { useAuthStore } from "@/store/useAuthStore";

export const mediaKeys = {
    all: ['media'] as const,
    myMedia: (userId: number) => [...mediaKeys.all, 'list', userId] as const,
};

export const useMyMediaFiles = () => {
    const { user, accessToken } = useAuthStore();

    return useQuery({
        queryKey: mediaKeys.myMedia(user?.id || 0),
        queryFn: async () => {
            if (!user?.id) throw new Error("No user ID");
            const response = await MediaFilesService.searchMediaFiles({
                filters: [
                    { field: "user.id", operator: "EQUAL", value: user.id },
                    { field: "deleted", operator: "EQUAL", value: false }
                ],
                sorts: [{ field: "createdDate", direction: "DESC" }],
                pagination: { page: 0, size: 100 }
            });

            const items = [];
            if (response.content && response.content.length > 0) {
                const results = await Promise.all(response.content.map(async (item: any) => {
                    const blobUrl = await FileUploadService.fetchImageBlobUrl(item.urlPath);
                    return {
                        id: item.id,
                        urlPath: item.urlPath,
                        blobUrl,
                        title: item.title,
                        fileSize: item.fileSize,
                        createdDate: item.createdDate,
                    };
                }));
                items.push(...results.filter(r => r.blobUrl !== ""));
            }
            return items;
        },
        enabled: !!user?.id && !!accessToken,
    });
};

export const useUploadMedia = () => {
    const queryClient = useQueryClient();
    const { user } = useAuthStore();

    return useMutation({
        mutationFn: async ({ file, title }: { file: File, title: string }) => {
            if (!user?.id) throw new Error("No user ID");
            const uploaded = await FileUploadService.uploadFile(file, 'library');
            return MediaFilesService.createMediaFile({
                userId: user.id,
                mediaType: 'IMAGE',
                urlPath: uploaded.key,
                fileSize: uploaded.size,
                title: title.trim() || file.name,
            });
        },
        onSuccess: () => {
            if (user?.id) {
                queryClient.invalidateQueries({ queryKey: mediaKeys.myMedia(user.id) });
            }
        }
    });
};

export const useDeleteMedia = () => {
    const queryClient = useQueryClient();
    const { user } = useAuthStore();

    return useMutation({
        mutationFn: async ({ id, urlPath }: { id: number, urlPath: string }) => {
            try {
                await MediaFilesService.deleteMediaFile(id);
            } catch (err: any) {
                if (err?.response?.status !== 404) throw err;
            }
            try {
                await FileUploadService.deleteFile(urlPath);
            } catch {
                // Ignore storage delete errors
            }
        },
        onSuccess: () => {
            if (user?.id) {
                queryClient.invalidateQueries({ queryKey: mediaKeys.myMedia(user.id) });
            }
        }
    });
};
