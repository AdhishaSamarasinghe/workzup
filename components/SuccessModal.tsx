import React from "react";
import Link from "next/link";

interface SuccessModalProps {
    isOpen: boolean;
    onClose?: () => void;
}

export default function SuccessModal({ isOpen, onClose }: SuccessModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
            <div className="w-full max-w-xl rounded-3xl bg-white p-10 text-center shadow-2xl animate-in fade-in zoom-in duration-300">
                {/* Checkmark Icon Circle */}
                <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-[#8ce0c2]">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-12 w-12 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                </div>

                {/* Heading */}
                <h2 className="mb-4 text-2xl font-black text-black sm:text-3xl">
                    Account Created Successfully!
                </h2>

                {/* Description */}
                <div className="mb-10 text-lg leading-relaxed text-gray-800">
                    <p>Your account has been created successfully.</p>
                    <p>Welcome to WorkzUp!</p>
                    <p className="mt-2">Your profile is now active and ready to use.</p>
                    <p>Start applying for jobs, tracking applications, and building your</p>
                    <p>career with us.</p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                    <Link
                        href="/auth/login"
                        className="flex-1 rounded-2xl bg-[#f2f4f7] px-8 py-4 text-lg font-bold text-black transition-colors hover:bg-gray-200"
                        onClick={onClose}
                    >
                        Go to Login
                    </Link>
                    <Link
                        href="/onboarding/welcome"
                        className="flex-1 rounded-2xl bg-[#6B8BFF] px-8 py-4 text-lg font-bold text-white transition-colors hover:bg-[#5A75D9]"
                        onClick={onClose}
                    >
                        Explore Jobs
                    </Link>
                </div>
            </div>
        </div>
    );
}
