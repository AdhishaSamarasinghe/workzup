"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

export default function AuthHeader() {
    return (
        <motion.header
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="fixed top-0 z-50 w-full bg-white/70 backdrop-blur-xl border-b border-white/20 py-4 shadow-sm"
        >
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 flex justify-center items-center">
                <Link href="/" className="flex items-center">
                    <Image 
                        src="/logo_main.png" 
                        alt="WorkzUp" 
                        width={140} 
                        height={32} 
                        priority 
                        className="h-auto w-auto max-w-[120px] md:max-w-[140px]" 
                    />
                </Link>
            </div>
        </motion.header>
    );
}
