"use client";
import { ReactNode, useState, useEffect } from "react";
import { Home, Image as ImageIcon, User, LogOut, Book, Users, Settings, Tags } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { authService } from "@/services/auth.service";
import { useLanguageStore, useTranslation } from "@/store/useLanguageStore";

export default function MainLayout({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const { t } = useTranslation();

    const logout = useAuthStore((state) => state.logout);
    const accessToken = useAuthStore((state) => state.accessToken);
    console.log("accessToken", accessToken);

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

                        {/* Nút chuyển ngôn ngữ */}
                        <LanguageToggle />

                        {/* Nút Đăng xuất */}
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 min-h-[56px] px-3 md:px-4 rounded-xl text-lg font-bold text-red-700 hover:bg-red-50 border-2 border-transparent hover:border-red-200 transition-colors ml-1 md:ml-2 whitespace-nowrap"
                            title="Đăng xuất"
                        >
                            <LogOut className="w-6 h-6" />
                            <span className="hidden md:inline">{t("nav.logout")}</span>
                        </button>
                    </nav>

                </div>
            </header>
            {/* VÙNG NỘI DUNG CHÍNH */}
            <main className="flex-grow max-w-4xl w-full mx-auto p-4 sm:p-6 md:py-10">
                {children}
            </main>
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
            className="flex items-center gap-1.5 min-h-[44px] px-3 py-1.5 rounded-xl border-2 border-stone-200 bg-stone-50 hover:bg-emerald-50 hover:border-emerald-300 transition-all font-bold text-sm text-stone-700 hover:text-emerald-800 whitespace-nowrap select-none"
        >
            <span className="text-xl leading-none">{isVi ? "🇻🇳" : "🇺🇸"}</span>
            <span className="hidden sm:inline">{isVi ? "VI" : "EN"}</span>
        </button>
    );
}