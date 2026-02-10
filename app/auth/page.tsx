"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
// Lucide icons are not used as we use custom SVGs for a more professional look

// Lucide icons are not installed, let's use SVGs or check if I can install them.
// I'll use SVGs for now to ensure it works without extra steps.

function AuthContent() {
    const searchParams = useSearchParams();
    const [type, setType] = useState<"recruiter" | "jobseeker">("jobseeker");
    const [mode, setMode] = useState<"login" | "register">("login");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        const t = searchParams?.get("type");
        if (t === "recruiter") setType("recruiter");
        else setType("jobseeker");
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccess(null);

        const formData = new FormData(e.currentTarget);
        const email = formData.get("email");
        const password = formData.get("password");

        try {
            const response = await fetch("/api/auth", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password, mode, type }),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess(data.message);
                // Redirect after success
                setTimeout(() => {
                    window.location.href = "/dashboard";
                }, 1500);
            } else {
                setError(data.message || "Something went wrong");
            }
        } catch (err) {
            setError("Failed to connect to the server");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative flex min-h-[calc(100vh-80px)] items-center justify-center bg-[#F8FAFC] px-4 py-12">
            {/* Background decoration */}
            <div className="absolute top-1/2 left-1/2 -z-10 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-50/50 blur-3xl"></div>

            <div className="w-full max-w-[480px]">
                {/* Mode Toggle with professional divider */}
                <div className="relative mb-10">
                    <div className="flex justify-center gap-4 relative z-10 bg-white pb-6">
                        <button
                            disabled={isLoading}
                            onClick={() => { setMode("login"); setError(null); setSuccess(null); }}
                            className={`rounded-lg px-7 py-2 text-sm font-bold transition-all border-2 ${mode === "login"
                                ? "bg-[#6366F1] text-white border-[#6366F1] shadow-lg shadow-indigo-100"
                                : "text-slate-500 border-slate-200 hover:border-slate-300 bg-white"
                                }`}
                        >
                            Login
                        </button>
                        <button
                            disabled={isLoading}
                            onClick={() => { setMode("register"); setError(null); setSuccess(null); }}
                            className={`rounded-lg px-7 py-2 text-sm font-bold transition-all border-2 ${mode === "register"
                                ? "bg-[#6366F1] text-white border-[#6366F1] shadow-lg shadow-indigo-100"
                                : "text-slate-500 border-slate-200 hover:border-slate-300 bg-white"
                                }`}
                        >
                            Register
                        </button>
                    </div>
                    <div className="absolute bottom-0 left-0 w-full h-[2px] bg-slate-200"></div>
                </div>

                {/* Main Title - Matches Mockup */}
                <div className="mb-8 text-center">
                    <h2 className="text-2xl font-bold text-[#4B5563]">
                        {type === "recruiter" ? "Job Recruiter" : "Job Seeker"} Login
                    </h2>
                </div>

                {error && (
                    <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-600 ring-1 ring-inset ring-red-100">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-6 rounded-xl bg-emerald-50 p-4 text-sm font-medium text-emerald-600 ring-1 ring-inset ring-emerald-100">
                        {success}
                    </div>
                )}

                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label className="mb-3 block text-sm font-bold text-[#374151]">
                            Email <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <input
                                name="email"
                                type="email"
                                placeholder="Email"
                                className="w-full rounded-xl border-0 bg-[#D1D5DB]/30 px-5 py-4 text-slate-900 ring-1 ring-inset ring-slate-200 transition-all placeholder:text-[#9CA3AF] focus:bg-white focus:ring-2 focus:ring-inset focus:ring-indigo-500 disabled:opacity-50"
                                required
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="mb-3 block text-sm font-bold text-[#374151]">
                            Password <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <input
                                name="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                className="w-full rounded-xl border-0 bg-[#D1D5DB]/30 px-5 py-4 text-slate-900 ring-1 ring-inset ring-slate-200 transition-all placeholder:text-[#9CA3AF] focus:bg-white focus:ring-2 focus:ring-inset focus:ring-indigo-500 disabled:opacity-50"
                                required
                                disabled={isLoading}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                {showPassword ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                )}
                            </button>
                        </div>
                    </div>

                    {mode === "login" && (
                        <div className="flex items-center justify-between py-2">
                            <span className="text-sm font-bold text-[#111827]">Forgot Password</span>
                            <button
                                type="button"
                                className="rounded-lg border-2 border-indigo-400 px-6 py-1.5 text-xs font-bold text-indigo-500 hover:bg-indigo-50 transition-colors"
                            >
                                RESET NOW
                            </button>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="flex w-full items-center justify-center rounded-xl bg-[#6366F1] py-4 text-sm font-extrabold tracking-widest text-white shadow-lg shadow-indigo-100 transition-all hover:bg-[#4F46E5] hover:shadow-indigo-200 active:scale-[0.98] disabled:opacity-70"
                    >
                        {isLoading ? (
                            <svg className="h-5 w-5 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            "LOGIN"
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center text-sm">
                    <p className="text-[#374151]">
                        Don’t have an account ?{" "}
                        <button
                            onClick={() => setMode(mode === "login" ? "register" : "login")}
                            className="font-extrabold text-[#111827] hover:underline"
                        >
                            Register now
                        </button>
                    </p>
                </div>

                <div className="relative my-10">
                    <div className="absolute inset-x-0 bottom-0 h-[2px] bg-slate-200"></div>
                    <div className="relative flex justify-center pb-4">
                        <span className="bg-white px-4 text-xs font-bold uppercase tracking-widest text-[#374151]">
                            Or Login Using
                        </span>
                    </div>
                </div>

                <div className="flex justify-center gap-6">
                    <SocialButton icon="google" />
                    <SocialButton icon="facebook" />
                    <SocialButton icon="linkedin" />
                </div>
            </div>
        </div>
    );
}

function SocialButton({ icon }: { icon: string }) {
    const icons: Record<string, React.ReactNode> = {
        google: (
            <svg className="h-6 w-6" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3.09c-2.114-1.927-4.873-3.09-7.91-3.09C7.4 0 3.195 3.323 1.255 7.765l3.523 2.503c.155-.503.288-1 .488-1.5z"></path>
                <path fill="#34A853" d="M16.04 18.013c-1.09.582-2.39.909-3.79.909-2.91 0-5.39-1.9-6.39-4.527l-3.523 2.503C4.24 21.365 7.854 24 12 24c3.11 0 5.927-1.036 8.045-2.8l-3.664-2.827c-.118.063-.236.126-.34.14z"></path>
                <path fill="#4285F4" d="M23.518 12.245c0-.736-.08-1.464-.21-2.182H12v4.137h6.473c-.273 1.409-1.073 2.6-2.273 3.4l3.664 2.827c2.145-1.973 3.382-4.882 3.382-8.182z"></path>
                <path fill="#FBBC05" d="M4.605 14.395c-.21-.636-.33-1.32-.33-2.023s.12-1.386.33-2.023L1.082 7.766A11.977 11.977 0 0 0 0 12c0 1.514.282 2.955.782 4.282l3.823-1.887z"></path>
            </svg>
        ),
        facebook: (
            <svg className="h-6 w-6 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
        ),
        linkedin: (
            <svg className="h-6 w-6 text-[#0A66C2]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
        ),
    };

    return (
        <button className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-200 transition-all hover:bg-slate-50 hover:shadow-md hover:ring-indigo-100 active:scale-95">
            {icons[icon]}
        </button>
    );
}

export default function AuthPage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
            <AuthContent />
        </Suspense>
    );
}
