"use client";

/**
 * TokenRefreshProvider
 * ─────────────────────────────────────────────────────────────────────────────
 * Component này được mount 1 lần ở root layout.
 */

import { useEffect, useRef } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { authService } from "@/services/auth.service";

const CHECK_INTERVAL_MS = 60 * 1000;
const REFRESH_THRESHOLD_MS = 5 * 60 * 1000;

export function TokenRefreshProvider({ children }: { children: React.ReactNode }) {
    const isRefreshingRef = useRef(false);

    useEffect(() => {
        const checkAndRefresh = async () => {
            const { accessToken, refreshToken, expiresAt, logout } = useAuthStore.getState();

            // Nếu chưa đăng nhập thì không cần làm gì
            if (!accessToken || !refreshToken || !expiresAt) return;

            const timeUntilExpiry = expiresAt - Date.now();

            // 1. Đã hết hạn hoặc sắp hết hạn trong vòng ngưỡng
            if (timeUntilExpiry <= REFRESH_THRESHOLD_MS) {
                // Nếu không có refresh token -> Không thể gia hạn -> Đẩy ra trang chủ
                if (!refreshToken) {
                    console.warn('[TokenRefreshProvider] Token hết hạn và không có refresh token -> Logout');
                    logout();
                    window.location.href = '/?expired=1';
                    return;
                }

                if (isRefreshingRef.current) return;
                isRefreshingRef.current = true;

                console.log(
                    `[TokenRefreshProvider] Token hết hạn sau ${Math.round(timeUntilExpiry / 1000)}s — tiến hành làm mới...`
                );

                try {
                    await authService.refreshAccessToken();
                } finally {
                    isRefreshingRef.current = false;
                }
            }
        };

        // Kiểm tra ngay khi mount
        checkAndRefresh();

        const timer = setInterval(checkAndRefresh, CHECK_INTERVAL_MS);
        return () => clearInterval(timer);
    }, []);

    return <>{children}</>;
}
