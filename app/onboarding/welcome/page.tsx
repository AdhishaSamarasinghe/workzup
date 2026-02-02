"use client";

import { useRouter } from "next/navigation";
import CenteredCard from "@/components/CenteredCard";
import { apiFetch } from "@/lib/api";

export default function WelcomePage() {
  const router = useRouter();

  const handleGetStarted = async () => {
    try {
      // If logged in, update onboarding step in backend
      await apiFetch("/api/onboarding/step", {
        method: "PATCH",
        body: JSON.stringify({ step: 1 }),
      });
      router.push("/onboarding/profile-prompt");
    } catch {
      // If not logged in (no token), send to register flow later
      router.push("/auth/register/step-1");
    }
  };

  return (
    <CenteredCard>
      <div className="mb-6 text-4xl font-extrabold">
        <span className="text-blue-500">Work</span>
        <span className="text-slate-900">zup</span>
      </div>

      <h1 className="mb-4 text-3xl font-extrabold text-slate-900">
        Welcome to Workzup
      </h1>

      <p className="mb-8 text-slate-500">
        The fastest way to find one-day jobs and hire temporary workers
      </p>

      <button
        onClick={handleGetStarted}
        className="w-full rounded-xl bg-blue-500 py-4 font-semibold text-white hover:bg-blue-600"
      >
        Get Started
      </button>
    </CenteredCard>
  );
}
