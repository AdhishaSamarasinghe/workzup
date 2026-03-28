"use client";

import { usePathname } from "next/navigation";
import { useProfileIdentity } from "@/lib/useProfileIdentity";

export default function Header() {
  const pathname = usePathname();
  const { name, avatarUrl } = useProfileIdentity("Viraj");

  // Hide header for Message and JobChat pages (case-insensitive)
  const path = pathname ? pathname.toLowerCase() : "";
  if (path.startsWith("/message") || path.startsWith("/jobchat")) return null;

  const user = {
    name: name || "Viraj",
    role: "Job Seeker",
    avatarUrl,
  };

    return null;
}
