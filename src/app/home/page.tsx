// src/app/home/page.tsx
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PenTool, AlertCircle, RefreshCcw, Sparkles } from 'lucide-react';
import { StoryService, PageResponse } from '@/services/stories.service';
import { Story } from '@/types/story';
import StoryCard from '@/components/story/StoryCard';
import MainLayout from '@/components/layout/MainLayout';

export default function HomePage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const fetchStories = async (pageNumber: number) => {
    try {
      setIsLoading(true);
      const data: PageResponse<Story> = await StoryService.getMyStories({
        page: pageNumber,
        size: 10,
        sort: 'createdDate,desc'
      });

      // FIX LỖI Ở ĐÂY: Đảm bảo newStories luôn là mảng, kể cả khi data.content bị undefined
      const newStories = data.content || [];

      if (pageNumber === 0) {
        setStories(newStories);
      } else {
        setStories(prev => [...(prev || []), ...newStories]);
      }

      // Kiểm tra an toàn cho totalPages đề phòng backend trả thiếu
      const totalPages = data.totalPages || 0;
      const currentPage = data.number || 0;
      setHasMore(currentPage < totalPages - 1);

    } catch (err) {
      setError('Không thể tải danh sách bài viết. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStories(0);
  }, []);

  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchStories(nextPage);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bài viết này không?')) {
      try {
        await StoryService.deleteStory(id);
        // FIX LỖI Ở ĐÂY: Đảm bảo stories là mảng trước khi filter
        setStories(prev => (prev || []).filter(story => story.id !== id));
      } catch (err) {
        alert('Xóa thất bại. Vui lòng thử lại.');
      }
    }
  };

  // Tránh lỗi null reference ở render
  const safeStories = stories || [];

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto space-y-8 pb-20">

        {/* HEADER BANNER */}
        <div className="bg-emerald-50 border-2 border-emerald-100 rounded-3xl p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <Sparkles className="w-32 h-32 text-emerald-800" aria-hidden="true" />
          </div>

          <div className="relative z-10 space-y-2">
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
              Nhật ký của tôi
            </h1>
            <p className="text-gray-700 text-lg md:text-xl font-medium">
              Không gian lưu giữ những câu chuyện và kỷ niệm quý giá.
            </p>
          </div>

          <Link
            href="/write"
            className="relative z-10 flex items-center justify-center gap-3 min-h-[56px] px-8 py-3 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl shadow-md transition-all font-bold text-xl shrink-0"
          >
            <PenTool className="w-6 h-6" aria-hidden="true" />
            <span>Viết bài mới</span>
          </Link>
        </div>

        {/* ERROR STATE */}
        {error && (
          <div className="flex items-center gap-3 bg-red-50 text-red-700 p-6 rounded-2xl shadow-sm border-2 border-red-200">
            <AlertCircle className="w-8 h-8 flex-shrink-0" aria-hidden="true" />
            <p className="text-lg font-bold">{error}</p>
          </div>
        )}

        {/* DANH SÁCH BÀI VIẾT */}
        <div className="space-y-6">
          {safeStories.length === 0 && !isLoading && !error ? (
            <div className="text-center p-12 bg-white rounded-3xl shadow-sm border border-gray-200">
              <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <PenTool className="w-10 h-10 text-emerald-700" aria-hidden="true" />
              </div>
              <p className="text-xl text-gray-800 font-bold mb-3">Bạn chưa có bài viết nào.</p>
              <p className="text-lg text-gray-600 mb-8 font-medium">Hãy bắt đầu ghi lại những khoảnh khắc đáng nhớ nhé.</p>
              <Link
                href="/write"
                className="inline-flex items-center gap-2 text-xl font-bold text-emerald-800 hover:text-emerald-900 underline"
              >
                Bắt đầu viết ngay &rarr;
              </Link>
            </div>
          ) : (
            safeStories.map(story => (
              <StoryCard key={story.id} story={story} onDelete={handleDelete} />
            ))
          )}
        </div>

        {/* NÚT TẢI THÊM */}
        {hasMore && (
          <div className="pt-8 flex justify-center">
            <button
              onClick={handleLoadMore}
              disabled={isLoading}
              className="flex items-center justify-center gap-3 min-h-[56px] px-10 py-3 bg-white text-gray-800 border-2 border-gray-200 hover:bg-gray-50 rounded-xl shadow-sm hover:shadow-md transition-all font-bold text-xl disabled:opacity-50"
            >
              {isLoading ? <RefreshCcw className="w-6 h-6 animate-spin" aria-hidden="true" /> : null}
              <span>
                {isLoading ? 'Đang tải thêm...' : 'Xem các bài cũ hơn'}
              </span>
            </button>
          </div>
        )}
      </div>
    </MainLayout>
  );
}