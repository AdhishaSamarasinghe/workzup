"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  BriefcaseBusiness,
  ShieldCheck,
  FileSearch,
  ClipboardList,
  Settings,
  LogOut,
} from "lucide-react";

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
    icon: BriefcaseBusiness,
  },
  {
    label: "Verification",
    href: "/admin/verifications",
    icon: ShieldCheck,
  },
  {
    label: "Applications",
    href: "/admin/applications",
    icon: ClipboardList,
  },
  {
    label: "Reports",
    href: "/admin/reports",
    icon: FileSearch,
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex min-h-screen w-[270px] flex-col border-r border-slate-200 bg-white">
      <div className="border-b border-slate-100 px-6 py-6">
        <h2 className="text-2xl font-extrabold tracking-tight text-blue-600">
          WORKZUP
        </h2>
        <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
          Admin Portal
        </p>
      </div>

      <div className="px-4 py-5">
        <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
          Main Menu
        </p>

        <nav className="mt-4 space-y-2">
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
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-100"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto border-t border-slate-100 px-4 py-5">
        <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
          Account
        </p>

        <div className="mt-4 space-y-2">
          <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50">
            <Settings size={18} />
            <span>Settings</span>
          </button>

          <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-rose-500 transition hover:bg-rose-50">
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>

        <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
          <p className="text-sm font-semibold text-slate-900">System Status</p>
          <div className="mt-2 flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            <span className="text-xs text-slate-500">All systems operational</span>
          </div>
        </div>
      </div>
    </aside>
  );
}