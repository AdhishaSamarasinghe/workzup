import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[var(--bg)] border-t border-gray-200">
      <div className="max-w-[var(--max-width)] mx-auto px-10 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Copyright */}
        <p className="text-sm text-gray-700">
          © 2025 Workzup SDGP CS-50. All rights reserved.
        </p>

        {/* Links */}
        <nav className="flex items-center gap-8">
          <Link
            href="/privacy"
            className="text-sm text-gray-700 hover:text-gray-900 transition-colors"
          >
            Privacy
          </Link>
          <Link
            href="/terms"
            className="text-sm text-gray-700 hover:text-gray-900 transition-colors"
          >
            Terms
          </Link>
          <Link
            href="/about"
            className="text-sm text-gray-700 hover:text-gray-900 transition-colors"
          >
            About
          </Link>
        </nav>
      </div>
    </footer>
  );
}
