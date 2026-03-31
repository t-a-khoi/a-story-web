"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";
import { Save, Image as ImageIcon, ArrowLeft, Lightbulb, CheckCircle2, PenTool, AlertCircle } from "lucide-react";
import { StoryService } from "@/services/stories.service";

export default function WritePage() {
    const router = useRouter();
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [selectedCatId, setSelectedCatId] = useState<number>(0);

    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    // Tự động điều chỉnh chiều cao của Textarea khi nội dung dài ra
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [content]);

    const handleSave = async () => {
        if (!title.trim() || !content.trim() || selectedCatId === 0) {
            setErrorMsg("Vui lòng nhập đầy đủ tiêu đề, danh mục và nội dung câu chuyện.");
            return;
        }

        setErrorMsg("");
        setIsSaving(true);

        try {
            // Gọi API thực tế
            const responseData = await StoryService.createStory({
                userId: 1,      // FIXME: Lấy auth context thực tế khi tích hợp
                profileId: 1,   // FIXME: Lấy profile context thực tế khi tích hợp
                catId: selectedCatId,
                title: title.trim(),
                content: content.trim()
            });

            console.log("✅ Dữ liệu đẩy lên Server thành công! Body trả về:", responseData);
            alert("Dữ liệu THẬT từ Server API trả về:\n\n" + JSON.stringify(responseData, null, 2));

            setShowSuccess(true);

            // Chờ 3 giây để người dùng đọc thông báo thành công, sau đó về trang chủ
            setTimeout(() => {
                router.push("/home");
            }, 3000);

        } catch (error) {
            console.error("Lỗi khi lưu bài:", error);
            setErrorMsg("Đã có kết nối lỗi xảy ra khi lưu lên máy chủ. Vui lòng thử lại!");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <MainLayout>
            <div className="max-w-3xl mx-auto space-y-8 pb-20">

                {/* HEADER BANNER - Nhỏ gọn để người dùng tập trung viết */}
                <div className="bg-emerald-50 border-2 border-emerald-100 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                        <PenTool className="w-32 h-32 text-emerald-800" aria-hidden="true" />
                    </div>

                    <div className="relative z-10 space-y-3">
                        <button
                            onClick={() => router.push("/home")}
                            className="flex items-center gap-2 text-emerald-800 hover:text-emerald-900 transition-colors font-bold text-lg w-fit bg-white/60 px-4 py-2 rounded-xl"
                        >
                            <ArrowLeft className="w-6 h-6" />
                            <span>Quay lại</span>
                        </button>
                        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
                            Kể câu chuyện mới
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
                                <span>Đã lưu kỷ niệm!</span>
                            </>
                        ) : isSaving ? (
                            <span>Đang lưu...</span>
                        ) : (
                            <>
                                <Save className="w-6 h-6" />
                                <span>Lưu câu chuyện</span>
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
                        <h3 className="text-xl md:text-2xl font-bold text-amber-900 mb-2">Gợi ý hôm nay:</h3>
                        <p className="text-lg md:text-xl text-amber-800 leading-relaxed font-medium">
                            "Hãy kể về một món đồ vật gắn bó với bạn từ thời trẻ mà đến giờ bạn vẫn còn giữ lại. Nó mang ý nghĩa gì với bạn?"
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
                        placeholder="Viết tiêu đề (ví dụ: Chiếc radio cũ năm 1990)..."
                        className="w-full text-2xl md:text-3xl font-extrabold text-gray-900 placeholder-gray-400 bg-transparent border-none focus:ring-0 focus:outline-none p-0"
                    />

                    <hr className="border-gray-100" />

                    {/* Select Danh mục */}
                    <div className="space-y-3">
                        <label className="text-lg font-bold text-gray-700 block">
                            Bạn xoay quanh chủ đề nào?
                        </label>
                        <select
                            value={selectedCatId}
                            onChange={(e) => setSelectedCatId(Number(e.target.value))}
                            className="w-full text-xl text-gray-900 font-medium border-2 border-gray-300 hover:border-emerald-300 focus:border-emerald-500 rounded-xl px-4 py-3 min-h-[56px] focus:ring-4 focus:ring-emerald-100 outline-none"
                        >
                            <option value={0} disabled>Chọn danh mục câu chuyện...</option>
                            <option value={1}>Gia đình</option>
                            <option value={2}>Tuổi trẻ</option>
                            <option value={3}>Kỷ niệm & Đồ vật</option>
                            <option value={4}>Kinh nghiệm sống</option>
                            <option value={5}>Chuyện nghề</option>
                        </select>
                    </div>

                    <hr className="border-gray-100" />

                    {/* Textarea Nội dung */}
                    <textarea
                        ref={textareaRef}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Bắt đầu kể câu chuyện của bạn tại đây..."
                        className="w-full text-xl md:text-2xl text-gray-800 leading-relaxed md:leading-[1.8] placeholder-gray-400 bg-transparent border-none focus:ring-0 focus:outline-none p-0 min-h-[300px] resize-none overflow-hidden"
                    />

                    {/* Nút Thêm hình ảnh */}
                    <div className="pt-8 border-t border-gray-100">
                        <button className="flex items-center gap-3 min-h-[64px] px-6 py-4 bg-gray-50 hover:bg-emerald-50 text-gray-700 hover:text-emerald-800 border-2 border-dashed border-gray-300 hover:border-emerald-300 rounded-2xl text-lg font-bold transition-colors w-full sm:w-auto justify-center shadow-sm">
                            <ImageIcon className="w-8 h-8" />
                            <span>Đính kèm một bức ảnh kỷ niệm</span>
                        </button>
                        <p className="mt-4 text-lg text-gray-500 font-medium">
                            * Ảnh giúp câu chuyện của bạn thêm sinh động (không bắt buộc).
                        </p>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}