"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { signIn } from "next-auth/react";

import Logo from "@/components/Logo";

export default function JobSeekerLoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await apiFetch("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                }),
            });

            if (res.token) {
                localStorage.setItem("token", res.token);
                // Based on welcome page behavior
                router.push("/onboarding/welcome");
            }
        } catch (error: any) {
            console.error("Login failed:", error);
            alert(error.message || "Login failed. Please check your credentials.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            {/* Header */}
            <header className="flex items-center justify-between bg-white px-6 py-4 shadow-sm z-10 w-full relative">
                <div className="flex items-center gap-2">
                    <Logo textSize="text-2xl" />
                </div>
                <div className="flex gap-4">
                    <Link
                        href="/auth/login"
                        className="rounded-md bg-[#586CB6] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-90"
                    >
                        RECRUITERS LOGIN
                    </Link>
                    <Link
                        href="/auth/login"
                        className="rounded-md bg-[#6C8BFF] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-90"
                    >
                        JOB SEEKER LOGIN
                    </Link>
                </div>
            </header>

            <div className="flex flex-1">
                {/* Left Side - Placeholder/Image */}
                <div className="hidden w-1/3 bg-[#D9D9D9] lg:block"></div>

                {/* Right Side - Form */}
                <div className="flex w-full flex-col justify-center items-center bg-[#F9FAFB] p-8 lg:w-2/3 lg:p-12 relative overflow-y-auto">

                    {/* The Card Form container */}
                    <div className="w-full max-w-[500px] bg-white rounded-xl shadow-lg shadow-gray-200/50 p-8 sm:p-10 mb-auto mt-4 sm:mt-8 relative animate-in fade-in slide-in-from-bottom-4 duration-500">

                        {/* Tabs */}
                        <div className="flex justify-center mb-6">
                            <div className="flex w-fit">
                                <button className="px-8 py-2 bg-[#6B8BFF] text-white font-semibold rounded-l-md border border-[#6B8BFF] hover:bg-[#5A75D9] transition-colors">
                                    Login
                                </button>
                                <Link href="/auth/register/job-seeker" className="px-8 py-2 bg-white text-gray-500 font-semibold rounded-r-md border border-gray-300 border-l-0 hover:bg-gray-50 transition-colors">
                                    Register
                                </Link>
                            </div>
                        </div>

                        {/* Divider Line */}
                        <div className="w-full h-px bg-gray-400/50 mb-8 rounded-full"></div>

                        {/* Title */}
                        <h2 className="text-center text-[26px] font-bold text-gray-700 mb-8">
                            Job Seeker Login
                        </h2>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-6">

                            {/* Email */}
                            <div>
                                <div className="relative rounded-lg overflow-hidden group">
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        placeholder="Email "
                                        className="block w-full border-0 bg-[#E0E0E0] py-3.5 px-4 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#6B8BFF] sm:text-[15px] sm:leading-6 font-medium transition-shadow"
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                    <span className="absolute top-3.5 left-[54px] text-red-500 font-bold pointer-events-none group-focus-within:invisible" style={{ display: formData.email ? 'none' : 'block' }}>*</span>
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <div className="relative rounded-lg overflow-hidden group">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        required
                                        placeholder="Password "
                                        className="block w-full border-0 bg-[#E0E0E0] py-3.5 pl-4 pr-12 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#6B8BFF] sm:text-[15px] sm:leading-6 font-medium transition-shadow"
                                        value={formData.password}
                                        onChange={handleChange}
                                    />
                                    <span className="absolute top-3.5 left-[84px] text-red-500 font-bold pointer-events-none group-focus-within:invisible" style={{ display: formData.password ? 'none' : 'block' }}>*</span>

                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-500 hover:text-gray-700 transition-colors focus:outline-none"
                                    >
                                        {showPassword ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Forgot Password Row */}
                            <div className="flex items-center justify-between pt-2">
                                <span className="text-sm font-bold text-black tracking-tight">Forgot Password</span>
                                <Link
                                    href="#"
                                    className="px-6 py-1.5 text-sm font-semibold text-[#6B8BFF] border-2 border-[#6B8BFF]/40 rounded hover:bg-blue-50 transition-colors"
                                >
                                    RESET NOW
                                </Link>
                            </div>

                            {/* Login Container (with gray background wrapping form controls as in design) */}
                            <div className="bg-[#f2f4f7] rounded-xl p-4 sm:p-5 mt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full rounded-md bg-[#6B8BFF] py-3.5 text-[15px] font-bold tracking-wide text-white shadow-sm hover:bg-[#5A75D9] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6B8BFF] disabled:opacity-70 transition-colors"
                                >
                                    {loading ? "LOGGING IN..." : "LOGIN"}
                                </button>
                            </div>

                            {/* Register text */}
                            <div className="text-center pt-2">
                                <span className="text-sm text-gray-500 font-medium">Don't have an account ? </span>
                                <Link href="/auth/register/job-seeker" className="text-sm font-bold text-black hover:underline">
                                    Register now
                                </Link>
                            </div>

                            {/* Divider with Line */}
                            <div className="pt-2 pb-1 relative">
                                <div className="absolute inset-x-0 top-1/2 h-px bg-gray-300"></div>
                            </div>

                            {/* Social Logins */}
                            <div className="flex flex-col items-center pt-2">
                                <span className="text-sm font-semibold text-black mb-4 bg-white px-2">Or Login Using</span>
                                <div className="flex gap-4">
                                    {/* Google */}
                                    <button
                                        type="button"
                                        onClick={() => signIn("google")}
                                        className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
                                    >
                                        <svg className="h-[22px] w-[22px]" aria-hidden="true" viewBox="0 0 24 24">
                                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#D2D6DC" />
                                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#D2D6DC" />
                                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#D2D6DC" />
                                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#D2D6DC" />
                                        </svg>
                                    </button>

                                    {/* Facebook */}
                                    <button
                                        type="button"
                                        onClick={() => signIn("facebook")}
                                        className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
                                    >
                                        <svg className="h-[22px] w-[22px] text-gray-300" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                            <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                                        </svg>
                                    </button>

                                    {/* LinkedIn */}
                                    <button
                                        type="button"
                                        onClick={() => signIn("linkedin")}
                                        className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
                                    >
                                        <svg className="h-[22px] w-[22px] text-gray-300" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                            <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
