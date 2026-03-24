import Image from "next/image";
import { Calendar, Image as ImageIcon } from "lucide-react";

export interface StoryProps {
    id: string | number;
    date: string;
    category: string;
    title?: string;
    content: string;
    imageUrl?: string;
}

export default function StoryCard({ date, category, title, content, imageUrl }: StoryProps) {
    return (
        <article className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8 flex flex-col gap-5 transition-all hover:shadow-md">

            {/* HEADER: Ngày tháng và Danh mục */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
                <div className="flex items-center gap-2 text-gray-800">
                    <Calendar className="w-6 h-6 text-blue-700" strokeWidth={2.5} />
                    <span className="text-xl md:text-2xl font-bold">{date}</span>
                </div>

                <div className="inline-flex items-center px-4 py-2 bg-slate-100 text-gray-700 rounded-lg text-base font-medium">
                    {category}
                </div>
            </div>

            {/* BODY: Tiêu đề và Nội dung */}
            <div className="space-y-3">
                {title && (
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 leading-snug">
                        {title}
                    </h2>
                )}
                <p className="text-lg md:text-xl text-gray-800 leading-relaxed whitespace-pre-line">
                    {content}
                </p>
            </div>

            {/* MEDIA: Hình ảnh đính kèm */}
            {imageUrl && (
                <div className="relative w-full h-[250px] sm:h-[350px] md:h-[450px] mt-2 rounded-xl overflow-hidden border border-gray-100">
                    <Image
                        src={imageUrl}
                        alt="Hình ảnh kỷ niệm"
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 800px"
                    />
                </div>
            )}

            {/* FOOTER: Nút thao tác mở rộng */}
            <div className="pt-2">
                <button className="min-h-[56px] w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-blue-700 rounded-xl text-lg font-bold transition-colors">
                    Xem lại toàn bộ câu chuyện
                </button>
            </div>
        </article>
    );
}