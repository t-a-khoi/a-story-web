"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";
import { Image as ImageIcon, Save, XCircle, Tag } from "lucide-react";

export default function WriteStoryPage() {
    const router = useRouter();
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [isPublishing, setIsPublishing] = useState(false);

    const handlePublish = async () => {
        if (!content.trim()) {
            alert("Vui lòng viết nội dung câu chuyện !");
            return;
        }

        setIsPublishing(true);
        console.log("Đang lưu:", { title, content });

        setTimeout(() => {
            setIsPublishing(false);
            router.push("/home");
        }, 1500);
    };

    return (
        <MainLayout>
            <div className="bg-white min-h-[calc(100vh-100px)] md:min-h-0 md:rounded-2xl md:shadow-sm md:border border-gray-200 overflow-hidden flex flex-col">

                <header className="flex items-center justify-between p-4 border-b border-gray-100 bg-white sticky top-0 z-10">
                    <button
                        onClick={() => router.push("/home")}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium p-2 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <XCircle className="w-7 h-7" />
                        <span className="text-lg">Hủy bỏ</span>
                    </button>

                    <button
                        onClick={handlePublish}
                        disabled={isPublishing}
                        className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white px-6 py-3 rounded-xl font-bold text-lg transition-all disabled:opacity-50"
                    >
                        <Save className="w-6 h-6" />
                        <span>{isPublishing ? "Đang lưu..." : "Lưu câu chuyện"}</span>
                    </button>
                </header>

                {/* KHU VỰC SOẠN THẢO (Editor) */}
                <div className="flex-1 flex flex-col p-6 md:p-8 gap-6">

                    <input
                        type="text"
                        placeholder="Tiêu đề"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full text-3xl md:text-4xl font-bold text-gray-900 placeholder:text-gray-300 focus:outline-none bg-transparent"
                    />

                    {/* Ô nhập Nội dung: Tự động mở rộng, font to dễ đọc */}
                    <textarea
                        placeholder="Bạn đang nhớ về điều gì? Hãy kể lại nhé..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full flex-1 min-h-[300px] text-xl md:text-2xl text-gray-800 leading-relaxed placeholder:text-gray-400 focus:outline-none resize-none bg-transparent"
                    />

                    {/* KHU VỰC THÊM HÌNH ẢNH & DANH MỤC */}
                    <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row gap-4">

                        <button className="flex-1 flex flex-col items-center justify-center gap-3 min-h-[120px] bg-slate-50 hover:bg-slate-100 border-2 border-dashed border-gray-300 rounded-2xl transition-colors">
                            <ImageIcon className="w-10 h-10 text-gray-400" />
                            <span className="text-lg font-medium text-gray-600">Thêm hình ảnh kỷ niệm</span>
                        </button>

                        <button className="flex-1 flex flex-col items-center justify-center gap-3 min-h-[120px] bg-slate-50 hover:bg-slate-100 border-2 border-dashed border-gray-300 rounded-2xl transition-colors">
                            <Tag className="w-10 h-10 text-gray-400" />
                            <span className="text-lg font-medium text-gray-600">Chọn chủ đề (Gia đình, Tuổi thơ...)</span>
                        </button>

                    </div>
                </div>
            </div>
        </MainLayout>
    );
}