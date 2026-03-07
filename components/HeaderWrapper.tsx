"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";
import PublicHeader from "./PublicHeader";

export default function HeaderWrapper() {
    const pathname = usePathname();

    // Show the transparent PublicHeader ONLY on the before-login jobseeker/browse page
    if (pathname === "/jobseeker/browse") {
        return <PublicHeader />;
    }

    // Fallback to the regular, sticky white background Header for everywhere else
    return <Header />;
}
