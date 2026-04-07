// src/app/contacts/[id]/edit/page.tsx
"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";
import {
  ArrowLeft,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
  User,
  Phone,
  Mail,
  Tag,
  Trash2,
  UserCog,
} from "lucide-react";
import { ContactService } from "@/services/contact.service";
import { CategoriesService } from "@/services/categories.service";
import { Contact } from "@/types/contact";
import { Category } from "@/types/story";



export default function EditContactPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const contactId = Number(id);

  const [contact, setContact] = useState<Contact | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [preferenceName, setPreferenceName] = useState("");
  const [categoryId, setCategoryId] = useState<number>(0);

  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [data, categoryData] = await Promise.all([
          ContactService.getContactById(contactId),
          CategoriesService.getCategories(0, 100)
        ]);
        setContact(data);
        setPreferenceName(data.preferenceName || data.fullname || "");
        
        setCategories(categoryData.content || []);
        
        if (data.categoryId) {
          setCategoryId(data.categoryId);
        } else if (categoryData.content && categoryData.content.length > 0) {
          setCategoryId(categoryData.content[0].id);
        } else {
          setCategoryId(0);
        }
      } catch {
        setLoadError("Không thể tải thông tin liên hệ. Vui lòng thử lại.");
      } finally {
        setIsLoading(false);
        setIsLoadingCategories(false);
      }
    };
    if (contactId) fetchData();
  }, [contactId]);

  const handleSave = async () => {
    if (!contact) return;
    setIsSaving(true);
    setSaveError("");
    setSaveSuccess(false);
    try {
      await ContactService.updateContact(contactId, {
        preferenceName: preferenceName.trim() || contact.fullname,
      });
      setSaveSuccess(true);
      setTimeout(() => router.push("/contacts"), 1800);
    } catch {
      setSaveError("Lưu thất bại. Vui lòng thử lại.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await ContactService.deleteContact(contactId);
      router.push("/contacts");
    } catch {
      setShowDeleteConfirm(false);
      setSaveError("Xóa thất bại. Vui lòng thử lại.");
      setIsDeleting(false);
    }
  };

  // ─── Loading ─────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-emerald-700">
          <Loader2 className="w-12 h-12 animate-spin" aria-hidden="true" />
          <p className="text-xl font-bold">Đang tải thông tin...</p>
        </div>
      </MainLayout>
    );
  }

  if (loadError || !contact) {
    return (
      <MainLayout>
        <div className="max-w-3xl mx-auto space-y-8 pb-20">
          <div className="flex items-center gap-3 bg-red-50 text-red-700 p-6 rounded-2xl shadow-sm border-2 border-red-200">
            <AlertCircle className="w-8 h-8 flex-shrink-0" aria-hidden="true" />
            <p className="text-lg font-bold">{loadError || "Không tìm thấy liên hệ này."}</p>
          </div>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-emerald-800 hover:text-emerald-900 transition-colors font-bold text-lg w-fit bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm"
          >
            <ArrowLeft className="w-6 h-6" />
            Quay lại
          </button>
        </div>
      </MainLayout>
    );
  }

  const displayName = contact.preferenceName || contact.fullname;

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto space-y-8 pb-20">

        {/* ═══════════════ HEADER BANNER ═══════════════ */}
        <div className="bg-emerald-50 border-2 border-emerald-100 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <UserCog className="w-32 h-32 text-emerald-800" aria-hidden="true" />
          </div>

          <div className="relative z-10 space-y-3">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-emerald-800 hover:text-emerald-900 transition-colors font-bold text-lg w-fit bg-white/60 px-4 py-2 rounded-xl"
            >
              <ArrowLeft className="w-6 h-6" />
              <span>Quay lại</span>
            </button>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
              Sửa thông tin người thân
            </h1>
          </div>

          {/* Avatar lớn góc phải */}
          <div className="relative z-10 w-20 h-20 bg-emerald-700 text-white rounded-3xl flex items-center justify-center text-4xl font-extrabold shadow-md flex-shrink-0">
            {displayName.charAt(0).toUpperCase()}
          </div>
        </div>

        {/* ═══════════════ THÔNG BÁO LỖI / THÀNH CÔNG ═══════════════ */}
        {saveSuccess && (
          <div className="flex items-center gap-3 bg-emerald-50 text-emerald-800 p-6 rounded-2xl shadow-sm border-2 border-emerald-200">
            <CheckCircle2 className="w-8 h-8 flex-shrink-0" aria-hidden="true" />
            <p className="text-lg font-bold">Đã lưu thành công! Đang chuyển về danh bạ...</p>
          </div>
        )}
        {saveError && (
          <div className="flex items-center gap-3 bg-red-50 text-red-700 p-6 rounded-2xl shadow-sm border-2 border-red-200">
            <AlertCircle className="w-8 h-8 flex-shrink-0" aria-hidden="true" />
            <p className="text-lg font-bold">{saveError}</p>
          </div>
        )}

        {/* ═══════════════ THÔNG TIN CỐ ĐỊNH (Readonly) ═══════════════ */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6 md:p-8 space-y-5">
          <h2 className="text-lg font-extrabold text-gray-500 uppercase tracking-widest">
            Thông tin từ hồ sơ
          </h2>
          <div className="divide-y divide-gray-100">
            <div className="flex items-center gap-4 py-4">
              <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-gray-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-wide">Họ tên đầy đủ</p>
                <p className="text-xl font-bold text-gray-800 mt-0.5">{contact.fullname}</p>
              </div>
            </div>

            {contact.phoneNumber && (
              <div className="flex items-center gap-4 py-4">
                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-gray-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-wide">Điện thoại</p>
                  <p className="text-xl font-bold text-gray-800 mt-0.5">{contact.phoneNumber}</p>
                </div>
              </div>
            )}

            {contact.email && (
              <div className="flex items-center gap-4 py-4">
                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-gray-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-wide">Email</p>
                  <p className="text-xl font-bold text-gray-800 mt-0.5">{contact.email}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ═══════════════ FORM CHỈNH SỬA ═══════════════ */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6 md:p-8 space-y-6">
          <h2 className="text-lg font-extrabold text-gray-500 uppercase tracking-widest">
            Thông tin cá nhân hóa
          </h2>

          {/* Tên gợi nhớ */}
          <div className="space-y-3">
            <label htmlFor="pref-name" className="text-lg font-bold text-gray-700 flex items-center gap-2 block">
              <Tag className="w-5 h-5 text-emerald-600" />
              Tên gợi nhớ
            </label>
            <input
              id="pref-name"
              type="text"
              value={preferenceName}
              onChange={e => setPreferenceName(e.target.value)}
              placeholder="VD: Ba, Mẹ, Anh Hùng..."
              className="w-full px-5 py-4 text-xl border-2 border-gray-300 hover:border-emerald-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 rounded-xl outline-none transition-colors font-medium text-gray-900"
              maxLength={100}
            />
            <p className="text-base text-gray-400 text-right font-medium">{preferenceName.length}/100</p>
          </div>

          {/* Nhóm quan hệ - Tạm thời ẩn đi để tách biệt với danh bạ */}
          {/*
          <div className="space-y-3">
            <label className="text-lg font-bold text-gray-700 block">
              Nhóm quan hệ
            </label>
            {isLoadingCategories ? (
               <div className="flex justify-center p-4"><Loader2 className="w-8 h-8 animate-spin text-emerald-600" /></div>
            ) : categories.length === 0 ? (
               <p className="text-gray-500 italic">Chưa có nhóm quan hệ nào.</p>
            ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {categories.map(group => (
                <button
                  key={group.id}
                  type="button"
                  onClick={() => setCategoryId(group.id)}
                  className={`flex items-center gap-3 px-4 py-3 min-h-[56px] rounded-xl border-2 font-bold text-lg transition-all ${
                    categoryId === group.id
                      ? "border-emerald-500 bg-emerald-50 text-emerald-900"
                      : "border-gray-200 bg-white text-gray-700 hover:border-emerald-300 hover:bg-emerald-50"
                    }`}
                >
                  <span className="text-2xl">{group.icon || "💬"}</span>
                  <span>{group.name}</span>
                </button>
              ))}
            </div>
            )}
          </div>
          */}

          {/* Nút Lưu */}
          <button
            onClick={handleSave}
            disabled={isSaving || saveSuccess}
            className={`w-full flex items-center justify-center gap-3 min-h-[60px] px-8 py-3 rounded-xl text-xl font-bold transition-all shadow-md ${saveSuccess
                ? "bg-emerald-100 text-emerald-800 border-2 border-emerald-300"
                : "bg-emerald-800 hover:bg-emerald-900 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              }`}
          >
            {saveSuccess ? (
              <><CheckCircle2 className="w-6 h-6" /><span>Đã lưu xong!</span></>
            ) : isSaving ? (
              <><Loader2 className="w-6 h-6 animate-spin" /><span>Đang lưu...</span></>
            ) : (
              <><Save className="w-6 h-6" /><span>Lưu thay đổi</span></>
            )}
          </button>
        </div>

        {/* ═══════════════ KHU VỰC NGUY HIỂM ═══════════════ */}
        <div className="bg-red-50 rounded-3xl border-2 border-red-100 p-6 md:p-8 space-y-4">
          <h2 className="text-lg font-extrabold text-red-700 uppercase tracking-widest flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Khu vực nguy hiểm
          </h2>
          <p className="text-lg text-red-700 font-medium">
            Xóa <strong>"{displayName}"</strong> khỏi danh bạ. Hành động này không thể hoàn tác.
          </p>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-2 min-h-[52px] px-6 py-2.5 bg-white hover:bg-red-50 text-red-700 font-bold rounded-xl border-2 border-red-200 hover:border-red-400 transition-colors text-lg"
          >
            <Trash2 className="w-5 h-5" />
            Xóa khỏi danh bạ
          </button>
        </div>

      </div>

      {/* ═══════════════ MODAL XÁC NHẬN XÓA ═══════════════ */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
          <div className="bg-white max-w-md w-full rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="bg-red-50 p-6 flex items-center gap-4 border-b border-red-100">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-2xl font-extrabold text-red-900">Xác nhận Xóa</h3>
            </div>
            <div className="p-6">
              <p className="text-lg text-gray-600 font-medium mb-2">
                Bạn có chắc chắn muốn xóa{" "}
                <strong className="text-gray-900">"{displayName}"</strong>{" "}
                khỏi danh bạ không?
              </p>
              <p className="text-base text-gray-500">
                Hành động này không thể hoàn tác. Các câu chuyện đã chia sẻ trước đây sẽ không bị mất.
              </p>
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="px-6 py-2.5 rounded-xl font-bold text-lg text-gray-700 hover:bg-gray-200 bg-gray-100 transition-colors border border-gray-200"
              >
                Thoát
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold text-lg text-white bg-red-600 hover:bg-red-700 transition-colors min-w-[120px]"
              >
                {isDeleting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Vâng, Xóa"}
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
