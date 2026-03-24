import axios from 'axios';
import { apiClient } from '@/lib/axios';
import { TokenResponse, User, UserCreateRequest } from '@/types/auth';

const AUTH_TOKEN_URL = process.env.NEXT_PUBLIC_AUTH_URL || 'http://localhost:9084/oauth2/token';

export const authService = {
    /**
     * 1. Đổi Authorization Code lấy Access Token (Chuẩn SPA Client - PKCE Flow)
     * API: POST /oauth2/token
     * Content-Type: application/x-www-form-urlencoded
     */
    exchangeToken: async (code: string, codeVerifier: string): Promise<TokenResponse> => {
        const params = new URLSearchParams();
        params.append('grant_type', 'authorization_code');
        params.append('client_id', 'spa-client');
        params.append('code', code);
        params.append('redirect_uri', 'http://localhost:3000/callback');
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
        const response = await apiClient.get<User>('/users/me');
        return response.data;
    },

    /**
     * 3. Đăng ký Tài khoản mới
     * API: POST /api/v1/users
     */
    register: async (data: UserCreateRequest): Promise<User> => {
        const response = await apiClient.post<User>('/users', data);
        return response.data;
    },

    getLoginUrl: (codeChallenge: string) => {
        const authServerUrl = 'http://localhost:9084/oauth2/authorize';
        const clientId = 'spa-client';
        const redirectUri = encodeURIComponent('http://localhost:3000/callback');
        const scope = encodeURIComponent('openid profile');

        return `${authServerUrl}?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&code_challenge=${codeChallenge}&code_challenge_method=S256`;
    }
};