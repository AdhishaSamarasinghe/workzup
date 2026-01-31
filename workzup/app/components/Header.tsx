"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[var(--bg)]">
      <div className="max-w-[var(--max-width)] mx-auto px-4 sm:px-6 md:px-10 py-3 sm:py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image
            src="/logo_main.png"
            alt="WorkzUp Logo"
            width={100}
            height={32}
            priority
            className="h-6 sm:h-7 md:h-8 w-auto object-contain"
          />
        </Link>

        {/* Right side - Login button and Menu */}
        <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
          <Link
            href="/login"
            className="bg-[var(--accent)] text-[var(--card)] px-4 sm:px-5 md:px-6 py-1.5 sm:py-2 rounded-full font-medium text-xs sm:text-sm hover:opacity-90 transition-all"
          >
            Login
          </Link>

          {/* Hamburger Menu - 3 lines */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex flex-col justify-center gap-[4px] sm:gap-[5px] p-1.5 sm:p-1"
            aria-label="Toggle menu"
          >
            <span className="w-5 sm:w-6 h-[2px] bg-gray-800 transition-transform"></span>
            <span className="w-5 sm:w-6 h-[2px] bg-gray-800 transition-opacity"></span>
            <span className="w-5 sm:w-6 h-[2px] bg-gray-800 transition-transform"></span>
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-white shadow-lg border-t border-gray-100 animate-fadeIn">
          <nav className="max-w-[var(--max-width)] mx-auto px-4 sm:px-6 py-3 sm:py-4">
            <ul className="flex flex-col gap-1 sm:gap-2">
              <li>
                <Link
                  href="/"
                  className="block py-2.5 sm:py-2 px-3 sm:px-4 hover:bg-gray-50 active:bg-gray-100 rounded-lg text-gray-700 font-medium text-sm sm:text-base"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/jobs"
                  className="block py-2.5 sm:py-2 px-3 sm:px-4 hover:bg-gray-50 active:bg-gray-100 rounded-lg text-gray-700 font-medium text-sm sm:text-base"
                >
                  Find Jobs
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="block py-2.5 sm:py-2 px-3 sm:px-4 hover:bg-gray-50 active:bg-gray-100 rounded-lg text-gray-700 font-medium text-sm sm:text-base"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="block py-2.5 sm:py-2 px-3 sm:px-4 hover:bg-gray-50 active:bg-gray-100 rounded-lg text-gray-700 font-medium text-sm sm:text-base"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
}
