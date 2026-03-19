"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { syncOAuthSession } from "@/lib/auth/workzupAuth";

export default function OAuthCompletePage() {
  const router = useRouter();
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const completeOAuthSignIn = async () => {
      try {
        const role =
          typeof window !== "undefined"
            ? localStorage.getItem("workzup:oauth-role") || "JOB_SEEKER"
            : "JOB_SEEKER";

        const payload = await syncOAuthSession(role);
        if (cancelled) {
          return;
        }

        if (typeof window !== "undefined") {
          localStorage.removeItem("workzup:oauth-role");
        }

        if (payload?.role === "EMPLOYER" || payload?.role === "RECRUITER") {
          router.replace("/employer/create-job/my-postings");
          return;
        }

        router.replace("/jobseeker/browse");
      } catch (oauthError) {
        if (!cancelled) {
          setError(
            oauthError instanceof Error
              ? oauthError.message
              : "Failed to complete social sign in.",
          );
        }
      }
    };

    void completeOAuthSignIn();

    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <div className="mt-[80px] flex h-[calc(100vh-80px)] items-center justify-center bg-[#f8fafc] px-6 text-center">
      <div>
        <p className="text-lg font-semibold text-slate-900">
          {error ? "Social sign in failed" : "Completing sign in..."}
        </p>
        <p className="mt-2 text-sm text-slate-500">
          {error || "Please wait while we finish setting up your WorkzUp session."}
        </p>
      </div>
    </div>
  );
}
