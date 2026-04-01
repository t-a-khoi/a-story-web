// src/app/home/page.tsx
"use client";

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, PlusCircle, BookHeart, BookOpen, Trash2 } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import MainLayout from '@/components/layout/MainLayout';
import { Story } from '@/types/story';
import { StoryService } from '@/services/stories.service';
import StoryCard from '@/components/story/StoryCard';

export default function HomePage() {
  const router = useRouter();

  // 1. Context & State
  const { accessToken, user } = useAuthStore();
  const [isInitializing, setIsInitializing] = useState(true);
  const [isLoadingStories, setIsLoadingStories] = useState(false);
  
  // Dữ liệu danh sách câu chuyện (cộng dồn cho Infinite Scroll)
  const [stories, setStories] = useState<Story[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  
  const observerTarget = useRef<HTMLDivElement>(null);
  const pageSize = 10;
  
  // 2. Data Fetching
  const fetchMyStories = useCallback(async (currentPage: number) => {
    if (!user?.id) return;
    
    setIsLoadingStories(true);
    try {
      const response = await StoryService.getStories({
        page: currentPage,
        size: pageSize,
        sort: "createdDate,desc"
      });
      console.log("response", response);
      
      if (currentPage === 0) {
        setStories(response.content);
      } else {
        setStories(prev => [...prev, ...response.content]);
      }
      
      // Kiểm tra xem còn trang nào để cuộn tiếp không
      setHasMore(response.number < response.totalPages - 1 && !response.empty);
    } catch (error) {
      console.error("Lỗi khi tải danh sách kỷ niệm:", error);
    } finally {
      setIsLoadingStories(false);
    }
  }, [user?.id]);

  // 3. Effects
  useEffect(() => {
    if (!accessToken) {
      router.replace("/");
      return;
    }
    setIsInitializing(false);
  }, [accessToken, router]);

  useEffect(() => {
    if (!isInitializing && user?.id) {
      fetchMyStories(page);
    }
  }, [isInitializing, user?.id, page, fetchMyStories]);

  // Observer cho tính năng Infinite Scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !isLoadingStories) {
          setPage(prev => prev + 1);
        }
      },
      { threshold: 1.0 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) observer.unobserve(currentTarget);
    };
  }, [hasMore, isLoadingStories]);

  // State quản lý xóa
  const [storyToDelete, setStoryToDelete] = useState<Story | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // 4. Handlers
  const openDeleteModal = (storyId: number) => {
    const story = stories.find((s) => s.id === storyId);
    if (story) setStoryToDelete(story);
  };

  const confirmDeleteStory = async () => {
    if (!storyToDelete) return;
    setIsDeleting(true);
    try {
      await StoryService.deleteStory(storyToDelete.id);
      setStories((prev) => prev.filter((s) => s.id !== storyToDelete.id));
      setStoryToDelete(null);
    } catch (error) {
      console.error("Lỗi khi xóa bài:", error);
      alert("Đã có lỗi xảy ra khi xóa bài. Xin bác thử lại sau nhé.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isInitializing) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <Loader2 className="w-12 h-12 text-emerald-700 animate-spin" />
          <p className="text-lg text-gray-800 font-medium">Đang chuẩn bị không gian của bác...</p>
        </div>
      </MainLayout>
    );
  }

  const displayName = user?.fullName || user?.username || "Bác";
  const hasNoStories = stories.length === 0;
  
  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto space-y-8 pb-20">

        {/* --- BANNER CHÀO MỪNG --- */}
        <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden transition-colors duration-500">
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
             <BookOpen className="w-32 h-32 text-emerald-800" aria-hidden="true" />
          </div>

          <div className="relative z-10 space-y-3">
            <h1 className="text-2xl md:text-3xl font-extrabold text-emerald-900 tracking-tight">
              Chào mừng, {displayName}!
            </h1>
            <p className="text-emerald-800 text-lg md:text-xl font-medium">
              Hôm nay bác muốn lưu giữ kỷ niệm nào?
            </p>
          </div>
        </div>

        {/* --- NÚT TẠO BÀI VIẾT MỚI --- */}
        <Link
          href="/write"
          className="flex items-center justify-center gap-3 w-full bg-emerald-800 hover:bg-emerald-900 text-white font-bold py-5 px-6 rounded-2xl min-h-[64px] transition-colors shadow-sm active:scale-[0.98] relative z-10"
          aria-label="Nhấn vào đây để viết bài viết mới"
        >
          <PlusCircle className="w-7 h-7" aria-hidden="true" />
          <span className="text-xl">Tạo bài viết</span>
        </Link>

        {/* --- DANH SÁCH BÀI VIẾT --- */}
        <section aria-label="Danh sách kỷ niệm của bác">
          {hasNoStories && isLoadingStories ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4 bg-gray-50 rounded-3xl border border-gray-100">
              <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" aria-hidden="true" />
              <p className="text-lg text-gray-600 font-medium">Đang mở lại những trang nhật ký...</p>
            </div>
          ) : hasNoStories && !isLoadingStories ? (
            // Trạng thái trống (Chưa có bài viết nào)
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center bg-gray-50 rounded-3xl border border-gray-200 border-dashed">
              <BookHeart className="w-16 h-16 text-emerald-200 mb-4" aria-hidden="true" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Chưa có kỷ niệm nào</h2>
              <p className="text-xl text-gray-600 mb-8 max-w-md">
                Bác hãy lưu lại câu chuyện đầu tiên của mình nhé. Chỉ mình bác và những người được chọn mới có thể xem.
              </p>
            </div>
          ) : (
            // Render danh sách StoryCard
            <div className="space-y-6 md:space-y-8">
              {stories.map((story) => (
                <StoryCard 
                  key={story.id} 
                  story={story} 
                  onDelete={openDeleteModal} 
                />
              ))}
            </div>
          )}

          {/* Vùng cắm mốc để Cuộn tự động tải thêm (Infinite Scroll) */}
          {stories.length > 0 && (
            <div ref={observerTarget} className="flex justify-center py-8 opacity-75">
              {isLoadingStories ? (
                <div className="flex items-center gap-3 bg-white px-5 py-2.5 rounded-full shadow-sm border border-gray-100">
                  <Loader2 className="w-5 h-5 text-emerald-600 animate-spin" />
                  <span className="text-emerald-800 font-semibold">Đang tải thêm...</span>
                </div>
              ) : !hasMore ? (
                <p className="text-gray-400 font-medium">Bạn đã xem hết kỷ niệm.</p>
              ) : null}
            </div>
          )}
        </section>

      </div>

      {/* POPUP XÁC NHẬN XÓA (Delete Confirmation Modal) */}
      {storyToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
          <div className="bg-white max-w-md w-full rounded-3xl overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-200">
            {/* Header màu đỏ nổi bật */}
            <div className="bg-red-50 p-6 flex items-center gap-4 border-b border-red-100">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h2 className="text-2xl font-extrabold text-red-900">Xác nhận Xóa</h2>
            </div>
            
            <div className="p-6">
              <p className="text-lg text-stone-600 font-medium mb-2">
                Bạn có chắc chắn muốn xóa câu chuyện <strong className="text-stone-900">"{storyToDelete.title}"</strong> không?
              </p>
              <p className="text-base text-stone-500">
                Hành động này không thể hoàn tác. Các dữ liệu liên đới sẽ bị xoá khỏi máy chủ.
              </p>
            </div>
            
            <div className="p-4 bg-stone-50 border-t border-stone-100 flex items-center justify-end gap-3 flex-wrap">
              {/* Nút thoát popup (Cancel) */}
              <button
                onClick={() => setStoryToDelete(null)}
                disabled={isDeleting}
                className="px-6 py-2.5 rounded-xl font-bold text-lg text-stone-700 hover:bg-stone-200 bg-stone-100 transition-colors border border-stone-200"
              >
                Thoát
              </button>
              {/* Nút Xóa (Xác nhận) */}
              <button
                onClick={confirmDeleteStory}
                disabled={isDeleting}
                className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold text-lg text-white bg-red-600 hover:bg-red-700 transition-colors min-w-[120px]"
              >
                {isDeleting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Vâng, Xóa"}
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}