"use client";

import React from "react";
import { useRouter } from "next/navigation";

interface PostJobSuccessProps {
    jobTitle: string;
    onReset: () => void;
}

export default function PostJobSuccess({ jobTitle, onReset }: PostJobSuccessProps) {
    const router = useRouter();

    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-500">
            {/* Success Icon */}
            <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-8 shadow-xl shadow-emerald-100/50">
                <svg className="w-12 h-12 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
            </div>

            {/* Heading */}
            <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Job Posted!</h1>

            {/* Confirmation Message */}
            <p className="text-lg text-slate-500 font-bold max-w-md mb-12 leading-relaxed">
                Your job posting for <span className="text-[#6B8BFF]">&quot;{jobTitle}&quot;</span> has been successfully created and is now live.
            </p>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                <button
                    onClick={() => router.push("/employer/profile")}
                    className="flex-1 bg-[#6B8BFF] hover:bg-[#5A78F0] text-white py-4 rounded-2xl font-black text-[16px] transition-all shadow-lg shadow-blue-200 active:scale-95"
                >
                    View My Profile
                </button>
                <button
                    onClick={() => router.push("/employer/my-postings")}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-4 rounded-2xl font-black text-[16px] transition-all active:scale-95"
                >
                    View My Job Posts
                </button>
            </div>

            {/* Secondary Link to post another */}
            <button
                onClick={onReset}
                className="mt-8 text-slate-400 hover:text-[#6B8BFF] font-bold text-sm transition-colors"
            >
                Post another job
            </button>
        </div>
    );
}
