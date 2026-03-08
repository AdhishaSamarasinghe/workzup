"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Users, Building2, LogOut, Menu, X } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    // Basic protected route handling snippet (could be refined)
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/auth/login");
        }
    }, [router]);

    const navItems = [
        { name: "Overview", href: "/admin", icon: LayoutDashboard },
        { name: "Manage Users", href: "/admin/users", icon: Users },
        { name: "Verify Companies", href: "/admin/companies", icon: Building2 },
    ];

    const handleLogout = () => {
        localStorage.removeItem("token");
        router.push("/auth/login");
    };

    return (
        <div className="min-h-screen bg-gray-50 flex font-sans">
            {/* Sidebar */}
            <aside
                className={`fixed md:sticky top-0 left-0 z-40 h-screen transition-transform transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                    } md:translate-x-0 w-64 bg-slate-900 border-r border-slate-800 flex flex-col`}
            >
                <div className="p-6 flex items-center justify-between">
                    <Link href="/admin" className="flex items-center gap-2">
                        <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                            WorkzUp
                        </span>
                        <span className="bg-slate-800 text-slate-300 text-xs px-2 py-0.5 rounded-full font-medium ml-2">
                            Admin
                        </span>
                    </Link>
                    <button className="md:hidden text-slate-400" onClick={() => setIsSidebarOpen(false)}>
                        <X size={20} />
                    </button>
                </div>

                <nav className="flex-1 px-4 space-y-1 mt-6">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive
                                        ? "bg-blue-600/10 text-blue-400 font-medium border border-blue-500/20"
                                        : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                                    }`}
                            >
                                <Icon size={20} className={isActive ? "text-blue-400" : "opacity-70"} />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                    >
                        <LogOut size={20} className="opacity-70" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Mobile Header */}
                <header className="md:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between sticky top-0 z-30">
                    <span className="text-xl font-bold text-slate-800">Admin</span>
                    <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-slate-600">
                        <Menu size={24} />
                    </button>
                </header>

                {/* Page Content */}
                <div className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50/50 p-4 md:p-8">
                    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
                        {children}
                    </div>
                </div>
            </main>

            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm transition-opacity"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}
        </div>
    );
}
