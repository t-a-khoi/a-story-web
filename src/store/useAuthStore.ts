import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Profile } from '@/types/auth';

interface AuthState {
    accessToken: string | null;
    user: User | null;
    profile: Profile | null;

    setToken: (token: string) => void;
    setUser: (user: User) => void;
    setProfile: (profile: Profile) => void;
    setAuth: (token: string, user: User, profile?: Profile | null) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            accessToken: null,
            user: null,
            profile: null,

            setToken: (token) => set({ accessToken: token }),

            setUser: (user) => set({ user }),

            setProfile: (profile) => set({ profile }),

            setAuth: (token, user, profile = null) =>
                set({ accessToken: token, user, profile }),

            logout: () =>
                set({ accessToken: null, user: null, profile: null }),
        }),
        {
            name: 'a-story-auth-storage',
        }
    )
);