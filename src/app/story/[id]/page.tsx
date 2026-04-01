"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import MainLayout from "@/components/layout/MainLayout";
import { ArrowLeft, Calendar, Edit3, Share2, Clock, Trash2, Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";
import ShareModal from "@/components/story/ShareModal";
import { StoryService } from "@/services/stories.service";
import { StoryMediaService } from "@/services/storyMedia.service";
import { MediaFilesService } from "@/services/mediaFiles.service";
import { FileUploadService } from "@/services/fileUpload.service";
import { Story } from "@/types/story";

export default function StoryDetailPage() {
  const params = useParams();
  const router = useRouter();

  const [story, setStory] = useState<Story | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modals state
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Toasts
  const [toastMsg, setToastMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [attachedMediaUrls, setAttachedMediaUrls] = useState<string[]>([]);

  useEffect(() => {
    if (params.id) {
      fetchStoryDetail(Number(params.id));
    }
  }, [params.id]);

  const fetchStoryDetail = async (id: number) => {
    setIsLoading(true);
    try {
      const data = await StoryService.getStoryById(id);
      setStory(data);

      try {
          const storyMediaList = await StoryMediaService.getStoryMediaByStoryId(id);
          if (storyMediaList && storyMediaList.length > 0) {
              const urls = await Promise.all(storyMediaList.map(async (sm) => {
                  const fileObj = await MediaFilesService.getMediaFileById(sm.mediaId);
                  return await FileUploadService.fetchImageBlobUrl(fileObj.urlPath);
              }));
              setAttachedMediaUrls(urls.filter(url => url !== ""));
          }
      } catch (mediaErr) {
          console.warn("Lỗi tải ảnh đính kèm:", mediaErr);
      }

    } catch (error) {
      console.error("Lỗi lấy chi tiết story:", error);
      showToast("error", "Không thể tải câu chuyện lúc này.");
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMsg({ type, text });
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleDeleteStory = async () => {
    if (!story) return;
    setIsDeleting(true);
    try {
      await StoryService.deleteStory(story.id);
      setIsDeleteModalOpen(false);
      showToast("success", "Đã xóa câu chuyện thành công. Đang quay về trang chủ...");
      setTimeout(() => {
        router.push("/home");
      }, 1500);
    } catch (error) {
      console.error("Lỗi xoá story:", error);
      showToast("error", "Xóa câu chuyện thất bại. Vui lòng thử lại!");
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center py-32 gap-4 text-emerald-800">
          <Loader2 className="w-12 h-12 animate-spin" />
          <p className="text-xl font-bold">Đang tải câu chuyện...</p>
        </div>
      </MainLayout>
    );
  }

  if (!story) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center py-32 gap-4 text-stone-500">
          <AlertTriangle className="w-16 h-16 text-stone-300" />
          <h2 className="text-2xl font-bold text-stone-800">Không tìm thấy câu chuyện</h2>
          <p className="text-lg">Câu chuyện này có thể đã bị xóa hoặc không tồn tại.</p>
          <button 
            onClick={() => router.push("/home")}
            className="mt-4 px-6 py-2.5 bg-stone-800 text-white rounded-xl font-bold hover:bg-stone-900 transition-colors"
          >
            Quay lại trang chủ
          </button>
        </div>
      </MainLayout>
    );
  }

  // Format Date
  const formatDate = (isoString?: string) => {
    if (!isoString) return "Không rõ ngày";
    const date = new Date(isoString);
    return date.toLocaleDateString("vi-VN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Tính số phút đọc nhấp nháp (khoảng 200 từ/phút)
  const calculateReadTime = (text: string) => {
    if (!text) return "1 phút đọc";
    const words = text.split(/\s+/).length;
    const readingTime = Math.ceil(words / 200);
    return `Khoảng ${readingTime} phút đọc`;
  };

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto pb-20 relative">

        {/* Thông báo Toast Popup */}
        {toastMsg && (
          <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-lg border-2 font-bold text-base flex items-center gap-3 animate-in fade-in slide-in-from-top-4 ${toastMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-800 border-red-200'}`}>
            {toastMsg.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            {toastMsg.text}
          </div>
        )}

        {/* Bọc toàn bộ nội dung trong Article */}
        <article className="bg-[#FDFBF7] rounded-3xl shadow-sm border border-stone-200 overflow-hidden pb-16">
          
          {/* THANH ĐIỀU HƯỚNG */}
          <div className="flex flex-wrap items-center justify-between p-6 border-b border-stone-200 bg-white gap-4">
            <button
              onClick={() => router.push("/home")}
              className="flex items-center gap-2 text-stone-600 hover:text-stone-900 transition-colors min-h-[48px] px-2 rounded-lg font-bold text-lg"
            >
              <ArrowLeft className="w-6 h-6" />
              <span>Trở về</span>
            </button>

            <div className="flex items-center gap-3">
              {/* Nút Xóa (Màu đỏ thu hút sự chú ý theo yêu cầu) */}
              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="flex items-center gap-2 min-h-[44px] px-4 rounded-xl text-base font-bold text-red-700 bg-red-50 hover:bg-red-100 transition-colors border border-red-100"
                title="Xóa câu chuyện"
              >
                <Trash2 className="w-5 h-5" />
                <span className="hidden sm:inline">Xóa</span>
              </button>

              {/* Nút Chỉnh sửa */}
              <button
                onClick={() => router.push(`/story/${story.id}/edit`)}
                className="flex items-center gap-2 min-h-[44px] px-4 rounded-xl text-base font-bold text-stone-700 hover:bg-stone-100 transition-colors border border-transparent"
                title="Sửa bài viết"
              >
                <Edit3 className="w-5 h-5" />
                <span className="hidden sm:inline">Sửa</span>
              </button>

              {/* Nút Chia sẻ */}
              <button
                onClick={() => setIsShareModalOpen(true)}
                className="flex items-center gap-2 min-h-[44px] px-4 bg-emerald-100 text-emerald-900 hover:bg-emerald-200 rounded-xl text-base font-bold transition-colors border-2 border-emerald-200"
              >
                <Share2 className="w-5 h-5" />
                <span className="hidden sm:inline">Gửi cho người thân</span>
              </button>
            </div>
          </div>

          {/* PHẦN ĐẦU BÀI VIẾT (HEADER) */}
          <div className="px-6 md:px-12 pt-10 pb-8 space-y-6 text-center">
            <h1 className="text-3xl md:text-5xl font-extrabold text-stone-900 leading-[1.3] tracking-tight">
              {story.title}
            </h1>

            <div className="flex flex-wrap items-center justify-center gap-6 text-stone-500 font-medium text-lg">
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
          {attachedMediaUrls.length > 0 ? (
            <div className="px-6 md:px-12 pb-10 space-y-6">
              {attachedMediaUrls.map((url, idx) => (
                  <div key={idx} className="relative w-full rounded-2xl overflow-hidden shadow-md border border-stone-200 bg-stone-100 flex justify-center max-h-[600px]">
                    <img
                      src={url}
                      alt={`Minh họa ${idx + 1}`}
                      className="w-full h-full object-contain max-h-[600px] bg-stone-100"
                    />
                  </div>
              ))}
            </div>
          ) : (
            <div className="px-6 md:px-12 pb-10">
              <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden shadow-md border border-stone-200 bg-stone-100">
                <Image
                  src={"https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=1200&auto=format&fit=crop"}
                  alt={`Minh hoạ mặc định`}
                  fill
                  className="object-cover"
                />
              </div>
              <p className="text-center text-sm text-stone-400 mt-3 italic">Hình ảnh kỉ niệm (Minh họa gốc chưa được thay thế)</p>
            </div>
          )}

          {/* NỘI DUNG VĂN BẢN (BODY) */}
          <div className="px-6 md:px-12 text-xl md:text-2xl text-stone-800">
            {story.content?.split('\n').filter(p => p.trim() !== '').map((paragraph, index) => (
              <p
                key={index}
                className="leading-[1.9] mb-8 font-medium tracking-wide text-justify"
              >
                {paragraph}
              </p>
            ))}
          </div>

          {/* CUỐI BÀI VIẾT (FOOTER CHỮ KÝ) */}
          <div className="px-6 md:px-12 mt-4 flex items-center justify-center">
            <div className="w-16 h-1 bg-emerald-200 rounded-full"></div>
          </div>
          <div className="px-6 md:px-12 mt-6 text-center text-lg text-stone-500 font-medium italic">
            Đã viết và lưu giữ an toàn.
          </div>
        </article>
      </div>

      {/* POPUP XÁC NHẬN XÓA (Delete Confirmation Modal) */}
      {isDeleteModalOpen && (
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
                Bạn có chắc chắn muốn xóa câu chuyện <strong className="text-stone-900">"{story.title}"</strong> không?
              </p>
              <p className="text-base text-stone-500">
                Hành động này không thể hoàn tác. Các dữ liệu liên đới sẽ bị xoá khỏi máy chủ.
              </p>
            </div>
            
            <div className="p-4 bg-stone-50 border-t border-stone-100 flex items-center justify-end gap-3 flex-wrap">
              {/* Nút thoát popup (Cancel) */}
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={isDeleting}
                className="px-6 py-2.5 rounded-xl font-bold text-lg text-stone-700 hover:bg-stone-200 bg-stone-100 transition-colors border border-stone-200"
              >
                Thoát
              </button>
              {/* Nút Xóa (Xác nhận) */}
              <button
                onClick={handleDeleteStory}
                disabled={isDeleting}
                className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold text-lg text-white bg-red-600 hover:bg-red-700 transition-colors min-w-[120px]"
              >
                {isDeleting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Vâng, Xóa"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CHIA SẺ (Hiển thị khi click nút Share) */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        storyId={story.id}
        storyTitle={story.title}
      />
    </MainLayout>
  );
}