// src/features/story/components/StoryCard.tsx
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookOpen, Pencil, Trash2 } from 'lucide-react';
import { Story } from '@/types/story';
import { formatDate } from '@/lib/utils';
import ShareModel from '@/features/story/components/ShareModel';
import ShareStoryButton from '@/features/story/components/ShareStoryButton';
import { StoryMediaService } from '@/services/storyMedia.service';
import { MediaFilesService } from '@/services/mediaFiles.service';
import { FileUploadService } from '@/services/fileUpload.service';

interface StoryCardProps {
  story: Story;
  onDelete?: (id: number) => void;
}

export default function StoryCard({ story, onDelete }: StoryCardProps) {
  const [isShareModelOpen, setIsShareModelOpen] = useState(false);
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
    <article className="bg-pearl-50 rounded-3xl p-6 md:p-8 flex flex-col gap-5 shadow-sm border border-pearl-200 hover:shadow-md transition-all duration-300">

      {/* 0. Ảnh Bìa (nếu có) */}
      {coverImageUrl && (
        <div className="w-full h-56 sm:h-72 rounded-2xl overflow-hidden mb-2 relative group bg-pearl-100 border border-pearl-200">
          <img src={coverImageUrl} alt="Story cover" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        </div>
      )}

      {/* 1. Header */}
      <div className="flex flex-col gap-2 border-b border-pearl-200 pb-4">
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-2xl font-bold text-charcoal-900 leading-snug line-clamp-2">
            {story.title}
          </h2>
          {/* Cấp độ Badge thể loại dùng tạm catId */}
          {story.catId && (
            <span
              className="inline-flex items-center justify-center px-4 py-1.5 rounded-xl text-sm font-bold whitespace-nowrap shrink-0 shadow-sm border bg-navy-50 text-navy-700 border-navy-100"
            >
              Topic #{story.catId}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 text-base font-medium text-charcoal-700">
          {story.profileId && (
            <>
              <span className="text-charcoal-900 font-bold">Author #{story.profileId}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-pearl-200" />
            </>
          )}
          <time dateTime={story.createdDate}>
            {formatDate(story.createdDate)}
          </time>
        </div>
      </div>

      {/* 2. Nội dung */}
      <div className="text-lg text-charcoal-900 leading-relaxed line-clamp-3">
        <div dangerouslySetInnerHTML={{ __html: story.content }} />
      </div>

      {/* 3. Hành động */}
      <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-pearl-200 mt-auto">

        {/* Nút Đọc bài */}
        <Link
          href={`/story/${story.id}`}
          className="flex flex-1 sm:flex-none items-center justify-center gap-2 px-6 min-h-[48px] bg-white hover:bg-navy-50 text-navy-700 font-bold rounded-xl transition-colors border-2 border-navy-500 shadow-sm"
          aria-label={`Đọc bài viết: ${story.title}`}
        >
          <BookOpen className="w-5 h-5" aria-hidden="true" />
          <span className="text-base">Read story</span>
        </Link>

        {/* Nút Chia sẻ */}
        <ShareStoryButton
          storyId={story.id}
          onClick={() => setIsShareModelOpen(true)}
        />

        {/* Nút Sửa */}
        <Link
          href={`/story/${story.id}/edit`}
          className="flex flex-1 sm:flex-none items-center justify-center gap-2 px-6 min-h-[48px] bg-pearl-100 hover:bg-pearl-200 text-charcoal-900 font-bold rounded-xl transition-colors border border-pearl-200"
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

      <ShareModel
        storyId={story.id}
        storyTitle={story.title}
        isOpen={isShareModelOpen}
        onClose={() => setIsShareModelOpen(false)}
      />
    </article>
  );
}