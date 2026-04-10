import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/store/useAuthStore';
import { authService } from '@/services/auth.service';
import { handleServerError } from './errors/serverErrors';
import { handleClientError } from './errors/clientErrors';

// Proxy path: browser → localhost:3000/api/gateway → (server-side) → backend
const BASE_URL = '/api/gateway';

export const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    // Chặn Timeout 15s tránh treo user ở màn hình loading
    timeout: 15000, 
});

// ─── Token Refresh Queue ─────────────────────────────────────────────────────
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

// ─── Request Interceptor ─────────────────────────────────────────────────────
apiClient.interceptors.request.use(
    (config) => {
        if (typeof window === 'undefined') return config;

        const state = useAuthStore.getState();
        // Lấy token chuẩn từ trạng thái
        const token = state.accessToken || localStorage.getItem('accessToken');

        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// ─── Response Interceptor ────────────────────────────────────────────────────
apiClient.interceptors.response.use(
    // [SUCCESS]
    (response) => response,

    // [ERROR]
    async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        // 1. Phân loại lỗi Network / Client Error (Mất mạng, CORS, Timeout)
        if (!error.response) {
            const friendlyMessage = handleClientError(error, originalRequest?.url);
            return Promise.reject(new Error(friendlyMessage));
        }

        // 2. Phân loại lỗi Server Error
        const status = error.response.status;

        // Xử lý đặc thù lỗi 401 (Hết hạn Token / Unauthorized)
        if (status === 401 && originalRequest && !originalRequest._retry) {
            if (typeof window === 'undefined') return Promise.reject(error);

            const state = useAuthStore.getState();

            // Rớt thẳng ra ngoài nếu không còn Refresh Token
            if (!state.refreshToken) {
                state.logout();
                window.location.href = '/?expired=1';
                return Promise.reject(new Error('Session has expired.'));
            }

            // Đang có tiến trình refresh khác chạy -> đưa request vào queue chờ
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

            // Tiến hành Refresh Token
            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const ok = await authService.refreshAccessToken();
                if (!ok) throw new Error("Refresh failed");

                const newToken = useAuthStore.getState().accessToken;
                processQueue(null, newToken);

                originalRequest.headers = {
                    ...originalRequest.headers,
                    Authorization: `Bearer ${newToken}`,
                };
                return apiClient(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                // Nếu refresh thất bại, logout hoàn toàn
                useAuthStore.getState().logout();
                window.location.href = '/?expired=1';
                return Promise.reject(new Error('Session has expired. Please log in again.'));
            } finally {
                isRefreshing = false;
            }
        }

        // 3. Mapping lỗi giao diện với serverErrors.ts cho các mã cứng Backend trả về
        const friendlyMessage = handleServerError(error, originalRequest?.url);
        
        // Throw Error chứa thông báo thân thiện để UI không phải tự parse lại
        return Promise.reject(new Error(friendlyMessage));
    }
);