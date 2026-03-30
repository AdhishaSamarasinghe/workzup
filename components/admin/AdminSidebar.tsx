"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  ShieldCheck,
  FileText,
  Flag,
  Settings,
  LogOut,
} from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const navItems = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    label: "User Management",
    href: "/admin/users",
    icon: Users,
  },
  {
    label: "Jobs",
    href: "/admin/jobs",
    icon: Briefcase,
  },
  {
    label: "Verification",
    href: "/admin/verifications",
    icon: ShieldCheck,
  },
  {
    label: "Applications",
    href: "/admin/applications",
    icon: FileText,
  },
  {
    label: "Reports",
    href: "/admin/reports",
    icon: Flag,
  },
];

const accountItems = [
  {
    label: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        console.warn("Supabase auth is not configured in this environment.");
        return;
      }
      await supabase.auth.signOut();
      router.replace("/admin/login");
      router.refresh();
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  return (
    <aside className="flex min-h-screen w-[300px] flex-col border-r border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-8 py-8">
        <Image
          src="/logo_main.png"
          alt="WorkzUp"
          width={190}
          height={44}
          priority
          className="h-auto w-auto"
        />
        <p className="mt-1 text-xs font-medium uppercase tracking-[0.35em] text-slate-400">
          Admin Portal
        </p>
      </div>

      <div className="flex-1 px-4 py-6">
        <div>
          <p className="px-4 text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
            Main Menu
          </p>

          <nav className="mt-5 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-4 text-base font-medium transition ${
                    isActive
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-100"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-10">
          <p className="px-4 text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
            Account
          </p>

          <div className="mt-5 space-y-2">
            {accountItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-4 text-base font-medium transition ${
                    isActive
                      ? "bg-slate-100 text-slate-900"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            <button
              type="button"
              onClick={handleSignOut}
              className="btn-primary flex w-full items-center gap-3 px-4 py-4 text-left text-base font-medium transition"
            >
              <LogOut size={20} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 pb-4">
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
          <p className="text-lg font-semibold text-slate-900">System Status</p>
          <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
            <span className="h-3 w-3 rounded-full bg-emerald-500" />
            <span>All systems operational</span>
          </div>
        </div>
      </div>
    </aside>
  );
}