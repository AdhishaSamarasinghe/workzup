"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";

type AppShellProps = {
  children: ReactNode;
};

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const hideGlobalHeader = pathname?.startsWith("/recruiter");

  return (
    <div className="flex min-h-screen flex-col">
      {!hideGlobalHeader && <Header />}
      <main className={`flex-1 ${hideGlobalHeader ? "" : "pt-16"}`}>{children}</main>
      <Footer />
    </div>
  );
}
