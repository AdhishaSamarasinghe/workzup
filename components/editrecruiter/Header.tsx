"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import MessagesBadge from '@/components/chat/MessagesBadge';
import { LogOut } from "lucide-react";
import ProfileAvatar from "@/components/ProfileAvatar";
import { useProfileIdentity } from "@/lib/useProfileIdentity";
import { signOutWorkzupAuth } from "@/lib/auth/workzupAuth";

export default function EditRecruiterHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const fallbackName = "Recruiter";
  const { avatarUrl, name } = useProfileIdentity(fallbackName);
  const userName = name || fallbackName;

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!dropdownRef.current) return;
      if (!dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [dropdownOpen]);

  const handleLogout = async () => {
    await signOutWorkzupAuth();
    window.location.href = "/auth/login/recruiter";
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[#E5E7EB] bg-card/90 backdrop-blur relative">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-6 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="relative h-7 w-24 sm:h-9 sm:w-28">
            <Image
              src="/logo_main.png"
              alt="Workzup"
              fill
              priority
              className="object-contain"
            />
          </div>
        </Link>

        <nav className="hidden items-center gap-8 text-base font-medium text-[#1F2937] md:flex md:ml-auto md:mr-8">
          <Link href="/employer/create-job/my-postings" className="transition-colors hover:text-accent">
            Dashboard
          </Link>
          <Link href="/recruiter/messages" className="transition-colors hover:text-accent">
            <MessagesBadge />
          </Link>
        </nav>

        {/* Hamburger for mobile */}
        <button
          type="button"
          className="absolute right-4 top-4 z-40 inline-flex md:hidden items-center justify-center rounded-md p-2 text-[#111827]"
          aria-label="Open menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            {menuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>

        {/* Profile Dropdown Area */}
        <div ref={dropdownRef} className="relative hidden md:block">
          <button
            type="button"
            onClick={() => setDropdownOpen((open) => !open)}
            className="flex items-center gap-2 rounded-full p-1 transition-all duration-300 hover:bg-slate-100"
            aria-expanded={dropdownOpen}
            aria-label="Account menu"
          >
            <div className="h-9 w-9 md:h-10 md:w-10 overflow-hidden rounded-full border border-slate-200 bg-slate-50 flex items-center justify-center shadow-sm">
              <ProfileAvatar
                src={avatarUrl}
                name={userName}
                size={40}
                textClassName="text-sm"
              />
            </div>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white py-2 shadow-lg ring-1 ring-black/5 flex flex-col items-start overflow-hidden">
              <div className="px-4 py-2 border-b border-slate-100 w-full mb-1">
                <p className="text-sm font-semibold truncate text-slate-800">{userName}</p>
                <p className="text-xs text-slate-500">Job Recruiter</p>
              </div>
              <Link
                href="/recruiterprofile"
                className="block w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                onClick={() => setDropdownOpen(false)}
              >
                My Profile
              </Link>
              <Link
                href="/editrecruiter"
                className="block w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                onClick={() => setDropdownOpen(false)}
              >
                Settings
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 text-left mt-1 border-t border-slate-100"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>

        <div className="md:hidden" />
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t border-[#E5E7EB] bg-card md:hidden">
          <nav className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-3 text-sm font-medium text-[#1F2937] sm:px-6 lg:px-8">
            <Link
              href="/employer/create-job/my-postings"
              className="rounded-md px-2 py-2 transition-colors hover:bg-[#F3F4F6]"
              onClick={() => setMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              href="/recruiter/messages"
              className="rounded-md px-2 py-2 transition-colors hover:bg-[#F3F4F6]"
              onClick={() => setMenuOpen(false)}
            >
              <MessagesBadge />
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
