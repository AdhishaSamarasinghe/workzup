"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ProfileAvatar from "./ProfileAvatar";
import { useProfileIdentity } from "@/lib/useProfileIdentity";
import MessagesBadge from '@/components/chat/MessagesBadge';

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

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* logo | nav | actions */}
        <div className="grid h-16 grid-cols-[1fr_auto_1fr] items-center">

          {/* Left — Logo */}
          <div className="flex items-center justify-start">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/logo_main.png" alt="WorkzUp" width={120} height={28} priority />
            </Link>
          </div>

          {/* Center — Primary nav links (hidden on mobile) */}
          <nav className="hidden md:flex items-center gap-8 text-sm text-slate-700">
            <Link href="/employer/create-job/my-postings" className="opacity-80 hover:opacity-100">Dashboard</Link>
            {/* My postings links directly to the employer job list */}
            <Link href="/employer/create-job/my-postings" className="opacity-80 hover:opacity-100">My postings</Link>
            <Link href="/messages" className="opacity-80 hover:opacity-100"><MessagesBadge /></Link>
          </nav>

          {/* Right — CTA button + user avatar */}
          <div className="flex items-center justify-end gap-4">
            {/* Primary CTA navigates to the create-job form */}
            <Link
              href="/employer/create-job"
              className="btn-primary min-w-[156px] w-fit px-4 h-[44px] text-sm whitespace-nowrap"
            >
              Post a new job
            </Link>

            {/* Avatar links to profile page */}
            <Link href="/profile" className="flex items-center gap-3 rounded-xl px-2 py-1 hover:bg-slate-100">
              <div className="h-10 w-10 overflow-hidden rounded-full border border-slate-200 bg-slate-50 flex items-center justify-center">
                <ProfileAvatar
                  src={user.avatarUrl}
                  name={user.name}
                  size={40}
                  textClassName="text-sm"
                />
              </div>
              <div className="hidden sm:block leading-tight">
                <div className="text-sm font-semibold text-slate-900">{user.name}</div>
                <div className="text-xs text-slate-500">{user.role}</div>
              </div>
            </Link>
          </div>

        </div>
      </div>
    </header>
  );
}
