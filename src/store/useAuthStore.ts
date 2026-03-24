import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Profile } from '@/types/auth';

interface AuthState {
    // --- STATE ---
    accessToken: string | null;
    user: User | null;
    profile: Profile | null;

    // --- ACTIONS ---
    // Gọi khi Login thành công và lấy được Token
    setToken: (token: string) => void;

    // Gọi khi fetch được thông tin User (từ /api/v1/users/me)
    setUser: (user: User) => void;

    // Gọi khi fetch được Profile hoặc sau khi user tạo/update Profile
    setProfile: (profile: Profile) => void;

    // Hàm tiện ích: Cập nhật toàn bộ (thường dùng lúc khởi tạo app nếu đã có đủ data)
    setAuth: (token: string, user: User, profile?: Profile | null) => void;

    // Đăng xuất: Xoá sạch dữ liệu
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            // Khởi tạo state mặc định
            accessToken: null,
            user: null,
            profile: null,

            // Triển khai các actions
            setToken: (token) => set({ accessToken: token }),

            setUser: (user) => set({ user }),

            setProfile: (profile) => set({ profile }),

            setAuth: (token, user, profile = null) =>
                set({ accessToken: token, user, profile }),

            logout: () =>
                set({ accessToken: null, user: null, profile: null }),
        }),
        {
            // Tên key sẽ được lưu trữ dưới LocalStorage của trình duyệt
            name: 'a-story-auth-storage',
        }
    )
);