"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";
import { 
    User, Bell, Shield, LogOut, CheckCircle2, Moon, 
    Globe, Smartphone, Save, Loader2, BookOpen, AlertCircle
} from "lucide-react";
import { SettingsService } from "@/services/settings.service";

// Define a local type for typed key access
type TabType = "general" | "profile" | "story";

export default function SettingsPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [toastMsg, setToastMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [activeTab, setActiveTab] = useState<TabType>("general");
    
    // Lưu ID của setting bản ghi nếu đã tồn tại trên server
    const [settingId, setSettingId] = useState<number | null>(null);

    // Trạng thái cục bộ (UI Flexible State mapping to backend's Record<string,any>)
    const [settingsData, setSettingsData] = useState({
        general: {
            theme: "light",
            language: "vi",
            notifications: true,
        },
        profile: {
            contactsOnlyView: true,
            contactsOnlyMessage: true,
        },
        story: {
            autoplay: false,
            defaultPrivacy: "CONTACTS",
        },
        mediaFile: {
            compressImage: true,
        }
    });

    const userName = "Nguyễn Văn Khoa"; // Mocked User Name

    useEffect(() => {
        fetchInitialSettings();
    }, []);

    const fetchInitialSettings = async () => {
        try {
            // Dùng search filter userId (giả lập userId = 1 hiện tại)
            const res = await SettingsService.searchSettings({
                filter: { "userId": 1 },
                size: 1
            });

            if (res.content && res.content.length > 0) {
                const config = res.content[0];
                setSettingId(config.id);

                // Gộp Object mềm mại để tránh mất schema mặc định ở Frontend nếu Backend trả thiếu
                setSettingsData(prev => ({
                    general: { ...prev.general, ...(config.general || {}) },
                    profile: { ...prev.profile, ...(config.profile || {}) },
                    story: { ...prev.story, ...(config.story || {}) },
                    mediaFile: { ...prev.mediaFile, ...(config.mediaFile || {}) },
                }));
            }
        } catch (error) {
            console.error("Lỗi khi tải cấu hình:", error);
            showToast("error", "Không thể tải cấu hình từ máy chủ.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const payload = {
                userId: 1, // Fixme: Lấy từ Context
                general: settingsData.general,
                profile: settingsData.profile,
                story: settingsData.story,
                mediaFile: settingsData.mediaFile,
            };

            if (settingId) {
                // Đã có id -> Gọi PUT
                await SettingsService.updateSettings(settingId, payload);
            } else {
                // Chưa có id -> Gọi POST tạo mới
                const newSetting = await SettingsService.createSettings(payload);
                setSettingId(newSetting.id);
            }
            showToast("success", "Đã lưu cài đặt thành công!");
        } catch (error) {
            showToast("error", "Lưu cài đặt thất bại. Vui lòng thử lại!");
        } finally {
            setIsSaving(false);
        }
    };

    const showToast = (type: 'success' | 'error', text: string) => {
        setToastMsg({ type, text });
        setTimeout(() => setToastMsg(null), 3000);
    };

    const handleLogout = () => {
        if (window.confirm("Bạn có chắc chắn muốn thoát khỏi tài khoản không?")) {
            localStorage.removeItem("accessToken");
            router.push("/");
        }
    };

    // Hàm update state tiện lợi cho form
    const updateSetting = (section: TabType, key: string, value: any) => {
        setSettingsData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [key]: value
            }
        }));
    };

    return (
        <MainLayout>
            <div className="max-w-3xl mx-auto space-y-8 pb-20 relative">

                {/* TOAST MESSAGE */}
                {toastMsg && (
                    <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-2xl shadow-lg border-2 font-bold text-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-4 ${
                        toastMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-800 border-red-200'
                    }`}>
                        {toastMsg.type === 'success' ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                        {toastMsg.text}
                    </div>
                )}

                {/* HEADER BANNER CÀI ĐẶT */}
                <div className="bg-slate-800 border-2 border-slate-700 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                        <Globe className="w-32 h-32 text-slate-100" />
                    </div>

                    <div className="relative z-10 space-y-2">
                        <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                            Cấu hình hệ thống
                        </h1>
                        <p className="text-slate-300 text-lg md:text-xl font-medium">
                            Quản lý giao diện, quyền riêng tư và thói quen của bạn.
                        </p>
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={isSaving || isLoading}
                        className="relative z-10 flex items-center justify-center gap-3 min-h-[56px] px-8 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-900 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all font-extrabold text-xl shrink-0 disabled:opacity-50"
                    >
                        {isSaving ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
                        Lưu cài đặt
                    </button>
                </div>

                {/* 1. KHỐI LIÊN KẾT NHANH ĐẾN HỒ SƠ */}
                <section className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="bg-emerald-50/50 px-6 py-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                                <User className="w-6 h-6 text-emerald-700" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">{userName}</h2>
                                <p className="text-gray-500 font-medium">Thông tin cá nhân & Liên hệ</p>
                            </div>
                        </div>
                        <button
                            onClick={() => router.push('/profile')}
                            className="bg-white hover:bg-emerald-50 text-emerald-800 border-2 border-emerald-200 px-6 py-2.5 rounded-xl font-bold transition-all shadow-sm w-fit truncate shrink-0"
                        >
                            Chỉnh sửa hồ sơ
                        </button>
                    </div>
                </section>

                {/* HỆ THỐNG TABS CHO SETTINGS */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
                    {/* Tabs Header */}
                    <div className="flex overflow-x-auto border-b border-gray-200 bg-gray-50 hide-scrollbar">
                        <button 
                            onClick={() => setActiveTab('general')}
                            className={`flex items-center gap-2 px-6 py-4 font-bold text-lg whitespace-nowrap transition-colors border-b-2 ${
                                activeTab === 'general' ? 'border-emerald-600 text-emerald-800 bg-white' : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            <Globe className="w-5 h-5" /> Cài đặt chung
                        </button>
                        <button 
                            onClick={() => setActiveTab('profile')}
                            className={`flex items-center gap-2 px-6 py-4 font-bold text-lg whitespace-nowrap transition-colors border-b-2 ${
                                activeTab === 'profile' ? 'border-emerald-600 text-emerald-800 bg-white' : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            <Shield className="w-5 h-5" /> Quyền riêng tư
                        </button>
                        <button 
                            onClick={() => setActiveTab('story')}
                            className={`flex items-center gap-2 px-6 py-4 font-bold text-lg whitespace-nowrap transition-colors border-b-2 ${
                                activeTab === 'story' ? 'border-emerald-600 text-emerald-800 bg-white' : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            <BookOpen className="w-5 h-5" /> Câu chuyện
                        </button>
                    </div>

                    {/* Tabs Body */}
                    <div className="p-6 md:p-8 min-h-[400px]">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center h-full py-20 text-emerald-800 gap-4">
                                <Loader2 className="w-10 h-10 animate-spin" />
                                <p className="font-bold text-xl">Đang tải cấu hình...</p>
                            </div>
                        ) : (
                            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
                                
                                {/* TAB: CÀI ĐẶT CHUNG */}
                                {activeTab === 'general' && (
                                    <>
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-gray-50 rounded-2xl border border-gray-100">
                                            <div>
                                                <p className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                                    <Moon className="w-5 h-5 text-indigo-500" /> Giao diện hiển thị
                                                </p>
                                                <p className="text-gray-500 font-medium pt-1">Chọn chế độ Màn hình sáng hoặc Tối</p>
                                            </div>
                                            <select
                                                value={settingsData.general.theme}
                                                onChange={(e) => updateSetting("general", "theme", e.target.value)}
                                                className="min-h-[48px] px-4 py-2 border-2 border-gray-300 rounded-xl font-bold text-gray-800 focus:ring-emerald-200 focus:border-emerald-500 outline-none w-full sm:w-auto"
                                            >
                                                <option value="light">Sáng (Light Mode)</option>
                                                <option value="dark">Tối (Dark Mode)</option>
                                                <option value="system">Theo hệ thống</option>
                                            </select>
                                        </div>

                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-gray-50 rounded-2xl border border-gray-100">
                                            <div>
                                                <p className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                                    <Globe className="w-5 h-5 text-blue-500" /> Ngôn ngữ
                                                </p>
                                                <p className="text-gray-500 font-medium pt-1">Ngôn ngữ chính trên ứng dụng</p>
                                            </div>
                                            <select
                                                value={settingsData.general.language}
                                                onChange={(e) => updateSetting("general", "language", e.target.value)}
                                                className="min-h-[48px] px-4 py-2 border-2 border-gray-300 rounded-xl font-bold text-gray-800 focus:ring-emerald-200 focus:border-emerald-500 outline-none w-full sm:w-auto"
                                            >
                                                <option value="vi">Tiếng Việt</option>
                                                <option value="en">English (US)</option>
                                            </select>
                                        </div>

                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-gray-50 rounded-2xl border border-gray-100">
                                            <div className="pr-4">
                                                <p className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                                    <Bell className="w-5 h-5 text-amber-500" /> Thông báo đẩy
                                                </p>
                                                <p className="text-gray-500 font-medium pt-1">Nhận thông báo khi có bình luận hoặc tương tác mới</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer shrink-0">
                                                <input 
                                                    type="checkbox" 
                                                    checked={settingsData.general.notifications} 
                                                    onChange={(e) => updateSetting("general", "notifications", e.target.checked)}
                                                    className="sr-only peer" 
                                                />
                                                <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-600"></div>
                                            </label>
                                        </div>
                                    </>
                                )}

                                {/* TAB: QUYỀN RIÊNG TƯ PROFILE */}
                                {activeTab === 'profile' && (
                                    <>
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-gray-50 rounded-2xl border border-gray-100">
                                            <div className="pr-4">
                                                <p className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                                    <Shield className="w-5 h-5 text-emerald-600" /> Chỉ cho phép Danh bạ xem Hồ sơ
                                                </p>
                                                <p className="text-gray-500 font-medium pt-1">Hồ sơ cá nhân và mọi kỷ niệm của bạn sẽ được bảo vệ, chỉ những người bạn đã lưu số trong Danh bạ mới có quyền truy cập và xem.</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer shrink-0">
                                                <input 
                                                    type="checkbox" 
                                                    checked={settingsData.profile.contactsOnlyView} 
                                                    onChange={(e) => updateSetting("profile", "contactsOnlyView", e.target.checked)}
                                                    className="sr-only peer" 
                                                />
                                                <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-600"></div>
                                            </label>
                                        </div>

                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-gray-50 rounded-2xl border border-gray-100">
                                            <div className="pr-4">
                                                <p className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                                    <Globe className="w-5 h-5 text-gray-400" /> Chỉ nhận liên lạc từ Danh bạ
                                                </p>
                                                <p className="text-gray-500 font-medium pt-1">Từ chối mọi tin nhắn hay thông báo tương tác từ người lạ. Việc kết nối là đặc quyền duy nhất của người trong Danh bạ.</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer shrink-0">
                                                <input 
                                                    type="checkbox" 
                                                    checked={settingsData.profile.contactsOnlyMessage} 
                                                    onChange={(e) => updateSetting("profile", "contactsOnlyMessage", e.target.checked)}
                                                    className="sr-only peer" 
                                                />
                                                <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-600"></div>
                                            </label>
                                        </div>
                                    </>
                                )}

                                {/* TAB: CÂU CHUYỆN */}
                                {activeTab === 'story' && (
                                    <>
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-gray-50 rounded-2xl border border-gray-100">
                                            <div>
                                                <p className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                                    <Shield className="w-5 h-5 text-indigo-500" /> Quyền được xem Nhật ký mới thiết lập
                                                </p>
                                                <p className="text-gray-500 font-medium pt-1">Theo nguyên tắc cá nhân hóa, hệ thống sẽ giới hạn mức độ chia sẻ để bảo vệ mọi câu chuyện của bạn an toàn trong vòng kết nối gia đình/bạn bè.</p>
                                            </div>
                                            <select
                                                value={settingsData.story.defaultPrivacy}
                                                onChange={(e) => updateSetting("story", "defaultPrivacy", e.target.value)}
                                                className="min-h-[48px] px-4 py-2 border-2 border-gray-300 rounded-xl font-bold text-gray-800 focus:ring-emerald-200 focus:border-emerald-500 outline-none w-full sm:w-auto"
                                            >
                                                <option value="CONTACTS">Chia sẻ cho Danh bạ</option>
                                                <option value="PRIVATE">Chỉ mình tôi (Bí mật)</option>
                                            </select>
                                        </div>

                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-gray-50 rounded-2xl border border-gray-100">
                                            <div className="pr-4">
                                                <p className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                                    <Smartphone className="w-5 h-5 text-gray-500" /> Tự động phát Video
                                                </p>
                                                <p className="text-gray-500 font-medium pt-1">Video và nhạc nền trong Story sẽ tự động phát khi bạn cuộn qua.</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer shrink-0">
                                                <input 
                                                    type="checkbox" 
                                                    checked={settingsData.story.autoplay} 
                                                    onChange={(e) => updateSetting("story", "autoplay", e.target.checked)}
                                                    className="sr-only peer" 
                                                />
                                                <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-600"></div>
                                            </label>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* KHU VỰC ĐĂNG XUẤT */}
                <section className="bg-red-50 border-2 border-red-100 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
                    <div>
                        <h3 className="text-2xl font-bold text-red-800 mb-2 whitespace-nowrap">Đăng xuất</h3>
                        <p className="text-red-600 font-medium text-lg">Đăng xuất khỏi thiết bị này. Dữ liệu của bạn sẽ vẫn được lưu an toàn.</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center justify-center gap-2 px-8 py-3 w-full sm:w-auto min-h-[56px] bg-white hover:bg-red-100 text-red-600 border-2 border-red-200 hover:border-red-300 font-bold rounded-xl transition-colors shadow-sm text-xl whitespace-nowrap"
                    >
                        <LogOut className="w-6 h-6" />
                        Đăng xuất
                    </button>
                </section>
            </div>
        </MainLayout>
    );
}