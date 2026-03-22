"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

function normalizeRole(role: unknown) {
  return String(role || "")
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_");
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const isLoginRoute = pathname === "/admin/login";

  useEffect(() => {
    if (isLoginRoute) {
      return;
    }

    let mounted = true;

    async function verifySession() {
      const supabase = getSupabaseBrowserClient();

      if (!supabase) {
        if (mounted) {
          router.replace("/admin/login");
        }
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) return;

      if (!session?.access_token) {
        router.replace("/admin/login");
        return;
      }

      const { data: userData } = await supabase.auth.getUser();
      const role =
        userData.user?.app_metadata?.role || userData.user?.user_metadata?.role;

      if (role && normalizeRole(role) !== "ADMIN") {
        router.replace("/");
        return;
      }

      setReady(true);
    }

    verifySession();

    return () => {
      mounted = false;
    };
  }, [isLoginRoute, router]);

  if (isLoginRoute) {
    return <>{children}</>;
  }

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 text-sm text-slate-500">
        Loading admin panel...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-100">
      <AdminSidebar />
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
