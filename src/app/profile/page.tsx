"use client";

import { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { User, Mail, Phone, MapPin, Calendar, CheckCircle2, UserCircle, Edit3, Loader2, HeartCrack, Activity, Save, ArrowLeft } from "lucide-react";
import { ProfileService } from "@/services/profile.service";
import { ProfilesCreateRequest, ProfilesUpdateRequest, ProfilesResponse } from "@/types/profile";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [toastMsg, setToastMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [isEditing, setIsEditing] = useState(false); // Default là mờ để xem, ấn sửa

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
        // Giả lập lấy profile của người dùng đăng nhập hiện tại
        setTimeout(() => {
            setFormData({
                fullname: "Nguyễn Văn A",
                gender: "MALE",
                dateOfBirth: "1960-05-15",
                phoneNumber: "0901234567",
                address: "123 Đường Hải Bà Trưng, Quận 1, TP.HCM",
                isDeceased: false,
                memorialMessage: "",
            });
            setProfileId(1);
            setIsEditing(false);
            setIsLoading(false);
        }, 800);
    }, []);

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
            showToast("error", "Vui lòng nhập họ và tên.");
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
                showToast("success", "Đã cập nhật hồ sơ thành công!");
            } else {
                const payload: ProfilesCreateRequest = {
                    userId: 1,
                    fullname: formData.fullname.trim(),
                    gender: formData.gender,
                    dateOfBirth: isoDateOfBirth,
                    phoneNumber: formData.phoneNumber.trim() || undefined,
                    address: formData.address.trim() || undefined,
                    isDeceased: formData.isDeceased,
                    memorialMessage: formData.isDeceased ? formData.memorialMessage.trim() : undefined,
                };
                showToast("success", "Đã tạo hồ sơ mới thành công!");
                setProfileId(999);
            }

            setIsEditing(false);
        } catch (error) {
            showToast("error", "Đã có lỗi kết nối máy chủ khi lưu hồ sơ.");
        } finally {
            setIsSaving(false);
        }
    };

    // Safelist manually mapped classes since Tailwind cannot compile dynamic bg-${themeTone}-xyz
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
                    <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-2xl shadow-lg border-2 font-bold text-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-4 ${toastMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-800 border-red-200'
                        }`}>
                        {toastMsg.type === 'success' ? <CheckCircle2 className="w-6 h-6" /> : <Loader2 className="w-6 h-6" />}
                        {toastMsg.text}
                    </div>
                )}

                {/* HEADER BANNER */}
                <div className={`${bgHeader} border-2 rounded-3xl p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden transition-colors duration-500`}>
                    <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                        {formData.isDeceased ? (
                            <HeartCrack className={`w-32 h-32 ${textIcon}`} aria-hidden="true" />
                        ) : (
                            <UserCircle className={`w-32 h-32 ${textIcon}`} aria-hidden="true" />
                        )}
                    </div>

                    <div className="relative z-10 space-y-3">
                        <button
                            onClick={() => router.push("/settings")}
                            className={`flex items-center gap-2 font-bold text-lg w-fit transition-colors px-4 py-2 rounded-xl border border-transparent hover:border-gray-200 hover:bg-white/50 ${textIcon}`}
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span>Quay lại Cài đặt</span>
                        </button>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
                            {profileId ? "Hồ sơ cá nhân" : "Tạo hồ sơ mới"}
                        </h1>
                        <p className="text-gray-700 text-lg md:text-xl font-medium">
                            Nơi bạn cập nhật thông tin cá nhân.
                        </p>
                    </div>

                    <button
                        onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                        disabled={isSaving}
                        className={`relative z-10 flex items-center justify-center gap-3 min-h-[56px] px-8 py-3 rounded-xl border-2 transition-all font-bold text-xl shrink-0 ${btnClass}`}
                    >
                        {isSaving ? (
                            <Loader2 className="w-6 h-6 animate-spin" />
                        ) : isEditing ? (
                            <><Save className="w-6 h-6" /> Lưu hồ sơ</>
                        ) : (
                            <><Edit3 className="w-6 h-6" /> Chỉnh sửa</>
                        )}
                    </button>
                </div>

                {isLoading ? (
                    <div className={`flex flex-col items-center justify-center py-20 gap-4 ${textIcon}`}>
                        <Loader2 className="w-12 h-12 animate-spin" aria-hidden="true" />
                        <p className="text-xl font-bold">Đang tải biểu mẫu...</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className={`bg-gray-50 px-8 py-8 border-b border-gray-200 flex flex-col md:flex-row items-center md:items-start gap-6`}>
                            <div className={`w-24 h-24 ${formData.isDeceased ? 'bg-stone-200' : 'bg-emerald-100'} border-4 border-white shadow-sm rounded-full flex items-center justify-center shrink-0`}>
                                <User className={`w-12 h-12 ${textIcon}`} />
                            </div>
                            <div className="text-center md:text-left w-full space-y-2 pt-2">
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="fullname"
                                        value={formData.fullname}
                                        onChange={handleInputChange}
                                        className={`text-3xl font-extrabold text-gray-900 bg-white border-2 rounded-xl px-4 py-2 w-full focus:ring-4 outline-none ${inputClass}`}
                                        placeholder="Nhập họ và tên..."
                                    />
                                ) : (
                                    <h2 className="text-3xl font-extrabold text-gray-900">{formData.fullname || "Chưa có tên"}</h2>
                                )}
                                <div className="flex items-center justify-center md:justify-start gap-2 pt-2">
                                    <span className="text-lg text-gray-600 font-bold">Trạng thái:</span>
                                    {isEditing ? (
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" name="isDeceased" checked={formData.isDeceased} onChange={handleInputChange} className="sr-only peer" />
                                            <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-stone-600"></div>
                                            <span className="ms-3 text-lg font-bold text-gray-700">{formData.isDeceased ? "Đã qua đời" : "Đang sinh sống"}</span>
                                        </label>
                                    ) : (
                                        <div className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-base font-bold shadow-sm border ${formData.isDeceased ? "bg-stone-100 text-stone-700 border-stone-200" : "bg-emerald-50 text-emerald-700 border-emerald-100"}`}>
                                            {formData.isDeceased ? <HeartCrack className="w-4 h-4" /> : <Activity className="w-4 h-4" />}
                                            {formData.isDeceased ? "Đã qua đời" : "Đang sinh sống"}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 md:p-8 space-y-8">
                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="flex items-center gap-2 text-lg font-bold text-gray-700">
                                        <UserCircle className="w-5 h-5 text-gray-400" /> Giới tính
                                    </label>
                                    {isEditing ? (
                                        <select
                                            name="gender"
                                            value={formData.gender}
                                            onChange={handleInputChange}
                                            className={`w-full text-xl text-gray-900 font-medium border-2 rounded-xl px-4 py-3 min-h-[56px] focus:ring-4 outline-none ${inputClass}`}
                                        >
                                            <option value="MALE">Nam</option>
                                            <option value="FEMALE">Nữ</option>
                                            <option value="OTHER">Khác</option>
                                        </select>
                                    ) : (
                                        <div className="w-full text-xl text-gray-900 font-bold bg-gray-50 rounded-xl px-4 py-3 border border-gray-100 min-h-[56px] flex items-center">
                                            {formData.gender === "MALE" ? "Nam" : formData.gender === "FEMALE" ? "Nữ" : "Khác"}
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-3">
                                    <label className="flex items-center gap-2 text-lg font-bold text-gray-700">
                                        <Calendar className="w-5 h-5 text-gray-400" /> Ngày sinh
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="date"
                                            name="dateOfBirth"
                                            value={formData.dateOfBirth}
                                            onChange={handleInputChange}
                                            className={`w-full text-xl text-gray-900 font-medium border-2 rounded-xl px-4 py-3 min-h-[56px] focus:ring-4 outline-none ${inputClass}`}
                                        />
                                    ) : (
                                        <div className="w-full text-xl text-gray-900 font-bold bg-gray-50 rounded-xl px-4 py-3 border border-gray-100 min-h-[56px] flex items-center">
                                            {formData.dateOfBirth ? new Date(formData.dateOfBirth).toLocaleDateString('vi-VN') : "Chưa cập nhật"}
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-3">
                                    <label className="flex items-center gap-2 text-lg font-bold text-gray-700">
                                        <Phone className="w-5 h-5 text-gray-400" /> Số điện thoại
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="tel"
                                            name="phoneNumber"
                                            value={formData.phoneNumber}
                                            onChange={handleInputChange}
                                            className={`w-full text-xl text-gray-900 font-medium border-2 rounded-xl px-4 py-3 min-h-[56px] focus:ring-4 outline-none ${inputClass}`}
                                            placeholder="Nhập số điện thoại"
                                        />
                                    ) : (
                                        <div className="w-full text-xl text-gray-900 font-bold bg-gray-50 rounded-xl px-4 py-3 border border-gray-100 min-h-[56px] flex items-center truncate">
                                            {formData.phoneNumber || "Chưa cập nhật"}
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-3">
                                    <label className="flex items-center gap-2 text-lg font-bold text-gray-700">
                                        <MapPin className="w-5 h-5 text-gray-400" /> Địa chỉ
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name="address"
                                            value={formData.address}
                                            onChange={handleInputChange}
                                            className={`w-full text-xl text-gray-900 font-medium border-2 rounded-xl px-4 py-3 min-h-[56px] focus:ring-4 outline-none ${inputClass}`}
                                            placeholder="Nhập địa chỉ nhà..."
                                        />
                                    ) : (
                                        <div className="w-full text-xl text-gray-900 font-bold bg-gray-50 rounded-xl px-4 py-3 border border-gray-100 min-h-[56px] flex items-center truncate">
                                            {formData.address || "Chưa cập nhật"}
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            {formData.isDeceased && (
                                <div className="space-y-3 pt-6 border-t border-gray-100 animate-in fade-in slide-in-from-bottom-2">
                                    <label className="flex items-center gap-2 text-xl font-extrabold text-stone-800">
                                        <HeartCrack className="w-6 h-6 text-stone-500" /> Lời nhắn tưởng nhớ
                                    </label>
                                    <p className="text-stone-600 text-lg font-medium pb-2">Ghi lại vài dòng ý nghĩa để tưởng nhớ về người này.</p>
                                    {isEditing ? (
                                        <textarea
                                            name="memorialMessage"
                                            value={formData.memorialMessage}
                                            onChange={handleInputChange}
                                            className="w-full text-xl text-stone-900 font-medium border-2 border-stone-300 focus:border-stone-500 rounded-xl px-5 py-4 min-h-[150px] focus:ring-4 focus:ring-stone-100 outline-none resize-none"
                                            placeholder="Viết một vài dòng tưởng nhớ..."
                                        />
                                    ) : (
                                        <div className="w-full text-xl font-serif italic text-stone-800 bg-stone-50 rounded-xl px-6 py-5 border-l-4 border-stone-400 min-h-[120px] leading-relaxed relative">
                                            <span className="text-4xl text-stone-300 absolute top-2 left-2">"</span>
                                            <span className="relative z-10">{formData.memorialMessage || "Chưa có lời tưởng nhớ."}</span>
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
