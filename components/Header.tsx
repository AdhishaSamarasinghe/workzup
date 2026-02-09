import Link from "next/link";


export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <span className="text-blue-600">Workzup</span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-700">
          <Link href="/" className="transition-colors hover:text-blue-600">Home</Link>
          <Link href="/jobs" className="transition-colors hover:text-blue-600">Jobs</Link>
          <Link href="/settings" className="transition-colors hover:text-blue-600">Settings</Link>
        </nav>

        <div className="flex items-center gap-4">
          <Link
            href="/settings"
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all shadow-sm"
          >
            My Account
          </Link>
        </div>
      </div>
    </header>
  );
}
