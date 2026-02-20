"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import CenteredCard from "@/components/CenteredCard";
import { apiFetch } from "@/lib/api";

import Logo from "@/components/Logo";

export default function ProfilePromptPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSetup = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");

    if (!token) {
      console.warn("No token found - bypassing API call for UI testing");
      router.push("/onboarding/role-selection");
      return;
    }

    try {
      await apiFetch("/api/onboarding/step", {
        method: "PATCH",
        body: JSON.stringify({ step: 2 }),
      });
      // Redirect to role selection
      router.push("/onboarding/role-selection");
    } catch (error) {
      console.error("Failed to update onboarding step:", error);
      // Fallback: assume token might be invalid or something else is wrong
      router.push("/auth/register/step-1");
    } finally {
      setLoading(false);
    }
  };

  return (
    <CenteredCard>
      <div className="mb-6 flex justify-center">
        <Logo />
      </div>
      {/* Icon */}
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border-4 border-[#6B8BFF] bg-white shadow-sm">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-8 w-8 text-[#6B8BFF]"
        >
          <path
            fillRule="evenodd"
            d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z"
            clipRule="evenodd"
          />
        </svg>
      </div>

      <h1 className="mb-4 text-3xl font-extrabold text-slate-900">
        Let’s Set Up Your Profile
      </h1>

      <p className="mb-8 text-slate-500">
        A great profile helps employers find you quickly.
        <br />
        Let’s get you ready for your first gig!
      </p>

      <button
        onClick={handleSetup}
        disabled={loading}
        className="w-full rounded-xl bg-[#6B8BFF] py-4 font-semibold text-white transition hover:bg-[#5A75D9] disabled:opacity-70"
      >
        {loading ? "Loading..." : "Set Up My Profile"}
      </button>
    </CenteredCard>
  );
}
