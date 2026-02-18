"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();

  // Hide footer for Message and JobChat pages (case-insensitive)
  const path = pathname ? pathname.toLowerCase() : "";
  if (path.startsWith("/message") || path.startsWith("/jobchat")) return null;

  return (
    <footer className="border-t border-[#E5E7EB] bg-card">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-muted sm:flex-row sm:px-6 lg:px-8">
        <p>© 2025 Workzup SDGP CS-50. All rights reserved.</p>
        <div className="flex items-center gap-6">
          <Link href="#" className="transition-colors hover:text-accent">
            Privacy
          </Link>
          <Link href="#" className="transition-colors hover:text-accent">
            Terms
          </Link>
          <Link href="#" className="transition-colors hover:text-accent">
            About
          </Link>
        </div>
      </div>
    </footer>
  );
}
