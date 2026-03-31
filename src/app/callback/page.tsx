"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authService } from "@/services/auth.service";
import { Loader2, AlertCircle } from "lucide-react";

function CallbackContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const isProcessing = useRef(false);

    useEffect(() => {
        const handleAuth = async () => {
            if (isProcessing.current) return;
            isProcessing.current = true;

            const code = searchParams.get("code");
            if (!code) {
                setError("Không tìm thấy mã xác thực. Vui lòng đăng nhập lại.");
                return;
            }

            try {
                // Toàn bộ logic giải mã token, lấy thông tin user đã được chuyển vào authService
                await authService.handleCallback(code);
                
                // Chuyển hướng tới trang chủ sau khi xử lý thành công
                router.push("/home");
            } catch (err: any) {
                console.error("Lỗi callback:", err);
                setError(err.message || "Lỗi trong quá trình xác thực");
            }
        };

        handleAuth();
    }, [searchParams, router]);

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

export default function CallbackPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
                <div className="space-y-8 flex flex-col items-center">
                    <Loader2 className="w-20 h-20 text-emerald-700 animate-spin" />
                    <h1 className="text-3xl font-bold text-gray-900">Đang chuẩn bị không gian của bạn...</h1>
                    <p className="text-xl text-gray-600 font-medium">Xin vui lòng đợi trong giây lát.</p>
                </div>
            </div>
        }>
            <CallbackContent />
        </Suspense>
    );
}