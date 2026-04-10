import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ProfileService } from "@/services/profile.service";
import { ProfilesCreateRequest, ProfilesUpdateRequest } from "@/types/profile";
import { useAuthStore } from "@/store/useAuthStore";

export const profileKeys = {
    all: ['profiles'] as const,
    myProfile: () => ['my-profile'] as const,
    detail: (id: number) => [...profileKeys.all, 'detail', id] as const,
};

export const useMyProfile = () => {
    const { accessToken } = useAuthStore();
    return useQuery({
        queryKey: profileKeys.myProfile(),
        queryFn: () => ProfileService.getMyProfile(),
        enabled: !!accessToken,
        retry: (failureCount, error: any) => {
            // Không retry nếu lỗi 404 (chưa tạo profile)
            if (error?.response?.status === 404) return false;
            return failureCount < 3;
        }
    });
};

export const useCreateProfile = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: ProfilesCreateRequest) => ProfileService.createProfile(data),
        onSuccess: (newProfile) => {
            queryClient.setQueryData(profileKeys.myProfile(), newProfile);
            queryClient.invalidateQueries({ queryKey: profileKeys.all });
            
            // Cập nhật profile rỗng trong authStore nếu cần
            const { user, accessToken, setAuth } = useAuthStore.getState();
            if (user && accessToken) {
                 setAuth(accessToken, user, newProfile as any);
            }
        }
    });
};

export const useUpdateProfile = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: number, data: ProfilesUpdateRequest }) => ProfileService.updateProfile(id, data),
        onSuccess: (updatedProfile) => {
            queryClient.setQueryData(profileKeys.myProfile(), updatedProfile);
            queryClient.invalidateQueries({ queryKey: profileKeys.detail(updatedProfile.id) });
            
            const { user, accessToken, setAuth } = useAuthStore.getState();
            if (user && accessToken) {
                 setAuth(accessToken, user, updatedProfile as any);
            }
        }
    });
};
