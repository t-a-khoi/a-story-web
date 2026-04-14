"use client";

import { useState, useEffect, useRef } from 'react';
import {
    Loader2, Image as ImageIcon, Upload, X, Trash2,
    ChevronLeft, ChevronRight, Plus, Eye,
    AlertCircle
} from 'lucide-react';
import { useTranslation } from '@/store/useLanguageStore';
import { useMyMediaFiles, useUploadMedia, useDeleteMedia } from '@/hooks/queries/useMediaFiles';

type ModalMode = 'none' | 'lightbox' | 'upload' | 'delete';

export default function LibraryManager() {
    const { t } = useTranslation();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data: mediaItems = [], isLoading } = useMyMediaFiles();
    const { mutate: uploadMedia, isPending: isUploading } = useUploadMedia();
    const { mutate: deleteMedia, isPending: isDeleting } = useDeleteMedia();

    const [modalMode, setModalMode] = useState<ModalMode>('none');
    const [selectedIndex, setSelectedIndex] = useState<number>(0);
    const [itemToDelete, setItemToDelete] = useState<any>(null);

    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [uploadPreviewUrl, setUploadPreviewUrl] = useState('');
    const [uploadTitle, setUploadTitle] = useState('');
    const [uploadError, setUploadError] = useState('');
    const [isDragging, setIsDragging] = useState(false);

    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    useEffect(() => {
        return () => {
            if (uploadPreviewUrl) URL.revokeObjectURL(uploadPreviewUrl);
            // We shouldn't implicitly revoke all blobUrls here since react-query cache might still be using them.
        };
    }, [uploadPreviewUrl]);

    const openLightbox = (index: number) => {
        setSelectedIndex(index);
        setModalMode('lightbox');
    };

    const closeLightbox = () => setModalMode('none');

    const prevImage = () => setSelectedIndex(i => (i - 1 + mediaItems.length) % mediaItems.length);
    const nextImage = () => setSelectedIndex(i => (i + 1) % mediaItems.length);

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
        if (uploadPreviewUrl) URL.revokeObjectURL(uploadPreviewUrl);
        setUploadPreviewUrl(URL.createObjectURL(file));
        setUploadError('');
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFileSelect(file);
    };

    const handleUploadSubmit = () => {
        if (!uploadFile) return;
        uploadMedia({ file: uploadFile, title: uploadTitle }, {
            onSuccess: () => {
                showToast(t('library.uploadSuccess'), 'success');
                setModalMode('none');
                if (uploadPreviewUrl) URL.revokeObjectURL(uploadPreviewUrl);
            },
            onError: (err) => {
                console.error('Upload error:', err);
                setUploadError(t('library.uploadError'));
            }
        });
    };

    const openDeleteModal = (item: any) => {
        setItemToDelete(item);
        setModalMode('delete');
    };

    const handleDelete = () => {
        if (!itemToDelete) return;
        deleteMedia({ id: itemToDelete.id, urlPath: itemToDelete.urlPath }, {
            onSuccess: () => {
                showToast(t('library.deleteSuccess'), 'success');
                setModalMode('none');
                setItemToDelete(null);
            },
            onError: (err) => {
                console.error('Delete error:', err);
                showToast(t('library.deleteError'), 'error');
                setModalMode('none');
                setItemToDelete(null);
            }
        });
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

    const selectedItem = mediaItems[selectedIndex];

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-20 relative">
            {toast && (
                <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] px-5 py-3 rounded-2xl shadow-lg font-bold text-base flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 ${toast.type === 'success' ? 'bg-teal-50 text-teal-800 border border-teal-200' : 'bg-red-500 text-white'}`}>
                    {toast.message}
                </div>
            )}

            {/* BANNER */}
            <div className="bg-teal-50 border border-teal-100 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                    <ImageIcon className="w-32 h-32 text-teal-800" aria-hidden="true" />
                </div>
                <div className="relative z-10 space-y-2">
                    <h1 className="text-2xl md:text-3xl font-extrabold text-teal-900 tracking-tight">
                        {t("library.headerTitle")}
                    </h1>
                    <p className="text-teal-800 text-lg font-medium">
                        {t("library.headerSubtitle")}
                    </p>
                    {!isLoading && mediaItems.length > 0 && (
                        <p className="text-teal-600 text-sm font-bold">
                            {t("library.totalImages")}: <span>{mediaItems.length}</span> {t("library.imageCount")}
                        </p>
                    )}
                </div>
                <button
                    onClick={openUploadModal}
                    className="relative z-10 flex items-center gap-2 px-6 py-3 bg-white hover:bg-teal-50 active:scale-95 text-teal-700 border-2 border-teal-500 text-base font-bold rounded-xl shadow-sm transition-all duration-200 shrink-0"
                >
                    <Plus className="w-5 h-5" />
                    {t("library.uploadButton")}
                </button>
            </div>

            {/* GRID */}
            <div className="bg-pearl-50 rounded-3xl p-6 md:p-8 shadow-sm border border-pearl-200 min-h-[400px]">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 space-y-4">
                        <Loader2 className="w-10 h-10 animate-spin text-teal-500" />
                        <p className="text-charcoal-500 font-bold text-lg">{t("library.loading")}</p>
                    </div>
                ) : mediaItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-pearl-300 rounded-2xl bg-white">
                        <ImageIcon className="w-20 h-20 text-pearl-300 mb-4" />
                        <h2 className="text-xl font-bold text-charcoal-700 mb-2">{t("library.emptyTitle")}</h2>
                        <p className="text-charcoal-500 max-w-md mb-6">{t("library.emptySubtitle")}</p>
                        <button
                            onClick={openUploadModal}
                            className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-teal-50 text-teal-700 border-2 border-teal-500 text-base font-bold rounded-xl shadow-sm transition-all duration-200"
                        >
                            <Upload className="w-4 h-4" />
                            {t("library.uploadButton")}
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {mediaItems.map((item: any, index: number) => (
                            <div
                                key={item.id}
                                className="relative aspect-square group rounded-2xl overflow-hidden bg-white shadow-sm border border-pearl-200 cursor-pointer"
                            >
                                <img
                                    src={item.blobUrl}
                                    alt={item.title || t("library.imageAlt")}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />

                                {/* Hover overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/80 via-charcoal-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3">
                                    <div className="flex justify-end">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); openDeleteModal(item); }}
                                            title={t("common.delete")}
                                            className="w-8 h-8 flex items-center justify-center bg-red-500/90 hover:bg-red-600 rounded-lg text-white transition-colors duration-200 shadow-md"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="space-y-1.5">
                                        {item.title && (
                                            <p className="text-white text-xs font-bold truncate" title={item.title}>
                                                {item.title}
                                            </p>
                                        )}
                                        <button
                                            onClick={() => openLightbox(index)}
                                            className="w-full flex items-center justify-center gap-1.5 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white text-xs font-bold rounded-lg transition-colors border border-white/10"
                                        >
                                            <Eye className="w-4 h-4" />
                                            {t("library.viewDetail")}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ─── LIGHTBOX MODAL ─────────────────────────────────────────────── */}
            {modalMode === 'lightbox' && selectedItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal-900/95 backdrop-blur-sm" onClick={closeLightbox}>
                    <button onClick={closeLightbox} className="absolute top-4 right-4 z-10 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                    <div className="absolute top-6 left-1/2 -translate-x-1/2 text-pearl-100 font-bold bg-white/10 px-4 py-1.5 rounded-full text-sm backdrop-blur-md border border-white/10">
                        {selectedIndex + 1} / {mediaItems.length}
                    </div>

                    {mediaItems.length > 1 && (
                        <button onClick={(e) => { e.stopPropagation(); prevImage(); }} className="absolute left-4 md:left-8 z-10 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
                            <ChevronLeft className="w-8 h-8" />
                        </button>
                    )}

                    <div className="relative max-w-5xl max-h-[85vh] w-full px-16 flex flex-col justify-center items-center" onClick={(e) => e.stopPropagation()}>
                        <img src={selectedItem.blobUrl} alt={selectedItem.title || t("library.imageAlt")} className="max-w-full object-contain rounded-xl shadow-2xl max-h-[75vh]" />
                        <div className="mt-6 flex items-center justify-between w-full max-w-lg bg-black/40 backdrop-blur-md p-4 rounded-xl border border-white/10">
                            <div>
                                <p className="text-white font-bold text-base">{selectedItem.title || t("library.noTitle")}</p>
                                <p className="text-pearl-200 text-sm mt-1 font-medium">
                                    {formatDate(selectedItem.createdDate)}
                                    {selectedItem.fileSize ? ` · ${formatFileSize(selectedItem.fileSize)}` : ''}
                                </p>
                            </div>
                            <button onClick={() => { closeLightbox(); openDeleteModal(selectedItem); }} className="flex items-center gap-2 px-4 py-2.5 bg-red-500/80 hover:bg-red-600 text-white text-sm font-bold rounded-xl transition-colors">
                                <Trash2 className="w-4 h-4" />
                                {t("common.delete")}
                            </button>
                        </div>
                    </div>

                    {mediaItems.length > 1 && (
                        <button onClick={(e) => { e.stopPropagation(); nextImage(); }} className="absolute right-4 md:right-8 z-10 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
                            <ChevronRight className="w-8 h-8" />
                        </button>
                    )}
                </div>
            )}

            {/* ─── UPLOAD MODAL ────────────────────────────────────────────────── */}
            {modalMode === 'upload' && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-6 py-5 border-b border-pearl-200 bg-pearl-50">
                            <h2 className="text-lg font-bold text-charcoal-900">{t("library.uploadModalTitle")}</h2>
                            <button onClick={() => setModalMode('none')} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-pearl-200 text-charcoal-500 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-5 flex flex-col">
                            <div
                                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                onDragLeave={() => setIsDragging(false)}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                                className={`relative rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer overflow-hidden flex flex-col items-center justify-center text-center
                                    ${isDragging ? 'border-teal-400 bg-teal-50' : 'border-pearl-300 hover:border-teal-300 hover:bg-pearl-50'}
                                    ${uploadPreviewUrl ? 'h-56' : 'h-40'}`}
                            >
                                {uploadPreviewUrl ? (
                                    <img src={uploadPreviewUrl} alt="preview" className="w-full h-full object-contain" />
                                ) : (
                                    <div className="flex flex-col items-center gap-3 text-charcoal-400 p-4">
                                        <div className="w-12 h-12 rounded-full bg-pearl-100 flex items-center justify-center">
                                            <Upload className="w-6 h-6 text-teal-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-charcoal-700">{t("library.uploadDragHint")}</p>
                                            <p className="text-xs text-charcoal-500 mt-1">{t("library.uploadFileTypes")}</p>
                                        </div>
                                    </div>
                                )}
                                {uploadPreviewUrl && (
                                    <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center">
                                        <div className="opacity-0 hover:opacity-100 bg-charcoal-900/80 text-white text-xs font-bold px-4 py-2 rounded-xl transition-opacity">
                                            {t("library.uploadSelectFile")}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) handleFileSelect(f);
                                e.target.value = '';
                            }} />

                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-charcoal-700 ml-1">Tiêu đề (Tùy chọn)</label>
                                <input
                                    type="text"
                                    value={uploadTitle}
                                    onChange={(e) => setUploadTitle(e.target.value)}
                                    placeholder={t("library.uploadTitlePlaceholder")}
                                    className="w-full px-4 py-3.5 rounded-xl border-2 border-pearl-200 focus:border-teal-400 focus:ring-4 focus:ring-teal-100 text-charcoal-900 text-base font-medium placeholder-charcoal-400 outline-none transition-all"
                                />
                            </div>
                            {uploadError && <p className="text-red-500 text-sm font-bold flex items-center gap-1.5"><AlertCircle className="w-4 h-4"/> {uploadError}</p>}
                        </div>

                        <div className="flex gap-3 px-6 pb-6 bg-white border-t border-pearl-100 pt-5">
                            <button onClick={() => setModalMode('none')} className="flex-1 py-3 rounded-xl border-2 border-pearl-200 text-charcoal-600 text-sm font-bold hover:bg-pearl-50 transition-colors">
                                {t("common.cancel")}
                            </button>
                            <button onClick={handleUploadSubmit} disabled={!uploadFile || isUploading} className="flex-1 py-3 rounded-xl bg-white hover:bg-teal-50 disabled:opacity-50 text-teal-700 border-2 border-teal-500 text-sm font-bold transition-colors flex items-center justify-center gap-2 shadow-sm">
                                {isUploading ? <><Loader2 className="w-4 h-4 animate-spin" /> {t("library.uploadingPhoto")}</> : <><Upload className="w-4 h-4" /> {t("library.uploadButton")}</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ─── DELETE CONFIRM MODAL ─────────────────────────────────────────── */}
            {modalMode === 'delete' && itemToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        <div className="relative h-48 bg-pearl-50 border-b border-pearl-200">
                            <img src={itemToDelete.blobUrl} alt={itemToDelete.title} className="w-full h-full object-contain" />
                            <div className="absolute inset-0 bg-gradient-to-t from-white to-transparent opacity-50" />
                        </div>
                        <div className="px-6 pb-6 text-center space-y-3 relative">
                            <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto -mt-7 relative z-10 border-4 border-white shadow-sm">
                                <Trash2 className="w-6 h-6 text-red-500" />
                            </div>
                            <h3 className="text-xl font-bold text-charcoal-900">{t("library.deleteConfirmTitle")}</h3>
                            {itemToDelete.title && <p className="text-teal-700 font-bold text-base px-2 truncate">"{itemToDelete.title}"</p>}
                            <p className="text-charcoal-500 text-sm">{t("library.deleteConfirmMessage")}</p>
                            <div className="flex gap-3 pt-4">
                                <button onClick={() => { setModalMode('none'); setItemToDelete(null); }} className="flex-1 py-3 rounded-xl border-2 border-pearl-200 text-charcoal-600 text-sm font-bold hover:bg-pearl-50 transition-colors">
                                    {t("common.cancel")}
                                </button>
                                <button onClick={handleDelete} disabled={isDeleting} className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-sm font-bold transition-colors flex items-center justify-center gap-2 shadow-md">
                                    {isDeleting ? <><Loader2 className="w-4 h-4 animate-spin" /> {t("common.deleting")}</> : <><Trash2 className="w-4 h-4" /> {t("common.yes")}</>}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
