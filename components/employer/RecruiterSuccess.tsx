"use client";

import React from "react";
import { useRouter } from "next/navigation";

interface RecruiterSuccessProps {
    title: string;
    message: string;
    onReset?: () => void;
    showPostAnother?: boolean;
}

export default function RecruiterSuccess({
    title,
    message,
    onReset,
    showPostAnother = false
}: RecruiterSuccessProps) {
    const router = useRouter();

    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-500">
            {/* Success Icon */}
            <div className="w-24 h-24 bg-[#E0F9F1] rounded-full flex items-center justify-center mb-10">
                <div className="w-12 h-12 bg-[#50E3C2] rounded-full flex items-center justify-center text-white">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" />
                    </svg>
                </div>
            </div>

            {/* Heading */}
            <h1 className="text-[40px] font-black text-slate-900 mb-6 tracking-tight leading-none">{title}</h1>

            {/* Confirmation Message */}
            <p className="text-[17px] text-slate-500 font-bold max-w-sm mb-12 leading-relaxed">
                {message}
            </p>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-[440px]">
                <button
                    onClick={() => router.push("/employer/create-job/my-postings")}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-4 rounded-2xl font-black text-[16px] transition-all active:scale-95"
                >
                    View My Job Posts
                </button>
                <button
                    onClick={() => router.push("/employer/profile")}
                    className="flex-1 bg-[#6B8BFF] hover:bg-[#5A78F0] text-white py-4 rounded-2xl font-black text-[16px] transition-all shadow-lg shadow-blue-200 active:scale-95"
                >
                    View My Profile
                </button>
            </div>

            {/* Secondary Link to post another */}
            {showPostAnother && onReset && (
                <button
                    onClick={onReset}
                    className="mt-10 text-slate-400 hover:text-[#6B8BFF] font-bold text-sm transition-colors"
                >
                    Post another job
                </button>
            )}
        </div>
    );
}
