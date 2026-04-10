"use client";

import { useState } from "react";
import Link from "next/link";
import { Users, Trash2, Edit, AlertCircle, Loader2, UserPlus, Phone, Tag, CheckCircle2 } from "lucide-react";
import { useTranslation } from "@/store/useLanguageStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useContactsSearch, useDeleteContact } from "@/hooks/queries/useContacts";
import { QueryRequest } from "@/types/common";

export default function ContactList() {
    const { t } = useTranslation();
    const { user } = useAuthStore();
    const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);

    // Queries & Mutations
    const queryRequest: QueryRequest = {
        filters: [
            { field: "user.id", operator: "EQUAL", value: user?.id || 0 },
            { field: "deleted", operator: "EQUAL", value: false },
        ],
        pagination: { page: 0, size: 500 },
        sorts: [{ field: "preferenceName", direction: "ASC" }]
    };

    // Chỉ tìm kiếm liên hệ khi user.id hợp lệ
    const { data, isLoading, isError } = useContactsSearch(queryRequest);
    const deleteMutation = useDeleteContact();

    const contacts = data?.content || [];

    const showToast = (type: "success" | "error", text: string) => {
        setToast({ type, text });
        setTimeout(() => setToast(null), 3000);
    };

    const handleDelete = (id: number, displayName: string) => {
        if (!window.confirm(`${t("contacts.deleteConfirm")} "${displayName}" ${t("contacts.deleteConfirmSuffix")}`)) return;

        deleteMutation.mutate(id, {
            onSuccess: () => {
                showToast("success", `${t("contacts.deleteSuccess")} "${displayName}" ${t("contacts.deleteSuccessSuffix")}`);
            },
            onError: () => {
                showToast("error", t("contacts.deleteError"));
            }
        });
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8 pb-20 relative">

            {/* TOAST NOTIFICATION */}
            {toast && (
                <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-lg border-2 font-bold text-base flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 ${toast.type === 'success'
                    ? 'bg-navy-50 text-navy-800 border-navy-200'
                    : 'bg-red-50 text-red-800 border-red-200'
                    }`}>
                    {toast.type === 'success'
                        ? <CheckCircle2 className="w-5 h-5" />
                        : <AlertCircle className="w-5 h-5" />}
                    {toast.text}
                </div>
            )}

            {/* HEADER BANNER */}
            <div className="bg-navy-50 border border-navy-100 rounded-[30px] p-6 md:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                    <Users className="w-32 h-32 text-navy-800" aria-hidden="true" />
                </div>

                <div className="relative z-10 space-y-2">
                    <h1 className="text-2xl md:text-3xl font-extrabold text-navy-900 tracking-tight">
                        {t("contacts.headerTitle")}
                    </h1>
                    <p className="text-navy-800 text-lg font-medium">
                        {t("contacts.headerSubtitle")}
                    </p>
                </div>

                <Link
                    href="/contacts/add"
                    className="relative z-10 flex items-center justify-center gap-3 min-h-[56px] px-8 py-3 bg-white hover:bg-navy-50 text-navy-700 border-2 border-navy-500 rounded-xl shadow-sm transition-all font-bold text-xl shrink-0"
                >
                    <UserPlus className="w-6 h-6" aria-hidden="true" />
                    <span>{t("contacts.addButton")}</span>
                </Link>
            </div>

            {/* ERROR STATE */}
            {isError && (
                <div className="flex items-center gap-3 bg-red-50 text-red-700 p-6 rounded-2xl shadow-sm border-2 border-red-200">
                    <AlertCircle className="w-8 h-8 flex-shrink-0" aria-hidden="true" />
                    <p className="text-lg font-bold">{t("contacts.loadError")}</p>
                </div>
            )}

            {/* LOADING & DATA GRID */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4 text-navy-700">
                    <Loader2 className="w-12 h-12 animate-spin" aria-hidden="true" />
                    <p className="text-xl font-bold">{t("contacts.loading")}</p>
                </div>
            ) : !isError && (
                <section className="space-y-6" aria-label={t("contacts.headerTitle")}>
                    {contacts.length === 0 ? (
                        <div className="text-center p-12 bg-white rounded-[30px] shadow-sm border border-pearl-200">
                            <div className="w-20 h-20 bg-pearl-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Users className="w-10 h-10 text-navy-700" aria-hidden="true" />
                            </div>
                            <p className="text-xl text-charcoal-900 font-bold mb-3">{t("contacts.emptyTitle")}</p>
                            <p className="text-lg text-charcoal-600 mb-8 font-medium">{t("contacts.emptySubtitle")}</p>
                            <Link
                                href="/contacts/add"
                                className="inline-flex items-center gap-2 text-xl font-bold text-navy-800 hover:text-navy-900 underline"
                            >
                                {t("contacts.addFirstLink")}
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {contacts.map(contact => {
                                const displayName = contact.preferenceName || contact.fullname;
                                const isDeleting = deleteMutation.isPending && deleteMutation.variables === contact.id;

                                return (
                                    <article key={contact.id} className="bg-white rounded-[30px] shadow-sm border border-pearl-200 p-6 flex flex-col gap-4 hover:shadow-md transition-shadow">
                                        {/* Thông chính */}
                                        <div className="flex flex-col gap-1 border-b border-pearl-100 pb-4">
                                            <h2 className="text-2xl font-bold text-charcoal-900 truncate" title={displayName}>
                                                {displayName}
                                            </h2>
                                            {contact.name && (
                                                <span className="inline-flex items-center gap-2 text-lg text-navy-800 font-bold bg-navy-50 border border-navy-100 px-3 py-1 rounded-xl w-fit mt-2 shadow-sm">
                                                    {contact.icon ? (
                                                        <span className="text-xl leading-none" aria-hidden="true">{contact.icon}</span>
                                                    ) : (
                                                        <Tag className="w-5 h-5" aria-hidden="true" />
                                                    )}
                                                    {contact.name}
                                                </span>
                                            )}
                                        </div>

                                        {/* Thông tin liên lạc */}
                                        <div className="flex flex-col gap-3 py-2 text-lg text-charcoal-700 font-medium">
                                            {contact.phoneNumber ? (
                                                <div className="flex items-center gap-3">
                                                    <Phone className="w-6 h-6 text-pearl-400" aria-hidden="true" />
                                                    <span>{contact.phoneNumber}</span>
                                                </div>
                                            ) : null}

                                            {(!contact.phoneNumber) && (
                                                <p className="italic text-charcoal-500">{t("contacts.noContactInfo")}</p>
                                            )}
                                        </div>

                                        {/* Nút hành động */}
                                        <div className="grid grid-cols-2 gap-4 pt-4 mt-auto border-t border-pearl-100">
                                            <Link
                                                href={`/contacts/${contact.id}/edit`}
                                                className="flex items-center justify-center gap-2 min-h-[48px] bg-pearl-50 hover:bg-navy-50 text-charcoal-800 hover:text-navy-800 text-lg font-bold rounded-xl transition-colors border border-pearl-200 hover:border-navy-200 shadow-sm"
                                            >
                                                <Edit className="w-5 h-5" aria-hidden="true" />
                                                {t("contacts.editButton")}
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(contact.id, displayName)}
                                                disabled={isDeleting}
                                                className="flex items-center justify-center gap-2 min-h-[48px] bg-red-50 hover:bg-red-100 text-red-700 hover:text-red-800 text-lg font-bold rounded-xl transition-colors border border-red-100 hover:border-red-200 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                                            >
                                                {isDeleting
                                                    ? <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                                                    : <Trash2 className="w-5 h-5" aria-hidden="true" />}
                                                {isDeleting ? t("contacts.deleteButton") + "..." : t("contacts.deleteButton")}
                                            </button>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </section>
            )}
        </div>
    );
}
