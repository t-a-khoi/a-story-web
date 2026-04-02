"use client";

import { useEffect, useState, useCallback } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Loader2, Plus, Edit3, Trash2, Tags, AlertTriangle, CheckCircle2, Bookmark } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { CategoriesService } from "@/services/categories.service";
import { Category } from "@/types/story";
import { useTranslation } from "@/store/useLanguageStore";

const PRESET_COLORS = [
    "#f87171", "#fb923c", "#fbbf24", "#34d399",
    "#38bdf8", "#818cf8", "#c084fc", "#f472b6"
];

const PRESET_EMOJIS = [
    "🏡", "👨‍👩‍👧‍👦", "❤️", "🎯", "✈️", "💼", "🎓", "🎉", 
    "🐕", "🌳", "💡", "💰", "📷", "🎵", "🍔", "✨"
];

export default function CategoriesPage() {
    const { user } = useAuthStore();
    const { t } = useTranslation();
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [currentCategory, setCurrentCategory] = useState<Category | null>(null);

    const [formData, setFormData] = useState({ name: "", icon: "🏡", color: "#34d399" });
    const [isSaving, setIsSaving] = useState(false);
    const [formError, setFormError] = useState("");

    const [toastMsg, setToastMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const fetchCategories = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await CategoriesService.getCategories(0, 200);
            if (res && res.content) {
                setCategories(res.content);
            }
        } catch (error) {
            console.error("Lỗi khi tải danh mục:", error);
            showToast("error", t("categories.toastLoadError"));
        } finally {
            setIsLoading(false);
        }
    }, [user?.id]);

    useEffect(() => {
        if (user) {
            fetchCategories();
        }
    }, [user, fetchCategories]);

    const showToast = (type: 'success' | 'error', text: string) => {
        setToastMsg({ type, text });
        setTimeout(() => setToastMsg(null), 3500);
    };

    const openAddModal = () => {
        setCurrentCategory(null);
        setFormData({ name: "", icon: "🏡", color: "#34d399" });
        setFormError("");
        setIsModalOpen(true);
    };

    const openEditModal = (cat: Category) => {
        setCurrentCategory(cat);
        setFormData({ 
            name: cat.name || "", 
            icon: cat.icon || "🏡", 
            color: cat.color || "#34d399" 
        });
        setFormError("");
        setIsModalOpen(true);
    };

    const openDeleteModal = (cat: Category) => {
        setCurrentCategory(cat);
        setIsDeleteModalOpen(true);
    };

    const handleSave = async () => {
        if (!formData.name.trim()) {
            setFormError(t("categories.formError"));
            return;
        }

        setIsSaving(true);
        setFormError("");

        try {
            const payload = {
                name: formData.name.trim(),
                typeCode: formData.name.trim().toUpperCase().replace(/\s+/g, '_').substring(0, 50),
                userId: user?.id || 1,
                icon: formData.icon,
                color: formData.color
            };

            if (currentCategory) {
                const res = await CategoriesService.updateCategory(currentCategory.id, payload);
                setCategories(prev => prev.map(c => c.id === res.id ? res : c));
                showToast("success", t("categories.toastUpdateSuccess"));
            } else {
                const res = await CategoriesService.createCategory(payload);
                setCategories([res, ...categories]);
                showToast("success", t("categories.toastCreateSuccess"));
            }
            setIsModalOpen(false);
        } catch (error) {
            console.error("Lỗi lưu:", error);
            setFormError(t("categories.toastSaveError"));
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!currentCategory) return;
        setIsSaving(true);
        try {
            await CategoriesService.deleteCategory(currentCategory.id);
            setCategories(prev => prev.filter(c => c.id !== currentCategory.id));
            setIsDeleteModalOpen(false);
            showToast("success", t("categories.toastDeleteSuccess"));
        } catch (error) {
            console.error("Lỗi xóa:", error);
            showToast("error", t("categories.toastDeleteError"));
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <MainLayout>
            <div className="max-w-4xl mx-auto space-y-8 pb-20 relative">

                {/* Toasts Popup */}
                {toastMsg && (
                    <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-lg border-2 font-bold text-base flex items-center gap-3 animate-in fade-in slide-in-from-top-4 ${toastMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-800 border-red-200'}`}>
                        {toastMsg.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                        {toastMsg.text}
                    </div>
                )}

                {/* HEADER BANNER */}
                <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden transition-colors duration-500">
                    <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                        <Tags className="w-32 h-32 text-emerald-800" aria-hidden="true" />
                    </div>

                    <div className="relative z-10 space-y-3">
                        <h1 className="text-2xl md:text-3xl font-extrabold text-emerald-900 tracking-tight">
                            {t("categories.headerTitle")}
                        </h1>
                        <p className="text-emerald-800 text-base md:text-lg font-medium">
                            {t("categories.headerSubtitle")}
                        </p>
                    </div>

                    <button
                        onClick={openAddModal}
                        className="relative z-10 flex items-center justify-center gap-2 px-6 py-3 min-w-[160px] bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl shadow-md transition-all font-bold text-lg shrink-0"
                    >
                        <Plus className="w-6 h-6" />
                        {t("categories.createButton")}
                    </button>
                </div>

                {/* CONTENT */}
                <section>
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 space-y-4 bg-stone-50 rounded-3xl border border-stone-200">
                            <Loader2 className="w-12 h-12 text-emerald-700 animate-spin" />
                            <p className="text-lg text-stone-600 font-medium">{t("categories.loading")}</p>
                        </div>
                    ) : categories.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 px-6 text-center bg-stone-50 rounded-3xl border-2 border-dashed border-stone-200">
                            <Bookmark className="w-16 h-16 text-emerald-200 mb-4" />
                            <h2 className="text-2xl font-bold text-stone-800 mb-2">{t("categories.emptyTitle")}</h2>
                            <p className="text-lg text-stone-600 mb-8 max-w-md">
                                {t("categories.emptySubtitle")}
                            </p>
                            <button
                                onClick={openAddModal}
                                className="px-6 py-2.5 bg-emerald-100 text-emerald-800 font-bold rounded-xl hover:bg-emerald-200 transition-colors border border-emerald-200 flex items-center gap-2"
                            >
                                <Plus className="w-5 h-5"/> {t("categories.addFirstButton")}
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                            {categories.map(cat => (
                                <div key={cat.id} className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5 hover:shadow-md transition-shadow relative group">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-4">
                                            <div 
                                                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
                                                style={{ backgroundColor: cat.color ? cat.color + "22" : "#d1fae5" }}
                                            >
                                                {cat.icon || "🏷️"}
                                            </div>
                                            <div>
                                                <h3 
                                                    className="text-lg font-bold break-words"
                                                    style={{ color: cat.color || "#064e3b" }}
                                                >
                                                    {cat.name}
                                                </h3>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-end gap-2 mt-6 opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                        <button 
                                            onClick={() => openEditModal(cat)}
                                            className="p-2 text-stone-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors border border-transparent hover:border-emerald-100"
                                            title={t("categories.editTooltip")}
                                        >
                                            <Edit3 className="w-5 h-5" />
                                        </button>
                                        <button 
                                            onClick={() => openDeleteModal(cat)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                                            title={t("categories.deleteTooltip")}
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* MODAL TẠO / SỬA */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
                        <div className="bg-white max-w-lg w-full rounded-3xl overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-200">
                            
                            <div className="p-6 border-b border-stone-100 flex items-center gap-4">
                                <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
                                    <Tags className="w-6 h-6" />
                                </div>
                                <h2 className="text-2xl font-extrabold text-stone-900">
                                    {currentCategory ? t("categories.modalEditTitle") : t("categories.modalAddTitle")}
                                </h2>
                            </div>

                            <div className="p-6 space-y-6">
                                {formError && (
                                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-2 font-bold text-sm">
                                        <AlertTriangle className="w-5 h-5" /> {formError}
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-bold text-stone-700 mb-2">{t("categories.formNameLabel")}</label>
                                    <input 
                                        type="text" 
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        className="w-full border-2 border-stone-200 px-4 py-3 rounded-xl text-lg font-bold text-stone-900 focus:outline-none focus:border-emerald-500 bg-stone-50 focus:bg-white transition-colors placeholder:font-normal"
                                        placeholder={t("categories.formNamePlaceholder")}
                                        maxLength={50}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-stone-700 mb-3">{t("categories.formColorLabel")}</label>
                                    <div className="flex flex-wrap gap-3">
                                        {PRESET_COLORS.map(c => (
                                            <button 
                                                key={c}
                                                onClick={() => setFormData({...formData, color: c})}
                                                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${formData.color === c ? 'ring-4 ring-offset-2 scale-110' : 'hover:scale-110 opacity-80'}`}
                                                style={{ backgroundColor: c, "--tw-ring-color": c } as React.CSSProperties}
                                            >
                                                {formData.color === c && <CheckCircle2 className="w-5 h-5 text-white" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-stone-700 mb-3">{t("categories.formIconLabel")}</label>
                                    <div className="grid grid-cols-8 gap-2 bg-stone-50 p-4 rounded-xl border border-stone-100">
                                        {PRESET_EMOJIS.map(emoji => (
                                            <button 
                                                key={emoji}
                                                onClick={() => setFormData({...formData, icon: emoji})}
                                                className={`text-2xl h-10 w-10 flex items-center justify-center rounded-lg transition-colors ${formData.icon === emoji ? 'bg-emerald-100 border border-emerald-300 scale-110' : 'hover:bg-stone-200'}`}
                                            >
                                                {emoji}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="p-5 bg-stone-50 border-t border-stone-100 flex justify-end gap-3">
                                <button 
                                    onClick={() => !isSaving && setIsModalOpen(false)}
                                    className="px-6 py-2.5 rounded-xl font-bold bg-white border border-stone-200 text-stone-700 hover:bg-stone-100"
                                >
                                    {t("common.close")}
                                </button>
                                <button 
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="px-6 py-2.5 rounded-xl font-bold bg-emerald-600 text-white hover:bg-emerald-700 flex items-center gap-2 min-w-[120px] justify-center"
                                >
                                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : currentCategory ? t("categories.saveButton") : t("categories.createConfirm")}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* MODAL XÓA */}
                {isDeleteModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
                        <div className="bg-white max-w-md w-full rounded-3xl overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-200">
                            <div className="bg-red-50 p-6 flex items-center gap-4 border-b border-red-100">
                                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                                    <Trash2 className="w-6 h-6 text-red-600" />
                                </div>
                                <h2 className="text-2xl font-extrabold text-red-900">{t("categories.deleteModalTitle")}</h2>
                            </div>
                            
                            <div className="p-6">
                                <p className="text-lg text-stone-700 font-medium mb-3">
                                    {t("categories.deleteConfirmMsg")} "<strong className="text-stone-900">{currentCategory?.name}</strong>"?
                                </p>
                                <p className="text-base text-stone-500 bg-stone-50 p-3 rounded-xl border border-stone-200">
                                    {t("categories.deleteNote")}
                                </p>
                            </div>
                            
                            <div className="p-4 bg-stone-50 border-t border-stone-100 flex items-center justify-end gap-3">
                                <button
                                    onClick={() => !isSaving && setIsDeleteModalOpen(false)}
                                    className="px-6 py-2.5 rounded-xl font-bold text-lg text-stone-700 hover:bg-stone-200 bg-stone-100 border border-stone-200"
                                >
                                    {t("common.no")}
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={isSaving}
                                    className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold text-lg text-white bg-red-600 hover:bg-red-700 min-w-[120px]"
                                >
                                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : t("categories.confirmDelete")}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </MainLayout>
    );
}
