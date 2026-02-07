"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function ProfileHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

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
          <Link href="#" className="transition-colors hover:text-accent">
            Find Jobs
          </Link>
          <Link href="#" className="transition-colors hover:text-accent">
            Messages
          </Link>
          <Link href="#" className="transition-colors hover:text-accent">
            Post a Job
          </Link>
        </nav>

        {/* Hamburger for mobile - positioned top-right on small screens */}
        <button
          type="button"
          className="absolute right-4 top-4 z-40 inline-flex md:hidden items-center justify-center rounded-md p-2 text-[#111827] md:static md:ml-3"
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

        {/* Notification & Profile Icons (link placeholders) */}
        <div className="hidden items-center gap-4 md:flex">
          {/* Notification Bell -> link to /messages (placeholder) */}
          <Link href="#" aria-label="Messages">
            <div className="relative flex h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 items-center justify-center rounded-full bg-[#F3F4F6] text-[#1F2937] transition-colors hover:bg-[#E5E7EB]">
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </div>
          </Link>

          {/* Profile Icon -> link to /account (placeholder) */}
          <Link href="#" aria-label="Account">
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 items-center justify-center rounded-full bg-[#F3F4F6] text-[#1F2937] transition-colors hover:bg-[#E5E7EB]">
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
          </Link>
        </div>

        <div className="md:hidden" />
      </div>

      {/* Mobile dropdown menu shown when hamburger is toggled (anchored to button) */}
      {menuOpen && (
        <div className="md:hidden">
          <div className="absolute right-4 top-full mt-2 z-40 w-[220px] rounded-xl border border-[#E5E7EB] bg-card p-3 shadow-lg">
            <nav>
              <Link
                href="#"
                className="block rounded-md px-3 py-2 text-sm font-medium text-[#1F2937] hover:bg-[#F3F4F6]"
                onClick={() => setMenuOpen(false)}
              >
                Find Jobs
              </Link>
              <Link
                href="#"
                className="mt-1 block rounded-md px-3 py-2 text-sm font-medium text-[#1F2937] hover:bg-[#F3F4F6]"
                onClick={() => setMenuOpen(false)}
              >
                Messages
              </Link>
              <Link
                href="#"
                className="mt-1 block rounded-md px-3 py-2 text-sm font-medium text-[#1F2937] hover:bg-[#F3F4F6]"
                onClick={() => setMenuOpen(false)}
              >
                Post a Job
              </Link>
            </nav>
          </div>
        </div>
      )}

      {/* removed static mobile nav; hamburger menu now controls mobile navigation */}
    </header>
  );
}
