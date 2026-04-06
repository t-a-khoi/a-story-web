import axios, { AxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/store/useAuthStore';
import { authService } from '@/services/auth.service';

// Proxy path: browser → localhost:3000/api/gateway → (server-side) → backend
const BASE_URL = '/api/gateway';

export const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

// ─── Token Refresh Queue ─────────────────────────────────────────────────────
// Đảm bảo chỉ có 1 request refresh chạy tại 1 thời điểm.
let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(({ resolve, reject }) => {
        if (error) {
            reject(error);
        } else {
            resolve(token);
        }
    });
    failedQueue = [];
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Trả về true nếu token sẽ hết hạn trong vòng 5 phút tới */
const isTokenExpiringSoon = (): boolean => {
    const expiresAt = useAuthStore.getState().expiresAt;
    if (!expiresAt) return false;
    const fiveMinutesMs = 5 * 60 * 1000;
    return Date.now() >= expiresAt - fiveMinutesMs;
};

// ─── Request Interceptor ─────────────────────────────────────────────────────
apiClient.interceptors.request.use(
    async (config) => {
        if (typeof window === 'undefined') return config;

        const state = useAuthStore.getState();
        let token = state.accessToken || localStorage.getItem('accessToken');

        // Proactive refresh: nếu token sắp hết hạn và có refresh token
        if (token && isTokenExpiringSoon() && state.refreshToken && !isRefreshing) {
            isRefreshing = true;
            try {
                const ok = await authService.refreshAccessToken();
                if (ok) {
                    token = useAuthStore.getState().accessToken;
                }
                processQueue(null, token);
            } catch (err) {
                processQueue(err, null);
            } finally {
                isRefreshing = false;
            }
        }

        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// ─── Response Interceptor ────────────────────────────────────────────────────
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        if (error.response?.status !== 401 || originalRequest._retry) {
            return Promise.reject(error);
        }

        if (typeof window === 'undefined') return Promise.reject(error);

        const state = useAuthStore.getState();

        // Không có refresh token → logout ngay
        if (!state.refreshToken) {
            state.logout();
            window.location.href = '/';
            return Promise.reject(error);
        }

        // Đang refresh → đưa request vào queue chờ
        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            }).then((token) => {
                originalRequest.headers = {
                    ...originalRequest.headers,
                    Authorization: `Bearer ${token}`,
                };
                return apiClient(originalRequest);
            }).catch((err) => Promise.reject(err));
        }

        // Thực hiện refresh
        originalRequest._retry = true;
        isRefreshing = true;

        try {
            const ok = await authService.refreshAccessToken();
            if (!ok) return Promise.reject(error);

            const newToken = useAuthStore.getState().accessToken;
            processQueue(null, newToken);

            originalRequest.headers = {
                ...originalRequest.headers,
                Authorization: `Bearer ${newToken}`,
            };
            return apiClient(originalRequest);
        } catch (refreshError) {
            processQueue(refreshError, null);
            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
        }
    }
);