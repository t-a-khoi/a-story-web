"use client";

import { Send } from 'lucide-react';
import { StoryShareService } from '@/services/storyShare.service';

interface ShareStoryButtonProps {
  storyId: number;
  onClick: () => void;
}

export default function ShareStoryButton({ storyId, onClick }: ShareStoryButtonProps) {
  
  const handleShareClick = () => {
    // 1. Gọi hành động UI ngay lập tức (Mở Modal chia sẻ)
    onClick();

    // 2. Chạy ngầm API đếm / tạo lượt share mà không chờ đợi (Background process)
    const payload = {
        storyId,
        sharedUserId: 1, // Giả lập user ID từ Context
    };

    StoryShareService.createStoryShare(payload)
        .then(() => console.log(`[Analytics] Đã ghi nhận share bài viết ID: ${storyId}`))
        .catch(error => {
            // Nuốt lỗi (Eat exception) để không làm gián đoạn trải nghiệm người dùng
            // Frontend có thể log vào một tool như Sentry nếu cần
            console.error(`[Analytics] Lỗi khi đếm lượt share: ${error.message}`);
        });
  };

  return (
    <button
      onClick={handleShareClick}
      className="flex flex-1 sm:flex-none items-center justify-center gap-2 px-6 min-h-[48px] bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl transition-colors border border-blue-100 hover:border-blue-200"
      aria-label="Chia sẻ cho người thân"
    >
      <Send className="w-5 h-5" aria-hidden="true" />
      <span className="text-base">Gửi đi</span>
    </button>
  );
}
