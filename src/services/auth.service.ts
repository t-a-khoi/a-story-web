import axios from 'axios';
import { apiClient } from '@/lib/axios';
import { TokenResponse, User, UserCreateRequest } from '@/types/auth';
import { useAuthStore } from '@/store/useAuthStore';

const AUTH_TOKEN_URL = process.env.NEXT_PUBLIC_AUTH_URL + '/oauth2/token';

export const authService = {
    /**
     * 1. Đổi Authorization Code lấy Access Token (Chuẩn SPA Client - PKCE Flow)
     * API: POST /oauth2/token
     * Content-Type: application/x-www-form-urlencoded
     */
    exchangeToken: async (code: string, codeVerifier: string): Promise<TokenResponse> => {
        const params = new URLSearchParams();
        params.append('grant_type', 'authorization_code');
        params.append('client_id', process.env.NEXT_PUBLIC_CLIENT_ID || 'spa-client');
        params.append('code', code);
        params.append('redirect_uri', process.env.NEXT_PUBLIC_REDIRECT_URI || 'http://localhost:3000/callback');
        params.append('code_verifier', codeVerifier);

        const response = await axios.post<TokenResponse>(AUTH_TOKEN_URL, params, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
        return response.data;
    },

    /**
    * 2. Lấy thông tin User hiện tại sau khi đã có Token
    * API: GET /api/v1/users/me
    */
    getCurrentUser: async (): Promise<User> => {
        const response = await apiClient.get<User>('ph-story-users-service/api/v1/users/me');
        return response.data;
    },

    /**
     * 2.5 Lấy thông tin Profile cơ bản sau khi login
     * API: POST /api/v1/profiles/search (Tạm thay thế profiles/me)
     */
    getCurrentProfile: async (userId: number): Promise<any> => {
        try {
            const response = await apiClient.post('ph-story-mvp-service/api/v1/profiles/search', {
                filters: [{ field: "userId", operator: "EQUAL", value: userId }],
                pagination: { page: 0, size: 1 }
            });
            return response.data?.content?.[0] || null;
        } catch (error) {
            console.warn("Failed to get current profile", error);
            return null; // An toàn trả về null thay vì crash luồng Callback
        }
    },

     /**
     * 3. Đăng ký Tài khoản mới
     * API: POST /api/v1/users
     */
    register: async (data: UserCreateRequest): Promise<User> => {
        const response = await apiClient.post<User>('ph-story-users-service/api/v1/users/register', data);
        return response.data;
    },

    getLoginUrl: (codeChallenge: string) => {
        const authServerUrl = `${process.env.NEXT_PUBLIC_AUTH_SERVER_URL || 'http://localhost:9094'}/oauth2/authorize`;
        const clientId = process.env.NEXT_PUBLIC_CLIENT_ID || 'spa-client';
        const redirectUri = encodeURIComponent(process.env.NEXT_PUBLIC_REDIRECT_URI || 'http://localhost:3000/callback');
        const scope = encodeURIComponent('openid profile');

        return `${authServerUrl}?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&code_challenge=${codeChallenge}&code_challenge_method=S256&prompt=login`;
    },

    /**
     * Xử lý callback sau khi đăng nhập thành công từ Auth Server
     */
    // handleCallback: async (code: string): Promise<void> => {
    //     const codeVerifier = sessionStorage.getItem("pkce_code_verifier");

    //     if (!codeVerifier) {
    //         throw new Error("Không tìm thấy mã xác thực. Vui lòng đăng nhập lại.");
    //     }

    //     try {
    //         // 1. Phục hồi access token từ code
    //         const tokenResponse = await authService.exchangeToken(code, codeVerifier);

    //         console.log("TOKEN RESPONSE:", tokenResponse);

    //         // 2. Lưu tokens vào store (access + refresh + expiry)
    //         const authStore = useAuthStore.getState();
    //         authStore.setTokens(
    //             tokenResponse.access_token,
    //             tokenResponse.refresh_token ?? null,
    //             tokenResponse.expires_in,
    //         );

    //         // 3. Lấy thông tin User hiện tại
    //         const user = await authService.getCurrentUser();

    //         // 3.5 Lấy thông tin Profile (nếu có)
    //         let profile = null;
    //         try {
    //             profile = await authService.getCurrentProfile();
    //         } catch (err) {
    //             console.warn("Người dùng này chưa có profile", err);
    //         }

    //         // 4. Lưu thông tin User/Profile vào store
    //         authStore.setAuth(authStore.accessToken!, user, profile);

    //         // 5. Dọn dẹp session sau khi hoàn thành
    //         sessionStorage.removeItem("pkce_code_verifier");
    //     } catch (error) {
    //         useAuthStore.getState().logout();
    //         throw error;
    //     }
    // },

    handleCallback: async (code: string): Promise<void> => {
        const codeVerifier = sessionStorage.getItem("pkce_code_verifier");

        if (!codeVerifier) {
            throw new Error("Không tìm thấy mã xác thực. Vui lòng đăng nhập lại.");
        }

        try {
            const tokenResponse = await authService.exchangeToken(code, codeVerifier);

            console.log("TOKEN RESPONSE:", tokenResponse);

            const accessToken = tokenResponse.access_token;
            const refreshToken = tokenResponse.refresh_token ?? null;
            const expiresIn = tokenResponse.expires_in;

            if (!accessToken) {
                throw new Error("Không nhận được access_token");
            }

            const authStore = useAuthStore.getState();

            // 1. Lưu token
            authStore.setTokens(accessToken, refreshToken, expiresIn);

            const user = await authService.getCurrentUser();

            let profile = null;
            try {
                if (user?.id) {
                    profile = await authService.getCurrentProfile(user.id);

                    // TH 1: Người dùng mới đăng ký (Có pendingProfile nhưng chưa có Profile)
                    if (!profile) {
                        const pendingInfoStr = sessionStorage.getItem('pendingProfile');
                        if (pendingInfoStr) {
                            try {
                                const pendingInfo = JSON.parse(pendingInfoStr);
                                const { ProfileService } = await import('@/services/profile.service');
                                profile = await ProfileService.createProfile({
                                    userId: user.id,
                                    fullname: pendingInfo.fullName,
                                    gender: pendingInfo.gender || 'MALE',
                                    dateOfBirth: pendingInfo.dateOfBirth,
                                    phoneNumber: pendingInfo.phoneNumber,
                                    address: pendingInfo.address,
                                    isDeceased: false,
                                });
                                console.log("[AuthFlow] Tự động tạo Profile thành công từ session bộ nhớ tạm!");
                            } catch (createErr) {
                                console.warn("[AuthFlow] Lỗi khi tạo auto profile", createErr);
                            } finally {
                                sessionStorage.removeItem('pendingProfile');
                            }
                        }
                    }
                }
            } catch (err) {
                console.warn("Lỗi tiến trình Profile", err);
            }

            // KHÔNG dùng lại store
            authStore.setAuth(accessToken, user, profile);

            sessionStorage.removeItem("pkce_code_verifier");

        } catch (error) {
            useAuthStore.getState().logout();
            throw error;
        }
    },

    /**
     * 4. Silent Refresh - Đổi refresh_token lấy access_token mới
     * Được gọi tự động trước khi access_token hết hạn 5 phút
     */
    refreshAccessToken: async (): Promise<boolean> => {
        const authStore = useAuthStore.getState();
        const refreshToken = authStore.refreshToken;

        if (!refreshToken) {
            console.warn('[TokenRefresh] Không có refresh token, bỏ qua.');
            return false;
        }

        try {
            const params = new URLSearchParams();
            params.append('grant_type', 'refresh_token');
            params.append('client_id', process.env.NEXT_PUBLIC_CLIENT_ID || 'spa-client');
            params.append('refresh_token', refreshToken);

            const response = await axios.post<TokenResponse>(AUTH_TOKEN_URL, params, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            });

            const { access_token, refresh_token, expires_in } = response.data;

            authStore.setTokens(
                access_token,
                refresh_token ?? refreshToken, // giữ lại refresh token cũ nếu server không trả cái mới
                expires_in,
            );

            console.log('[TokenRefresh] Token đã được làm mới thành công.');
            return true;
        } catch (error) {
            console.error('[TokenRefresh] Không thể làm mới token:', error);
            // Refresh thất bại → logout hoàn toàn
            authStore.logout();
            if (typeof window !== 'undefined') {
                window.location.href = '/';
            }
            return false;
        }
    },

    logout: () => {
        // 1. Xóa trạng thái trong Zustand store
        useAuthStore.getState().logout();

        // 2. Dọn dẹp toàn bộ dữ liệu định danh ở Local/Session Storage
        localStorage.removeItem("accessToken");
        localStorage.removeItem("a-story-auth-storage");
        sessionStorage.clear();

        // 3. Hard Redirect về trang chủ
        window.location.href = "/";
    }
};