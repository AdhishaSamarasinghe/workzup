"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`
        fixed top-0 left-0 w-full z-50 transition-all duration-300
        ${
          scrolled
            ? "bg-white/70 backdrop-blur-md shadow-sm"
            : "bg-transparent"
        }
      `}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-xl font-semibold">
          Work<span className="text-black">z</span>up
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-6 text-sm font-medium">
          <Link href="/jobs" className="hover:text-blue-600 transition">
            Find Jobs
          </Link>
          <Link href="/post-job" className="hover:text-blue-600 transition">
            Post a Job
          </Link>
        </nav>
      </div>
    </header>
  );
}
