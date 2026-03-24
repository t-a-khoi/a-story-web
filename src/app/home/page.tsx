import MainLayout from "@/components/layout/MainLayout";
import StoryCard, { StoryProps } from "@/components/story/StoryCard";
import { PenSquare } from "lucide-react";
import photo1 from "@/image/photo1.avif";

const MOCK_STORIES: StoryProps[] = [
    {
        id: 1,
        date: "Hôm nay, 15 tháng 3, 2026",
        category: "Gia đình",
        title: "Bữa cơm chiều chủ nhật",
        content: "Hôm nay các con cháu tụ họp đông đủ. Đã lâu lắm rồi cái bếp mới ấm cúng và rộn rã tiếng cười như vậy. Nhìn xấp nhỏ lớn nhanh quá, mới ngày nào còn bế trên tay...",
        imageUrl: "https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=1000&auto=format&fit=crop",
    },
    {
        id: 2,
        date: "Thứ Hai, 10 tháng 3, 2026",
        category: "Tuổi thơ",
        title: "Ký ức đồng lúa",
        content: "Nhớ lại những ngày còn nhỏ, cứ chiều đến là chạy ra đồng bắt dế, thả diều. Cuộc sống lúc đó khó khăn thật nhưng sao trong trí nhớ bây giờ chỉ toàn thấy bình yên.",
    }
];

export default function HomePage() {
    return (
        <MainLayout>
            <div className="p-4 md:p-0 space-y-6">
                {/* Tiêu đề trang */}
                <header className="py-4">
                    <h1 className="text-3xl font-bold text-gray-900">Câu chuyện của tôi</h1>
                </header>

                {/* Khung nhập liệu nhanh */}
                <div className="bg-blue-50 p-6 rounded-2xl shadow-sm border border-blue-100">
                    <p className="text-xl text-gray-700 font-medium mb-4">Hôm nay bạn muốn kể câu chuyện gì?</p>
                    <button className="w-full min-h-[56px] bg-slate-100 hover:bg-slate-200 text-left px-6 rounded-xl text-lg text-gray-500 transition-colors">
                        Chạm vào đây để bắt đầu viết...
                    </button>
                </div>

                {/* Danh sách Câu chuyện (Timeline) */}
                <div className="space-y-6 md:space-y-8">
                    {MOCK_STORIES.map((story) => (
                        <StoryCard
                            key={story.id}
                            id={story.id}
                            date={story.date}
                            category={story.category}
                            title={story.title}
                            content={story.content}
                            imageUrl={story.imageUrl}
                        />
                    ))}
                </div>

            </div>
        </MainLayout>
    );
}