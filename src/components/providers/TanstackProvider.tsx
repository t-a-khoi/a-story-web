"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";

export function TanstackProvider({ children }: { children: React.ReactNode }) {
  // Sử dụng useState để đảm bảo QueryClient chỉ được tạo 1 lần duy nhất trong toàn bộ vòng đời component client
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Không tự động fetch lại khi người dùng vừa chuyển qua tab khác và quay lại (tránh tốn tài nguyên)
            refetchOnWindowFocus: false,
            // Đặt thời gian fresh của cache (ví dụ 10 giây) thay vì luôn gán là stale
            staleTime: 10 * 1000,
            // Retry mặc định 0 hoặc 1 lần nếu gặp lỗi mạng
            retry: 1,
            // Bỏ qua lỗi trong lúc render hiển thị ở console (đã có error handler quản lý)
            throwOnError: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Devtools này mặc định chỉ hiển thị ở process.env.NODE_ENV === 'development' */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
