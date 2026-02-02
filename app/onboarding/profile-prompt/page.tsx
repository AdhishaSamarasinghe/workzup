"use client";

import { useRouter } from "next/navigation";
import CenteredCard from "@/components/CenteredCard";
import { apiFetch } from "@/lib/api";

export default function ProfilePromptPage() {
  const router = useRouter();

  const handleSetup = async () => {
    await apiFetch("/api/onboarding/step", {
      method: "PATCH",
      body: JSON.stringify({ step: 2 }),
    });

    // Later you will build this profile setup form page
    router.push("/profile/setup");
  };

  return (
    <CenteredCard>
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border-4 border-blue-500">
        <div className="h-6 w-6 rounded-full bg-blue-500" />
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
        className="w-full rounded-xl bg-blue-500 py-4 font-semibold text-white hover:bg-blue-600"
      >
        Set Up My Profile
      </button>
    </CenteredCard>
  );
}
