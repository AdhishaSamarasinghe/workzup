import Image from "next/image";
import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-[#E5E7EB]/50 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 transition-transform hover:scale-105 active:scale-95">
          <Image
            src="/logo_main.png"
            alt="Workzup"
            width={120}
            height={28}
            priority
            className="h-9 w-auto"
          />
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-semibold text-[#374151] lg:flex">
          <Link href="/find-jobs" className="transition-colors hover:text-[#6b8bff]">
            Find Jobs
          </Link>
          <Link href="/post-job" className="transition-colors hover:text-[#6b8bff]">
            Post a Job
          </Link>
          <Link href="/companies" className="transition-colors hover:text-[#6b8bff]">
            Companies
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/auth?type=recruiter"
            className="hidden rounded-full bg-[#4F46E5] px-5 py-2.5 text-xs font-bold tracking-wider text-white transition-all hover:bg-[#4338CA] hover:shadow-lg hover:shadow-indigo-200 active:scale-95 sm:block"
          >
            JOB RECRUITER LOGIN
          </Link>
          <Link
            href="/auth?type=jobseeker"
            className="rounded-full bg-[#6366F1] px-5 py-2.5 text-xs font-bold tracking-wider text-white transition-all hover:bg-[#4F46E5] hover:shadow-lg hover:shadow-indigo-200 active:scale-95"
          >
            JOB SEEKER LOGIN
          </Link>
        </div>
      </div>
    </header>
  );
}
