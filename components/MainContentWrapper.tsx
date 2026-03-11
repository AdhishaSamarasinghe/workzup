"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export default function MainContentWrapper({ children }: { children: ReactNode }) {
    const pathname = usePathname();

    // If we are on the browse page (before login), we don't want the top padding
    // so the transparent PublicHeader can overlay the hero video.
    const isPublicRoute = pathname === "/jobseeker/browse";

    return (
        <main className="flex-1">
            {children}
        </main>
    );
}
