import Image from "next/image";
import { Calendar, Tag } from "lucide-react"; // Thêm icon Tag cho sinh động và dễ hiểu

export interface StoryProps {
    id: string | number;
    date: string;
    category: string;
    title?: string;
    content: string;
    imageUrl?: string;
    onClick?: () => void;
}

export default function StoryCard({ id, date, category, title, content, imageUrl, onClick }: StoryProps) {
    return (
        <article
            onClick={onClick}
            // Thêm cursor-pointer và group để tạo hiệu ứng hover đồng bộ
            className="bg-white rounded-2xl shadow-sm border-2 border-gray-100 p-6 md:p-8 flex flex-col gap-6 transition-all hover:shadow-md hover:border-emerald-200 cursor-pointer group"
        >

            {/* HEADER: Ngày tháng và Danh mục */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-gray-50 pb-4">
                <div className="flex items-center gap-3 text-gray-900">
                    {/* Đồng bộ màu emerald-800 */}
                    <div className="p-2 bg-emerald-50 rounded-lg">
                        <Calendar className="w-7 h-7 text-emerald-800" strokeWidth={2.5} />
                    </div>
                    <span className="text-xl md:text-2xl font-extrabold">{date}</span>
                </div>

                {/* Tăng cỡ chữ lên text-lg, thêm icon để người lớn tuổi dễ hiểu đây là "Nhãn/Danh mục" */}
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-gray-800 rounded-xl text-lg font-bold">
                    <Tag className="w-5 h-5 text-gray-500" />
                    {category}
                </div>
            </div>

            {/* BODY: Tiêu đề và Nội dung */}
            <div className="space-y-4">
                {title && (
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 leading-snug group-hover:text-emerald-800 transition-colors">
                        {title}
                    </h2>
                )}
                {/* Dùng line-clamp-3 để giới hạn nội dung hiển thị tối đa 3 dòng */}
                <p className="text-xl text-gray-700 leading-relaxed whitespace-pre-line line-clamp-3">
                    {content}
                </p>
            </div>

            {/* MEDIA: Hình ảnh đính kèm */}
            {imageUrl && (
                <div className="relative w-full h-[250px] sm:h-[350px] md:h-[450px] rounded-2xl overflow-hidden border-2 border-gray-100">
                    <Image
                        src={imageUrl}
                        alt={`Hình ảnh đính kèm cho câu chuyện: ${title || date}`}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 800px"
                    />
                </div>
            )}

            {/* FOOTER: Nút thao tác mở rộng */}
            <div className="pt-4 mt-auto">
                {/* Đồng bộ màu sắc nút bấm với màu thương hiệu emerald */}
                <button
                    className="min-h-[60px] w-full bg-emerald-50 hover:bg-emerald-100 border-2 border-emerald-200 text-emerald-800 rounded-xl text-xl font-bold transition-colors flex items-center justify-center gap-2"
                    aria-label={`Xem lại toàn bộ câu chuyện viết ngày ${date}`}
                >
                    Xem lại toàn bộ câu chuyện
                </button>
            </div>
        </article>
    );
}