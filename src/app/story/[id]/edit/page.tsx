// src/app/story/[id]/edit/page.tsx
"use client";

import { useState, useRef, useEffect, use, useMemo } from "react";
import { useRouter } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";
import {
  Save, Image as ImageIcon, ArrowLeft, CheckCircle2, AlertCircle,
  Loader2, Lightbulb, XCircle, PenTool
} from "lucide-react";
import { FileUploadService } from "@/services/fileUpload.service";
import { MediaFilesService } from "@/services/mediaFiles.service";
import { StoryMediaService } from "@/services/storyMedia.service";
import { useAuthStore } from "@/store/useAuthStore";
import { useTranslation } from "@/store/useLanguageStore";
import { useStoryById, useUpdateStory, useStoryMedia, STORY_MEDIA_KEYS } from "@/hooks/queries/useStories";
import { useQueryClient } from "@tanstack/react-query";

// ─── Types ────────────────────────────────────────────────────────────────────
interface AttachedMedia {
  id?: number;
  mediaFileId: number;
  fileKey: string;
  blobUrl: string;
  isNew: boolean;
}

// ─── Writing prompts theo category ───────────────────────────────────────────
const WRITING_PROMPTS: Record<number, string[]> = {
  1: ["Kể về bữa cơm tối nhớ nhất?", "Một thói quen đặc biệt của Ba/Mẹ?", "Ngày đầu tiên đón con/cháu chào đời?"],
  2: ["Trò chơi ngày bé bạn hay chơi?", "Người bạn thân nhất thời đi học là ai?", "Lần đầu tiên đi xa nhà?"],
  3: ["Món đồ chơi đầu tiên bạn được tặng?", "Câu chuyện đằng sau một bức ảnh cũ?", "Âm thanh hoặc mùi hương nào gợi nhớ quá khứ?"],
  4: ["Một lời khuyên đắt giá bạn từng nhận được?", "Bạn đã học được gì từ một sai lầm lớn?", "Định nghĩa về hạnh phúc của bạn hiện tại?"],
  5: ["Ngày đầu tiên đi làm diễn ra thế nào?", "Một người đồng nghiệp đáng nhớ?", "Thành tựu lớn nhất trong sự nghiệp?"],
};

const DEFAULT_PROMPTS = [
  "Hãy bắt đầu bằng việc mô tả thời gian và địa điểm...",
  "Hôm đó thời tiết thế nào?",
  "Ai là người xuất hiện chính trong kỷ niệm này?",
];

export default function EditStoryPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { t } = useTranslation();
  const resolvedParams = use(params);
  const storyId = Number(resolvedParams.id);
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  // ─── TanStack Query ───────────────────────────────────────────────────────
  const { data: story, isLoading, isError } = useStoryById(storyId);
  const { data: remoteMedia = [] } = useStoryMedia(storyId);
  const updateStoryMutation = useUpdateStory();

  // ─── Form states ──────────────────────────────────────────────────────────
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedCatId, setSelectedCatId] = useState<number>(0);

  // ─── Media states ─────────────────────────────────────────────────────────
  const [attachedMedia, setAttachedMedia] = useState<AttachedMedia[]>([]);
  const [deletedStoryMediaIds, setDeletedStoryMediaIds] = useState<number[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [mediaInitialized, setMediaInitialized] = useState(false);

  // ─── UI states ────────────────────────────────────────────────────────────
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // ─── Refs ─────────────────────────────────────────────────────────────────
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // ─── Khởi tạo form khi story load xong ───────────────────────────────────
  useEffect(() => {
    if (story) {
      setTitle(story.title || "");
      setContent(story.content || "");
      setSelectedCatId(story.catId || 0);
    }
  }, [story]);

  // ─── Khởi tạo media khi remoteMedia load xong (chỉ chạy 1 lần) ──────────
  useEffect(() => {
    if (remoteMedia.length > 0 && !mediaInitialized) {
      setAttachedMedia(remoteMedia);
      setMediaInitialized(true);
    }
  }, [remoteMedia, mediaInitialized]);

  // ─── Auto-resize textarea ─────────────────────────────────────────────────
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content]);

  // ─── Writing prompts ──────────────────────────────────────────────────────
  const writingPrompts = useMemo(() => WRITING_PROMPTS[selectedCatId] ?? DEFAULT_PROMPTS, [selectedCatId]);

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const handleUpdate = async () => {
    if (!title.trim() || !content.trim()) {
      setErrorMsg("Vui lòng nhập đầy đủ tiêu đề và nội dung câu chuyện.");
      return;
    }
    setErrorMsg("");

    updateStoryMutation.mutate(
      { id: storyId, data: { catId: selectedCatId > 0 ? selectedCatId : null, title: title.trim(), content: content.trim() } },
      {
        onSuccess: async () => {
          try {
            // Xóa các media cũ đã đánh dấu
            if (deletedStoryMediaIds.length > 0) {
              await Promise.all(deletedStoryMediaIds.map(id => StoryMediaService.deleteStoryMedia(id).catch(console.error)));
            }
            // Thêm các media mới
            const newMedia = attachedMedia.filter(m => m.isNew);
            if (newMedia.length > 0) {
              await Promise.all(newMedia.map(m =>
                StoryMediaService.createStoryMedia({ storyId, mediaId: m.mediaFileId, caption: "" })
              ));
            }
            // Invalidate media cache để reload mới nhất
            queryClient.invalidateQueries({ queryKey: STORY_MEDIA_KEYS.byStory(storyId) });
          } catch (err) {
            console.error("Lỗi xử lý media:", err);
          }

          setShowSuccess(true);
          setTimeout(() => router.push(`/story/${storyId}`), 3000);
        },
        onError: () => setErrorMsg("Lưu thất bại. Vui lòng kiểm tra mạng và thử lại!"),
      }
    );
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setErrorMsg("");

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const uploadRes = await FileUploadService.uploadFile(file, "story-assets");
        const blobUrl = await FileUploadService.fetchImageBlobUrl(uploadRes.key);
        const mediaRes = await MediaFilesService.createMediaFile({
          userId: user?.id || 1,
          categoryId: null,
          mediaType: "IMAGE",
          urlPath: uploadRes.key,
          fileSize: uploadRes.size,
          title: file.name,
        });
        setAttachedMedia(prev => [...prev, { mediaFileId: mediaRes.id, fileKey: uploadRes.key, blobUrl, isNew: true }]);
      }
    } catch (error) {
      console.error("Lỗi upload ảnh:", error);
      setErrorMsg("Không thể tải ảnh lên. Vui lòng thử lại!");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveMedia = async (index: number) => {
    const target = attachedMedia[index];
    if (!target.isNew && target.id) {
      // Đánh dấu để xóa khi save
      setDeletedStoryMediaIds(prev => [...prev, target.id!]);
    } else {
      try {
        await MediaFilesService.deleteMediaFile(target.mediaFileId);
        await FileUploadService.deleteFile(target.fileKey);
      } catch { /* ignore */ }
    }
    setAttachedMedia(prev => prev.filter((_, i) => i !== index));
  };

  // ─── Loading / Error states ───────────────────────────────────────────────
  if (isLoading) {
    return (
      <MainLayout>
        <div className="max-w-3xl mx-auto flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <Loader2 className="w-10 h-10 text-teal-700 animate-spin" />
          <p className="text-lg text-charcoal-700 font-medium">Đang tìm lại kỷ niệm cũ...</p>
        </div>
      </MainLayout>
    );
  }

  if (isError || !story) {
    return (
      <MainLayout>
        <div className="max-w-3xl mx-auto flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <AlertCircle className="w-10 h-10 text-red-500" />
          <p className="text-lg text-charcoal-700 font-medium">Không thể tải nội dung câu chuyện.</p>
          <button onClick={() => router.back()} className="px-6 py-2.5 bg-teal-700 text-white rounded-xl font-bold">
            Quay lại
          </button>
        </div>
      </MainLayout>
    );
  }

  const isSaving = updateStoryMutation.isPending;

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto space-y-8 pb-20">

        {/* ═══ HEADER BANNER ═══════════════════════════════════════════ */}
        <div className="bg-teal-50 border border-teal-100 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <PenTool className="w-32 h-32 text-teal-800" aria-hidden="true" />
          </div>

          <div className="relative z-10 space-y-3">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-teal-800 hover:text-teal-900 transition-colors font-bold text-lg w-fit bg-white/60 px-4 py-2 rounded-xl"
              aria-label="Quay lại"
            >
              <ArrowLeft className="w-6 h-6" />
              <span>Quay lại</span>
            </button>
            <h1 className="text-2xl md:text-3xl font-extrabold text-charcoal-900 tracking-tight">
              Sửa câu chuyện cũ
            </h1>
          </div>

          <button
            onClick={handleUpdate}
            disabled={isSaving || showSuccess}
            className={`relative z-10 flex items-center justify-center gap-2 min-h-[56px] px-8 py-3 rounded-xl text-xl font-bold transition-all shadow-md shrink-0 ${
              showSuccess
                ? "bg-teal-100 text-teal-800 border-2 border-teal-300"
                : "bg-teal-700 text-white hover:bg-teal-800 disabled:opacity-50 disabled:cursor-not-allowed"
            }`}
            aria-live="polite"
          >
            {showSuccess ? (
              <><CheckCircle2 className="w-6 h-6" /><span>Đã lưu xong!</span></>
            ) : isSaving ? (
              <><Loader2 className="w-6 h-6 animate-spin" /><span>Đang lưu...</span></>
            ) : (
              <><Save className="w-6 h-6" /><span>Lưu thay đổi</span></>
            )}
          </button>
        </div>

        {/* BÁO LỖI */}
        {errorMsg && (
          <div className="flex items-start gap-3 bg-red-50 text-red-900 p-5 rounded-2xl shadow-sm border-2 border-red-200" role="alert">
            <AlertCircle className="w-6 h-6 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-base font-semibold leading-relaxed">{errorMsg}</p>
          </div>
        )}

        {/* ═══ KHU VỰC SOẠN THẢO ══════════════════════════════════════ */}
        <div className="bg-white rounded-3xl shadow-sm border border-pearl-200 p-6 md:p-10 space-y-8">

          {/* Tiêu đề */}
          <div className="space-y-1.5">
            <label htmlFor="story-title" className="text-sm font-semibold text-charcoal-500 ml-1">Tiêu đề kỷ niệm</label>
            <input
              id="story-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Viết một tiêu đề ngắn (ví dụ: Tết năm 1975)..."
              className="w-full text-2xl md:text-3xl font-extrabold text-charcoal-900 placeholder-charcoal-400 bg-transparent border-none focus:ring-0 focus:outline-none p-0"
            />
          </div>

          <hr className="border-pearl-200" />

          {/* Nội dung */}
          <div className="space-y-1.5">
            <label htmlFor="story-content" className="text-sm font-semibold text-charcoal-500 ml-1">Nội dung câu chuyện</label>
            <textarea
              id="story-content"
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Hãy nhớ lại và kể câu chuyện tại đây..."
              className="w-full text-xl md:text-2xl text-charcoal-800 leading-[1.9] placeholder-charcoal-400 bg-transparent border-none focus:ring-0 focus:outline-none p-0 min-h-[280px] resize-none overflow-hidden font-medium tracking-wide"
            />
          </div>

          {/* Hình ảnh */}
          <div className="pt-8 border-t border-pearl-200">
            {attachedMedia.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {attachedMedia.map((m, index) => (
                  <div key={m.mediaFileId} className="relative group rounded-xl overflow-hidden border border-pearl-200 shadow-sm aspect-square bg-pearl-100">
                    <img src={m.blobUrl} alt="preview" className="w-full h-full object-cover" />
                    <button
                      onClick={() => handleRemoveMedia(index)}
                      className="absolute top-2 right-2 p-1.5 bg-red-100/90 text-red-600 rounded-full hover:bg-red-200 transition-colors opacity-0 group-hover:opacity-100 shadow-sm"
                      title="Xóa ảnh"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <input
              type="file"
              accept="image/*"
              multiple
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileChange}
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className={`flex items-center gap-3 min-h-[64px] px-6 py-4 bg-pearl-50 hover:bg-teal-50 text-charcoal-700 hover:text-teal-800 border-2 border-dashed border-pearl-300 hover:border-teal-300 rounded-2xl text-lg font-bold transition-colors w-full sm:w-auto justify-center shadow-sm ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isUploading ? <Loader2 className="w-8 h-8 animate-spin" /> : <ImageIcon className="w-8 h-8" />}
              <span>{isUploading ? 'Đang tải ảnh...' : 'Thêm hoặc thay đổi ảnh (Tuỳ chọn)'}</span>
            </button>
            <p className="mt-4 text-lg text-charcoal-500 font-medium">
              * Ảnh giúp câu chuyện của bạn thêm sinh động.
            </p>
          </div>
        </div>

        {/* ═══ GÓC GỢI Ý ════════════════════════════════════════════════ */}
        <div className="bg-bronze-200/30 border-2 border-bronze-400/40 rounded-3xl p-6 md:p-8 flex items-start gap-4 md:gap-6 shadow-sm">
          <div className="bg-bronze-200 p-3 rounded-full shrink-0 shadow-sm border border-bronze-400/30">
            <Lightbulb className="w-8 h-8 md:w-10 md:h-10 text-bronze-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl md:text-2xl font-bold text-bronze-600 mb-3">Góc gợi ý kỷ niệm</h3>
            <p className="text-base text-charcoal-700 font-medium mb-4">
              Nếu bạn chưa nhớ ra điều gì để viết, hãy thử nhớ lại:
            </p>
            <ul className="space-y-3">
              {writingPrompts.map((prompt, index) => (
                <li key={index} className="flex items-start gap-3 bg-white/60 p-3 rounded-xl border border-bronze-400/20">
                  <div className="font-bold text-lg text-bronze-500 mt-0.5">•</div>
                  <p className="text-base text-charcoal-800 font-medium leading-relaxed">{prompt}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>

      </div>
    </MainLayout>
  );
}