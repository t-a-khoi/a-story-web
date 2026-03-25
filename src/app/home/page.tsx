"use client";

import MainLayout from "@/components/layout/MainLayout";
import { PenSquare, Calendar, Book, Image as ImageIcon } from "lucide-react";
import { useRouter } from "next/navigation";

const MOCK_STORIES = [
    {
        id: "1",
        title: "Ngày đầu tiên bước chân vào Sài Gòn",
        excerpt: "Đó là một buổi sáng tháng 8 năm 1980. Tiếng còi tàu xé toạc màn sương...",
        date: "12/03/2026",
        hasImage: true,
    },
    {
        id: "2",
        title: "Kỷ niệm chiếc xe đạp Thống Nhất",
        excerpt: "Hồi đó mua được chiếc xe đạp Thống Nhất là cả một gia tài. Cả xóm ai cũng ra xem...",
        date: "05/03/2026",
        hasImage: false,
    }
];

export default function HomePage() {
    const router = useRouter();

    return (
        <MainLayout>
            <div className="space-y-10">

                {/* LỜI CHÀO & NÚT VIẾT BÀI MỚI */}
                <section className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-gray-200 text-center space-y-6">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">
                        Chào mừng bạn trở lại!
                    </h1>
                    <p className="text-xl text-gray-700 font-medium">
                        Hôm nay bạn có câu chuyện hay kỷ niệm nào muốn lưu giữ không?
                    </p>
                    <div className="pt-4">
                        <button
                            onClick={() => router.push("/write")}
                            className="w-full md:w-auto flex items-center justify-center gap-3 min-h-[64px] px-10 py-4 bg-emerald-800 text-white rounded-2xl text-2xl font-bold shadow-md hover:bg-emerald-900 transition-all hover:scale-[1.02]"
                        >
                            <PenSquare className="w-8 h-8" />
                            <span>Viết kỷ niệm mới</span>
                        </button>
                    </div>
                </section>

                {/* DÒNG THỜI GIAN (TIMELINE) CÂU CHUYỆN */}
                <section className="space-y-6">
                    <h2 className="text-2xl font-bold text-gray-900 border-b-2 border-gray-200 pb-4">
                        Các câu chuyện của bạn
                    </h2>

                    {MOCK_STORIES.length > 0 ? (
                        <div className="space-y-6">
                            {MOCK_STORIES.map((story) => (
                                <article
                                    key={story.id}
                                    onClick={() => router.push(`/story/${story.id}`)}
                                    className="bg-white p-6 md:p-8 rounded-2xl border-2 border-gray-100 shadow-sm hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer group"
                                >
                                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                        <div className="space-y-3 flex-grow">
                                            <h3 className="text-2xl font-bold text-gray-900 group-hover:text-emerald-800 transition-colors">
                                                {story.title}
                                            </h3>
                                            <p className="text-xl text-gray-600 line-clamp-2 leading-relaxed">
                                                {story.excerpt}
                                            </p>

                                            {/* Meta data: Ngày tháng & Icon hình ảnh */}
                                            <div className="flex items-center gap-6 text-gray-500 pt-2 font-medium">
                                                <span className="flex items-center gap-2 text-lg">
                                                    <Calendar className="w-5 h-5" />
                                                    {story.date}
                                                </span>
                                                {story.hasImage && (
                                                    <span className="flex items-center gap-2 text-lg text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg">
                                                        <ImageIcon className="w-5 h-5" />
                                                        Có hình ảnh
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Nút xem chi tiết (chỉ hiển thị rõ trên Desktop, trên mobile chạm cả card) */}
                                        <div className="hidden md:flex items-center pt-2">
                                            <span className="text-emerald-700 font-bold text-lg group-hover:underline">Đọc lại</span>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    ) : (
                        /* Trạng thái trống (Empty State) khi chưa có bài viết nào */
                        <div className="text-center py-16 px-6 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
                            <Book className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Cuốn sách của bạn đang chờ trang đầu tiên</h3>
                            <p className="text-xl text-gray-600">Hãy nhấn nút "Viết kỷ niệm mới" ở trên để bắt đầu lưu giữ nhé.</p>
                        </div>
                    )}
                </section>

            </div>
        </MainLayout>
    );
}