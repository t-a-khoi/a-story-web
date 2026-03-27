// src/components/story/StoryCard.tsx
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { BookOpen, Pencil, Trash2 } from 'lucide-react';
import { Story } from '@/types/story';
import { formatDate } from '@/lib/utils';
import ShareModal from '@/components/story/ShareModal';
import ShareStoryButton from '@/components/story/ShareStoryButton';

interface StoryCardProps {
  story: Story;
  onDelete?: (id: number) => void;
}

export default function StoryCard({ story, onDelete }: StoryCardProps) {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  return (
    <article className="bg-white rounded-3xl p-6 md:p-8 flex flex-col gap-5 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300">
      
      {/* 1. Header: Chữ gọn gàng hơn */}
      <div className="flex flex-col gap-2 border-b border-gray-100 pb-4">
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-2xl font-bold text-gray-900 leading-snug line-clamp-2">
            {story.title}
          </h2>
          {/* Cấp độ Badge thể loại */}
          {story.category && (
            <span 
              className="inline-flex items-center justify-center px-4 py-1.5 rounded-xl text-sm font-bold whitespace-nowrap shrink-0 shadow-sm border"
              style={{
                backgroundColor: story.category.color ? `${story.category.color}15` : '#ecfdf5',
                color: story.category.color || '#065f46',
                borderColor: story.category.color ? `${story.category.color}30` : '#a7f3d0'
              }}
            >
              {story.category.name}
            </span>
          )}
        </div>
        
        <div className="flex flex-wrap items-center gap-2 text-base font-medium text-gray-500">
          {story.profile && (
            <>
              <span className="text-gray-700 font-bold">{story.profile.fullname}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
            </>
          )}
          <time dateTime={story.createdDate}>
            {formatDate(story.createdDate)}
          </time>
        </div>
      </div>

      {/* 2. Nội dung */}
      <div className="text-lg text-gray-700 leading-relaxed line-clamp-3">
        {/* Render dangerouslySetInnerHTML nếu content là HTML, nhưng tam thời chỉ render p để tránh lỗi hydration */}
        <div dangerouslySetInnerHTML={{ __html: story.content }} />
      </div>

      {/* 4. Hành động */}
      <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-gray-100 mt-auto">
        
        {/* Nút Đọc bài */}
        <Link
          href={`/story/${story.id}`}
          className="flex flex-1 sm:flex-none items-center justify-center gap-2 px-6 min-h-[48px] bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-xl transition-colors border border-emerald-100 hover:border-emerald-200"
          aria-label={`Đọc bài viết: ${story.title}`}
        >
          <BookOpen className="w-5 h-5" aria-hidden="true" />
          <span className="text-base">Đọc bài</span>
        </Link>

        {/* Nút Chia sẻ đã được đóng gói */}
        <ShareStoryButton 
          storyId={story.id} 
          onClick={() => setIsShareModalOpen(true)} 
        />

        {/* Nút Sửa */}
        <Link
          href={`/story/${story.id}/edit`}
          className="flex flex-1 sm:flex-none items-center justify-center gap-2 px-6 min-h-[48px] bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold rounded-xl transition-colors border border-gray-200"
        >
          <Pencil className="w-4 h-4" aria-hidden="true" />
          <span className="text-base">Sửa</span>
        </Link>

        {/* Nút Xóa */}
        {onDelete && (
          <button
            onClick={() => onDelete(story.id)}
            className="flex flex-1 sm:flex-none items-center justify-center gap-2 px-6 min-h-[48px] bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl transition-colors ml-auto sm:ml-0 border border-red-100 hover:border-red-200"
          >
            <Trash2 className="w-4 h-4" aria-hidden="true" />
            <span className="text-base">Xóa</span>
          </button>
        )}
      </div>

      <ShareModal 
        storyId={story.id} 
        storyTitle={story.title}
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />
    </article>
  );
}