"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";
import { Save, Image as ImageIcon, ArrowLeft, Lightbulb, CheckCircle2 } from "lucide-react";

export default function WritePage() {
    const router = useRouter();
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    // Tự động điều chỉnh chiều cao của Textarea khi nội dung dài ra
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [content]);

    const handleSave = async () => {
        if (!title.trim() && !content.trim()) return;

        setIsSaving(true);

        try {
            // Giả lập gọi API lưu bài viết
            await new Promise((resolve) => setTimeout(resolve, 1500));

            setShowSuccess(true);

            // Chờ 2 giây để người dùng đọc thông báo thành công, sau đó về trang chủ
            setTimeout(() => {
                router.push("/home");
            }, 2000);

        } catch (error) {
            console.error("Lỗi khi lưu bài:", error);
            alert("Đã có lỗi xảy ra khi lưu. Vui lòng thử lại!");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <MainLayout>
            <div className="max-w-3xl mx-auto space-y-8 pb-20">

                {/* THANH ĐIỀU HƯỚNG TRONG TRANG VIẾT */}
                <div className="flex items-center justify-between border-b-2 border-gray-200 pb-4">
                    <button
                        onClick={() => router.push("/home")}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors min-h-[48px] px-2 rounded-lg font-bold text-lg"
                    >
                        <ArrowLeft className="w-6 h-6" />
                        <span>Quay lại</span>
                    </button>

                    {/* Nút Lưu bài - To, rõ ràng, màu xanh khích lệ */}
                    <button
                        onClick={handleSave}
                        disabled={isSaving || (!title.trim() && !content.trim()) || showSuccess}
                        className={`flex items-center gap-2 min-h-[56px] px-8 rounded-xl text-xl font-bold transition-all shadow-sm ${showSuccess
                                ? "bg-emerald-100 text-emerald-800 border-2 border-emerald-300"
                                : "bg-emerald-800 text-white hover:bg-emerald-900 disabled:opacity-50 disabled:cursor-not-allowed"
                            }`}
                    >
                        {showSuccess ? (
                            <>
                                <CheckCircle2 className="w-6 h-6" />
                                <span>Đã lưu thành công!</span>
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

                {/* GỢI Ý CHỦ ĐỀ (Writing Prompt) - Giúp người lớn tuổi dễ bắt đầu */}
                <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6 flex items-start gap-4">
                    <div className="bg-amber-100 p-3 rounded-full shrink-0">
                        <Lightbulb className="w-8 h-8 text-amber-700" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-amber-900 mb-2">Gợi ý hôm nay:</h3>
                        <p className="text-xl text-amber-800 leading-relaxed font-medium">
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
                        className="w-full text-3xl md:text-4xl font-extrabold text-gray-950 placeholder-gray-400 bg-transparent border-none focus:ring-0 focus:outline-none p-0"
                    />

                    <hr className="border-gray-100" />

                    {/* Textarea Nội dung */}
                    <textarea
                        ref={textareaRef}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Bắt đầu kể câu chuyện của bạn tại đây..."
                        className="w-full text-xl md:text-2xl text-gray-800 leading-[1.8] placeholder-gray-400 bg-transparent border-none focus:ring-0 focus:outline-none p-0 min-h-[300px] resize-none overflow-hidden"
                    />

                    {/* Nút Thêm hình ảnh */}
                    <div className="pt-8 border-t border-gray-100">
                        <button className="flex items-center gap-3 min-h-[56px] px-6 py-3 bg-gray-50 hover:bg-emerald-50 text-gray-700 hover:text-emerald-800 border-2 border-dashed border-gray-300 hover:border-emerald-300 rounded-2xl text-lg font-bold transition-colors w-full sm:w-auto justify-center">
                            <ImageIcon className="w-7 h-7" />
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