"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/useAuthStore";
import { Loader2 } from "lucide-react";

export default function CallbackPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const isProcessing = useRef(false);

    const [statusMessage, setStatusMessage] = useState("Đang kết nối tài khoản của bạn...");
    const [hasError, setHasError] = useState(false);

    const setToken = useAuthStore((state) => state.setToken);
    const setAuth = useAuthStore((state) => state.setAuth);

    useEffect(() => {
        if (isProcessing.current) return;

        const processAuthCallback = async () => {
            isProcessing.current = true;

            // Bước 1: Lấy code từ URL
            const code = searchParams.get("code");

            if (!code) {
                setHasError(true);
                setStatusMessage("Đăng nhập thất bại: Không tìm thấy mã xác thực.");
                setTimeout(() => router.push("/"), 3000);
                return;
            }

            // Bước 2: Lấy code_verifier từ Session Storage
            const codeVerifier = sessionStorage.getItem("pkce_code_verifier");

            if (!codeVerifier) {
                setHasError(true);
                setStatusMessage("Lỗi bảo mật: Không tìm thấy khóa xác thực. Đang quay lại...");
                setTimeout(() => router.push("/"), 3000);
                return;
            }

            try {
                setStatusMessage("Đang thiết lập không gian của bạn...");

                // Bước 3: Đổi mã code lấy Token từ Backend
                const tokenResponse = await authService.exchangeToken(code, codeVerifier);

                setToken(tokenResponse.access_token);

                // Bước 4 & 5: Lấy thông tin User Profile hiện tại
                const userData = await authService.getCurrentUser();

                setAuth(tokenResponse.access_token, userData);

                sessionStorage.removeItem("pkce_code_verifier");

                setStatusMessage("Hoàn tất! Đang vào trang chủ...");

                // Bước 6: Đăng nhập thành công, chuyển thẳng vào trang Timeline / Home
                setTimeout(() => {
                    router.push("/home");
                }, 500);

            } catch (error) {
                console.error("Lỗi trong quá trình đăng nhập:", error);
                setHasError(true);
                setStatusMessage("Có lỗi xảy ra khi đăng nhập. Vui lòng thử lại sau.");

                sessionStorage.removeItem("pkce_code_verifier");
                setTimeout(() => router.push("/"), 3000);
            }
        };

        processAuthCallback();
    }, [searchParams, router, setToken, setAuth]);

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
            <div className="max-w-md flex flex-col items-center gap-6">

                {!hasError ? (
                    <Loader2 className="w-16 h-16 text-blue-700 animate-spin" strokeWidth={2.5} />
                ) : (
                    <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-2xl">
                        !
                    </div>
                )}

                <h1 className={`text-2xl md:text-3xl font-bold ${hasError ? "text-red-700" : "text-gray-900"}`}>
                    {statusMessage}
                </h1>

                <p className="text-lg text-gray-600 font-medium">
                    {!hasError && "Vui lòng đợi một lát, đừng đóng trình duyệt nhé."}
                </p>

            </div>
        </div>
    );
}