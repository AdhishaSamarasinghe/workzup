"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

export default function PublicHeader({ alwaysSolid = false }: { alwaysSolid?: boolean }) {
    const pathname = usePathname();
    const [scrolledDelta, setScrolledDelta] = useState(false);
    const isScrolled = alwaysSolid || scrolledDelta;

    useEffect(() => {
        if (alwaysSolid) return;

        const handleScroll = () => {
            // Threshold for when the header becomes a solid/blurred background (e.g., crossing the hero area)
            setScrolledDelta(window.scrollY > 20);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [alwaysSolid]);

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
            <div className="mx-auto grid w-full max-w-7xl grid-cols-[auto_1fr] items-center gap-3 px-4 sm:px-6 md:grid-cols-[1fr_auto_1fr] md:gap-0 lg:px-8">
                {/* Logo */}
                <Link href="/" className="flex items-center justify-self-start">
                    <div className={`transition-all duration-500 ${!isScrolled ? 'brightness-0 invert drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]' : ''}`}>
                        <Image src="/logo_main.png" alt="WorkzUp" width={140} height={32} priority className="h-auto w-auto max-w-[120px] md:max-w-[140px]" />
                    </div>
                </Link>

                {/* Navigation */}
                <nav className={`hidden md:flex items-center justify-center gap-8 text-sm font-medium transition-colors md:justify-self-center ${!isScrolled ? "text-white" : "text-slate-700"}`}>
                    <Link href="/" className={`transition-colors hover:text-[#6b8cff] ${pathname === "/" ? "font-semibold" : "opacity-90 hover:opacity-100"}`}>
                        Home
                    </Link>
                    <Link href="/about" className={`transition-colors hover:text-[#6b8cff] ${pathname === "/about" ? "font-semibold" : "opacity-90 hover:opacity-100"}`}>
                        About
                    </Link>
                    <Link href="/help" className="opacity-90 transition-colors hover:opacity-100 hover:text-[#6b8cff]">
                        Help
                    </Link>
                </nav>


                {/* Auth Buttons */}
                <div className="col-start-2 flex items-center justify-end gap-3 md:col-start-3 md:gap-4 md:justify-self-end">
                    <Link
                        href="/auth/login"
                        className={`px-5 py-2 md:px-6 md:py-2.5 rounded-md font-semibold text-xs md:text-sm tracking-wide transition-all duration-300 ${isScrolled
                            ? 'bg-[#6b8cff] text-white shadow-md hover:bg-[#5b72c9] hover:shadow-lg hover:-translate-y-0.5'
                            : 'bg-white/10 text-white backdrop-blur-md border border-white/30 shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:bg-white/25 hover:shadow-[0_6px_16px_rgba(0,0,0,0.2)] hover:-translate-y-0.5'
                            }`}
                    >
                        JOB SEEKER LOGIN
                    </Link>

                    <Link
                        href="/auth/login/recruiter"
                        className={`px-5 py-2 md:px-6 md:py-2.5 rounded-md font-semibold text-xs md:text-sm tracking-wide transition-all duration-300 ${isScrolled
                            ? 'bg-[#5b72c9] text-white shadow-md hover:bg-[#4a5fb8] hover:shadow-lg hover:-translate-y-0.5'
                            : 'bg-white/10 text-white backdrop-blur-md border border-white/30 shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:bg-white/25 hover:shadow-[0_6px_16px_rgba(0,0,0,0.2)] hover:-translate-y-0.5'
                            }`}
                    >
                        RECRUITERS LOGIN
                    </Link>
                </div>
            </div>
        </motion.header>
    );
}
