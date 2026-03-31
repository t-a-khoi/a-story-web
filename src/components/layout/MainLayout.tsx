"use client";
import { ReactNode, useState, useEffect } from "react";
import { Home, PenSquare, User, LogOut, Book, Users, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { authService } from "@/services/auth.service";

export default function MainLayout({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();

    const logout = useAuthStore((state) => state.logout);
    const accessToken = useAuthStore((state) => state.accessToken);
    console.log("accessToken", accessToken);

    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
        // Đánh dấu Zustand đã lấy xong dữ liệu từ localStorage
        setIsHydrated(true);
    }, []);

    useEffect(() => {
        // Chỉ chạy logic chuyển hướng KHI đã hydrated xong
        if (isHydrated && !accessToken) {
            router.push("/");
        }
    }, [isHydrated, accessToken, router]);

    const handleLogout = () => {
        authService.logout();
        router.push("/");
    };

    if (!isHydrated) {
        return <div className="min-h-screen bg-slate-50"></div>;
    }
    const navItems = [
        { name: "Trang chủ", href: "/home", icon: Home },
        { name: "Viết mới", href: "/write", icon: PenSquare },
        { name: "Danh bạ", href: "/contacts", icon: Users },
        { name: "Cài đặt", href: "/settings", icon: Settings },
    ];


    return (
        <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
            {/* HEADER DÀNH CHO APP */}
            <header className="bg-white border-b-2 border-gray-200 sticky top-0 z-40 shadow-sm">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">

                    {/* Logo */}
                    <Link href="/home" className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition">
                        <Book className="w-8 h-8 text-emerald-800" />
                        <span className="text-2xl font-extrabold text-gray-900 tracking-tight hidden sm:block">
                            A Story.
                        </span>
                    </Link>

                    {/* Navigation - Cực kỳ rõ ràng, kèm Text */}
                    <nav className="flex items-center gap-2 md:gap-4">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center gap-2 min-h-[56px] px-3 md:px-5 lg:px-6 rounded-xl text-lg font-bold transition-colors whitespace-nowrap ${isActive
                                        ? "bg-emerald-100 text-emerald-900 border-2 border-emerald-200"
                                        : "text-gray-700 hover:bg-gray-100 border-2 border-transparent"
                                        }`}
                                >
                                    <item.icon className="w-6 h-6" />
                                    <span className="hidden sm:inline">{item.name}</span>
                                </Link>
                            );
                        })}

                        {/* Nút Đăng xuất */}
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 min-h-[56px] px-3 md:px-4 rounded-xl text-lg font-bold text-red-700 hover:bg-red-50 border-2 border-transparent hover:border-red-200 transition-colors ml-1 md:ml-2 whitespace-nowrap"
                            title="Đăng xuất"
                        >
                            <LogOut className="w-6 h-6" />
                            <span className="hidden md:inline">Thoát</span>
                        </button>
                    </nav>

                </div>
            </header>
            {/* VÙNG NỘI DUNG CHÍNH */}
            {/* max-w-4xl giúp thu hẹp độ rộng dòng chữ trên Desktop, tối ưu cho việc đọc (Reading UX) */}
            <main className="flex-grow max-w-4xl w-full mx-auto p-4 sm:p-6 md:py-10">
                {children}
            </main>
        </div>
    );
}