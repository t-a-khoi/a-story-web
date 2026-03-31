// src/app/home/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react'; // Hoặc các icon khác bạn đang dùng
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/useAuthStore';
import MainLayout from '@/components/layout/MainLayout';

export default function HomePage() {
  const router = useRouter();

  // Rút trích các hàm và state từ Zustand Store
  const { accessToken, user, setUser, logout } = useAuthStore();

  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initHomePage = async () => {
      // 1. Nếu không có token -> Chống truy cập trái phép, đá về trang chủ
      if (!accessToken) {
        router.replace("/");
        return;
      }
      setIsInitializing(false);
    };

    initHomePage();
  }, [accessToken, user, router, setUser, logout]);

  // Giao diện chờ thân thiện (Đồng bộ với các trang khác)
  if (isInitializing) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <Loader2 className="w-12 h-12 text-emerald-700 animate-spin" />
          <p className="text-lg text-stone-800 font-medium">Đang chuẩn bị không gian của bác...</p>
        </div>
      </MainLayout>
    );
  }

  // Khai báo tên hiển thị (Ưu tiên fullName, nếu không có thì fallback)
  const displayName = user?.fullName || user?.username || "Bác";

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto space-y-8 pb-20">

        {/* Banner chào mừng */}
        <div className="bg-emerald-800 rounded-3xl p-8 md:p-10 shadow-md">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            Chào mừng, {displayName}!
          </h1>
          <p className="text-emerald-100 text-lg mt-3">
            Hôm nay bác muốn lưu giữ kỷ niệm nào?
          </p>
        </div>

        {/* ... (Các phần hiển thị danh sách Story cũ của bạn) ... */}

      </div>
    </MainLayout>
  );
}