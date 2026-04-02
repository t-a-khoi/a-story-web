"use client";

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Image as ImageIcon } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import MainLayout from '@/components/layout/MainLayout';
import { MediaFilesService } from '@/services/mediaFiles.service';
import { FileUploadService } from '@/services/fileUpload.service';
import { useTranslation } from '@/store/useLanguageStore';

interface MediaItem {
    id: number;
    urlPath: string;
    blobUrl: string;
    title: string;
}

export default function LibraryPage() {
    const router = useRouter();
    const { t } = useTranslation();
    const { accessToken, user } = useAuthStore();
    const [isInitializing, setIsInitializing] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);

    useEffect(() => {
        if (!accessToken) {
            router.replace("/");
            return;
        }
        setIsInitializing(false);
    }, [accessToken, router]);

    const fetchMyLibrary = useCallback(async () => {
        if (!user?.id) return;
        setIsLoading(true);
        try {
            const response = await MediaFilesService.searchMediaFiles({
                filters: [{ field: "user.id", operator: "EQUAL", value: user.id }],
                sorts: [{ field: "createdDate", direction: "DESC" }],
                pagination: { page: 0, size: 100 }
            });

            const items: MediaItem[] = [];
            if (response.content && response.content.length > 0) {
                const results = await Promise.all(response.content.map(async (item) => {
                    const blobUrl = await FileUploadService.fetchImageBlobUrl(item.urlPath);
                    return {
                        id: item.id,
                        urlPath: item.urlPath,
                        blobUrl: blobUrl,
                        title: item.title
                    };
                }));
                items.push(...results.filter(r => r.blobUrl !== ""));
            }
            
            setMediaItems(items);
        } catch (error) {
            console.error("Lỗi khi xem thư viện:", error);
        } finally {
            setIsLoading(false);
        }
    }, [user?.id]);

    useEffect(() => {
        if (!isInitializing && user?.id) {
            fetchMyLibrary();
        }
    }, [isInitializing, user?.id, fetchMyLibrary]);

    useEffect(() => {
        return () => {
            mediaItems.forEach(item => {
                if (item.blobUrl) URL.revokeObjectURL(item.blobUrl);
            });
        };
    }, [mediaItems]);

    if (isInitializing) {
        return (
            <MainLayout>
                <div className="flex justify-center py-20">
                    <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="max-w-5xl mx-auto space-y-8 pb-20">
                
                {/* BANNER */}
                <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                        <ImageIcon className="w-32 h-32 text-emerald-800" aria-hidden="true" />
                    </div>

                    <div className="relative z-10 space-y-2">
                        <h1 className="text-2xl md:text-3xl font-extrabold text-emerald-900 tracking-tight">
                            {t("library.headerTitle")}
                        </h1>
                        <p className="text-emerald-800 text-lg font-medium">
                            {t("library.headerSubtitle")}
                        </p>
                    </div>
                </div>

                {/* KHU VỰC HIỂN THỊ */}
                <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 min-h-[400px]">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 space-y-4">
                            <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
                            <p className="text-gray-500 font-medium text-lg">{t("library.loading")}</p>
                        </div>
                    ) : mediaItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50">
                            <ImageIcon className="w-16 h-16 text-gray-300 mb-4" />
                            <h2 className="text-xl font-bold text-gray-700 mb-2">{t("library.emptyTitle")}</h2>
                            <p className="text-gray-500 max-w-md">{t("library.emptySubtitle")}</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {mediaItems.map((item) => (
                                <div key={item.id} className="relative aspect-square group rounded-xl overflow-hidden bg-gray-100 shadow-sm border border-gray-200 cursor-pointer">
                                    <img 
                                        src={item.blobUrl} 
                                        alt={item.title || t("library.imageAlt")} 
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                                        <p className="text-white text-xs font-semibold truncate w-full" title={item.title}>
                                            {item.title}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </MainLayout>
    );
}
