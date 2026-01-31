import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-[#E5E7EB] bg-card">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-muted sm:flex-row sm:px-6 lg:px-8">
        <p>© 2025 Workzup SDGP CS-50.  All rights reserved.</p>
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
