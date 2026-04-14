"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Save, Image as ImageIcon, ArrowLeft, Lightbulb, CheckCircle2, PenTool, AlertCircle, XCircle, Loader2, ChevronDown } from "lucide-react";
import { FileUploadService } from "@/services/fileUpload.service";
import { MediaFilesService } from "@/services/mediaFiles.service";
import { CategoriesService } from "@/services/categories.service";
import { Category } from "@/types/story";
import { useAuthStore } from "@/store/useAuthStore";
import { useTranslation } from "@/store/useLanguageStore";
import { useCreateStory } from "@/hooks/queries/useWrite";

export default function WriteForm() {
    const router = useRouter();
    const { t } = useTranslation();
    const { user } = useAuthStore();
    
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [selectedCatId, setSelectedCatId] = useState<number>(0);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoadingCategories, setIsLoadingCategories] = useState(true);

    const [showSuccess, setShowSuccess] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [isCatDropdownOpen, setIsCatDropdownOpen] = useState(false);
    const catDropdownRef = useRef<HTMLDivElement>(null);

    // Media states
    const [attachedMedia, setAttachedMedia] = useState<{ id: number; fileKey: string; blobUrl: string }[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const { mutate: createStory, isPending: isSaving } = useCreateStory();

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [content]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (catDropdownRef.current && !catDropdownRef.current.contains(e.target as Node)) {
                setIsCatDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

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

    const handleSave = () => {
        if (!title.trim() || !content.trim()) {
            setErrorMsg(t("write.validationError"));
            return;
        }

        setErrorMsg("");

        createStory(
            {
                title,
                content,
                catId: selectedCatId > 0 ? selectedCatId : null,
                mediaIds: attachedMedia.map(m => m.id)
            },
            {
                onSuccess: (data) => {
                    console.log("Dữ liệu lưu thành công:", data);
                    setShowSuccess(true);
                    setTimeout(() => {
                        router.push("/home");
                    }, 3000);
                },
                onError: (error) => {
                    console.error("Lỗi khi lưu bài:", error);
                    setErrorMsg(t("write.serverError"));
                },
                onSettled: (_data, error) => {
                    // Đảm bảo button không bị kẹt trong trạng thái disabled
                    // Nếu có lỗi nghiêm trọng (không phải validation), scroll lên trên để user thấy thông báo
                    if (error) {
                        window.scrollTo({ top: 0, behavior: "smooth" });
                    }
                },
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
                    userId: user?.id as number,
                    categoryId: null,
                    mediaType: "IMAGE",
                    urlPath: uploadRes.key,
                    fileSize: uploadRes.size,
                    title: file.name
                });

                setAttachedMedia(prev => [...prev, {
                    id: mediaRes.id,
                    fileKey: uploadRes.key,
                    blobUrl: blobUrl
                }]);
            }
        } catch (error) {
            console.error("Lỗi upload ảnh:", error);
            setErrorMsg(t("write.uploadError"));
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const handleRemoveMedia = async (index: number) => {
        const target = attachedMedia[index];
        try {
            await MediaFilesService.deleteMediaFile(target.id);
            await FileUploadService.deleteFile(target.fileKey);
        } catch (error) {
            console.warn("Failed to cleanup deleted file", error);
        }

        URL.revokeObjectURL(target.blobUrl);
        setAttachedMedia(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8 pb-20">

            {/* HEADER BANNER */}
            <div className="bg-teal-50 border border-teal-100 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                    <PenTool className="w-32 h-32 text-teal-800" aria-hidden="true" />
                </div>

                <div className="relative z-10 space-y-2">
                    <button
                        onClick={() => router.push("/home")}
                        className="flex items-center gap-2 text-teal-800 hover:text-teal-900 transition-colors font-bold text-lg w-fit bg-white/60 px-4 py-2 rounded-xl"
                    >
                        <ArrowLeft className="w-6 h-6" />
                        <span>{t("write.backButton")}</span>
                    </button>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-teal-900 tracking-tight">
                        {t("write.headerTitle")}
                    </h1>
                </div>

                {/* Nút Lưu bài */}
                <button
                    onClick={handleSave}
                    disabled={isSaving || showSuccess}
                    className={`relative z-10 flex items-center justify-center gap-2 min-h-[56px] px-8 py-3 rounded-xl text-xl font-bold transition-all shadow-md shrink-0 ${showSuccess
                        ? "bg-teal-50 text-teal-700 border-2 border-teal-300"
                        : "bg-white hover:bg-teal-50 text-teal-700 border-2 border-teal-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        }`}
                >
                    {showSuccess ? (
                        <>
                            <CheckCircle2 className="w-6 h-6" />
                            <span>{t("write.savedSuccess")}</span>
                        </>
                    ) : isSaving ? (
                        <span>{t("write.saving")}</span>
                    ) : (
                        <>
                            <Save className="w-6 h-6" />
                            <span>{t("write.saveButton")}</span>
                        </>
                    )}
                </button>
            </div>

            {/* THÔNG BÁO LỖI */}
            {errorMsg && (
                <div className="flex items-center gap-3 bg-red-50 text-red-700 p-6 rounded-2xl shadow-sm border-2 border-red-200">
                    <AlertCircle className="w-8 h-8 flex-shrink-0" aria-hidden="true" />
                    <p className="text-lg font-bold">{errorMsg}</p>
                </div>
            )}

            {/* GỢI Ý CHỦ ĐỀ (Writing Prompt) */}
            <div className="bg-amber-50 border-2 border-amber-200 rounded-3xl p-6 md:p-8 flex items-start gap-4 md:gap-6 shadow-sm">
                <div className="bg-amber-100 p-3 rounded-full shrink-0 shadow-sm border border-amber-200">
                    <Lightbulb className="w-8 h-8 md:w-10 md:h-10 text-amber-700" />
                </div>
                <div>
                    <h3 className="text-xl md:text-2xl font-bold text-amber-900 mb-2">{t("write.promptTitle")}</h3>
                    <p className="text-lg md:text-xl text-amber-800 leading-relaxed font-medium">
                        {t("write.promptText")}
                    </p>
                </div>
            </div>

            {/* KHU VỰC SOẠN THẢO CHÍNH */}
            <div className="bg-white rounded-3xl shadow-sm border border-pearl-200 p-6 md:p-10 space-y-8">
                {/* Input Tiêu đề */}
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={t("write.titlePlaceholder")}
                    className="w-full text-2xl md:text-3xl font-extrabold text-charcoal-900 placeholder-charcoal-400 bg-transparent border-none focus:ring-0 focus:outline-none p-0"
                />

                <hr className="border-pearl-100" />

                {/* Textarea Nội dung */}
                <textarea
                    ref={textareaRef}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={t("write.contentPlaceholder")}
                    className="w-full text-xl md:text-2xl text-charcoal-800 leading-relaxed md:leading-[1.8] placeholder-charcoal-400 bg-transparent border-none focus:ring-0 focus:outline-none p-0 min-h-[300px] resize-none overflow-hidden"
                />

                {/* Nút Thêm hình ảnh */}
                <div className="pt-8 border-t border-pearl-100">
                    {/* Danh sách ảnh đã đính kèm */}
                    {attachedMedia.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            {attachedMedia.map((m, index) => (
                                <div key={index} className="relative group rounded-xl overflow-hidden border border-pearl-200 shadow-sm aspect-square bg-pearl-50">
                                    <img src={m.blobUrl} alt="preview" className="w-full h-full object-cover" />
                                    <button
                                        onClick={() => handleRemoveMedia(index)}
                                        className="absolute top-2 right-2 p-1.5 bg-red-100/90 text-red-600 rounded-full hover:bg-red-200 transition-colors opacity-0 group-hover:opacity-100 shadow-sm"
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
                        <span>{isUploading ? t("write.uploadingPhoto") : t("write.attachPhoto")}</span>
                    </button>
                    <p className="mt-4 text-lg text-charcoal-500 font-medium">
                        {t("write.photoHint")}
                    </p>
                </div>
            </div>
        </div>
    );
}
