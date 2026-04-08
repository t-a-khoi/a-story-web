"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";
import { Save, Image as ImageIcon, ArrowLeft, Lightbulb, CheckCircle2, PenTool, AlertCircle, XCircle, Loader2, ChevronDown } from "lucide-react";
import { StoryService } from "@/services/stories.service";
import { FileUploadService } from "@/services/fileUpload.service";
import { MediaFilesService } from "@/services/mediaFiles.service";
import { StoryMediaService } from "@/services/storyMedia.service";
import { CategoriesService } from "@/services/categories.service";
import { Category } from "@/types/story";
import { useAuthStore } from "@/store/useAuthStore";
import { useTranslation } from "@/store/useLanguageStore";

export default function WritePage() {
    const router = useRouter();
    const { t } = useTranslation();
    const { user, profile } = useAuthStore();
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [selectedCatId, setSelectedCatId] = useState<number>(0);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoadingCategories, setIsLoadingCategories] = useState(true);

    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [isCatDropdownOpen, setIsCatDropdownOpen] = useState(false);
    const catDropdownRef = useRef<HTMLDivElement>(null);

    // Media states
    const [attachedMedia, setAttachedMedia] = useState<{ id: number; fileKey: string; blobUrl: string }[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

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

    const handleSave = async () => {
        if (!title.trim() || !content.trim()) {
            setErrorMsg(t("write.validationError"));
            return;
        }

        setErrorMsg("");
        setIsSaving(true);

        try {
            const responseData = await StoryService.createStory({
                userId: user?.id as number,
                profileId: profile?.id as number,
                catId: selectedCatId > 0 ? selectedCatId : null,
                title: title.trim(),
                content: content.trim()
            });

            if (attachedMedia.length > 0 && responseData.id) {
                await Promise.all(attachedMedia.map((m, index) =>
                    StoryMediaService.createStoryMedia({
                        storyId: responseData.id,
                        mediaId: m.id,
                        caption: ""
                    })
                ));
            }

            console.log("✅ Dữ liệu đẩy lên Server thành công! Body trả về:", responseData);
            alert("Dữ liệu THẬT từ Server API trả về:\n\n" + JSON.stringify(responseData, null, 2));

            setShowSuccess(true);

            setTimeout(() => {
                router.push("/home");
            }, 3000);

        } catch (error) {
            console.error("Lỗi khi lưu bài:", error);
            setErrorMsg(t("write.serverError"));
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
        <MainLayout>
            <div className="max-w-3xl mx-auto space-y-8 pb-20">

                {/* HEADER BANNER */}
                <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                        <PenTool className="w-32 h-32 text-emerald-800" aria-hidden="true" />
                    </div>

                    <div className="relative z-10 space-y-2">
                        <button
                            onClick={() => router.push("/home")}
                            className="flex items-center gap-2 text-emerald-800 hover:text-emerald-900 transition-colors font-bold text-lg w-fit bg-white/60 px-4 py-2 rounded-xl"
                        >
                            <ArrowLeft className="w-6 h-6" />
                            <span>{t("write.backButton")}</span>
                        </button>
                        <h1 className="text-2xl md:text-3xl font-extrabold text-emerald-900 tracking-tight">
                            {t("write.headerTitle")}
                        </h1>
                    </div>

                    {/* Nút Lưu bài */}
                    <button
                        onClick={handleSave}
                        disabled={isSaving || showSuccess}
                        className={`relative z-10 flex items-center justify-center gap-2 min-h-[56px] px-8 py-3 rounded-xl text-xl font-bold transition-all shadow-md shrink-0 ${showSuccess
                            ? "bg-emerald-100 text-emerald-800 border-2 border-emerald-300"
                            : "bg-emerald-800 text-white hover:bg-emerald-900 disabled:opacity-50 disabled:cursor-not-allowed"
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
                <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6 md:p-10 space-y-8">
                    {/* Input Tiêu đề */}
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder={t("write.titlePlaceholder")}
                        className="w-full text-2xl md:text-3xl font-extrabold text-gray-900 placeholder-gray-400 bg-transparent border-none focus:ring-0 focus:outline-none p-0"
                    />

                    <hr className="border-gray-100" />

                    {/* Chọn Chủ đề */}
                    {/* <div className="space-y-3">
                        <label className="text-lg font-bold text-gray-700 block">
                            {t("write.categoryLabel")}
                        </label>

                        {isLoadingCategories ? (
                            <div className="flex items-center gap-3 text-emerald-700 py-2">
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span className="text-base font-medium">{t("write.categoryLoading")}</span>
                            </div>
                        ) : (
                            <div className="relative" ref={catDropdownRef}>
                                {/* Trigger Button */}
                    {/* <button
                                    type="button"
                                    onClick={() => setIsCatDropdownOpen(prev => !prev)}
                                    className="w-full flex items-center justify-between gap-3 border-2 border-gray-200 hover:border-emerald-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 rounded-xl px-4 py-3 min-h-[56px] outline-none transition-colors bg-white"
                                >
                                    {selectedCatId === 0 ? (
                                        <span className="text-gray-500 font-medium text-lg">{t("write.categoryNone")}</span>
                                    ) : (() => {
                                        const selected = categories.find(c => c.id === selectedCatId);
                                        return selected ? (
                                            <span className="flex items-center gap-3">
                                                <span
                                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-xl shrink-0"
                                                    style={{ backgroundColor: selected.color ? selected.color + "22" : "#d1fae5" }}
                                                >
                                                    {selected.icon || "🏷️"}
                                                </span>
                                                <span className="text-lg font-bold" style={{ color: selected.color || "#064e3b" }}>
                                                    {selected.name}
                                                </span>
                                            </span>
                                        ) : null;
                                    })()}
                                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform shrink-0 ${isCatDropdownOpen ? 'rotate-180' : ''}`} />
                                </button> */}

                    {/* Dropdown List */}
                    {/* {isCatDropdownOpen && (
                                    <div className="absolute z-30 top-full mt-2 left-0 right-0 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden">
                                        <div className="max-h-64 overflow-y-auto py-2">
                                            {/* Option: Không chọn */}
                    {/* <button
                                                type="button"
                                                onClick={() => { setSelectedCatId(0); setIsCatDropdownOpen(false); }}
                                                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-emerald-50 transition-colors text-left ${
                                                    selectedCatId === 0 ? 'bg-emerald-50' : ''
                                                }`}
                                            >
                                                <span className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-xl shrink-0">—</span>
                                                <span className="text-base font-medium text-gray-500">{t("write.categoryNone")}</span>
                                                {selectedCatId === 0 && <CheckCircle2 className="w-4 h-4 text-emerald-600 ml-auto" />}
                                            </button>

                                            {categories.map(cat => (
                                                <button
                                                    key={cat.id}
                                                    type="button"
                                                    onClick={() => { setSelectedCatId(cat.id); setIsCatDropdownOpen(false); }}
                                                    className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-emerald-50 transition-colors text-left ${
                                                        selectedCatId === cat.id ? 'bg-emerald-50' : ''
                                                    }`}
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
                    </div> */}

                    <hr className="border-gray-100" />

                    {/* Textarea Nội dung */}
                    <textarea
                        ref={textareaRef}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder={t("write.contentPlaceholder")}
                        className="w-full text-xl md:text-2xl text-gray-800 leading-relaxed md:leading-[1.8] placeholder-gray-400 bg-transparent border-none focus:ring-0 focus:outline-none p-0 min-h-[300px] resize-none overflow-hidden"
                    />

                    {/* Nút Thêm hình ảnh */}
                    <div className="pt-8 border-t border-gray-100">
                        {/* Danh sách ảnh đã đính kèm */}
                        {attachedMedia.length > 0 && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                {attachedMedia.map((m, index) => (
                                    <div key={index} className="relative group rounded-xl overflow-hidden border border-gray-200 shadow-sm aspect-square bg-gray-50">
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
                            className={`flex items-center gap-3 min-h-[64px] px-6 py-4 bg-gray-50 hover:bg-emerald-50 text-gray-700 hover:text-emerald-800 border-2 border-dashed border-gray-300 hover:border-emerald-300 rounded-2xl text-lg font-bold transition-colors w-full sm:w-auto justify-center shadow-sm ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {isUploading ? <Loader2 className="w-8 h-8 animate-spin" /> : <ImageIcon className="w-8 h-8" />}
                            <span>{isUploading ? t("write.uploadingPhoto") : t("write.attachPhoto")}</span>
                        </button>
                        <p className="mt-4 text-lg text-gray-500 font-medium">
                            {t("write.photoHint")}
                        </p>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}