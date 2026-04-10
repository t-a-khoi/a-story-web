import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SettingsService } from "@/services/settings.service";
import { useAuthStore } from "@/store/useAuthStore";
import { useLanguageStore } from "@/store/useLanguageStore";

export const settingsKeys = {
    all: ['settings'] as const,
    mySettings: (userId: number) => [...settingsKeys.all, 'detail', userId] as const,
};

export const useMySettings = () => {
    const { user, accessToken } = useAuthStore();
    const setGlobalLanguage = useLanguageStore(state => state.setLanguage);

    return useQuery({
        queryKey: settingsKeys.mySettings(user?.id || 0),
        queryFn: async () => {
            if (!user?.id) throw new Error("No user ID");
            const res = await SettingsService.searchSettings({
                filters: [
                    { field: "userId", operator: "EQUAL", value: user.id },
                    { field: "deleted", operator: "EQUAL", value: false }
                ],
                pagination: { page: 0, size: 1 }
            });

            const config = res.content?.[0] || null;
            if (config?.general?.language) {
                setGlobalLanguage(config.general.language as any);
            }
            return config;
        },
        enabled: !!user?.id && !!accessToken,
        staleTime: 5 * 60 * 1000,
    });
};

export const useSaveSettings = () => {
    const queryClient = useQueryClient();
    const { user } = useAuthStore();

    return useMutation({
        mutationFn: async ({ settingId, payload }: { settingId: number | null, payload: any }) => {
            if (settingId) {
                return SettingsService.updateSettings(settingId, payload);
            } else {
                return SettingsService.createSettings(payload);
            }
        },
        onSuccess: () => {
            if (user?.id) {
                queryClient.invalidateQueries({ queryKey: settingsKeys.mySettings(user.id) });
            }
        }
    });
};
