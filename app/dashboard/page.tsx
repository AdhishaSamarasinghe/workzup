"use client";

import Link from "next/link";

export default function DashboardPage() {
    return (
        <div className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-[#F8FAFC]">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-slate-900">Welcome to Workzup!</h1>
                <p className="mt-4 text-slate-600">You have successfully logged in.</p>
                <Link
                    href="/"
                    className="mt-8 inline-block rounded-xl bg-[#6366F1] px-6 py-3 text-sm font-bold text-white shadow-lg hover:bg-[#4F46E5] transition-all"
                >
                    Go back Home
                </Link>
            </div>
        </div>
    );
}
