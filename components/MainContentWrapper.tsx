"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export default function MainContentWrapper({ children }: { children: ReactNode }) {
    const pathname = usePathname();

    // If we are on the browse page (before login), we don't want the top padding
    // so the transparent PublicHeader can overlay the hero video.
    const isBrowseHero = pathname === "/jobseeker/browse";
    const isAuthRoute = pathname.includes("/auth/");
    const isFixedHeaderRoute =
        isAuthRoute ||
        pathname === "/about" ||
        (pathname.startsWith("/jobseeker") && !isBrowseHero) ||
        pathname.startsWith("/apply-form") ||
        pathname.startsWith("/applications") ||
        pathname.startsWith("/messages") && !pathname.startsWith("/admin");

    return (
        <main className={`flex-1 ${isFixedHeaderRoute ? "pt-20" : ""}`}>
            {children}
        </main>
    );
}
