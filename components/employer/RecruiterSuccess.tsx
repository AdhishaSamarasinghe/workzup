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
        <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
            <div className="relative w-full max-w-xl rounded-3xl bg-white p-8 text-center shadow-2xl animate-in fade-in zoom-in duration-300 sm:p-10">
                {onReset && (
                    <button
                        type="button"
                        aria-label="Close"
                        onClick={onReset}
                        className="absolute right-4 top-4 rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                    >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}

                {/* Success Icon */}
                <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-[#E0F9F1]">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#50E3C2] text-white">
                        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                </div>

                {/* Heading */}
                <h1 className="mb-5 text-3xl font-black leading-none tracking-tight text-slate-900 sm:text-[40px]">{title}</h1>

                {/* Confirmation Message */}
                <p className="mx-auto mb-10 max-w-md text-[17px] font-bold leading-relaxed text-slate-500">
                    {message}
                </p>

                {/* Actions */}
                <div className="mx-auto flex w-full max-w-[440px] flex-col gap-4 sm:flex-row">
                    <button
                        onClick={() => router.push("/employer/create-job/my-postings")}
                        className="flex-1 rounded-2xl bg-slate-100 py-4 text-[16px] font-black text-slate-700 transition-all hover:bg-slate-200 active:scale-95"
                    >
                        View My Job Posts
                    </button>
                    <button
                        onClick={() => router.push("/employer/profile")}
                        className="flex-1 rounded-2xl bg-[#6B8BFF] py-4 text-[16px] font-black text-white transition-all shadow-lg shadow-blue-200 hover:bg-[#5A78F0] active:scale-95"
                    >
                        View My Profile
                    </button>
                </div>

                {/* Secondary Link to post another */}
                {showPostAnother && onReset && (
                    <button
                        onClick={onReset}
                        className="mt-8 text-sm font-bold text-slate-400 transition-colors hover:text-[#6B8BFF]"
                    >
                        Post another job
                    </button>
                )}
            </div>
        </div>
    );
}
