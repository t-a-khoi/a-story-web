// src/components/story/StoryCard.tsx
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookOpen, Pencil, Trash2 } from 'lucide-react';
import { Story } from '@/types/story';
import { formatDate } from '@/lib/utils';
import ShareModal from '@/components/story/ShareModal';
import ShareStoryButton from '@/components/story/ShareStoryButton';
import { StoryMediaService } from '@/services/storyMedia.service';
import { MediaFilesService } from '@/services/mediaFiles.service';
import { FileUploadService } from '@/services/fileUpload.service';

interface StoryCardProps {
  story: Story;
  onDelete?: (id: number) => void;
}

export default function StoryCard({ story, onDelete }: StoryCardProps) {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [coverImageUrl, setCoverImageUrl] = useState<string>('');

  useEffect(() => {
    let active = true;
    const fetchCoverImage = async () => {
      try {
        const medias = await StoryMediaService.getStoryMediaByStoryId(story.id);
        if (medias && medias.length > 0 && active) {
          const firstMedia = medias[0];
          try {
            const mediaFile = await MediaFilesService.getMediaFileById(firstMedia.mediaId);
            if (mediaFile && mediaFile.urlPath && active) {
              const blobUrl = await FileUploadService.fetchImageBlobUrl(mediaFile.urlPath);
              if (active) setCoverImageUrl(blobUrl);
            }
          } catch {
            // Media file bị xóa hoặc không tồn tại — không hiển thị ảnh bìa
          }
        }
      } catch (err) {
        console.warn("Không thể tải ảnh bìa story:", err);
      }
    };
    fetchCoverImage();
    return () => { active = false; };
  }, [story.id]);


  return (
    <article className="bg-white rounded-3xl p-6 md:p-8 flex flex-col gap-5 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300">

      {/* 0. Ảnh Bìa (nếu có) */}
      {coverImageUrl && (
        <div className="w-full h-56 sm:h-72 rounded-2xl overflow-hidden mb-2 relative group bg-gray-50 border border-gray-100">
          <img src={coverImageUrl} alt="Story cover" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        </div>
      )}

      {/* 1. Header */}
      <div className="flex flex-col gap-2 border-b border-gray-100 pb-4">
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-2xl font-bold text-gray-900 leading-snug line-clamp-2">
            {story.title}
          </h2>
          {/* Cấp độ Badge thể loại dùng tạm catId */}
          {story.catId && (
            <span
              className="inline-flex items-center justify-center px-4 py-1.5 rounded-xl text-sm font-bold whitespace-nowrap shrink-0 shadow-sm border bg-emerald-50 text-emerald-800 border-emerald-200"
            >
              Topic #{story.catId}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 text-base font-medium text-gray-500">
          {story.profileId && (
            <>
              <span className="text-gray-700 font-bold">Author #{story.profileId}</span>
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
        <div dangerouslySetInnerHTML={{ __html: story.content }} />
      </div>

      {/* 3. Hành động */}
      <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-gray-100 mt-auto">

        {/* Nút Đọc bài */}
        <Link
          href={`/story/${story.id}`}
          className="flex flex-1 sm:flex-none items-center justify-center gap-2 px-6 min-h-[48px] bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-xl transition-colors border border-emerald-100 hover:border-emerald-200"
          aria-label={`Đọc bài viết: ${story.title}`}
        >
          <BookOpen className="w-5 h-5" aria-hidden="true" />
          <span className="text-base">Read story</span>
        </Link>

        {/* Nút Chia sẻ */}
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
          <span className="text-base">Edit</span>
        </Link>

        {/* Nút Xóa */}
        {onDelete && (
          <button
            onClick={() => onDelete(story.id)}
            className="flex flex-1 sm:flex-none items-center justify-center gap-2 px-6 min-h-[48px] bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl transition-colors ml-auto sm:ml-0 border border-red-100 hover:border-red-200"
          >
            <Trash2 className="w-4 h-4" aria-hidden="true" />
            <span className="text-base">Delete</span>
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