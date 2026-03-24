'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/useAuthStore';

export default function CallbackPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Trạng thái để thông báo cho người lớn tuổi biết hệ thống đang làm gì
    const [status, setStatus] = useState('Đang kiểm tra thông tin đăng nhập...');
    const [error, setError] = useState('');

    // Dùng useRef để chặn React 18 Strict Mode gọi API 2 lần trong môi trường Dev
    const hasFetched = useRef(false);

    useEffect(() => {
        if (hasFetched.current) return;
        hasFetched.current = true;

        const code = searchParams.get('code');
        const authError = searchParams.get('error');

        if (authError) {
            setError('Đăng nhập bị từ chối hoặc có lỗi từ hệ thống.');
            return;
        }

        if (!code) {
            setError('Không tìm thấy mã xác thực. Vui lòng quay lại trang đăng nhập.');
            return;
        }

        const processLogin = async () => {
            try {
                // Trong luồng PKCE, verifier thường được lưu vào sessionStorage trước khi redirect sang trang Login
                // Tôi để tạm 'mock-verifier' nếu bạn đang test Postman, nhưng thực tế phải lấy từ sessionStorage
                const codeVerifier = sessionStorage.getItem('pkce_code_verifier') || 'mock-verifier-123';

                setStatus('Đang thiết lập kết nối an toàn...');
                const tokenResponse = await authService.exchangeToken(code, codeVerifier);

                // 1. Lưu Token vào Zustand (sẽ tự động lưu xuống LocalStorage)
                useAuthStore.getState().setToken(tokenResponse.access_token);

                setStatus('Đang tải thông tin cá nhân của bạn...');
                // 2. Lấy thông tin User hiện tại
                const user = await authService.getCurrentUser();
                useAuthStore.getState().setUser(user);

                // Dọn dẹp verifier cũ cho an toàn
                sessionStorage.removeItem('pkce_code_verifier');

                setStatus('Thành công! Đang đưa bạn vào trang chính...');

                // 3. Chuyển hướng người dùng. 
                // Sau này chúng ta có thể thêm logic: Nếu user chưa có Profile thì đẩy sang '/onboarding'
                setTimeout(() => {
                    router.push('/');
                }, 1000); // Thêm delay 1s để người dùng kịp đọc dòng "Thành công"

            } catch (err) {
                console.error('Lỗi khi xử lý callback:', err);
                setError('Đã có sự cố xảy ra trong lúc đăng nhập. Vui lòng thử lại sau.');
            }
        };

        processLogin();
    }, [searchParams, router]);

    // Giao diện thiết kế thân thiện cho người lớn tuổi (Chữ to, rõ ràng, độ tương phản cao)
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-8 text-center border border-slate-100">
                {error ? (
                    <div className="space-y-6">
                        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto text-2xl">
                            !
                        </div>
                        <h1 className="text-xl font-semibold text-slate-900">Đăng nhập không thành công</h1>
                        <p className="text-lg text-slate-600">{error}</p>
                        <button
                            onClick={() => router.push('/login')}
                            className="mt-4 w-full min-h-[48px] bg-slate-900 text-white text-lg font-medium rounded-xl hover:bg-slate-800 transition-colors px-6 py-3"
                        >
                            Quay lại trang Đăng nhập
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Vòng tròn Loading đơn giản, nhẹ nhàng */}
                        <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin mx-auto"></div>
                        <h1 className="text-xl font-semibold text-slate-900">Vui lòng đợi một chút</h1>
                        <p className="text-lg text-slate-600">{status}</p>
                    </div>
                )}
            </div>
        </div>
    );
}