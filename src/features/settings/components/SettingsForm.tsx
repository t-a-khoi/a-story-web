"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    User, Bell, Shield, LogOut, CheckCircle2, Moon,
    Globe, Smartphone, Save, Loader2, BookOpen, AlertCircle
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useTranslation, useLanguageStore } from "@/store/useLanguageStore";
import { authService } from "@/services/auth.service";
import { useMySettings, useSaveSettings } from "@/hooks/queries/useSettings";

type TabType = "general" | "profile" | "story";

export default function SettingsForm() {
    const router = useRouter();
    const { t } = useTranslation();
    const currentLang = useLanguageStore((state) => state.language);
    const setGlobalLanguage = useLanguageStore((state) => state.setLanguage);

    const authUser = useAuthStore((state) => state.user);
    const authProfile = useAuthStore((state) => state.profile);

    const { data: remoteSettings, isLoading } = useMySettings();
    const { mutate: saveSettings, isPending: isSaving } = useSaveSettings();

    const [toastMsg, setToastMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [activeTab, setActiveTab] = useState<TabType>("general");

    const [settingsData, setSettingsData] = useState({
        general: { theme: "light", language: "vi", notifications: true },
        profile: { contactsOnlyView: true, contactsOnlyMessage: true },
        story: { autoplay: false, defaultPrivacy: "CONTACTS" },
        mediaFile: { compressImage: true }
    });

    useEffect(() => {
        if (remoteSettings) {
            setSettingsData(prev => ({
                general: { ...prev.general, ...remoteSettings.general },
                profile: { ...prev.profile, ...remoteSettings.profile },
                story: { ...prev.story, ...remoteSettings.story },
                mediaFile: { ...prev.mediaFile, ...remoteSettings.mediaFile },
            }));
        }
    }, [remoteSettings]);

    useEffect(() => {
        setSettingsData(prev => ({
            ...prev,
            general: { ...prev.general, language: currentLang }
        }));
    }, [currentLang]);

    const handleSave = () => {
        if (!authUser?.id) {
            showToast("error", t("settings.loading.error"));
            return;
        }

        saveSettings({
            settingId: remoteSettings?.id || null,
            payload: {
                userId: authUser.id,
                general: settingsData.general,
                profile: settingsData.profile,
                story: settingsData.story,
                mediaFile: settingsData.mediaFile,
            }
        }, {
            onSuccess: () => showToast("success", t("settings.buttons.savedSuccess")),
            onError: () => showToast("error", t("settings.buttons.savedError")),
        });
    };

    const showToast = (type: 'success' | 'error', text: string) => {
        setToastMsg({ type, text });
        setTimeout(() => setToastMsg(null), 3000);
    };

    const handleLogout = () => {
        if (window.confirm(t("settings.logout.confirm"))) {
            authService.logout();
        }
    };

    const updateSetting = (section: TabType, key: string, value: any) => {
        if (section === "general" && key === "language") setGlobalLanguage(value as any);
        setSettingsData(prev => ({ ...prev, [section]: { ...prev[section], [key]: value } }));
    };

    const userName = authProfile?.fullname || authUser?.fullName || authUser?.username || "—";

    return (
        <div className="max-w-3xl mx-auto space-y-8 pb-20 relative">
            {toastMsg && (
                <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-lg border-2 font-bold text-base flex items-center gap-3 animate-in fade-in slide-in-from-top-4 ${toastMsg.type === 'success' ? 'bg-navy-50 text-navy-800 border-navy-200' : 'bg-red-50 text-red-800 border-red-200'}`}>
                    {toastMsg.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    {toastMsg.text}
                </div>
            )}

            {/* HEADER BANNER */}
            <div className="bg-navy-50 border border-navy-100 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                    <Globe className="w-32 h-32 text-navy-800" />
                </div>
                <div className="relative z-10 space-y-2">
                    <h1 className="text-2xl md:text-3xl font-extrabold text-navy-900 tracking-tight">{t("settings.header.title")}</h1>
                    <p className="text-navy-800 text-base md:text-lg font-medium">{t("settings.header.subtitle")}</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving || isLoading}
                    className="relative z-10 flex items-center justify-center gap-2 min-h-[56px] px-8 py-3 bg-white hover:bg-navy-50 text-navy-700 border-2 border-navy-500 rounded-xl shadow-sm transition-all font-bold text-lg shrink-0 disabled:opacity-50"
                >
                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    {isSaving ? t("settings.buttons.saving") : t("settings.buttons.save")}
                </button>
            </div>

            {/* QUICK LINK TO PROFILE */}
            <section className="bg-pearl-50 rounded-2xl shadow-sm border border-pearl-200 overflow-hidden">
                <div className="bg-navy-50/50 px-5 py-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-navy-100 rounded-full flex items-center justify-center shrink-0">
                            <User className="w-5 h-5 text-navy-700" />
                        </div>
                        <div>
                            {isLoading ? (
                                <div className="h-5 w-36 bg-pearl-200 animate-pulse rounded-md" />
                            ) : (
                                <h2 className="text-lg font-bold text-charcoal-900">{userName}</h2>
                            )}
                            <p className="text-sm text-charcoal-500 font-medium">{t("settings.profileBanner.subtitle")}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => router.push('/profile')}
                        className="bg-white hover:bg-navy-50 text-navy-800 border-2 border-navy-200 px-5 py-2 rounded-xl text-base font-bold transition-all shadow-sm w-fit shrink-0 min-h-[48px]"
                    >
                        {t("settings.buttons.editProfile")}
                    </button>
                </div>
            </section>

            {/* SETTINGS TABS */}
            <div className="bg-white rounded-2xl shadow-sm border border-pearl-200 overflow-hidden">
                <div className="flex overflow-x-auto border-b border-pearl-200 bg-pearl-50 hide-scrollbar">
                    <button onClick={() => setActiveTab('general')} className={`flex items-center gap-2 px-5 py-3.5 font-bold text-base whitespace-nowrap transition-colors border-b-2 ${activeTab === 'general' ? 'border-navy-600 text-navy-800 bg-white' : 'border-transparent text-charcoal-500 hover:text-charcoal-700'}`}>
                        <Globe className="w-5 h-5" /> {t("settings.tabs.general")}
                    </button>
                    <button onClick={() => setActiveTab('profile')} className={`flex items-center gap-2 px-5 py-3.5 font-bold text-base whitespace-nowrap transition-colors border-b-2 ${activeTab === 'profile' ? 'border-navy-600 text-navy-800 bg-white' : 'border-transparent text-charcoal-500 hover:text-charcoal-700'}`}>
                        <Shield className="w-5 h-5" /> {t("settings.tabs.profilePrivacy")}
                    </button>
                    <button onClick={() => setActiveTab('story')} className={`flex items-center gap-2 px-5 py-3.5 font-bold text-base whitespace-nowrap transition-colors border-b-2 ${activeTab === 'story' ? 'border-navy-600 text-navy-800 bg-white' : 'border-transparent text-charcoal-500 hover:text-charcoal-700'}`}>
                        <BookOpen className="w-5 h-5" /> {t("settings.tabs.story")}
                    </button>
                </div>

                <div className="p-5 md:p-6 min-h-[400px]">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-full py-20 text-navy-800 gap-3">
                            <Loader2 className="w-8 h-8 animate-spin" />
                            <p className="font-bold text-lg">{t("settings.loading.config")}</p>
                        </div>
                    ) : (
                        <div className="space-y-5 animate-in fade-in zoom-in-95 duration-200">
                            {/* TAB: GENERAL */}
                            {activeTab === 'general' && (
                                <>
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-pearl-50 rounded-xl border border-pearl-200">
                                        <div>
                                            <p className="text-lg font-bold text-charcoal-900 flex items-center gap-2"><Moon className="w-5 h-5 text-indigo-500" /> {t("settings.general.theme.title")}</p>
                                            <p className="text-sm text-charcoal-500 font-medium pt-1">{t("settings.general.theme.subtitle")}</p>
                                        </div>
                                        <select value={settingsData.general.theme} onChange={(e) => updateSetting("general", "theme", e.target.value)} className="min-h-[48px] px-3 py-2 border-2 border-pearl-300 rounded-lg text-base font-bold text-charcoal-900 focus:ring-navy-200 focus:border-navy-500 outline-none w-full sm:w-auto bg-white">
                                            <option value="light">{t("settings.general.theme.light")}</option>
                                            <option value="dark">{t("settings.general.theme.dark")}</option>
                                            <option value="system">{t("settings.general.theme.system")}</option>
                                        </select>
                                    </div>
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-pearl-50 rounded-xl border border-pearl-200">
                                        <div>
                                            <p className="text-lg font-bold text-charcoal-900 flex items-center gap-2"><Globe className="w-5 h-5 text-blue-500" /> {t("settings.general.language.title")}</p>
                                            <p className="text-sm text-charcoal-500 font-medium pt-1">{t("settings.general.language.subtitle")}</p>
                                        </div>
                                        <select value={settingsData.general.language} onChange={(e) => updateSetting("general", "language", e.target.value)} className="min-h-[48px] px-3 py-2 border-2 border-pearl-300 rounded-lg text-base font-bold text-charcoal-900 focus:ring-navy-200 focus:border-navy-500 outline-none w-full sm:w-auto bg-white">
                                            <option value="vi">{t("settings.general.language.vi")}</option>
                                            <option value="en">{t("settings.general.language.en")}</option>
                                        </select>
                                    </div>
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-pearl-50 rounded-xl border border-pearl-200">
                                        <div className="pr-4">
                                            <p className="text-lg font-bold text-charcoal-900 flex items-center gap-2"><Bell className="w-5 h-5 text-amber-500" /> {t("settings.general.notifications.title")}</p>
                                            <p className="text-sm text-charcoal-500 font-medium pt-1">{t("settings.general.notifications.subtitle")}</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer shrink-0">
                                            <input type="checkbox" checked={settingsData.general.notifications} onChange={(e) => updateSetting("general", "notifications", e.target.checked)} className="sr-only peer" />
                                            <div className="w-14 h-7 bg-pearl-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[4px] after:bg-white after:border-pearl-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-navy-600"></div>
                                        </label>
                                    </div>
                                </>
                            )}
                            {/* TAB: PROFILE PRIVACY */}
                            {activeTab === 'profile' && (
                                <>
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-pearl-50 rounded-xl border border-pearl-200">
                                        <div className="pr-4">
                                            <p className="text-lg font-bold text-charcoal-900 flex items-center gap-2"><Shield className="w-5 h-5 text-navy-600" /> {t("settings.profilePrivacy.contactsOnlyView.title")}</p>
                                            <p className="text-sm text-charcoal-500 font-medium pt-1">{t("settings.profilePrivacy.contactsOnlyView.subtitle")}</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer shrink-0">
                                            <input type="checkbox" checked={settingsData.profile.contactsOnlyView} onChange={(e) => updateSetting("profile", "contactsOnlyView", e.target.checked)} className="sr-only peer" />
                                            <div className="w-14 h-7 bg-pearl-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[4px] after:bg-white after:border-pearl-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-navy-600"></div>
                                        </label>
                                    </div>
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-pearl-50 rounded-xl border border-pearl-200">
                                        <div className="pr-4">
                                            <p className="text-lg font-bold text-charcoal-900 flex items-center gap-2"><Globe className="w-5 h-5 text-charcoal-400" /> {t("settings.profilePrivacy.contactsOnlyMessage.title")}</p>
                                            <p className="text-sm text-charcoal-500 font-medium pt-1">{t("settings.profilePrivacy.contactsOnlyMessage.subtitle")}</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer shrink-0">
                                            <input type="checkbox" checked={settingsData.profile.contactsOnlyMessage} onChange={(e) => updateSetting("profile", "contactsOnlyMessage", e.target.checked)} className="sr-only peer" />
                                            <div className="w-14 h-7 bg-pearl-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[4px] after:bg-white after:border-pearl-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-navy-600"></div>
                                        </label>
                                    </div>
                                </>
                            )}
                            {/* TAB: STORY */}
                            {activeTab === 'story' && (
                                <>
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-pearl-50 rounded-xl border border-pearl-200">
                                        <div>
                                            <p className="text-lg font-bold text-charcoal-900 flex items-center gap-2"><Shield className="w-5 h-5 text-indigo-500" /> {t("settings.story.defaultPrivacy.title")}</p>
                                            <p className="text-sm text-charcoal-500 font-medium pt-1">{t("settings.story.defaultPrivacy.subtitle")}</p>
                                        </div>
                                        <select value={settingsData.story.defaultPrivacy} onChange={(e) => updateSetting("story", "defaultPrivacy", e.target.value)} className="min-h-[48px] px-3 py-2 border-2 border-pearl-300 rounded-lg text-base font-bold text-charcoal-900 focus:ring-navy-200 focus:border-navy-500 outline-none w-full sm:w-auto bg-white">
                                            <option value="CONTACTS">{t("settings.story.defaultPrivacy.contacts")}</option>
                                            <option value="PRIVATE">{t("settings.story.defaultPrivacy.private")}</option>
                                        </select>
                                    </div>
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-pearl-50 rounded-xl border border-pearl-200">
                                        <div className="pr-4">
                                            <p className="text-lg font-bold text-charcoal-900 flex items-center gap-2"><Smartphone className="w-5 h-5 text-charcoal-500" /> {t("settings.story.autoplay.title")}</p>
                                            <p className="text-sm text-charcoal-500 font-medium pt-1">{t("settings.story.autoplay.subtitle")}</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer shrink-0">
                                            <input type="checkbox" checked={settingsData.story.autoplay} onChange={(e) => updateSetting("story", "autoplay", e.target.checked)} className="sr-only peer" />
                                            <div className="w-14 h-7 bg-pearl-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[4px] after:bg-white after:border-pearl-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-navy-600"></div>
                                        </label>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* LOGOUT */}
            <section className="bg-red-50 border border-red-200 rounded-2xl p-5 md:p-6 flex flex-col md:flex-row items-center justify-between gap-5 shadow-sm">
                <div>
                    <h3 className="text-xl font-bold text-red-800 mb-1 whitespace-nowrap">{t("settings.logout.title")}</h3>
                    <p className="text-red-700 font-medium text-sm">{t("settings.logout.subtitle")}</p>
                </div>
                <button onClick={handleLogout} className="flex items-center justify-center gap-2 px-6 py-2 w-full sm:w-auto min-h-[56px] bg-white hover:bg-red-100 text-red-700 border-2 border-red-200 hover:border-red-300 font-bold rounded-xl transition-colors shadow-sm text-lg whitespace-nowrap">
                    <LogOut className="w-5 h-5" />
                    {t("settings.buttons.logout")}
                </button>
            </section>
        </div>
    );
}
