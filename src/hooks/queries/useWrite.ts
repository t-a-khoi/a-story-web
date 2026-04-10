import { useMutation, useQueryClient } from "@tanstack/react-query";
import { StoryService } from "@/services/stories.service";
import { StoryMediaService } from "@/services/storyMedia.service";
import { useAuthStore } from "@/store/useAuthStore";
import { STORY_KEYS } from "./useStories";

export const useCreateStory = () => {
    const queryClient = useQueryClient();
    const { user, profile } = useAuthStore();

    return useMutation({
        mutationFn: async ({ title, content, catId, mediaIds }: { title: string, content: string, catId: number | null, mediaIds: number[] }) => {
            if (!user?.id || !profile?.id) throw new Error("No user or profile ID");

            const responseData = await StoryService.createStory({
                userId: user.id,
                profileId: profile.id,
                catId: catId || null,
                title: title.trim(),
                content: content.trim()
            });

            if (mediaIds.length > 0 && responseData.id) {
                await Promise.all(mediaIds.map((mediaId) =>
                    StoryMediaService.createStoryMedia({
                        storyId: responseData.id,
                        mediaId: mediaId,
                        caption: ""
                    })
                ));
            }

            return responseData;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: STORY_KEYS.all });
            queryClient.invalidateQueries({ queryKey: STORY_KEYS.lists() });
        }
    });
};
