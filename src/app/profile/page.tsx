// src/app/profile/page.tsx
"use client";

import { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { User, Phone, MapPin, Calendar, CheckCircle2, UserCircle, Edit3, Loader2, HeartCrack, Activity, Save, ArrowLeft } from "lucide-react";
import { ProfileService } from "@/services/profile.service";
import { ProfilesCreateRequest, ProfilesUpdateRequest } from "@/types/profile";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { useTranslation } from "@/store/useLanguageStore";

export default function ProfilePage() {
    const router = useRouter();
    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [toastMsg, setToastMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [isEditing, setIsEditing] = useState(false);

    const [profileId, setProfileId] = useState<number | null>(null);

    const [formData, setFormData] = useState({
        fullname: "",
        gender: "MALE" as "MALE" | "FEMALE" | "OTHER",
        dateOfBirth: "",
        phoneNumber: "",
        address: "",
        isDeceased: false,
        memorialMessage: "",
    });

    useEffect(() => {
        fetchInitialProfile();
    }, []);

    const fetchInitialProfile = async () => {
        const { accessToken } = useAuthStore.getState();
        if (!accessToken) return;

        try {
            const profile = await ProfileService.getMyProfile();

            if (profile) {
                setProfileId(profile.id);
                setFormData({
                    fullname: profile.fullname || "",
                    gender: profile.gender || "MALE",
                    dateOfBirth: profile.dateOfBirth ? profile.dateOfBirth.split('T')[0] : "",
                    phoneNumber: profile.phoneNumber || "",
                    address: profile.address || "",
                    isDeceased: profile.isDeceased || false,
                    memorialMessage: profile.memorialMessage || "",
                });
            }
        } catch (error: any) {
            if (error.response?.status === 404) {
                setIsEditing(true);
            } else {
                console.error("Lỗi tải profile:", error);
                showToast("error", t("profile.loadError"));
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const showToast = (type: 'success' | 'error', text: string) => {
        setToastMsg({ type, text });
        setTimeout(() => setToastMsg(null), 3500);
    };

    const handleSave = async () => {
        if (!formData.fullname.trim()) {
            showToast("error", t("profile.nameRequired"));
            return;
        }

        setIsSaving(true);
        try {
            let isoDateOfBirth = undefined;
            if (formData.dateOfBirth) {
                isoDateOfBirth = `${formData.dateOfBirth}T00:00:00Z`;
            }

            if (profileId) {
                const payload: ProfilesUpdateRequest = {
                    fullname: formData.fullname.trim(),
                    gender: formData.gender,
                    dateOfBirth: isoDateOfBirth,
                    phoneNumber: formData.phoneNumber.trim() || undefined,
                    address: formData.address.trim() || undefined,
                    isDeceased: formData.isDeceased,
                    memorialMessage: formData.isDeceased ? formData.memorialMessage.trim() : undefined,
                };
                await ProfileService.updateProfile(profileId, payload);
                showToast("success", t("profile.saveSuccess"));
            } else {
                const user = useAuthStore.getState().user;
                const payload: ProfilesCreateRequest = {
                    userId: user?.id || 0,
                    fullname: formData.fullname.trim(),
                    gender: formData.gender,
                    dateOfBirth: isoDateOfBirth,
                    phoneNumber: formData.phoneNumber.trim() || undefined,
                    address: formData.address.trim() || undefined,
                    isDeceased: formData.isDeceased,
                    memorialMessage: formData.isDeceased ? formData.memorialMessage.trim() : undefined,
                };
                const newProfile = await ProfileService.createProfile(payload);
                setProfileId(newProfile.id);
                showToast("success", t("profile.createSuccess"));
            }

            setIsEditing(false);
        } catch (error) {
            console.error(error);
            showToast("error", t("profile.serverError"));
        } finally {
            setIsSaving(false);
        }
    };

    const bgHeader = formData.isDeceased ? "bg-stone-50 border-stone-200" : "bg-emerald-50 border-emerald-100";
    const textIcon = formData.isDeceased ? "text-stone-800" : "text-emerald-800";
    const inputClass = formData.isDeceased
        ? "border-stone-300 hover:border-stone-400 focus:border-stone-600 focus:ring-stone-100"
        : "border-gray-300 hover:border-emerald-300 focus:border-emerald-500 focus:ring-emerald-100";
    const btnClass = formData.isDeceased
        ? (isEditing || isSaving ? "bg-stone-800 hover:bg-stone-900 text-white shadow-md border-transparent" : "bg-white text-stone-800 border-stone-200 hover:bg-stone-50")
        : (isEditing || isSaving ? "bg-emerald-800 hover:bg-emerald-900 text-white shadow-md border-transparent" : "bg-white text-emerald-800 border-emerald-200 hover:bg-emerald-50");

    return (
        <MainLayout>
            <div className="max-w-3xl mx-auto space-y-8 pb-20 relative">

                {toastMsg && (
                    <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-lg border-2 font-bold text-base flex items-center gap-3 animate-in fade-in slide-in-from-top-4 ${toastMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-800 border-red-200'}`}>
                        {toastMsg.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <Loader2 className="w-5 h-5 animate-spin" />}
                        {toastMsg.text}
                    </div>
                )}

                {/* HEADER BANNER */}
                <div className={`${bgHeader} border rounded-2xl p-6 md:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden transition-colors duration-500`}>
                    <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                        {formData.isDeceased ? (
                            <HeartCrack className={`w-32 h-32 ${textIcon}`} aria-hidden="true" />
                        ) : (
                            <UserCircle className={`w-32 h-32 ${textIcon}`} aria-hidden="true" />
                        )}
                    </div>

                    <div className="relative z-10 space-y-2">
                        <button
                            onClick={() => router.push("/settings")}
                            className={`flex items-center gap-1.5 font-bold text-base w-fit transition-colors px-3 py-1.5 rounded-lg border border-transparent hover:border-gray-200 hover:bg-white/50 ${textIcon}`}
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span>{t("profile.backToSettings")}</span>
                        </button>
                        <h1 className="text-xl md:text-2xl font-extrabold text-gray-900 tracking-tight">
                            {profileId ? t("profile.headerTitle") : t("profile.createTitle")}
                        </h1>
                        <p className="text-gray-600 text-base md:text-lg font-medium">
                            {t("profile.headerSubtitle")}
                        </p>
                    </div>

                    <button
                        onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                        disabled={isSaving}
                        className={`relative z-10 flex items-center justify-center gap-2 min-h-[48px] px-6 py-2 rounded-xl border transition-all font-bold text-lg shrink-0 ${btnClass}`}
                    >
                        {isSaving ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : isEditing ? (
                            <><Save className="w-5 h-5" /> {t("profile.saveButton")}</>
                        ) : (
                            <><Edit3 className="w-5 h-5" /> {t("profile.editButton")}</>
                        )}
                    </button>
                </div>

                {isLoading ? (
                    <div className={`flex flex-col items-center justify-center py-20 gap-4 ${textIcon}`}>
                        <Loader2 className="w-10 h-10 animate-spin" aria-hidden="true" />
                        <p className="text-lg font-bold">{t("profile.loading")}</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className={`bg-gray-50 px-6 py-6 border-b border-gray-200 flex flex-col md:flex-row items-center md:items-start gap-5`}>
                            <div className={`w-20 h-20 ${formData.isDeceased ? 'bg-stone-200' : 'bg-emerald-100'} border-4 border-white shadow-sm rounded-full flex items-center justify-center shrink-0`}>
                                <User className={`w-10 h-10 ${textIcon}`} />
                            </div>
                            <div className="text-center md:text-left w-full space-y-1.5 pt-1">
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="fullname"
                                        value={formData.fullname}
                                        onChange={handleInputChange}
                                        className={`text-xl font-extrabold text-gray-900 bg-white border rounded-lg px-4 py-2 w-full focus:ring-2 outline-none ${inputClass}`}
                                        placeholder={t("profile.namePlaceholder")}
                                    />
                                ) : (
                                    <h2 className="text-xl font-extrabold text-gray-900">{formData.fullname || t("profile.noName")}</h2>
                                )}
                                <div className="flex items-center justify-center md:justify-start gap-2 pt-1.5">
                                    <span className="text-base text-gray-500 font-bold">{t("profile.statusLabel")}</span>
                                    {isEditing ? (
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" name="isDeceased" checked={formData.isDeceased} onChange={handleInputChange} className="sr-only peer" />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-stone-600"></div>
                                            <span className="ms-3 text-base font-bold text-gray-700">{formData.isDeceased ? t("profile.statusDeceased") : t("profile.statusAlive")}</span>
                                        </label>
                                    ) : (
                                        <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-bold shadow-sm border ${formData.isDeceased ? "bg-stone-100 text-stone-700 border-stone-200" : "bg-emerald-50 text-emerald-700 border-emerald-100"}`}>
                                            {formData.isDeceased ? <HeartCrack className="w-3.5 h-3.5" /> : <Activity className="w-3.5 h-3.5" />}
                                            {formData.isDeceased ? t("profile.statusDeceased") : t("profile.statusAlive")}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Form Body */}
                        <div className="p-6 space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-base font-bold text-gray-700">
                                        <UserCircle className="w-4 h-4 text-gray-400" /> {t("profile.genderLabel")}
                                    </label>
                                    {isEditing ? (
                                        <select
                                            name="gender"
                                            value={formData.gender}
                                            onChange={handleInputChange}
                                            className={`w-full text-base text-gray-900 font-medium border rounded-lg px-3 py-2.5 min-h-[48px] focus:ring-2 outline-none ${inputClass}`}
                                        >
                                            <option value="MALE">{t("profile.genderMale")}</option>
                                            <option value="FEMALE">{t("profile.genderFemale")}</option>
                                            <option value="OTHER">{t("profile.genderOther")}</option>
                                        </select>
                                    ) : (
                                        <div className="w-full text-base text-gray-900 font-bold bg-gray-50 rounded-lg px-3 py-2.5 border border-gray-100 min-h-[48px] flex items-center">
                                            {formData.gender === "MALE" ? t("profile.genderMale") : formData.gender === "FEMALE" ? t("profile.genderFemale") : t("profile.genderOther")}
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-base font-bold text-gray-700">
                                        <Calendar className="w-4 h-4 text-gray-400" /> {t("profile.dobLabel")}
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="date"
                                            name="dateOfBirth"
                                            value={formData.dateOfBirth}
                                            onChange={handleInputChange}
                                            className={`w-full text-base text-gray-900 font-medium border rounded-lg px-3 py-2.5 min-h-[48px] focus:ring-2 outline-none ${inputClass}`}
                                        />
                                    ) : (
                                        <div className="w-full text-base text-gray-900 font-bold bg-gray-50 rounded-lg px-3 py-2.5 border border-gray-100 min-h-[48px] flex items-center">
                                            {formData.dateOfBirth ? new Date(formData.dateOfBirth).toLocaleDateString('vi-VN') : t("profile.notUpdated") ?? t("common.notUpdated")}
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-base font-bold text-gray-700">
                                        <Phone className="w-4 h-4 text-gray-400" /> {t("profile.phoneLabel")}
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="tel"
                                            name="phoneNumber"
                                            value={formData.phoneNumber}
                                            onChange={handleInputChange}
                                            className={`w-full text-base text-gray-900 font-medium border rounded-lg px-3 py-2.5 min-h-[48px] focus:ring-2 outline-none ${inputClass}`}
                                            placeholder={t("profile.phonePlaceholder")}
                                        />
                                    ) : (
                                        <div className="w-full text-base text-gray-900 font-bold bg-gray-50 rounded-lg px-3 py-2.5 border border-gray-100 min-h-[48px] flex items-center truncate">
                                            {formData.phoneNumber || t("common.notUpdated")}
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-base font-bold text-gray-700">
                                        <MapPin className="w-4 h-4 text-gray-400" /> {t("profile.addressLabel")}
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name="address"
                                            value={formData.address}
                                            onChange={handleInputChange}
                                            className={`w-full text-base text-gray-900 font-medium border rounded-lg px-3 py-2.5 min-h-[48px] focus:ring-2 outline-none ${inputClass}`}
                                            placeholder={t("profile.addressPlaceholder")}
                                        />
                                    ) : (
                                        <div className="w-full text-base text-gray-900 font-bold bg-gray-50 rounded-lg px-3 py-2.5 border border-gray-100 min-h-[48px] flex items-center truncate">
                                            {formData.address || t("common.notUpdated")}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Section Người đã qua đời */}
                            {formData.isDeceased && (
                                <div className="space-y-3 pt-6 border-t border-gray-100 animate-in fade-in slide-in-from-bottom-2">
                                    <label className="flex items-center gap-2 text-lg font-extrabold text-stone-800">
                                        <HeartCrack className="w-5 h-5 text-stone-500" /> {t("profile.memorialTitle")}
                                    </label>
                                    <p className="text-stone-500 text-sm font-medium pb-2">{t("profile.memorialSubtitle")}</p>
                                    {isEditing ? (
                                        <textarea
                                            name="memorialMessage"
                                            value={formData.memorialMessage}
                                            onChange={handleInputChange}
                                            className="w-full text-base text-stone-900 font-medium border border-stone-300 focus:border-stone-500 rounded-lg px-4 py-3 min-h-[120px] focus:ring-2 focus:ring-stone-100 outline-none resize-none"
                                            placeholder={t("profile.memorialPlaceholder")}
                                        />
                                    ) : (
                                        <div className="w-full text-base font-serif italic text-stone-800 bg-stone-50 rounded-lg px-5 py-4 border-l-4 border-stone-400 min-h-[100px] leading-relaxed relative">
                                            <span className="text-2xl text-stone-300 absolute top-1 left-2">"</span>
                                            <span className="relative z-10">{formData.memorialMessage || t("profile.noMemorial")}</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </MainLayout>
    );
}
