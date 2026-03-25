"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/useAuthStore"; // Giả định bạn dùng Zustand ở đây
import { Loader2, AlertCircle } from "lucide-react";

export default function CallbackPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [error, setError] = useState<string | null>(null);
    const setAuth = useAuthStore((state: any) => state.setAuth); // Hàm lưu token & user

    // Dùng useRef để tránh gọi API 2 lần trong React Strict Mode
    const isProcessing = useRef(false);

    useEffect(() => {
        const processAuth = async () => {
            if (isProcessing.current) return;
            isProcessing.current = true;

            const code = searchParams.get("code");
            const verifier = sessionStorage.getItem("pkce_code_verifier");

            if (!code || !verifier) {
                setError("Không tìm thấy thông tin xác thực. Vui lòng đăng nhập lại.");
                return;
            }

            try {
                // 1. Đổi Code lấy Access Token
                const tokenResponse = await authService.exchangeToken(code, verifier);

                // 2. Lấy thông tin User hiện tại (cần cấu hình axios để dùng token vừa lấy)
                // Lưu ý: Tạm lưu token vào localStorage/store trước khi gọi getCurrentUser
                localStorage.setItem("accessToken", tokenResponse.access_token);
                const user = await authService.getCurrentUser();

                // 3. Lưu vào Zustand Store
                if (setAuth) {
                    setAuth(tokenResponse.access_token, user);
                }

                // 4. Xóa verifier và chuyển hướng vào trang chủ
                sessionStorage.removeItem("pkce_code_verifier");
                router.push("/home");

            } catch (err) {
                console.error("Lỗi xác thực:", err);
                setError("Quá trình đăng nhập thất bại. Vui lòng thử lại.");
            }
        };

        processAuth();
    }, [searchParams, router, setAuth]);

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
            {error ? (
                <div className="bg-red-50 p-8 rounded-3xl border-2 border-red-200 max-w-lg w-full space-y-6">
                    <AlertCircle className="w-16 h-16 text-red-600 mx-auto" />
                    <h1 className="text-3xl font-bold text-gray-900">Đã có lỗi xảy ra</h1>
                    <p className="text-xl text-gray-800">{error}</p>
                    <button
                        onClick={() => router.push("/")}
                        className="min-h-[56px] w-full px-6 py-3 bg-gray-900 text-white rounded-xl text-xl font-bold hover:bg-gray-800 transition"
                    >
                        Quay lại trang chủ
                    </button>
                </div>
            ) : (
                <div className="space-y-8 flex flex-col items-center">
                    <Loader2 className="w-20 h-20 text-emerald-700 animate-spin" />
                    <h1 className="text-3xl font-bold text-gray-900">Đang chuẩn bị không gian của bạn...</h1>
                    <p className="text-xl text-gray-600 font-medium">Xin vui lòng đợi trong giây lát.</p>
                </div>
            )}
        </div>
    );
}