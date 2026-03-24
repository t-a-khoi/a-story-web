"use client";

import { Home, PenSquare, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function MainLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const navItems = [
        { name: "Trang chủ", href: "/home", icon: Home },
        { name: "Viết mới", href: "/write", icon: PenSquare },
        { name: "Cá nhân", href: "/profile", icon: User },
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-medium text-gray-900">

            {/* KHU VỰC NỘI DUNG CHÍNH (CONTENT)*/}
            <main className="flex-1 w-full max-w-3xl mx-auto md:p-6 pb-28 md:pb-6">
                {children}
            </main>

            {/* THANH ĐIỀU HƯỚNG (NAVIGATION)*/}
            <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] 
                      md:static md:w-64 md:border-t-0 md:border-r md:shadow-none md:min-h-screen md:p-4 z-50">
                <ul className="flex flex-row md:flex-col justify-around md:justify-start items-center md:items-stretch h-[80px] md:h-auto md:gap-4 px-2 md:px-0">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;

                        return (
                            <li key={item.href} className="flex-1 md:flex-none flex justify-center">
                                <Link
                                    href={item.href}
                                    className={`flex flex-col md:flex-row items-center justify-center md:justify-start gap-1 md:gap-4 w-full h-[64px] md:h-auto md:py-4 md:px-6 rounded-xl transition-all
                    ${isActive
                                            ? "text-blue-700 bg-blue-50 md:bg-blue-100 font-bold"
                                            : "text-gray-600 hover:text-blue-700 hover:bg-gray-100"
                                        }
                  `}
                                >
                                    <Icon className="w-6 h-6 md:w-7 md:h-7" strokeWidth={isActive ? 2.5 : 2} />
                                    <span className={`text-sm md:text-lg ${isActive ? "font-bold" : "font-medium"}`}>
                                        {item.name}
                                    </span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

        </div>
    );
}