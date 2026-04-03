"use client";

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
    Loader2, Image as ImageIcon, Upload, X, Trash2,
    ChevronLeft, ChevronRight, Plus, Eye
} from 'lucide-react';
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
    fileSize: number;
    createdDate?: string;
}

type ModalMode = 'none' | 'lightbox' | 'upload' | 'delete';

export default function LibraryPage() {
    const router = useRouter();
    const { t } = useTranslation();
    const { accessToken, user } = useAuthStore();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isInitializing, setIsInitializing] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);

    // Modal state
    const [modalMode, setModalMode] = useState<ModalMode>('none');
    const [selectedIndex, setSelectedIndex] = useState<number>(0);
    const [itemToDelete, setItemToDelete] = useState<MediaItem | null>(null);

    // Upload state
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [uploadPreviewUrl, setUploadPreviewUrl] = useState('');
    const [uploadTitle, setUploadTitle] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const [isDragging, setIsDragging] = useState(false);

    // Delete state
    const [isDeleting, setIsDeleting] = useState(false);

    // Toast
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

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
                filters: [
                    { field: "user.id", operator: "EQUAL", value: user.id },
                    { field: "deleted", operator: "EQUAL", value: false }
                ],
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
                        blobUrl,
                        title: item.title,
                        fileSize: item.fileSize,
                        createdDate: item.createdDate,
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

    // ── Lightbox helpers ──────────────────────────────────────────────────────
    const openLightbox = (index: number) => {
        setSelectedIndex(index);
        setModalMode('lightbox');
    };

    const closeLightbox = () => setModalMode('none');

    const prevImage = () => setSelectedIndex(i => (i - 1 + mediaItems.length) % mediaItems.length);
    const nextImage = () => setSelectedIndex(i => (i + 1) % mediaItems.length);

    // Keyboard nav for lightbox
    useEffect(() => {
        if (modalMode !== 'lightbox') return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') prevImage();
            if (e.key === 'ArrowRight') nextImage();
            if (e.key === 'Escape') closeLightbox();
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [modalMode, mediaItems.length]);

    // ── Upload helpers ────────────────────────────────────────────────────────
    const openUploadModal = () => {
        setUploadFile(null);
        setUploadPreviewUrl('');
        setUploadTitle('');
        setUploadError('');
        setModalMode('upload');
    };

    const handleFileSelect = (file: File) => {
        if (!file.type.startsWith('image/')) {
            setUploadError(t('library.uploadError'));
            return;
        }
        setUploadFile(file);
        setUploadTitle(file.name.replace(/\.[^/.]+$/, ''));
        setUploadPreviewUrl(URL.createObjectURL(file));
        setUploadError('');
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFileSelect(file);
    };

    const handleUploadSubmit = async () => {
        if (!uploadFile || !user?.id) return;
        setIsUploading(true);
        setUploadError('');
        try {
            const uploaded = await FileUploadService.uploadFile(uploadFile, 'library');
            await MediaFilesService.createMediaFile({
                userId: user.id,
                mediaType: 'IMAGE',
                urlPath: uploaded.key,
                fileSize: uploaded.size,
                title: uploadTitle.trim() || uploadFile.name,
            });
            showToast(t('library.uploadSuccess'), 'success');
            setModalMode('none');
            if (uploadPreviewUrl) URL.revokeObjectURL(uploadPreviewUrl);
            await fetchMyLibrary();
        } catch (err) {
            console.error('Upload error:', err);
            setUploadError(t('library.uploadError'));
        } finally {
            setIsUploading(false);
        }
    };

    // ── Delete helpers ────────────────────────────────────────────────────────
    const openDeleteModal = (item: MediaItem) => {
        setItemToDelete(item);
        setModalMode('delete');
    };

    const handleDelete = async () => {
        if (!itemToDelete) return;
        setIsDeleting(true);
        try {
            await MediaFilesService.deleteMediaFile(itemToDelete.id);
            try { await FileUploadService.deleteFile(itemToDelete.urlPath); } catch { /* storage delete is best-effort */ }
            showToast(t('library.deleteSuccess'), 'success');
        } catch (err: any) {
            const status = err?.response?.status;
            if (status === 404) {
                showToast(t('library.deleteSuccess'), 'success');
            } else {
                console.error('Delete error:', err);
                showToast(t('library.deleteError'), 'error');
                setIsDeleting(false);
                return;
            }
        } finally {
            setIsDeleting(false);
        }
        setModalMode('none');
        setItemToDelete(null);
        setMediaItems(prev => prev.filter(i => i.id !== itemToDelete.id));
    };

    const formatFileSize = (bytes: number) => {
        if (!bytes) return '';
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '';
        try {
            return new Date(dateStr).toLocaleDateString('vi-VN', {
                day: '2-digit', month: '2-digit', year: 'numeric'
            });
        } catch { return ''; }
    };

    // ── Render ────────────────────────────────────────────────────────────────
    if (isInitializing) {
        return (
            <MainLayout>
                <div className="flex justify-center py-20">
                    <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
                </div>
            </MainLayout>
        );
    }

    const selectedItem = mediaItems[selectedIndex];

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
                        {!isLoading && mediaItems.length > 0 && (
                            <p className="text-emerald-600 text-sm font-medium">
                                {t("library.totalImages")}: <span className="font-bold">{mediaItems.length}</span> {t("library.imageCount")}
                            </p>
                        )}
                    </div>
                    <button
                        onClick={openUploadModal}
                        className="relative z-10 flex items-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-sm font-semibold rounded-2xl shadow-md transition-all duration-200 shrink-0"
                    >
                        <Plus className="w-4 h-4" />
                        {t("library.uploadButton")}
                    </button>
                </div>

                {/* GRID */}
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
                            <p className="text-gray-500 max-w-md mb-6">{t("library.emptySubtitle")}</p>
                            <button
                                onClick={openUploadModal}
                                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow transition-all duration-200"
                            >
                                <Upload className="w-4 h-4" />
                                {t("library.uploadButton")}
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {mediaItems.map((item, index) => (
                                <div
                                    key={item.id}
                                    className="relative aspect-square group rounded-xl overflow-hidden bg-gray-100 shadow-sm border border-gray-200 cursor-pointer"
                                >
                                    <img
                                        src={item.blobUrl}
                                        alt={item.title || t("library.imageAlt")}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />

                                    {/* Hover overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3">
                                        {/* Delete button */}
                                        <div className="flex justify-end">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); openDeleteModal(item); }}
                                                title={t("common.delete")}
                                                className="w-8 h-8 flex items-center justify-center bg-red-500/90 hover:bg-red-600 rounded-lg text-white transition-colors duration-200 shadow-md"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                        {/* Title + View button */}
                                        <div className="space-y-1.5">
                                            {item.title && (
                                                <p className="text-white text-xs font-semibold truncate" title={item.title}>
                                                    {item.title}
                                                </p>
                                            )}
                                            <button
                                                onClick={() => openLightbox(index)}
                                                className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white text-xs font-medium rounded-lg transition-colors duration-200"
                                            >
                                                <Eye className="w-3.5 h-3.5" />
                                                {t("library.viewDetail")}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* ─── LIGHTBOX MODAL ─────────────────────────────────────────────── */}
            {modalMode === 'lightbox' && selectedItem && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
                    onClick={closeLightbox}
                >
                    {/* Close */}
                    <button
                        onClick={closeLightbox}
                        className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    {/* Counter */}
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/70 text-sm font-medium">
                        {selectedIndex + 1} / {mediaItems.length}
                    </div>

                    {/* Prev */}
                    {mediaItems.length > 1 && (
                        <button
                            onClick={(e) => { e.stopPropagation(); prevImage(); }}
                            className="absolute left-3 md:left-6 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                    )}

                    {/* Image */}
                    <div
                        className="relative max-w-4xl max-h-[80vh] w-full px-16"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img
                            key={selectedItem.id}
                            src={selectedItem.blobUrl}
                            alt={selectedItem.title || t("library.imageAlt")}
                            className="w-full h-full object-contain rounded-xl shadow-2xl max-h-[70vh]"
                        />

                        {/* Info bar */}
                        <div className="mt-3 flex items-center justify-between px-1">
                            <div>
                                <p className="text-white font-semibold text-sm">
                                    {selectedItem.title || t("library.noTitle")}
                                </p>
                                <p className="text-white/50 text-xs mt-0.5">
                                    {formatDate(selectedItem.createdDate)}
                                    {selectedItem.fileSize ? ` · ${formatFileSize(selectedItem.fileSize)}` : ''}
                                </p>
                            </div>
                            <button
                                onClick={() => { closeLightbox(); openDeleteModal(selectedItem); }}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/80 hover:bg-red-600 text-white text-xs font-medium rounded-lg transition-colors duration-200"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                                {t("common.delete")}
                            </button>
                        </div>
                    </div>

                    {/* Next */}
                    {mediaItems.length > 1 && (
                        <button
                            onClick={(e) => { e.stopPropagation(); nextImage(); }}
                            className="absolute right-3 md:right-6 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>
                    )}
                </div>
            )}

            {/* ─── UPLOAD MODAL ────────────────────────────────────────────────── */}
            {modalMode === 'upload' && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div
                        className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                            <h2 className="text-lg font-bold text-gray-900">{t("library.uploadModalTitle")}</h2>
                            <button
                                onClick={() => setModalMode('none')}
                                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            {/* Drop zone */}
                            <div
                                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                onDragLeave={() => setIsDragging(false)}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                                className={`relative rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer overflow-hidden
                                    ${isDragging ? 'border-emerald-400 bg-emerald-50' : 'border-gray-200 hover:border-emerald-300 hover:bg-gray-50'}
                                    ${uploadPreviewUrl ? 'h-52' : 'h-36'}`}
                            >
                                {uploadPreviewUrl ? (
                                    <img
                                        src={uploadPreviewUrl}
                                        alt="preview"
                                        className="w-full h-full object-contain"
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-400">
                                        <Upload className="w-8 h-8" />
                                        <p className="text-sm font-medium">{t("library.uploadDragHint")}</p>
                                        <p className="text-xs">{t("library.uploadFileTypes")}</p>
                                    </div>
                                )}
                                {uploadPreviewUrl && (
                                    <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center">
                                        <div className="opacity-0 hover:opacity-100 bg-black/60 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-opacity">
                                            {t("library.uploadSelectFile")}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                    const f = e.target.files?.[0];
                                    if (f) handleFileSelect(f);
                                    e.target.value = '';
                                }}
                            />

                            {/* Title input */}
                            <input
                                type="text"
                                value={uploadTitle}
                                onChange={(e) => setUploadTitle(e.target.value)}
                                placeholder={t("library.uploadTitlePlaceholder")}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 text-gray-800 text-sm placeholder-gray-400 outline-none transition-all"
                            />

                            {uploadError && (
                                <p className="text-red-500 text-sm">{uploadError}</p>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="flex gap-3 px-6 pb-6">
                            <button
                                onClick={() => setModalMode('none')}
                                className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
                            >
                                {t("common.cancel")}
                            </button>
                            <button
                                onClick={handleUploadSubmit}
                                disabled={!uploadFile || isUploading}
                                className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                            >
                                {isUploading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        {t("library.uploadingPhoto")}
                                    </>
                                ) : (
                                    <>
                                        <Upload className="w-4 h-4" />
                                        {t("library.uploadButton")}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ─── DELETE CONFIRM MODAL ─────────────────────────────────────────── */}
            {modalMode === 'delete' && itemToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div
                        className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Image preview */}
                        <div className="relative h-48 bg-gray-100">
                            <img
                                src={itemToDelete.blobUrl}
                                alt={itemToDelete.title}
                                className="w-full h-full object-contain"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
                        </div>

                        <div className="px-6 pb-6 text-center space-y-3">
                            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto -mt-6 relative z-10 border-4 border-white shadow-sm">
                                <Trash2 className="w-5 h-5 text-red-600" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">{t("library.deleteConfirmTitle")}</h3>
                            {itemToDelete.title && (
                                <p className="text-emerald-700 font-semibold text-sm">"{itemToDelete.title}"</p>
                            )}
                            <p className="text-gray-500 text-sm">{t("library.deleteConfirmMessage")}</p>

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => { setModalMode('none'); setItemToDelete(null); }}
                                    className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
                                >
                                    {t("common.cancel")}
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                                >
                                    {isDeleting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            {t("common.deleting")}
                                        </>
                                    ) : (
                                        <>
                                            <Trash2 className="w-4 h-4" />
                                            {t("common.yes")}
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ─── TOAST ────────────────────────────────────────────────────────── */}
            {toast && (
                <div
                    className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] px-5 py-3 rounded-2xl shadow-lg text-white text-sm font-medium transition-all duration-300
                        ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-500'}`}
                >
                    {toast.message}
                </div>
            )}
        </MainLayout>
    );
}
