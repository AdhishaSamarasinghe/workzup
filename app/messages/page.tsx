"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiFetch } from "@/lib/api";

const normalizeRole = (role?: string) =>
  String(role || "")
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_");

export default function MessagesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const routeByRole = async () => {
      try {
        const profile = await apiFetch("/api/auth/profile");
        const role = normalizeRole(profile?.role);
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
