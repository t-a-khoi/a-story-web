// src/app/story/[id]/edit/page.tsx
"use client";

import { useState, useRef, useEffect, use, useMemo } from "react";
import { useRouter } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";
import { Save, Image as ImageIcon, ArrowLeft, CheckCircle2, BookOpenText, AlertCircle, Loader2, Lightbulb, XCircle, ChevronDown, PenTool } from "lucide-react";
import { StoryService } from "@/services/stories.service";
import { FileUploadService } from "@/services/fileUpload.service";
import { MediaFilesService } from "@/services/mediaFiles.service";
import { useAuthStore } from "@/store/useAuthStore";
import { StoryMediaService } from "@/services/storyMedia.service";
import { CategoriesService } from "@/services/categories.service";
import { Category } from "@/types/story";
import { useTranslation } from "@/store/useLanguageStore";

export default function EditStoryPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { t } = useTranslation();
    const resolvedParams = use(params);
    const storyId = Number(resolvedParams.id);
    const { user } = useAuthStore();

    // Form states
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [selectedCatId, setSelectedCatId] = useState<number>(0);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoadingCategories, setIsLoadingCategories] = useState(true);
    const [isCatDropdownOpen, setIsCatDropdownOpen] = useState(false);
    const catDropdownRef = useRef<HTMLDivElement>(null);

    // UI statuses
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    // Media states
    interface AttachedMedia {
        id?: number;
        mediaFileId: number;
        fileKey: string;
        blobUrl: string;
        isNew: boolean;
    }
    const [attachedMedia, setAttachedMedia] = useState<AttachedMedia[]>([]);
    const [deletedStoryMediaIds, setDeletedStoryMediaIds] = useState<number[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [content]);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (catDropdownRef.current && !catDropdownRef.current.contains(e.target as Node)) {
                setIsCatDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Fetch story data
    useEffect(() => {
        const fetchStory = async () => {
            try {
                setIsLoading(true);
                const data = await StoryService.getStoryById(storyId);
                setTitle(data.title);
                setContent(data.content);
                setSelectedCatId(data.catId || 0);

                try {
                    const storyMediaList = await StoryMediaService.getStoryMediaByStoryId(storyId);
                    if (storyMediaList && storyMediaList.length > 0) {
                        const mediaItems = await Promise.all(storyMediaList.map(async (sm) => {
                            const fileObj = await MediaFilesService.getMediaFileById(sm.mediaId);
                            const blobUrl = await FileUploadService.fetchImageBlobUrl(fileObj.urlPath);
                            return {
                                id: sm.id,
                                mediaFileId: sm.mediaId,
                                fileKey: fileObj.urlPath,
                                blobUrl: blobUrl,
                                isNew: false
                            };
                        }));
                        setAttachedMedia(mediaItems);
                    }
                } catch (mediaErr) {
                    console.warn("Lỗi tải ảnh đính kèm:", mediaErr);
                }

            } catch (error) {
                console.error("Lỗi khi tải câu chuyện:", error);
                setErrorMsg("Không thể tải nội dung câu chuyện. Có thể câu chuyện đã bị xóa hoặc kết nối mạng có vấn đề.");
            } finally {
                setIsLoading(false);
            }
        };

        if (storyId) {
            fetchStory();
        }
    }, [storyId]);

    // Fetch categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setIsLoadingCategories(true);
                const res = await CategoriesService.getCategories(0, 50);
                if (res && res.content) {
                    setCategories(res.content);
                }
            } catch (error) {
                console.error("Lỗi khi load danh mục:", error);
            } finally {
                setIsLoadingCategories(false);
            }
        };
        fetchCategories();
    }, []);

    // Writing prompts by category
    const writingPrompts = useMemo(() => {
        switch (selectedCatId) {
            case 1:
                return ["Kể về bữa cơm tối nhớ nhất?", "Một thói quen đặc biệt của Ba/Mẹ?", "Ngày đầu tiên đón con/cháu chào đời?"];
            case 2:
                return ["Trò chơi ngày bé bạn hay chơi?", "Người bạn thân nhất thời đi học là ai?", "Lần đầu tiên đi xa nhà?"];
            case 3:
                return ["Món đồ chơi đầu tiên bạn được tặng?", "Câu chuyện đằng sau một bức ảnh cũ?", "Âm thanh hoặc mùi hương nào gợi nhớ quá khứ?"];
            case 4:
                return ["Một lời khuyên đắt giá bạn từng nhận được?", "Bạn đã học được gì từ một sai lầm lớn?", "Định nghĩa về hạnh phúc của bạn hiện tại?"];
            case 5:
                return ["Ngày đầu tiên đi làm diễn ra thế nào?", "Một người đồng nghiệp đáng nhớ?", "Thành tựu lớn nhất trong sự nghiệp?"];
            default:
                return ["Hãy bắt đầu bằng việc mô tả thời gian và địa điểm...", "Hôm đó thời tiết thế nào?", "Ai là người xuất hiện chính trong kỷ niệm này?"];
        }
    }, [selectedCatId]);

    const handleUpdate = async () => {
        if (!title.trim() || !content.trim()) {
            setErrorMsg("Vui lòng nhập đầy đủ tiêu đề và nội dung câu chuyện.");
            return;
        }

        setErrorMsg("");
        setIsSaving(true);

        try {
            await StoryService.updateStory(storyId, {
                catId: selectedCatId > 0 ? selectedCatId : null,
                title: title.trim(),
                content: content.trim()
            });

            if (deletedStoryMediaIds.length > 0) {
                await Promise.all(deletedStoryMediaIds.map(id => StoryMediaService.deleteStoryMedia(id).catch(e => console.error(e))));
            }

            const newMedia = attachedMedia.filter(m => m.isNew);
            if (newMedia.length > 0) {
                await Promise.all(newMedia.map(m =>
                    StoryMediaService.createStoryMedia({
                        storyId: storyId,
                        mediaId: m.mediaFileId,
                        caption: ""
                    })
                ));
            }

            setShowSuccess(true);
            setTimeout(() => {
                router.push(`/story/${storyId}`);
            }, 3000);

        } catch (error) {
            console.error("Lỗi khi cập nhật bài:", error);
            setErrorMsg("Lưu thất bại. Vui lòng kiểm tra mạng và thử lại!");
        } finally {
            setIsSaving(false);
        }
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
                    title: file.name
                });

                setAttachedMedia(prev => [...prev, {
                    id: undefined,
                    mediaFileId: mediaRes.id,
                    fileKey: uploadRes.key,
                    blobUrl: blobUrl,
                    isNew: true
                }]);
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
            setDeletedStoryMediaIds(prev => [...prev, target.id!]);
        } else {
            try {
                await MediaFilesService.deleteMediaFile(target.mediaFileId);
                await FileUploadService.deleteFile(target.fileKey);
            } catch (e) {}
        }
        URL.revokeObjectURL(target.blobUrl);
        setAttachedMedia(prev => prev.filter((_, i) => i !== index));
    };

    // Selected category object
    const selectedCategory = categories.find(c => c.id === selectedCatId) ?? null;

    if (isLoading) {
        return (
            <MainLayout>
                <div className="max-w-3xl mx-auto flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                    <Loader2 className="w-10 h-10 text-emerald-700 animate-spin" />
                    <p className="text-lg text-stone-700 font-medium">Đang tìm lại kỷ niệm cũ...</p>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="max-w-3xl mx-auto space-y-8 pb-20">

                {/* ═══ HEADER BANNER ═══════════════════════════════════════════ */}
                <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                        <PenTool className="w-32 h-32 text-emerald-800" aria-hidden="true" />
                    </div>

                    <div className="relative z-10 space-y-3">
                        <button
                            onClick={() => router.back()}
                            className="flex items-center gap-2 text-emerald-800 hover:text-emerald-900 transition-colors font-bold text-lg w-fit bg-white/60 px-4 py-2 rounded-xl"
                            aria-label="Quay lại"
                        >
                            <ArrowLeft className="w-6 h-6" />
                            <span>Quay lại</span>
                        </button>
                        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
                            Sửa câu chuyện cũ
                        </h1>
                    </div>

                    <button
                        onClick={handleUpdate}
                        disabled={isSaving || showSuccess}
                        className={`relative z-10 flex items-center justify-center gap-2 min-h-[56px] px-8 py-3 rounded-xl text-xl font-bold transition-all shadow-md shrink-0 ${
                            showSuccess
                                ? "bg-emerald-100 text-emerald-800 border-2 border-emerald-300"
                                : "bg-emerald-800 text-white hover:bg-emerald-900 disabled:opacity-50 disabled:cursor-not-allowed"
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
                <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6 md:p-10 space-y-8">

                    {/* Tiêu đề */}
                    <div className="space-y-1.5">
                        <label htmlFor="story-title" className="text-sm font-semibold text-stone-500 ml-1">Tiêu đề kỷ niệm</label>
                        <input
                            id="story-title"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Viết tiêu đề ngắn gọn (ví dụ: Tết năm 1975)..."
                            className="w-full text-2xl md:text-3xl font-extrabold text-gray-900 placeholder-gray-400 bg-transparent border-none focus:ring-0 focus:outline-none p-0"
                        />
                    </div>

                    <hr className="border-gray-100" />

                    {/* ═══ CATEGORY DROPDOWN (Styled — có màu + icon) ══════════ */}
                    <div className="space-y-3">
                        <label className="text-lg font-bold text-gray-700 block">
                            Đây là câu chuyện về chủ đề gì?
                        </label>

                        {isLoadingCategories ? (
                            <div className="flex items-center gap-3 text-emerald-700 py-2">
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span className="text-base font-medium">Đang tải danh sách chủ đề...</span>
                            </div>
                        ) : (
                            <div className="relative" ref={catDropdownRef}>
                                {/* Trigger Button */}
                                <button
                                    type="button"
                                    onClick={() => setIsCatDropdownOpen(prev => !prev)}
                                    className="w-full flex items-center justify-between gap-3 border-2 border-gray-200 hover:border-emerald-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 rounded-xl px-4 py-3 min-h-[56px] outline-none transition-colors bg-white"
                                >
                                    {selectedCatId === 0 || !selectedCategory ? (
                                        <span className="text-gray-500 font-medium text-lg">— Không chọn chủ đề</span>
                                    ) : (
                                        <span className="flex items-center gap-3">
                                            <span
                                                className="w-8 h-8 rounded-lg flex items-center justify-center text-xl shrink-0"
                                                style={{ backgroundColor: selectedCategory.color ? selectedCategory.color + "22" : "#d1fae5" }}
                                            >
                                                {selectedCategory.icon || "🏷️"}
                                            </span>
                                            <span className="text-lg font-bold" style={{ color: selectedCategory.color || "#064e3b" }}>
                                                {selectedCategory.name}
                                            </span>
                                        </span>
                                    )}
                                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform shrink-0 ${isCatDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {/* Dropdown List */}
                                {isCatDropdownOpen && (
                                    <div className="absolute z-30 top-full mt-2 left-0 right-0 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden">
                                        <div className="max-h-64 overflow-y-auto py-2">
                                            {/* Option: Không chọn */}
                                            <button
                                                type="button"
                                                onClick={() => { setSelectedCatId(0); setIsCatDropdownOpen(false); }}
                                                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-emerald-50 transition-colors text-left ${selectedCatId === 0 ? 'bg-emerald-50' : ''}`}
                                            >
                                                <span className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-xl shrink-0">—</span>
                                                <span className="text-base font-medium text-gray-500">— Không chọn chủ đề</span>
                                                {selectedCatId === 0 && <CheckCircle2 className="w-4 h-4 text-emerald-600 ml-auto" />}
                                            </button>

                                            {categories.map(cat => (
                                                <button
                                                    key={cat.id}
                                                    type="button"
                                                    onClick={() => { setSelectedCatId(cat.id); setIsCatDropdownOpen(false); }}
                                                    className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-emerald-50 transition-colors text-left ${selectedCatId === cat.id ? 'bg-emerald-50' : ''}`}
                                                >
                                                    <span
                                                        className="w-8 h-8 rounded-lg flex items-center justify-center text-xl shrink-0"
                                                        style={{ backgroundColor: cat.color ? cat.color + "22" : "#d1fae5" }}
                                                    >
                                                        {cat.icon || "🏷️"}
                                                    </span>
                                                    <span className="text-base font-bold" style={{ color: cat.color || "#064e3b" }}>
                                                        {cat.name}
                                                    </span>
                                                    {selectedCatId === cat.id && <CheckCircle2 className="w-4 h-4 text-emerald-600 ml-auto" />}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <hr className="border-gray-100" />

                    {/* Nội dung */}
                    <div className="space-y-1.5">
                        <label htmlFor="story-content" className="text-sm font-semibold text-stone-500 ml-1">Nội dung câu chuyện</label>
                        <textarea
                            id="story-content"
                            ref={textareaRef}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Nhớ lại và kể lại câu chuyện tại đây nhé..."
                            className="w-full text-xl md:text-2xl text-gray-800 leading-[1.9] placeholder-gray-400 bg-transparent border-none focus:ring-0 focus:outline-none p-0 min-h-[280px] resize-none overflow-hidden font-medium tracking-wide"
                        />
                    </div>

                    {/* Hình ảnh */}
                    <div className="pt-8 border-t border-gray-100">
                        {attachedMedia.length > 0 && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                {attachedMedia.map((m, index) => (
                                    <div key={index} className="relative group rounded-xl overflow-hidden border border-gray-200 shadow-sm aspect-square bg-gray-50">
                                        <img src={m.blobUrl} alt="preview" className="w-full h-full object-cover" />
                                        <button
                                            onClick={() => handleRemoveMedia(index)}
                                            className="absolute top-2 right-2 p-1.5 bg-red-100/90 text-red-600 rounded-full hover:bg-red-200 transition-colors opacity-0 group-hover:opacity-100 shadow-sm"
                                            title="Xoá ảnh"
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
                            className={`flex items-center gap-3 min-h-[64px] px-6 py-4 bg-gray-50 hover:bg-emerald-50 text-gray-700 hover:text-emerald-800 border-2 border-dashed border-gray-300 hover:border-emerald-300 rounded-2xl text-lg font-bold transition-colors w-full sm:w-auto justify-center shadow-sm ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {isUploading ? <Loader2 className="w-8 h-8 animate-spin" /> : <ImageIcon className="w-8 h-8" />}
                            <span>{isUploading ? 'Đang tải ảnh...' : 'Thêm hoặc thay đổi hình ảnh (Không bắt buộc)'}</span>
                        </button>
                        <p className="mt-4 text-lg text-gray-500 font-medium">
                            * Ảnh giúp câu chuyện của bạn thêm sinh động.
                        </p>
                    </div>
                </div>

                {/* ═══ GÓC GỢI Ý ════════════════════════════════════════════════ */}
                <div className="bg-amber-50 border-2 border-amber-200 rounded-3xl p-6 md:p-8 flex items-start gap-4 md:gap-6 shadow-sm">
                    <div className="bg-amber-100 p-3 rounded-full shrink-0 shadow-sm border border-amber-200">
                        <Lightbulb className="w-8 h-8 md:w-10 md:h-10 text-amber-700" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-xl md:text-2xl font-bold text-amber-900 mb-3">Góc gợi ý kỷ niệm</h3>
                        <p className="text-base text-amber-800 font-medium mb-4">
                            Nếu bạn chưa nhớ ra nên viết gì, hãy thử nhớ về:
                        </p>
                        <ul className="space-y-3">
                            {writingPrompts.map((prompt, index) => (
                                <li key={index} className="flex items-start gap-3 bg-white/60 p-3 rounded-xl border border-amber-100">
                                    <div className="font-bold text-lg text-amber-700 mt-0.5">•</div>
                                    <p className="text-base text-amber-900 font-medium leading-relaxed">{prompt}</p>
                                </li>
                            ))}
                        </ul>
                        {selectedCategory && (
                            <p className="mt-4 text-sm text-amber-700 font-semibold">
                                Gợi ý theo chủ đề: <span style={{ color: selectedCategory.color || "#064e3b" }}>{selectedCategory.icon} {selectedCategory.name}</span>
                            </p>
                        )}
                    </div>
                </div>

            </div>
        </MainLayout>
    );
}