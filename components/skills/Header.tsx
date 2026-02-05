"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-bg">
      <div className="mx-auto flex w-full max-w-[var(--max-width)] items-center justify-between px-6 py-4 sm:px-8 lg:px-12">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <div className="relative h-7 w-24 sm:h-8 sm:w-28">
            <Image
              src="/logo_main.png"
              alt="WorkzUp"
              fill
              priority
              className="object-contain"
            />
          </div>
        </Link>

        {/* Right side - Login button and Menu */}
        <div className="relative flex items-center gap-4">
          <Link
            href="#"
            className="rounded-full bg-accent px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-accent/90 sm:px-6 sm:py-2 sm:text-sm"
          >
            Login
          </Link>

          {/* Hamburger button */}
          <button
            type="button"
            onClick={() => setMenuOpen((p) => !p)}
            className="flex h-10 w-10 items-center justify-center text-[#111827]"
            aria-label="Open menu"
            aria-expanded={menuOpen}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          </button>

          {/* Dropdown menu */}
          {menuOpen && (
            <div className="absolute right-0 top-12 w-48 max-w-[85vw] rounded-xl border border-gray-200 bg-white shadow-lg sm:w-56">
              <nav className="flex flex-col p-2 text-sm font-medium text-[#111827]">
                <Link
                  href="#"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg px-3 py-2 hover:bg-gray-100"
                >
                  Home
                </Link>

                <Link
                  href="#"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg px-3 py-2 hover:bg-gray-100"
                >
                  Preferences
                </Link>

                <Link
                  href="#"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg px-3 py-2 hover:bg-gray-100"
                >
                  Recruiter Profile
                </Link>

                <Link
                  href="#"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg px-3 py-2 hover:bg-gray-100"
                >
                  Find Jobs
                </Link>
              </nav>
            </div>
          )}
        </div>
      </div>

      {/* Optional: close menu when clicking outside */}
      {menuOpen && (
        <button
          type="button"
          aria-label="Close menu overlay"
          className="fixed inset-0 z-40 cursor-default bg-transparent"
          onClick={() => setMenuOpen(false)}
        />
      )}
    </header>
  );
}
