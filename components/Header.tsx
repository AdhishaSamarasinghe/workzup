import Image from "next/image";
import Link from "next/link";

export default function Header() {
  const user = { name: "John Doe", role: "Employer", avatarUrl: "/avatar.png" };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid h-16 grid-cols-[1fr_auto_1fr] items-center">
          {/* Left */}
          <div className="flex items-center justify-start">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/logo_main.png" alt="WorkzUp" width={120} height={28} priority />
            </Link>
          </div>

          {/* Center */}
          <nav className="hidden md:flex items-center gap-8 text-sm text-slate-700">
            <Link href="/dashboard" className="opacity-80 hover:opacity-100">Dashboard</Link>
            <Link href="/employer/create-job/my-postings" className="opacity-80 hover:opacity-100">My postings</Link>
            <Link href="/messages" className="opacity-80 hover:opacity-100">Messages</Link>
            <Link href="/profile" className="opacity-80 hover:opacity-100">Profile</Link>
          </nav>

          {/* Right */}
          <div className="flex items-center justify-end gap-4">
            <Link
              href="/employer/create-job"
              className="btn-primary min-w-[156px] w-fit px-4 h-[44px] text-sm whitespace-nowrap"
            >
              Post a new job
            </Link>

            <Link href="/profile" className="flex items-center gap-3 rounded-xl px-2 py-1 hover:bg-slate-100">
              <div className="h-10 w-10 overflow-hidden rounded-full border border-slate-200 bg-slate-50">
                <Image src={user.avatarUrl} alt={user.name} width={40} height={40} />
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
