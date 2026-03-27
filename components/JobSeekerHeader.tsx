"use client";

import { useEffect, useState } from "react";
import Link from 'next/link';
import Image from 'next/image';
import MessagesBadge from '@/components/chat/MessagesBadge';
import { motion } from "framer-motion";
import { LogOut } from "lucide-react";
import ProfileAvatar from "./ProfileAvatar";
import { useProfileIdentity } from "@/lib/useProfileIdentity";
import { signOutWorkzupAuth } from "@/lib/auth/workzupAuth";

export default function JobSeekerHeader({ alwaysSolid = false }: { alwaysSolid?: boolean }) {
    const [scrolledDelta, setScrolledDelta] = useState(false);
    const isScrolled = alwaysSolid || scrolledDelta;
    const [dropdownOpen, setDropdownOpen] = useState(false);

    useEffect(() => {
        if (alwaysSolid) return;
        
        const handleScroll = () => {
            setScrolledDelta(window.scrollY > 20);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [alwaysSolid]);

    const handleLogout = async () => {
        await signOutWorkzupAuth();
        window.location.href = "/jobseeker/browse";
    };

    const fallbackName = "Job Seeker";
    const { avatarUrl, name } = useProfileIdentity(fallbackName);
    const userName = name || fallbackName;

    return (
        <motion.header
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={`fixed top-0 z-50 w-full transition-all duration-300 ease-in-out ${isScrolled
                ? "bg-white/70 backdrop-blur-xl border-b border-white/20 py-3 shadow-lg"
                : "bg-transparent py-5"
                }`}
        >
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                {/* Logo */}
                <Link href="/jobseeker/browse" className="flex items-center">
                    <div className={`transition-all duration-500 ${!isScrolled ? 'brightness-0 invert drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]' : ''}`}>
                        <Image src="/logo_main.png" alt="WorkzUp" width={140} height={32} priority className="h-auto w-auto max-w-[120px] md:max-w-[140px]" />
                    </div>
                </Link>

                {/* Right Area: Nav + Profile */}
                <div className="flex items-center gap-4 md:gap-8">
                    {/* Primary nav links (hidden on mobile) */}
                    <nav className={`hidden md:flex items-center gap-6 text-sm font-medium transition-colors ${!isScrolled ? 'text-white' : 'text-slate-700'}`}>
                        <Link href="/jobseeker/browse" className="opacity-90 hover:opacity-100 hover:text-[#6b8cff] transition-colors">Home</Link>
                        <Link href="/jobseeker/gigs" className="opacity-90 hover:opacity-100 hover:text-[#6b8cff] transition-colors">Find Jobs</Link>
                        <Link href="/jobseeker/matches" className="opacity-90 hover:opacity-100 hover:text-[#6b8cff] transition-colors">AI Matches</Link>
                        <Link href="/applications" className="opacity-90 hover:opacity-100 hover:text-[#6b8cff] transition-colors">My Applications</Link>
                        <Link href="/jobseeker/saved" className="opacity-90 hover:opacity-100 hover:text-[#6b8cff] transition-colors">Saved Jobs</Link>
                        <Link href="/messages" className="opacity-90 hover:opacity-100 hover:text-[#6b8cff] transition-colors"><MessagesBadge /></Link>
                    </nav>

                    {/* Profile Dropdown Area */}
                    <div className="relative">
                        <button
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            className="flex items-center gap-2 rounded-full p-1 transition-all duration-300 hover:bg-white/10"
                        >
                            <div className="h-9 w-9 md:h-10 md:w-10 overflow-hidden rounded-full border-2 border-white/50 bg-slate-50 flex items-center justify-center shadow-sm">
                                <ProfileAvatar
                                    src={avatarUrl}
                                    name={userName}
                                    size={40}
                                    textClassName="text-sm"
                                />
                            </div>
                        </button>

                        {/* Dropdown Menu */}
                        {dropdownOpen && (
                            <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white py-2 shadow-lg ring-1 ring-black/5 flex flex-col items-start overflow-hidden">
                                <div className="px-4 py-2 border-b border-slate-100 w-full mb-1">
                                    <p className="text-sm font-semibold truncate text-slate-800">{userName}</p>
                                    <p className="text-xs text-slate-500">Job Seeker</p>
                                </div>
                                <Link 
                                    href="/jobseeker/profile" 
                                    className="block w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                                    onClick={() => setDropdownOpen(false)}
                                >
                                    My Profile
                                </Link>
                                <Link
                                    href="/jobseeker/settings"
                                    className="block w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                                    onClick={() => setDropdownOpen(false)}
                                >
                                    Settings
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 text-left mt-1 border-t border-slate-100"
                                >
                                    <LogOut className="h-4 w-4" />
                                    Sign Out
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </motion.header>
    );
}
