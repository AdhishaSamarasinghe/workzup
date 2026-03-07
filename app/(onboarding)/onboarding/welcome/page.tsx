"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import CenteredCard from "@/components/CenteredCard";
import { apiFetch } from "@/lib/api";

import Logo from "@/components/Logo";

export default function WelcomePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleGetStarted = async () => {
        setLoading(true);
        router.push("/onboarding/profile-prompt");
    };

    return (
        <CenteredCard>
            <div className="mb-6 flex justify-center">
                <Logo />
            </div>

            <h2 className="mb-2 text-2xl font-bold text-gray-900">Welcome to Workzup</h2>
            <p className="mb-8 text-gray-500">The fastest way to find one-day jobs and hire temporary workers</p>

            <button
                onClick={handleGetStarted}
                disabled={loading}
                className="w-full rounded-lg bg-[#6B8BFF] py-3 font-semibold text-white transition hover:bg-[#5A75D9] disabled:opacity-70"
            >
                {loading ? "Loading..." : "Get Started"}
            </button>
        </CenteredCard>
    );
}
