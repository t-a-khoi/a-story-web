import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Profile } from '@/types/auth';

interface AuthState {
    accessToken: string | null;
    refreshToken: string | null;
    expiresAt: number | null;
    user: User | null;
    profile: Profile | null;
    _hasHydrated: boolean;

    setToken: (token: string) => void;
    setUser: (user: User) => void;
    setProfile: (profile: Profile) => void;
    /** Lưu toàn bộ thông tin token (access + refresh + expiry) */
    setTokens: (accessToken: string, refreshToken: string | null, expiresIn: number) => void;
    setAuth: (token: string, user: User, profile?: Profile | null) => void;
    setHasHydrated: (state: boolean) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            accessToken: null,
            refreshToken: null,
            expiresAt: null,
            user: null,
            profile: null,
            _hasHydrated: false,

            setToken: (token) => set({ accessToken: token }),

            setUser: (user) => set({ user }),

            setProfile: (profile) => set({ profile }),

            setHasHydrated: (state) => set({ _hasHydrated: state }),

            setTokens: (accessToken, refreshToken, expiresIn) =>
                set({
                    accessToken,
                    refreshToken,
                    // Trừ 60 giây buffer để refresh sớm hơn hết hạn
                    expiresAt: Date.now() + (expiresIn - 60) * 1000,
                }),

            setAuth: (token, user, profile = null) =>
                set({ accessToken: token, user, profile }),

            logout: () =>
                set({ accessToken: null, refreshToken: null, expiresAt: null, user: null, profile: null }),
        }),
        {
            name: 'a-story-auth-storage',
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated(true);
            },
        }
    )
);