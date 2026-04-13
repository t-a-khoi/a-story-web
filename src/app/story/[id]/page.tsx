"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";
import { ArrowLeft, Calendar, Edit3, Share2, Clock, Trash2, Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";
import ShareModel from "@/features/story/components/ShareModel";
import { useStoryById, useDeleteStory, useStoryMedia } from "@/hooks/queries/useStories";
import { useTranslation } from "@/store/useLanguageStore";

export default function StoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useTranslation();

  const storyId = Number(params.id);

  // ─── Data fetching với TanStack Query ────────────────────────────────────
  const { data: story, isLoading, isError } = useStoryById(storyId);
  const { data: attachedMedia = [] } = useStoryMedia(storyId);
  const deleteStoryMutation = useDeleteStory();

  // ─── Local UI state ───────────────────────────────────────────────────────
  const [isShareModelOpen, setIsShareModelOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMsg({ type, text });
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleDeleteStory = () => {
    if (!story) return;
    deleteStoryMutation.mutate(story.id, {
      onSuccess: () => {
        setIsDeleteModalOpen(false);
        showToast("success", t("story.deleteSuccess"));
        setTimeout(() => router.push("/home"), 1500);
      },
      onError: () => showToast("error", t("story.deleteError")),
    });
  };

  // ─── Loading / Error states ───────────────────────────────────────────────
  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center py-32 gap-4 text-navy-700">
          <Loader2 className="w-12 h-12 animate-spin" />
          <p className="text-xl font-bold">{t("story.loading")}</p>
        </div>
      </MainLayout>
    );
  }

  if (isError || !story) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center py-32 gap-4 text-charcoal-700">
          <AlertTriangle className="w-16 h-16 text-pearl-200" />
          <h2 className="text-2xl font-bold text-charcoal-900">{t("story.notFoundTitle")}</h2>
          <p className="text-lg">{t("story.notFoundMessage")}</p>
          <button
            onClick={() => router.push("/home")}
            className="mt-4 px-6 py-2.5 bg-white hover:bg-navy-50 text-navy-700 border-2 border-navy-500 rounded-xl font-bold transition-colors"
          >
            {t("story.backToHome")}
          </button>
        </div>
      </MainLayout>
    );
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────
  const formatDate = (isoString?: string) => {
    if (!isoString) return t("story.unknownDate");
    return new Date(isoString).toLocaleDateString("vi-VN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const calculateReadTime = (text: string) => {
    if (!text) return `1 ${t("story.readTimeUnit")}`;
    const words = text.split(/\s+/).length;
    return `${t("story.readTimeApprox")} ${Math.ceil(words / 200)} ${t("story.readTimeUnit")}`;
  };

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto pb-20 relative">

        {/* Toast Popup */}
        {toastMsg && (
          <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-lg border-2 font-bold text-base flex items-center gap-3 animate-in fade-in slide-in-from-top-4 ${toastMsg.type === 'success' ? 'bg-navy-50 text-navy-700 border-navy-100' : 'bg-red-50 text-red-800 border-red-200'}`}>
            {toastMsg.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            {toastMsg.text}
          </div>
        )}

        <article className="bg-pearl-50 rounded-3xl shadow-sm border border-pearl-200 overflow-hidden pb-16">

          {/* THANH ĐIỀU HƯỚNG */}
          <div className="flex flex-wrap items-center justify-between p-6 border-b border-pearl-200 bg-pearl-100 gap-4">
            <button
              onClick={() => router.push("/home")}
              className="flex items-center gap-2 text-charcoal-700 hover:text-charcoal-900 transition-colors min-h-[48px] px-2 rounded-lg font-bold text-lg"
            >
              <ArrowLeft className="w-6 h-6" />
              <span>{t("story.backButton")}</span>
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="flex items-center gap-2 min-h-[44px] px-4 rounded-xl text-base font-bold text-red-700 bg-red-50 hover:bg-red-100 transition-colors border border-red-100"
                title={t("story.deleteButton")}
              >
                <Trash2 className="w-5 h-5" />
                <span className="hidden sm:inline">{t("story.deleteButton")}</span>
              </button>

              <button
                onClick={() => router.push(`/story/${story.id}/edit`)}
                className="flex items-center gap-2 min-h-[44px] px-4 rounded-xl text-base font-bold text-charcoal-700 bg-pearl-50 hover:bg-pearl-200 transition-colors border border-pearl-200"
                title={t("story.editButton")}
              >
                <Edit3 className="w-5 h-5" />
                <span className="hidden sm:inline">{t("story.editButton")}</span>
              </button>

              <button
                onClick={() => setIsShareModelOpen(true)}
                className="flex items-center gap-2 min-h-[44px] px-4 bg-navy-50 text-navy-900 hover:bg-navy-100 rounded-xl text-base font-bold transition-colors border-2 border-navy-100"
              >
                <Share2 className="w-5 h-5" />
                <span className="hidden sm:inline">{t("story.shareButton")}</span>
              </button>
            </div>
          </div>

          {/* PHẦN ĐẦU BÀI VIẾT */}
          <div className="px-6 md:px-12 pt-10 pb-8 space-y-6 text-center">
            <h1 className="text-3xl md:text-5xl font-extrabold text-charcoal-900 leading-[1.3] tracking-tight">
              {story.title}
            </h1>

            <div className="flex flex-wrap items-center justify-center gap-6 text-charcoal-700 font-medium text-lg">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span>{formatDate(story.createdDate)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span>{calculateReadTime(story.content || "")}</span>
              </div>
            </div>
          </div>

          {/* HIỂN THỊ HÌNH ẢNH ĐÍNH KÈM */}
          {attachedMedia.length > 0 && (
            <div className="px-6 md:px-12 pb-10 space-y-6">
              {attachedMedia.map((media, idx) => (
                <div key={media.id ?? idx} className="relative w-full rounded-2xl overflow-hidden shadow-md border border-pearl-200 bg-pearl-100 flex justify-center max-h-[600px]">
                  <img
                    src={media.blobUrl}
                    alt={`${t("story.imageAlt")} ${idx + 1}`}
                    className="w-full h-full object-contain max-h-[600px] bg-pearl-100"
                  />
                </div>
              ))}
            </div>
          )}

          {/* NỘI DUNG VĂN BẢN */}
          <div className="px-6 md:px-12 text-xl md:text-2xl text-charcoal-900">
            {story.content?.split('\n').filter(p => p.trim() !== '').map((paragraph, index) => (
              <p
                key={index}
                className="leading-[1.9] mb-8 font-medium tracking-wide text-justify"
              >
                {paragraph}
              </p>
            ))}
          </div>

          {/* CUỐI BÀI VIẾT */}
          <div className="px-6 md:px-12 mt-4 flex items-center justify-center">
            <div className="w-16 h-1 bg-pearl-200 rounded-full"></div>
          </div>
          <div className="px-6 md:px-12 mt-6 text-center text-lg text-charcoal-700 font-medium italic">
            {t("story.footer")}
          </div>
        </article>
      </div>

      {/* POPUP XÁC NHẬN XÓA */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
          <div className="bg-pearl-50 max-w-md w-full rounded-3xl overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-200">
            <div className="bg-red-50 p-6 flex items-center gap-4 border-b border-red-100">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h2 className="text-2xl font-extrabold text-red-900">{t("story.deleteModalTitle")}</h2>
            </div>

            <div className="p-6">
              <p className="text-lg text-charcoal-700 font-medium mb-2">
                {t("story.deleteConfirmMessage")} <strong className="text-charcoal-900">"{story.title}"</strong> {t("story.deleteConfirmSuffix")}
              </p>
              <p className="text-base text-charcoal-700">
                {t("story.deleteIrreversible")}
              </p>
            </div>

            <div className="p-4 bg-pearl-100 border-t border-pearl-200 flex items-center justify-end gap-3 flex-wrap">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={deleteStoryMutation.isPending}
                className="px-6 py-2.5 rounded-xl font-bold text-lg text-charcoal-900 hover:bg-pearl-200 bg-pearl-50 transition-colors border border-pearl-200"
              >
                {t("common.no")}
              </button>
              <button
                onClick={handleDeleteStory}
                disabled={deleteStoryMutation.isPending}
                className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold text-lg text-white bg-red-600 hover:bg-red-700 transition-colors min-w-[120px]"
              >
                {deleteStoryMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : t("common.yes")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CHIA SẺ */}
      <ShareModel
        isOpen={isShareModelOpen}
        onClose={() => setIsShareModelOpen(false)}
        storyId={story.id}
        storyTitle={story.title}
      />
    </MainLayout>
  );
}