/* eslint-disable */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [step, setStep] = useState<"request" | "reset">("request");
    
    // Request Step State
    const [email, setEmail] = useState("");
    const [requestLoading, setRequestLoading] = useState(false);
    const [requestError, setRequestError] = useState("");

    // Reset Step State
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [resetLoading, setResetLoading] = useState(false);
    const [resetError, setResetError] = useState("");
    const [resetSuccess, setResetSuccess] = useState(false);

    const handleRequestSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setRequestLoading(true);
        setRequestError("");

        try {
            await apiFetch("/api/auth/forgot-password/request", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            // Proceed to the next step regardless of real outcome to prevent enumeration
            setStep("reset");
        } catch (error: any) {
            setRequestError(error.message || "Failed to process request. Please try again.");
        } finally {
            setRequestLoading(false);
        }
    };

    const handleResetSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (newPassword !== confirmPassword) {
            setResetError("Passwords do not match.");
            return;
        }

        if (newPassword.length < 6) {
            setResetError("Password must be at least 6 characters.");
            return;
        }

        setResetLoading(true);
        setResetError("");

        try {
            await apiFetch("/api/auth/forgot-password/reset", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp, newPassword }),
            });
            
            setResetSuccess(true);
        } catch (error: any) {
            setResetError(error.message || "Failed to reset password. Please check your reset code.");
        } finally {
            setResetLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="flex flex-col justify-center items-center flex-1 p-4"
            >
                <div className="w-full max-w-[500px] bg-white rounded-xl shadow-lg shadow-gray-200/50 p-8 sm:p-10 relative">
                    {/* Back Link */}
                    {!resetSuccess && (
                        <div className="mb-6">
                            <Link href="/auth/login" className="inline-flex items-center text-sm font-semibold text-gray-500 hover:text-[#6B8BFF] transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 mr-1">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                                </svg>
                                Back to Login
                            </Link>
                        </div>
                    )}

                    <AnimatePresence mode="wait">
                        {resetSuccess ? (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-center py-6"
                            >
                                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8 text-green-600">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                    </svg>
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">Password Reset!</h2>
                                <p className="text-gray-500 mb-8">
                                    Your password has been successfully updated. You can now log in with your new credentials.
                                </p>
                                <Link
                                    href="/auth/login"
                                    className="block w-full rounded-md bg-[#6B8BFF] py-3.5 text-[15px] font-bold tracking-wide text-white shadow-sm hover:bg-[#5A75D9] transition-colors"
                                >
                                    Log In Now
                                </Link>
                            </motion.div>
                        ) : step === "request" ? (
                            <motion.div
                                key="request"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <h2 className="text-center text-[26px] font-bold text-gray-900 mb-3">
                                    Reset Password
                                </h2>
                                <p className="text-center text-gray-500 text-sm mb-8">
                                    Enter your registered email address to receive a secure password reset code.
                                </p>

                                <form onSubmit={handleRequestSubmit} className="space-y-6">
                                    <div>
                                        <div className="relative rounded-lg overflow-hidden">
                                            <input
                                                type="email"
                                                required
                                                placeholder="Email Address"
                                                className="block w-full border-0 bg-[#f2f4f7] py-3.5 px-4 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#6B8BFF] sm:text-[15px] sm:leading-6 font-medium transition-shadow"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    {requestError && (
                                        <div className="text-sm text-red-600 font-medium text-center bg-red-50 p-3 rounded">
                                            {requestError}
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={requestLoading || !email}
                                        className="w-full rounded-md bg-[#6B8BFF] py-3.5 text-[15px] font-bold tracking-wide text-white shadow-sm hover:bg-[#5A75D9] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6B8BFF] disabled:opacity-70 transition-colors"
                                    >
                                        {requestLoading ? "SENDING..." : "SEND RESET CODE"}
                                    </button>
                                </form>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="reset"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <h2 className="text-[26px] font-bold text-gray-900 mb-3">
                                    Secure your account
                                </h2>
                                <p className="text-gray-500 text-sm mb-8">
                                    We've sent a 6-digit reset code to <strong>{email}</strong>. Enter it below along with your new password.
                                </p>

                                <form onSubmit={handleResetSubmit} className="space-y-5">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Reset Code</label>
                                        <input
                                            type="text"
                                            required
                                            maxLength={6}
                                            placeholder="123456"
                                            className="block w-full border-0 bg-[#f2f4f7] py-3.5 px-4 text-gray-900 tracking-widest placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#6B8BFF] sm:text-[15px] font-bold transition-shadow"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">New Password</label>
                                        <div className="relative rounded-lg overflow-hidden group">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                required
                                                placeholder="••••••••"
                                                className="block w-full border-0 bg-[#f2f4f7] py-3.5 pl-4 pr-12 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#6B8BFF] sm:text-[15px] sm:leading-6 font-medium transition-shadow"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                            />
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

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirm Password</label>
                                        <div className="relative rounded-lg overflow-hidden">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                required
                                                placeholder="••••••••"
                                                className="block w-full border-0 bg-[#f2f4f7] py-3.5 px-4 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#6B8BFF] sm:text-[15px] sm:leading-6 font-medium transition-shadow"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    {resetError && (
                                        <div className="text-sm text-red-600 font-medium bg-red-50 p-3 rounded mt-2">
                                            {resetError}
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={resetLoading || !otp || !newPassword || !confirmPassword}
                                        className="w-full mt-4 rounded-md bg-[#6B8BFF] py-3.5 text-[15px] font-bold tracking-wide text-white shadow-sm hover:bg-[#5A75D9] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6B8BFF] disabled:opacity-70 transition-colors"
                                    >
                                        {resetLoading ? "UPDATING PASSWORD..." : "UPDATE PASSWORD"}
                                    </button>
                                </form>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
}
