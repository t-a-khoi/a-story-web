"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";
import { Settings, User, Mail, Lock, LogOut, Trash2, AlertTriangle, ChevronRight } from "lucide-react";

export default function SettingsPage() {
    const router = useRouter();

    // States giả lập cho UI
    const [userEmail, setUserEmail] = useState("nguyenvana@gmail.com");
    const [userName, setUserName] = useState("Nguyễn Văn A");

    // Xử lý Đăng xuất
    const handleLogout = () => {
        if (window.confirm("Bạn có chắc chắn muốn đăng xuất khỏi ứng dụng không?")) {
            localStorage.removeItem("accessToken");
            router.push("/");
        }
    };

    // Xử lý Xóa tài khoản
    const handleDeleteAccount = () => {
        const isConfirmed = window.confirm(
            "CẢNH BÁO: Việc này sẽ xóa vĩnh viễn tài khoản và toàn bộ câu chuyện của bạn. Bạn có CHẮC CHẮN muốn xóa không?"
        );
        if (isConfirmed) {
            alert("Yêu cầu xóa tài khoản đã được gửi. Đang xử lý...");
            // Logic gọi API xóa tài khoản sẽ nằm ở đây
            localStorage.removeItem("accessToken");
            router.push("/");
        }
    };

    return (
        <MainLayout>
            <div className="space-y-8 md:space-y-10 pb-16">

                {/* HEADER */}
                <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-stone-200 flex items-center gap-4">
                    <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
                        <Settings className="w-8 h-8 text-emerald-800" />
                    </div>
                    <div>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-stone-900">
                            Cài đặt tài khoản
                        </h1>
                        <p className="text-xl text-stone-600 font-medium mt-1">
                            Quản lý thông tin và bảo mật của bạn.
                        </p>
                    </div>
                </div>

                {/* 1. KHỐI THÔNG TIN TÀI KHOẢN (View account information) */}
                <section className="bg-white rounded-3xl shadow-sm border border-stone-200 overflow-hidden">
                    <div className="bg-stone-50 px-6 py-4 border-b border-stone-200">
                        <h2 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
                            <User className="w-6 h-6 text-stone-700" /> Hồ sơ của bạn
                        </h2>
                    </div>
                    <div className="p-6 md:p-8 space-y-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-stone-50 rounded-2xl border border-stone-100">
                            <div>
                                <p className="text-lg text-stone-500 font-medium">Họ và tên</p>
                                <p className="text-2xl font-bold text-stone-900">{userName}</p>
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-stone-50 rounded-2xl border border-stone-100">
                            <div>
                                <p className="text-lg text-stone-500 font-medium">Địa chỉ Email</p>
                                <p className="text-2xl font-bold text-stone-900">{userEmail}</p>
                            </div>
                            {/* Nút Đổi Email */}
                            <button
                                onClick={() => alert("Mở Pop-up nhập Email mới")}
                                className="flex items-center justify-center gap-2 min-h-[48px] px-6 bg-white border-2 border-stone-300 hover:border-emerald-500 hover:text-emerald-800 text-stone-700 text-lg font-bold rounded-xl transition-all"
                            >
                                <Mail className="w-5 h-5" /> Thay đổi
                            </button>
                        </div>
                    </div>
                </section>

                {/* 2. KHỐI BẢO MẬT (Security) */}
                <section className="bg-white rounded-3xl shadow-sm border border-stone-200 overflow-hidden">
                    <div className="bg-stone-50 px-6 py-4 border-b border-stone-200">
                        <h2 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
                            <Lock className="w-6 h-6 text-stone-700" /> Bảo mật
                        </h2>
                    </div>
                    <div className="p-2">
                        {/* Nút Đổi Mật Khẩu */}
                        <button
                            onClick={() => alert("Mở Pop-up nhập Mật khẩu mới")}
                            className="w-full flex items-center justify-between p-6 hover:bg-stone-50 transition-colors rounded-2xl text-left group"
                        >
                            <div>
                                <h3 className="text-2xl font-bold text-stone-900 group-hover:text-emerald-800 transition-colors">Đổi mật khẩu</h3>
                                <p className="text-lg text-stone-600 font-medium mt-1">Cập nhật mật khẩu mới để bảo vệ tài khoản tốt hơn.</p>
                            </div>
                            <ChevronRight className="w-8 h-8 text-stone-400 group-hover:text-emerald-800 transition-colors" />
                        </button>
                    </div>
                </section>

                {/* 3. VÙNG NGUY HIỂM (Danger Zone) */}
                <section className="bg-red-50 rounded-3xl shadow-sm border-2 border-red-100 overflow-hidden mt-12">
                    <div className="bg-red-100/50 px-6 py-4 border-b border-red-100">
                        <h2 className="text-2xl font-bold text-red-800 flex items-center gap-2">
                            <AlertTriangle className="w-6 h-6" /> Quản lý truy cập
                        </h2>
                    </div>
                    <div className="p-6 md:p-8 space-y-6">

                        {/* Nút Đăng xuất */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-red-100">
                            <div className="text-center sm:text-left">
                                <h3 className="text-2xl font-bold text-stone-900">Đăng xuất khỏi thiết bị</h3>
                                <p className="text-lg text-stone-600 font-medium mt-1">Bạn sẽ cần nhập lại email và mật khẩu ở lần sau.</p>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="w-full sm:w-auto flex items-center justify-center gap-2 min-h-[56px] px-8 bg-white border-2 border-stone-300 hover:bg-stone-100 text-stone-800 text-xl font-bold rounded-xl transition-all"
                            >
                                <LogOut className="w-6 h-6" /> Đăng xuất
                            </button>
                        </div>

                        {/* Nút Xóa tài khoản (Yêu cầu xác nhận) */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                            <div className="text-center sm:text-left max-w-lg">
                                <h3 className="text-2xl font-bold text-red-700">Xóa tài khoản vĩnh viễn</h3>
                                <p className="text-lg text-red-600/80 font-medium mt-1">Toàn bộ câu chuyện, hình ảnh và danh bạ của bạn sẽ bị xóa sạch khỏi hệ thống. Không thể khôi phục.</p>
                            </div>
                            <button
                                onClick={handleDeleteAccount}
                                className="w-full sm:w-auto flex items-center justify-center gap-2 min-h-[56px] px-8 bg-red-600 hover:bg-red-700 text-white text-xl font-bold rounded-xl transition-all shadow-sm"
                            >
                                <Trash2 className="w-6 h-6" /> Xóa tài khoản
                            </button>
                        </div>

                    </div>
                </section>

            </div>
        </MainLayout>
    );
}