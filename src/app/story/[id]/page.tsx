"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import MainLayout from "@/components/layout/MainLayout";
import { ArrowLeft, Calendar, Edit3, Share2, Clock } from "lucide-react";
import ShareModal from "@/components/story/ShareModal";

// Dữ liệu mẫu (Mock data) - Cố tình tạo nhiều đoạn văn để test giao diện
const MOCK_STORY = {
  id: "1",
  date: "12 tháng 3, 2026",
  title: "Ngày đầu tiên bước chân vào Sài Gòn",
  readTime: "Khoảng 3 phút đọc",
  imageUrl: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=1200&auto=format&fit=crop", // Hình ảnh hoài niệm
  content: `Đó là một buổi sáng tháng 8 năm 1980. Tiếng còi tàu xé toạc màn sương mù lất phất của ga Hòa Hưng. Tôi bước xuống sân ga với chiếc ba lô con cóc rách vai và một tâm trạng ngổn ngang đến khó tả. Sài Gòn đón tôi không bằng nắng vàng rực rỡ như người ta vẫn hát, mà bằng một cơn mưa rào vội vã.

Cái chớp mắt đầu tiên về thành phố này là sự xô bồ nhưng kỳ lạ thay, lại rất đon đả. Những tiếng rao lanh lảnh, tiếng xích lô lạch cạch nối đuôi nhau. Tôi nhớ mãi hình ảnh chú đạp xích lô già còm nhom, mỉm cười chìa tay ra đỡ lấy phụ tải của tôi: "Về đâu cậu ba? Lên chú chở, trời đang sụt sùi rứa!". Chỉ một câu nói rặt giọng Quảng Nam giữa lòng Sài Gòn lúc ấy, tự nhiên thấy khóe mắt mình cay cay.

Hồi đó, làm gì có điện thoại thông minh hay bản đồ điện tử như bây giờ. Hành trang của tôi chỉ là một mảnh giấy gấp tư ghi nguệch ngoạc địa chỉ nhà người bà con xa ở tận xóm Lò Heo.

Cả một tuổi trẻ đã gắn bó với mảnh đất này. Những chập chững đầu đời, những giọt mồ hôi rơi trên công trường, và cả nụ cười của mẹ xấp nhỏ nhà tôi lần đầu gặp gỡ ở quán chè bà Ba. Tất cả như cuốn phim quay chậm, cứ đến những ngày mưa rả rích thế này, lại ùa về rõ mồn một.

Sài Gòn bao dung lắm, cứ thế ôm trọn lấy những đứa con tứ xứ, dạy cho chúng tôi cách sống kiên cường và cách bao dung với đời.`,
};

export default function StoryDetailPage() {
  const params = useParams();
  const router = useRouter();

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const story = MOCK_STORY;

  return (
    <MainLayout>
      {/* Sử dụng thẻ article để bọc toàn bộ nội dung.
        Dùng màu nền cực nhẹ (bg-[#FDFBF7]) để mô phỏng trang giấy, giảm chói mắt.
      */}
      <article className="max-w-3xl mx-auto bg-[#FDFBF7] rounded-3xl shadow-sm border border-stone-200 overflow-hidden pb-16">

        {/* THANH ĐIỀU HƯỚNG BÊN TRONG BÀI ĐỌC */}
        <div className="flex items-center justify-between p-6 md:p-8 border-b border-stone-200 bg-white">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-stone-600 hover:text-stone-900 transition-colors min-h-[48px] px-2 rounded-lg font-bold text-lg"
          >
            <ArrowLeft className="w-6 h-6" />
            <span>Trở về</span>
          </button>

          <div className="flex items-center gap-2 sm:gap-4">
            {/* Nút Chỉnh sửa */}
            <button
              className="flex items-center gap-2 min-h-[48px] px-4 md:px-6 rounded-xl text-lg font-bold text-stone-700 hover:bg-stone-100 transition-colors border-2 border-transparent"
              title="Sửa bài viết"
            >
              <Edit3 className="w-5 h-5" />
              <span className="hidden sm:inline">Sửa</span>
            </button>

            {/* Nút Chia sẻ (Feature cốt lõi của MVP) */}
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="flex items-center gap-2 min-h-[48px] px-4 md:px-6 bg-emerald-100 text-emerald-900 hover:bg-emerald-200 rounded-xl text-lg font-bold transition-colors border-2 border-emerald-200"
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
              <span>{story.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <span>{story.readTime}</span>
            </div>
          </div>
        </div>

        {/* HÌNH ẢNH MINH HỌA */}
        {story.imageUrl && (
          <div className="px-6 md:px-12 pb-10">
            <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden shadow-md border border-stone-200">
              <Image
                src={story.imageUrl}
                alt={`Hình ảnh cho bài viết: ${story.title}`}
                fill
                className="object-cover"
              />
            </div>
          </div>
        )}

        {/* NỘI DUNG VĂN BẢN (BODY) */}
        <div className="px-6 md:px-12 text-xl md:text-2xl text-stone-800">
          {story.content.split('\n\n').map((paragraph, index) => (
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

      {/* MODAL CHIA SẺ (Hiển thị khi click nút Share) */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        storyId={Number(story.id)}
        storyTitle={story.title}
      />
    </MainLayout>
  );
}