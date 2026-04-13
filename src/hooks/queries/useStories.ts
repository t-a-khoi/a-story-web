import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { StoryService } from '@/services/stories.service';
import { StoryMediaService } from '@/services/storyMedia.service';
import { MediaFilesService } from '@/services/mediaFiles.service';
import { FileUploadService } from '@/services/fileUpload.service';
import { StoryCreateRequest, StoryUpdateRequest, StoryQueryParams } from '@/types/story';

// ─── QUERY KEYS ──────────────────────────────────────────────────────────────
export const STORY_KEYS = {
  all: ['stories'] as const,
  lists: () => [...STORY_KEYS.all, 'list'] as const,
  list: (filters: string) => [...STORY_KEYS.lists(), { filters }] as const,
  details: () => [...STORY_KEYS.all, 'detail'] as const,
  detail: (id: number) => [...STORY_KEYS.details(), id] as const,
};

// ─── QUERIES ─────────────────────────────────────────────────────────────────

/**
 * Fetch danh sách Stories hỗ trợ Cuộn trang liên tục (Infinite Scroll)
 */
export const useInfiniteStories = (params?: Omit<StoryQueryParams, 'page'>) => {
  return useInfiniteQuery({
    queryKey: STORY_KEYS.list(JSON.stringify(params)),
    queryFn: async ({ pageParam = 0 }) => {
      // Gọi service, truyền tham số kết hợp pageParam
      const response = await StoryService.getStories({ ...params, page: pageParam as number });
      return response;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      // lastPage là PageResponse<Story>
      if (lastPage.number < lastPage.totalPages - 1) {
        return lastPage.number + 1; // page tiếp theo
      }
      return undefined; // Không còn trang nào
    },
  });
};

/**
 * Lấy chi tiết 1 Story bằng ID
 */
export const useStoryById = (id: number) => {
  return useQuery({
    queryKey: STORY_KEYS.detail(id),
    queryFn: () => StoryService.getStoryById(id),
    enabled: !!id, // Chỉ fetch nếu id tồn tại hợp lệ
  });
};

// ─── STORY MEDIA KEYS ────────────────────────────────────────────────────────
export const STORY_MEDIA_KEYS = {
  all: ['storyMedia'] as const,
  byStory: (storyId: number) => [...STORY_MEDIA_KEYS.all, storyId] as const,
};

/**
 * Fetch toàn bộ ảnh đính kèm của 1 Story (bao gồm blob URL để hiển thị)
 */
export const useStoryMedia = (storyId: number) => {
  return useQuery({
    queryKey: STORY_MEDIA_KEYS.byStory(storyId),
    queryFn: async () => {
      const storyMediaList = await StoryMediaService.getStoryMediaByStoryId(storyId);
      if (!storyMediaList || storyMediaList.length === 0) return [];

      const results = await Promise.all(
        storyMediaList.map(async (sm) => {
          try {
            const fileObj = await MediaFilesService.getMediaFileById(sm.mediaId);
            const blobUrl = await FileUploadService.fetchImageBlobUrl(fileObj.urlPath);
            return {
              id: sm.id,
              mediaFileId: sm.mediaId,
              fileKey: fileObj.urlPath,
              blobUrl,
              isNew: false as const,
            };
          } catch {
            return null;
          }
        })
      );
      return results.filter(Boolean) as Array<{ id: number; mediaFileId: number; fileKey: string; blobUrl: string; isNew: false }>;
    },
    enabled: !!storyId,
    staleTime: 2 * 60 * 1000,
  });
};


// ─── MUTATIONS ───────────────────────────────────────────────────────────────

/**
 * Hook tạo mới bài viết. Sau khi tạo xong sẽ tự động làm mới lại toàn bộ list stories.
 */
export const useCreateStory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: StoryCreateRequest) => StoryService.createStory(data),
    onSuccess: () => {
      // Khi thêm thành công, xóa cache hiện tại bắt buộc phải load data mới lại nhưng dưới dạng "Ngầm" (Background Refetch)
      queryClient.invalidateQueries({ queryKey: STORY_KEYS.lists() });
    },
  });
};

/**
 * Hook cập nhật bài viết. Làm mới lại cả danh sách lẫn chi tiết.
 */
export const useUpdateStory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: StoryUpdateRequest }) => StoryService.updateStory(id, data),
    onSuccess: (data, variables) => {
      // Invalidate toàn bộ lists
      queryClient.invalidateQueries({ queryKey: STORY_KEYS.lists() });
      // Invalidate chính story đang update (nếu ai đó đang mở chi tiết)
      queryClient.invalidateQueries({ queryKey: STORY_KEYS.detail(variables.id) });
    },
  });
};

/**
 * Hook xóa bài viết.
 */
export const useDeleteStory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => StoryService.deleteStory(id),
    onSuccess: () => {
      // Reload lại lists ngầm tránh phải f5
      queryClient.invalidateQueries({ queryKey: STORY_KEYS.lists() });
    },
  });
};
