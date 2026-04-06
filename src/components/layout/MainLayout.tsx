"use client";
import { ReactNode, useState, useEffect } from "react";
import { Home, Image as ImageIcon, User, LogOut, Book, Users, Settings, Tags } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { authService } from "@/services/auth.service";
import { useLanguageStore, useTranslation } from "@/store/useLanguageStore";

export default function MainLayout({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const { t } = useTranslation();

    const logout = useAuthStore((state) => state.logout);
    const accessToken = useAuthStore((state) => state.accessToken);

    const [isHydrated, setIsHydrated] = useState(false);

    const handleLogout = () => {
        authService.logout();
    };

    useEffect(() => {
        setIsHydrated(true);
    }, []);

    if (!isHydrated) {
        return <div className="min-h-screen bg-slate-50"></div>;
    }

    const navItems = [
        { name: t("nav.home"), href: "/home", icon: Home },
        { name: t("nav.library"), href: "/library", icon: ImageIcon },
        { name: t("nav.categories"), href: "/categories", icon: Tags },
        { name: t("nav.contacts"), href: "/contacts", icon: Users },
        { name: t("nav.settings"), href: "/settings", icon: Settings },
    ];

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
            {/* HEADER CHUNG */}
            <header className="bg-white border-b-2 border-gray-200 sticky top-0 z-40 shadow-sm">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 md:h-20 flex items-center justify-between">

                    {/* Logo */}
                    <Link href="/home" className="flex items-center gap-2 md:gap-3 p-1 md:p-2 rounded-lg hover:bg-gray-50 transition">
                        <Book className="w-7 h-7 md:w-8 md:h-8 text-emerald-800" />
                        <span className="text-xl md:text-2xl font-extrabold text-gray-900 tracking-tight whitespace-nowrap">
                            A Story.
                        </span>
                    </Link>

                    {/* DESKTOP NAVIGATION*/}
                    <nav className="hidden md:flex flex-1 items-center justify-center gap-2 lg:gap-4">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center gap-2 min-h-[48px] px-3 lg:px-5 rounded-xl text-base lg:text-lg font-bold transition-colors whitespace-nowrap ${isActive
                                        ? "bg-emerald-100 text-emerald-900 border-2 border-emerald-200"
                                        : "text-gray-700 hover:bg-gray-100 border-2 border-transparent"
                                        }`}
                                >
                                    <item.icon className="w-5 h-5 lg:w-6 lg:h-6" />
                                    <span>{item.name}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* ACTIONS (Language & Logout) */}
                    <div className="flex items-center gap-2 md:gap-4">
                        <LanguageToggle />
                        <button
                            onClick={handleLogout}
                            className="flex items-center justify-center min-h-[40px] md:min-h-[48px] px-3 md:px-4 rounded-xl text-sm md:text-base font-bold text-red-700 hover:bg-red-50 border-2 border-transparent hover:border-red-200 transition-colors"
                            title={t("nav.logout")}
                        >
                            <LogOut className="w-5 h-5 md:w-6 md:h-6" />
                            <span className="hidden md:inline ml-2">{t("nav.logout")}</span>
                        </button>
                    </div>

                </div>
            </header>

            {/* VÙNG NỘI DUNG CHÍNH */}
            <main className="flex-grow max-w-4xl w-full mx-auto p-4 sm:p-6 md:py-10 pb-24 md:pb-10">
                {children}
            </main>

            {/* MOBILE BOTTOM NAVIGATION */}
            <nav className="md:hidden fixed bottom-0 w-full bg-white border-t border-gray-200 flex justify-around items-center h-16 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-50 px-2 pb-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${isActive ? "text-emerald-800" : "text-gray-500 hover:text-gray-900"
                                }`}
                        >
                            <div className={`p-1 rounded-full ${isActive ? "bg-emerald-100" : ""}`}>
                                <item.icon
                                    className={`w-6 h-6 ${isActive ? "text-emerald-800" : ""}`}
                                    strokeWidth={isActive ? 2.5 : 2}
                                />
                            </div>
                            <span className="text-[10px] font-bold truncate max-w-full px-1">
                                {item.name}
                            </span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}

// ─── Language Toggle Component ────────────────────────────────────────────────
function LanguageToggle() {
    const language = useLanguageStore((state) => state.language);
    const setLanguage = useLanguageStore((state) => state.setLanguage);

    const isVi = language === "vi";

    const toggle = () => {
        setLanguage(isVi ? "en" : "vi");
    };

    return (
        <button
            onClick={toggle}
            title={isVi ? "Switch to English" : "Chuyển sang Tiếng Việt"}
            className="relative inline-flex items-center w-16 h-8 rounded-full bg-emerald-50 border-2 border-emerald-200 hover:border-emerald-300 focus:outline-none transition-colors shrink-0"
        >
            {/* Chữ nền chỉ báo ngôn ngữ */}
            <span className="absolute left-2 text-[10px] font-bold text-emerald-800 select-none">VI</span>
            <span className="absolute right-2 text-[10px] font-bold text-emerald-800 select-none">EN</span>

            {/* Nút tròn di chuyển (Thumb) */}
            <span
                className={`z-10 flex items-center justify-center w-6 h-6 bg-white rounded-full shadow-sm border border-gray-100 transform transition-transform duration-300 ease-in-out ${isVi ? "translate-x-1" : "translate-x-8"
                    }`}
            >
                <span className="text-[14px] leading-none">{isVi ? "🇻🇳" : "🇺🇸"}</span>
            </span>
        </button>
    );
}