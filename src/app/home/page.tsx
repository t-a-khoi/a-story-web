// src/app/home/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, PlusCircle, BookHeart, BookOpen, Trash2 } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import MainLayout from '@/components/layout/MainLayout';
import { Story } from '@/types/story';
import StoryCard from '@/features/story/components/StoryCard';
import { useTranslation } from '@/store/useLanguageStore';
import { useInfiniteStories, useDeleteStory } from '@/hooks/queries/useStories';
import { useInView } from 'react-intersection-observer';

export default function HomePage() {
  const router = useRouter();
  const { t } = useTranslation();

  // 1. Context Auth
  const { accessToken, user, _hasHydrated } = useAuthStore();
  const [isInitializing, setIsInitializing] = useState(true);
  const [deleteErrorMsg, setDeleteErrorMsg] = useState<string | null>(null);

  // 2. Data Fetching với TanStack Query
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLoadingStories,
  } = useInfiniteStories({ sort: "createdDate,desc", size: 10 });

  const deleteStoryMutation = useDeleteStory();

  // 3. Infinite Scroll Hook
  const { ref, inView } = useInView({
    threshold: 1.0,
  });

  // Load thêm dữ liệu khi user cuộn tới cuối
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Auth check
  useEffect(() => {
    if (!_hasHydrated) return;
    if (!accessToken) {
      router.replace("/");
      return;
    }
    setIsInitializing(false);
  }, [_hasHydrated, accessToken, router]);

  // State quản lý Modal xóa
  const [storyToDelete, setStoryToDelete] = useState<Story | null>(null);

  const confirmDeleteStory = async () => {
    if (!storyToDelete) return;
    setDeleteErrorMsg(null);
    deleteStoryMutation.mutate(storyToDelete.id, {
      onSuccess: () => {
        setStoryToDelete(null);
        setDeleteErrorMsg(null);
      },
      onError: (error: any) => {
        setDeleteErrorMsg(error.message || t("home.deleteError"));
      },
      onSettled: (_data, error) => {
        // Đảm bảo modal luôn đóng sau kết quả — tránh UI bị đóng băng
        if (!error) {
          setStoryToDelete(null);
        }
      }
    });
  };

  if (isInitializing) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <Loader2 className="w-12 h-12 text-teal-500 animate-spin" />
          <p className="text-lg text-charcoal-700 font-medium">{t("home.preparing")}</p>
        </div>
      </MainLayout>
    );
  }

  const displayName = user?.fullName || user?.username || "Bạn";
  const storiesList = data?.pages.flatMap((page) => page.content) || [];
  const hasNoStories = storiesList.length === 0;

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto space-y-8 pb-20">

        {/* --- BANNER CHÀO MỪNG --- */}
        <div className="bg-teal-50 border border-teal-100 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <BookOpen className="w-32 h-32 text-teal-900" aria-hidden="true" />
          </div>

          <div className="relative z-10 space-y-2">
            <h1 className="text-2xl md:text-3xl font-extrabold text-teal-900 tracking-tight">
              {t("home.welcome")} {displayName}!
            </h1>
            <p className="text-teal-700 text-lg font-medium">
              {t("home.welcomeSubtitle")}
            </p>
          </div>
        </div>

        {/* --- NÚT TẠO BÀI VIẾT MỚI --- */}
        <Link
          href="/write"
          className="flex items-center justify-center gap-3 w-full bg-bronze-500 hover:bg-bronze-600 text-pearl-50 font-bold py-5 px-6 rounded-2xl min-h-[64px] transition-colors shadow-sm active:scale-[0.98] relative z-10"
          aria-label={t("home.createPost")}
        >
          <PlusCircle className="w-7 h-7" aria-hidden="true" />
          <span className="text-xl">{t("home.createPost")}</span>
        </Link>

        {/* --- DANH SÁCH BÀI VIẾT --- */}
        <section aria-label={t("home.emptyTitle")}>
          {isLoadingStories ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4 bg-pearl-100 rounded-3xl border border-pearl-200">
              <Loader2 className="w-10 h-10 text-teal-500 animate-spin" aria-hidden="true" />
              <p className="text-lg text-charcoal-700 font-medium">{t("home.loadingStories")}</p>
            </div>
          ) : hasNoStories ? (
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center bg-pearl-50 rounded-3xl border border-pearl-200 border-dashed">
              <BookHeart className="w-16 h-16 text-teal-100 mb-4" aria-hidden="true" />
              <h2 className="text-2xl font-bold text-charcoal-900 mb-2">{t("home.emptyTitle")}</h2>
              <p className="text-xl text-charcoal-700 mb-8 max-w-md">
                {t("home.emptySubtitle")}
              </p>
            </div>
          ) : (
            <div className="space-y-6 md:space-y-8">
              {storiesList.map((story) => (
                <StoryCard
                  key={story.id}
                  story={story}
                  onDelete={(id) => setStoryToDelete(story)}
                />
              ))}
            </div>
          )}

          {/* Vùng cắm mốc để Cuộn tự động tải thêm (Infinite Scroll) */}
          {storiesList.length > 0 && (
            <div ref={ref} className="flex justify-center py-8 opacity-75">
              {isFetchingNextPage ? (
                <div className="flex items-center gap-3 bg-pearl-50 px-5 py-2.5 rounded-full shadow-sm border border-pearl-200">
                  <Loader2 className="w-5 h-5 text-teal-500 animate-spin" />
                  <span className="text-teal-700 font-semibold">{t("home.loadingMore")}</span>
                </div>
              ) : !hasNextPage ? (
                <p className="text-charcoal-700 font-medium">{t("home.allLoaded")}</p>
              ) : null}
            </div>
          )}
        </section>

      </div>

      {/* POPUP XÁC NHẬN XÓA (Delete Confirmation Modal) */}
      {storyToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
          <div className="bg-pearl-50 max-w-md w-full rounded-3xl overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-200">
            <div className="bg-red-50 p-6 flex items-center gap-4 border-b border-red-100">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h2 className="text-2xl font-extrabold text-red-900">{t("home.deleteConfirmTitle")}</h2>
            </div>

            <div className="p-6">
              <p className="text-lg text-charcoal-700 font-medium mb-2">
                {t("home.deleteConfirmMessage")} <strong className="text-charcoal-900">"{storyToDelete.title}"</strong> {t("home.deleteConfirmSuffix")}
              </p>
              <p className="text-base text-charcoal-700">
                {t("common.confirmDeleteIrreversible")}
              </p>
              {deleteErrorMsg && (
                <p className="mt-3 text-base font-bold text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2">
                  {deleteErrorMsg}
                </p>
              )}
            </div>

            <div className="p-4 bg-pearl-100 border-t border-pearl-200 flex items-center justify-end gap-3 flex-wrap">
              <button
                onClick={() => setStoryToDelete(null)}
                disabled={deleteStoryMutation.isPending}
                className="px-6 py-2.5 rounded-xl font-bold text-lg text-charcoal-900 hover:bg-pearl-200 bg-pearl-50 transition-colors border border-pearl-200"
              >
                {t("common.no")}
              </button>
              <button
                onClick={confirmDeleteStory}
                disabled={deleteStoryMutation.isPending}
                className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold text-lg text-white bg-red-600 hover:bg-red-700 transition-colors min-w-[120px]"
              >
                {deleteStoryMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : t("common.yes")}
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}