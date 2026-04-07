// src/app/contacts/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import MainLayout from "@/components/layout/MainLayout";
import { Users, Trash2, Edit, AlertCircle, Loader2, UserPlus, Phone, Mail, Tag, CheckCircle2 } from "lucide-react";
import { ContactService } from "@/services/contact.service";
import { Contact } from "@/types/contact";
import { useTranslation } from "@/store/useLanguageStore";
import { useAuthStore } from "@/store/useAuthStore";

export default function ContactsPage() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (user?.id) {
      fetchContacts();
    }
  }, [user?.id]);

  const showToast = (type: "success" | "error", text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchContacts = async () => {
    if (!user?.id) return;
    setIsLoading(true);
    setError("");
    try {
      const data = await ContactService.searchContacts({
        filters: [{ field: "user.id", operator: "EQUAL", value: user.id }],
        pagination: { page: 0, size: 500 },
        sorts: [{ field: "preferenceName", direction: "ASC" }]
      });
      setContacts(data.content || []);
    } catch (err) {
      console.error("Lỗi lấy danh bạ:", err);
      setError(t("contacts.loadError"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number, displayName: string) => {
    if (!window.confirm(`${t("contacts.deleteConfirm")} "${displayName}" ${t("contacts.deleteConfirmSuffix")}`)) return;

    setDeletingId(id);
    try {
      await ContactService.deleteContact(id);
      setContacts(prev => prev.filter(c => c.id !== id));
      showToast("success", `${t("contacts.deleteSuccess")} "${displayName}" ${t("contacts.deleteSuccessSuffix")}`);
    } catch (err) {
      console.error("Lỗi xóa contact:", err);
      showToast("error", t("contacts.deleteError"));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto space-y-8 pb-20 relative">

        {/* TOAST NOTIFICATION */}
        {toast && (
          <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-lg border-2 font-bold text-base flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 ${toast.type === 'success'
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
            : 'bg-red-50 text-red-800 border-red-200'
            }`}>
            {toast.type === 'success'
              ? <CheckCircle2 className="w-5 h-5" />
              : <AlertCircle className="w-5 h-5" />}
            {toast.text}
          </div>
        )}

        {/* HEADER BANNER */}
        <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <Users className="w-32 h-32 text-emerald-800" aria-hidden="true" />
          </div>

          <div className="relative z-10 space-y-2">
            <h1 className="text-2xl md:text-3xl font-extrabold text-emerald-900 tracking-tight">
              {t("contacts.headerTitle")}
            </h1>
            <p className="text-emerald-800 text-lg font-medium">
              {t("contacts.headerSubtitle")}
            </p>
          </div>

          <Link
            href="/contacts/add"
            className="relative z-10 flex items-center justify-center gap-3 min-h-[56px] px-8 py-3 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl shadow-md transition-all font-bold text-xl shrink-0"
          >
            <UserPlus className="w-6 h-6" aria-hidden="true" />
            <span>{t("contacts.addButton")}</span>
          </Link>
        </div>

        {/* ERROR STATE */}
        {error && (
          <div className="flex items-center gap-3 bg-red-50 text-red-700 p-6 rounded-2xl shadow-sm border-2 border-red-200">
            <AlertCircle className="w-8 h-8 flex-shrink-0" aria-hidden="true" />
            <p className="text-lg font-bold">{error}</p>
          </div>
        )}

        {/* LOADING & DATA GRID */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-emerald-700">
            <Loader2 className="w-12 h-12 animate-spin" aria-hidden="true" />
            <p className="text-xl font-bold">{t("contacts.loading")}</p>
          </div>
        ) : !error && (
          <section className="space-y-6" aria-label={t("contacts.headerTitle")}>
            {contacts.length === 0 ? (
              <div className="text-center p-12 bg-white rounded-3xl shadow-sm border border-gray-200">
                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="w-10 h-10 text-emerald-700" aria-hidden="true" />
                </div>
                <p className="text-xl text-gray-800 font-bold mb-3">{t("contacts.emptyTitle")}</p>
                <p className="text-lg text-gray-600 mb-8 font-medium">{t("contacts.emptySubtitle")}</p>
                <Link
                  href="/contacts/add"
                  className="inline-flex items-center gap-2 text-xl font-bold text-emerald-800 hover:text-emerald-900 underline"
                >
                  {t("contacts.addFirstLink")}
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {contacts.map(contact => {
                  const displayName = contact.preferenceName || contact.fullname;

                  return (
                    <article key={contact.id} className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6 flex flex-col gap-4 hover:shadow-md transition-shadow">
                      {/* Thông chính */}
                      <div className="flex flex-col gap-1 border-b border-gray-100 pb-4">
                        <h2 className="text-2xl font-bold text-gray-900 truncate" title={displayName}>
                          {displayName}
                        </h2>
                        {contact.name && (
                          <span className="inline-flex items-center gap-2 text-lg text-emerald-800 font-bold bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-xl w-fit mt-2 shadow-sm">
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
                      <div className="flex flex-col gap-3 py-2 text-lg text-gray-700 font-medium">
                        {contact.phoneNumber ? (
                          <div className="flex items-center gap-3">
                            <Phone className="w-6 h-6 text-gray-400" aria-hidden="true" />
                            <span>{contact.phoneNumber}</span>
                          </div>
                        ) : null}

                        {(!contact.phoneNumber) && (
                          <p className="italic text-gray-500">{t("contacts.noContactInfo")}</p>
                        )}
                      </div>

                      {/* Nút hành động */}
                      <div className="grid grid-cols-2 gap-4 pt-4 mt-auto border-t border-gray-100">
                        <Link
                          href={`/contacts/${contact.id}/edit`}
                          className="flex items-center justify-center gap-2 min-h-[48px] bg-slate-50 hover:bg-emerald-50 text-gray-800 hover:text-emerald-800 text-lg font-bold rounded-xl transition-colors border border-gray-200 hover:border-emerald-200 shadow-sm"
                        >
                          <Edit className="w-5 h-5" aria-hidden="true" />
                          {t("contacts.editButton")}
                        </Link>
                        <button
                          onClick={() => handleDelete(contact.id, displayName)}
                          disabled={deletingId === contact.id}
                          className="flex items-center justify-center gap-2 min-h-[48px] bg-red-50 hover:bg-red-100 text-red-700 hover:text-red-800 text-lg font-bold rounded-xl transition-colors border border-red-100 hover:border-red-200 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {deletingId === contact.id
                            ? <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                            : <Trash2 className="w-5 h-5" aria-hidden="true" />}
                          {deletingId === contact.id ? t("contacts.deleteButton") + "..." : t("contacts.deleteButton")}
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
    </MainLayout>
  );
}