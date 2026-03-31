// src/app/story/[id]/edit/page.tsx
"use client";

import { useState, useRef, useEffect, use, useMemo } from "react";
import { useRouter } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";
import { Save, Image as ImageIcon, ArrowLeft, CheckCircle2, BookOpenText, AlertCircle, Loader2, Lightbulb } from "lucide-react";
import { StoryService } from "@/services/stories.service";

export default function EditStoryPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const resolvedParams = use(params);
    const storyId = Number(resolvedParams.id);

    // Form states
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [selectedCatId, setSelectedCatId] = useState<number>(0);

    // UI statuses
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [content]);

    // Fetch story data
    useEffect(() => {
        const fetchStory = async () => {
            try {
                setIsLoading(true);
                const data = await StoryService.getStoryById(storyId);
                setTitle(data.title);
                setContent(data.content);
                setSelectedCatId(data.catId);
            } catch (error) {
                console.error("Lỗi khi tải câu chuyện:", error);
                setErrorMsg("Không thể tải nội dung câu chuyện. Có thể câu chuyện đã bị xóa hoặc kết nối mạng có vấn đề.");
            } finally {
                setIsLoading(false);
            }
        };

        if (storyId) {
            fetchStory();
        }
    }, [storyId]);

    // Cấu trúc danh mục mẫu (Để dùng cho phần gợi ý)
    const categories = useMemo(() => [
        { id: 1, name: "Gia đình" },
        { id: 2, name: "Tuổi trẻ" },
        { id: 3, name: "Kỷ niệm & Đồ vật" },
        { id: 4, name: "Kinh nghiệm sống" },
        { id: 5, name: "Chuyện nghề" },
    ], []);

    // Gợi ý viết bài động dựa theo danh mục được chọn
    const writingPrompts = useMemo(() => {
        switch (selectedCatId) {
            case 1: // Gia đình
                return ["Kể về bữa cơm tối nhớ nhất?", "Một thói quen đặc biệt của Ba/Mẹ?", "Ngày đầu tiên đón con/cháu chào đời?"];
            case 2: // Tuổi trẻ
                return ["Trò chơi ngày bé bạn hay chơi?", "Người bạn thân nhất thời đi học là ai?", "Lần đầu tiên đi xa nhà?"];
            case 3: // Kỷ niệm & Đồ vật
                return ["Món đồ chơi đầu tiên bạn được tặng?", "Câu chuyện đằng sau một bức ảnh cũ?", "Âm thanh hoặc mùi hương nào gợi nhớ quá khứ?"];
            case 4: // Kinh nghiệm sống
                return ["Một lời khuyên đắt giá bạn từng nhận được?", "Bạn đã học được gì từ một sai lầm lớn?", "Định nghĩa về hạnh phúc của bạn hiện tại?"];
            case 5: // Chuyện nghề
                return ["Ngày đầu tiên đi làm diễn ra thế nào?", "Một người đồng nghiệp đáng nhớ?", "Thành tựu lớn nhất trong sự nghiệp?"];
            default:
                return ["Hãy bắt đầu bằng việc mô tả thời gian và địa điểm...", "Hôm đó thời tiết thế nào?", "Ai là người xuất hiện chính trong kỷ niệm này?"];
        }
    }, [selectedCatId]);

    const handleUpdate = async () => {
        if (!title.trim() || !content.trim() || selectedCatId === 0) {
            setErrorMsg("Vui lòng nhập đầy đủ tiêu đề, chủ đề và nội dung.");
            return;
        }

        setErrorMsg("");
        setIsSaving(true);

        try {
            await StoryService.updateStory(storyId, {
                catId: selectedCatId,
                title: title.trim(),
                content: content.trim()
            });

            setShowSuccess(true);
            setTimeout(() => {
                router.push(`/story/${storyId}`);
            }, 3000);

        } catch (error) {
            console.error("Lỗi khi cập nhật bài:", error);
            setErrorMsg("Lưu thất bại. Vui lòng kiểm tra mạng và thử lại!");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <MainLayout>
                <div className="max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                    <Loader2 className="w-10 h-10 text-emerald-700 animate-spin" />
                    <p className="text-lg text-stone-700 font-medium">Đang tìm lại kỷ niệm cũ của bác...</p>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            {/* THÊM HỌA TIẾT NỀN NHẸ CHO TOÀN TRANG (Mô phỏng vân giấy) */}
            <div className="min-h-screen bg-stone-50 bg-opacity-60" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23a8a29e\' fill-opacity=\'0.08\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'3\'/%3E%3Ccircle cx=\'13\' cy=\'13\' r=\'3\'/%3E%3C/g%3E%3C/svg%3E")' }}>

                <div className="max-w-7xl mx-auto px-4 py-6 md:py-10 space-y-8 pb-24">

                    {/* HEADER BANNER - Giảm cỡ chữ, giảm padding */}
                    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 md:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-3 opacity-[0.08] pointer-events-none">
                            <BookOpenText className="w-24 h-24 text-emerald-900" aria-hidden="true" />
                        </div>

                        <div className="relative z-10 space-y-2">
                            <button
                                onClick={() => router.back()}
                                className="flex items-center gap-1.5 text-emerald-800 hover:text-emerald-900 transition-colors font-semibold text-base w-fit bg-white px-3.5 py-2 min-h-[48px] rounded-lg border border-stone-200 shadow-sm"
                                aria-label="Quay lại"
                            >
                                <ArrowLeft className="w-5 h-5" />
                                <span>Quay lại</span>
                            </button>
                            {/* Giảm size: text-2xl -> text-2xl */}
                            <h1 className="text-2xl md:text-2xl font-extrabold text-stone-900 tracking-tight">
                                Sửa câu chuyện cũ
                            </h1>
                        </div>

                        {/* Nút Cập nhật - Giảm text size, padding */}
                        <button
                            onClick={handleUpdate}
                            disabled={isSaving || showSuccess}
                            className={`relative z-10 flex items-center justify-center gap-2 min-h-[56px] min-w-[160px] px-6 py-2 rounded-xl text-lg font-bold transition-all shadow-md shrink-0 ${showSuccess
                                ? "bg-emerald-100 text-emerald-900 border border-emerald-400"
                                : "bg-emerald-800 text-white hover:bg-emerald-900 disabled:opacity-50 disabled:cursor-not-allowed"
                                }`}
                            aria-live="polite"
                        >
                            {showSuccess ? (
                                <>
                                    <CheckCircle2 className="w-5 h-5" />
                                    <span>Đã lưu xong!</span>
                                </>
                            ) : isSaving ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>Đang lưu...</span>
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    <span>Lưu thay đổi</span>
                                </>
                            )}
                        </button>
                    </div>

                    {/* BÁO LỖI */}
                    {errorMsg && (
                        <div className="flex items-start gap-3 bg-red-50 text-red-900 p-5 rounded-xl shadow-sm border border-red-200" role="alert">
                            <AlertCircle className="w-6 h-6 flex-shrink-0 mt-0.5" aria-hidden="true" />
                            <p className="text-base font-semibold leading-relaxed">{errorMsg}</p>
                        </div>
                    )}

                    {/* BỐ CỤC CHÍNH 2 CỘT (Desktop) */}
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr,320px] gap-8 items-start">

                        {/* CỘT 1: KHU VỰC SOẠN THẢO */}
                        <div className="bg-white rounded-3xl shadow-lg border border-stone-100 p-6 md:p-8 space-y-6">
                            {/* Input Tiêu đề - Giảm text-2xl/4xl -> text-2xl/3xl */}
                            <div className="space-y-1.5">
                                <label htmlFor="story-title" className="text-sm font-semibold text-stone-500 ml-1">Tiêu đề kỷ niệm</label>
                                <input
                                    id="story-title"
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Viết tiêu đề ngắn gọn (ví dụ: Tết năm 1975)..."
                                    className="w-full text-2xl md:text-2xl font-extrabold text-stone-900 placeholder-stone-300 bg-transparent border-none focus:ring-0 focus:outline-none p-0"
                                />
                            </div>

                            <hr className="border-stone-100" />

                            {/* Select Danh mục - Giảm text size, min-h */}
                            <div className="space-y-2.5">
                                <label htmlFor="story-category" className="text-lg font-bold text-stone-900 block">
                                    Đây là câu chuyện về chủ đề gì?
                                </label>
                                <select
                                    id="story-category"
                                    value={selectedCatId}
                                    onChange={(e) => setSelectedCatId(Number(e.target.value))}
                                    // Giảm text-xl -> text-base, min-h-[64px] -> min-h-[56px]
                                    className="w-full text-base text-stone-900 font-medium border border-stone-300 hover:border-emerald-300 focus:border-emerald-500 rounded-lg px-4 py-2 min-h-[56px] focus:ring-2 focus:ring-emerald-100 outline-none transition-colors shadow-sm bg-white"
                                >
                                    <option value={0} disabled>Bác vui lòng chọn một chủ đề...</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>

                            <hr className="border-stone-100" />

                            {/* Textarea Nội dung - Giảm text-xl/2xl -> text-lg/xl, line-height giảm nhẹ */}
                            <div className="space-y-1.5">
                                <label htmlFor="story-content" className="text-sm font-semibold text-stone-500 ml-1">Nội dung câu chuyện</label>
                                <textarea
                                    id="story-content"
                                    ref={textareaRef}
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder="Bác nhớ lại và kể lại câu chuyện tại đây nhé..."
                                    // text-xl/2xl -> text-lg/xl, leading-[1.8] -> leading-[1.7]
                                    className="w-full text-lg md:text-xl text-stone-800 leading-[1.7] placeholder-stone-300 bg-transparent border-none focus:ring-0 focus:outline-none p-0 min-h-[280px] resize-none overflow-hidden"
                                />
                            </div>

                            {/* Hình ảnh */}
                            <div className="pt-6 border-t border-stone-100">
                                <button className="flex items-center gap-2.5 min-h-[52px] px-5 py-3 bg-stone-50 hover:bg-emerald-50 text-stone-800 hover:text-emerald-900 border-2 border-dashed border-stone-300 hover:border-emerald-400 rounded-xl text-base font-semibold transition-colors w-fit justify-center shadow-sm">
                                    <ImageIcon className="w-6 h-6 text-stone-500" />
                                    <span>Thay đổi hình ảnh (Không bắt buộc)</span>
                                </button>
                            </div>
                        </div>

                        {/* CỘT 2: GÓC GỢI Ý KỶ NIỆM (Phần tử sáng tạo mới để bớt đơn điệu) */}
                        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6 space-y-5 sticky top-6">
                            <div className="flex items-center gap-3 pb-4 border-b border-stone-100">
                                <div className="p-2.5 bg-amber-50 rounded-full border border-amber-200 shadow-inner">
                                    <Lightbulb className="w-6 h-6 text-amber-600" aria-hidden="true" />
                                </div>
                                <h2 className="text-xl font-bold text-stone-900">Góc gợi ý kỷ niệm</h2>
                            </div>

                            <p className="text-base text-stone-700 leading-relaxed font-medium">
                                Nếu bác chưa nhớ ra nên viết gì, hãy thử nhớ về:
                            </p>

                            <ul className="space-y-4 pt-1">
                                {writingPrompts.map((prompt, index) => (
                                    <li key={index} className="flex items-start gap-3 bg-stone-50/50 p-4 rounded-lg border border-stone-100/50 hover:bg-emerald-50/50 hover:border-emerald-100 transition-colors">
                                        <div className="font-bold text-base text-emerald-800 mt-0.5">•</div>
                                        <p className="text-base text-stone-800 font-medium leading-relaxed">{prompt}</p>
                                    </li>
                                ))}
                            </ul>

                            <div className="mt-6 p-4 bg-emerald-50/60 rounded-xl border border-emerald-100 text-center">
                                <p className="text-sm text-emerald-900 font-semibold">
                                    (Chọn chủ đề khác để xem gợi ý khác)
                                </p>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </MainLayout>
    );
}