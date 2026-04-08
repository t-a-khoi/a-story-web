"use client";

import { Send } from 'lucide-react';

interface ShareStoryButtonProps {
  storyId: number;
  onClick: () => void;
}

export default function ShareStoryButton({ storyId, onClick }: ShareStoryButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex flex-1 sm:flex-none items-center justify-center gap-2 px-6 min-h-[48px] bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-xl transition-colors border border-emerald-100 hover:border-emerald-200"
      aria-label={`Gửi câu chuyện cho người thân`}
    >
      <Send className="w-5 h-5" aria-hidden="true" />
      <span className="text-base">Share</span>
    </button>
  );
}
