"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { getCurrentMessagingUser } from "@/lib/messaging/api";

const normalizeRole = (role?: string) =>
  String(role || "")
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_");

function MessagesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const routeByRole = async () => {
      try {
        let role = "";

        try {
          const profile = await apiFetch("/api/auth/profile");
          role = normalizeRole(profile?.role || "");
        } catch {
          const user = await getCurrentMessagingUser();
          role = normalizeRole(user?.role || "");
        }

        const query = searchParams?.toString();
        const suffix = query ? `?${query}` : "";

        if (role === "EMPLOYER" || role === "RECRUITER") {
          router.replace(`/recruiter/messages${suffix}`);
          return;
        }

        router.replace(`/jobseeker/messages${suffix}`);
      } catch {
        router.replace("/auth/login?redirectTo=/messages");
      } finally {
        setLoading(false);
      }
    };

    void routeByRole();
  }, [router, searchParams]);

  return (
    <div className="mt-[80px] flex h-[calc(100vh-80px)] items-center justify-center bg-[#f9fafb]">
      <p className="text-gray-500">{loading ? "Opening your messages..." : "Redirecting..."}</p>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="mt-[80px] h-[calc(100vh-80px)] bg-[#f9fafb]" />}>
      <MessagesPageContent />
    </Suspense>
  );
}
