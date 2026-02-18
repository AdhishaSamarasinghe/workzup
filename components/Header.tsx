"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();

  // Hide header for Message and JobChat pages (case-insensitive)
  const path = pathname ? pathname.toLowerCase() : "";
  if (path.startsWith("/message") || path.startsWith("/jobchat")) return null;

  return (
    <header className="sticky top-0 z-50 border-b border-[#E5E7EB] bg-card/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-6 sm:px-6 lg:px-8">
        <Link href="#" className="-ml-10 flex items-center gap-2">
          <Image
            src="/logo_main.png"
            alt="Workzup"
            width={120}
            height={28}
            priority
            className="h-9 w-auto"
          />
        </Link>

        <nav className="hidden items-center gap-8 text-base font-medium text-[#1F2937] md:flex md:ml-auto">
          <Link href="#" className="transition-colors hover:text-accent">
            Find Jobs
          </Link>
          <Link href="#" className="transition-colors hover:text-accent">
            Post a Job
          </Link>
        </nav>

        <div className="md:hidden" />
      </div>

      <div className="border-t border-[#E5E7EB] bg-card md:hidden">
        <nav className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-3 text-sm font-medium text-[#1F2937] sm:px-6 lg:px-8">
          <Link
            href="#"
            className="rounded-md px-2 py-2 transition-colors hover:bg-[#F3F4F6]"
          >
            Find Jobs
          </Link>
          <Link
            href="#"
            className="rounded-md px-2 py-2 transition-colors hover:bg-[#F3F4F6]"
          >
            Post a Job
          </Link>
        </nav>
      </div>
    </header>
  );
}
