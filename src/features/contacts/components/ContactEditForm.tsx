"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { useContactById, useUpdateContact, useDeleteContact } from "@/hooks/queries/useContacts";

export default function ContactEditForm({ contactId }: { contactId: number }) {
    const router = useRouter();

    const [preferenceName, setPreferenceName] = useState("");

    const [saveSuccess, setSaveSuccess] = useState(false);

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Queries & Mutations
    const { data: contact, isLoading, error: loadError } = useContactById(contactId);
    const updateMutation = useUpdateContact();
    const deleteMutation = useDeleteContact();

    useEffect(() => {
        if (contact) {
            setPreferenceName(contact.preferenceName || contact.fullname || "");
        }
    }, [contact]);

    const handleSave = () => {
        if (!contact) return;
        setSaveSuccess(false);

        updateMutation.mutate({
            id: contactId,
            data: {
                preferenceName: preferenceName.trim() || contact.fullname,
            }
        }, {
            onSuccess: () => {
                setSaveSuccess(true);
                setTimeout(() => router.push("/contacts"), 1800);
            },
            onError: () => {
                setSaveSuccess(false);
            },
            onSettled: () => {
                // Luôn đảm bảo form khắng bị kẹt loading sau kết quả
            }
        });
    };

    const handleDelete = () => {
        deleteMutation.mutate(contactId, {
            onSuccess: () => {
                router.push("/contacts");
            },
            onError: () => {
                setShowDeleteConfirm(false);
            },
            onSettled: (_data, error) => {
                // Nếu lỗi, đóng modal xóa để tránh user bấm liên tục
                if (error) {
                    setShowDeleteConfirm(false);
                }
            }
        });
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-navy-700">
                <Loader2 className="w-12 h-12 animate-spin" aria-hidden="true" />
                <p className="text-xl font-bold">Đang tải thông tin...</p>
            </div>
        );
    }

    if (loadError || !contact) {
        return (
            <div className="max-w-3xl mx-auto space-y-8 pb-20">
                <div className="flex items-center gap-3 bg-red-50 text-red-700 p-6 rounded-2xl shadow-sm border-2 border-red-200">
                    <AlertCircle className="w-8 h-8 flex-shrink-0" aria-hidden="true" />
                    <p className="text-lg font-bold">Không tìm thấy liên hệ này hoặc đã có lỗi xảy ra.</p>
                </div>
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-navy-800 hover:text-navy-900 transition-colors font-bold text-lg w-fit bg-white px-4 py-2 rounded-xl border border-pearl-200 shadow-sm"
                >
                    <ArrowLeft className="w-6 h-6" />
                    Quay lại
                </button>
            </div>
        );
    }

    const displayName = contact.preferenceName || contact.fullname;

    return (
        <div className="max-w-3xl mx-auto space-y-8 pb-20">

            {/* HEADER BANNER */}
            <div className="bg-navy-50 border-2 border-navy-100 rounded-[30px] p-6 md:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                    <UserCog className="w-32 h-32 text-navy-800" aria-hidden="true" />
                </div>

                <div className="relative z-10 space-y-3">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-navy-800 hover:text-navy-900 transition-colors font-bold text-lg w-fit bg-white/60 px-4 py-2 rounded-xl"
                    >
                        <ArrowLeft className="w-6 h-6" />
                        <span>Quay lại</span>
                    </button>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-charcoal-900 tracking-tight">
                        Sửa thông tin người thân
                    </h1>
                </div>

                <div className="relative z-10 w-20 h-20 bg-navy-50 text-navy-700 border-2 border-navy-200 rounded-3xl flex items-center justify-center text-4xl font-extrabold shadow-sm flex-shrink-0">
                    {displayName.charAt(0).toUpperCase()}
                </div>
            </div>

            {/* THÔNG BÁO LỖI / THÀNH CÔNG */}
            {saveSuccess && (
                <div className="flex items-center gap-3 bg-navy-50 text-navy-800 p-6 rounded-2xl shadow-sm border-2 border-navy-200">
                    <CheckCircle2 className="w-8 h-8 flex-shrink-0" aria-hidden="true" />
                    <p className="text-lg font-bold">Đã lưu thành công! Đang chuyển về danh bạ...</p>
                </div>
            )}
            {updateMutation.isError && (
                <div className="flex items-center gap-3 bg-red-50 text-red-700 p-6 rounded-2xl shadow-sm border-2 border-red-200">
                    <AlertCircle className="w-8 h-8 flex-shrink-0" aria-hidden="true" />
                    <p className="text-lg font-bold">Lưu thất bại. Vui lòng thử lại.</p>
                </div>
            )}
            {deleteMutation.isError && (
                <div className="flex items-center gap-3 bg-red-50 text-red-700 p-6 rounded-2xl shadow-sm border-2 border-red-200">
                    <AlertCircle className="w-8 h-8 flex-shrink-0" aria-hidden="true" />
                    <p className="text-lg font-bold">Xóa thất bại. Vui lòng thử lại.</p>
                </div>
            )}

            {/* THÔNG TIN CỐ ĐỊNH */}
            <div className="bg-white rounded-[30px] shadow-sm border border-pearl-200 p-6 md:p-8 space-y-5">
                <h2 className="text-lg font-extrabold text-charcoal-500 uppercase tracking-widest">
                    Thông tin từ hồ sơ
                </h2>
                <div className="divide-y divide-pearl-100">
                    <div className="flex items-center gap-4 py-4">
                        <div className="w-10 h-10 bg-pearl-50 rounded-xl flex items-center justify-center flex-shrink-0">
                            <User className="w-5 h-5 text-charcoal-400" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-charcoal-400 uppercase tracking-wide">Họ tên đầy đủ</p>
                            <p className="text-xl font-bold text-charcoal-800 mt-0.5">{contact.fullname}</p>
                        </div>
                    </div>

                    {contact.phoneNumber && (
                        <div className="flex items-center gap-4 py-4">
                            <div className="w-10 h-10 bg-pearl-50 rounded-xl flex items-center justify-center flex-shrink-0">
                                <Phone className="w-5 h-5 text-charcoal-400" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-charcoal-400 uppercase tracking-wide">Điện thoại</p>
                                <p className="text-xl font-bold text-charcoal-800 mt-0.5">{contact.phoneNumber}</p>
                            </div>
                        </div>
                    )}

                    {contact.email && (
                        <div className="flex items-center gap-4 py-4">
                            <div className="w-10 h-10 bg-pearl-50 rounded-xl flex items-center justify-center flex-shrink-0">
                                <Mail className="w-5 h-5 text-charcoal-400" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-charcoal-400 uppercase tracking-wide">Email</p>
                                <p className="text-xl font-bold text-charcoal-800 mt-0.5">{contact.email}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* FORM CHỈNH SỬA */}
            <div className="bg-white rounded-[30px] shadow-sm border border-pearl-200 p-6 md:p-8 space-y-6">
                <h2 className="text-lg font-extrabold text-charcoal-500 uppercase tracking-widest">
                    Thông tin cá nhân hóa
                </h2>

                <div className="space-y-3">
                    <label htmlFor="pref-name" className="text-lg font-bold text-charcoal-700 flex items-center gap-2">
                        <Tag className="w-5 h-5 text-navy-600" />
                        Tên gợi nhớ
                    </label>
                    <input
                        id="pref-name"
                        type="text"
                        value={preferenceName}
                        onChange={e => setPreferenceName(e.target.value)}
                        placeholder="VD: Ba, Mẹ, Anh Hùng..."
                        className="w-full px-5 py-4 text-xl border-2 border-pearl-200 hover:border-navy-300 focus:border-navy-500 focus:ring-4 focus:ring-navy-100 rounded-xl outline-none transition-colors font-medium text-charcoal-900"
                        maxLength={100}
                    />
                    <p className="text-base text-charcoal-400 text-right font-medium">{preferenceName.length}/100</p>
                </div>

                <button
                    onClick={handleSave}
                    disabled={updateMutation.isPending || saveSuccess}
                    className={`w-full flex items-center justify-center gap-3 min-h-[60px] px-8 py-3 rounded-xl text-xl font-bold transition-all shadow-md ${saveSuccess
                        ? "bg-navy-50 text-navy-700 border-2 border-navy-300"
                        : "bg-white hover:bg-navy-50 text-navy-700 border-2 border-navy-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        }`}
                >
                    {saveSuccess ? (
                        <><CheckCircle2 className="w-6 h-6" /><span>Đã lưu xong!</span></>
                    ) : updateMutation.isPending ? (
                        <><Loader2 className="w-6 h-6 animate-spin" /><span>Đang lưu...</span></>
                    ) : (
                        <><Save className="w-6 h-6" /><span>Lưu thay đổi</span></>
                    )}
                </button>
            </div>

            {/* KHU VỰC NGUY HIỂM */}
            <div className="bg-red-50 rounded-[30px] border-2 border-red-100 p-6 md:p-8 space-y-4">
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

            {/* MODAL XÁC NHẬN XÓA */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white max-w-md w-full rounded-[30px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="bg-red-50 p-6 flex items-center gap-4 border-b border-red-100">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                                <Trash2 className="w-6 h-6 text-red-600" />
                            </div>
                            <h3 className="text-2xl font-extrabold text-red-900">Xác nhận Xóa</h3>
                        </div>
                        <div className="p-6">
                            <p className="text-lg text-charcoal-600 font-medium mb-2">
                                Bạn có chắc chắn muốn xóa{" "}
                                <strong className="text-charcoal-900">"{displayName}"</strong>{" "}
                                khỏi danh bạ không?
                            </p>
                            <p className="text-base text-charcoal-500">
                                Hành động này không thể hoàn tác. Các câu chuyện đã chia sẻ trước đây sẽ không bị mất.
                            </p>
                        </div>
                        <div className="p-4 bg-pearl-50 border-t border-pearl-100 flex items-center justify-end gap-3">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                disabled={deleteMutation.isPending}
                                className="px-6 py-2.5 rounded-xl font-bold text-lg text-charcoal-700 hover:bg-pearl-200 bg-pearl-100 transition-colors border border-pearl-200"
                            >
                                Thoát
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={deleteMutation.isPending}
                                className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold text-lg text-white bg-red-600 hover:bg-red-700 transition-colors min-w-[120px]"
                            >
                                {deleteMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Vâng, Xóa"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
