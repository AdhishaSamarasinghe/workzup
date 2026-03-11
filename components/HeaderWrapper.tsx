"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Header from "./Header";
import PublicHeader from "./PublicHeader";
import JobSeekerHeader from "./JobSeekerHeader";
import AuthHeader from "./AuthHeader";

export default function HeaderWrapper() {
    const pathname = usePathname();
    const { status } = useSession();
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const hasToken = typeof window !== "undefined" && !!localStorage.getItem("token");
        setIsAuthenticated(status === "authenticated" || hasToken);
    }, [status, pathname]);

    // Show minimal header on login and register pages
    if (pathname.includes("/auth/")) {
        return <AuthHeader />;
    }

    // Show the transparent headers ONLY on the jobseeker/browse page
    if (pathname === "/jobseeker/browse") {
        return isAuthenticated ? <JobSeekerHeader /> : <PublicHeader />;
    }

    const isJobSeekerPage = 
        pathname.startsWith("/jobseeker") || 
        pathname.startsWith("/apply-form") || 
        pathname.startsWith("/applications") || 
        pathname.startsWith("/messages");

    if (isAuthenticated && isJobSeekerPage) {
        return <JobSeekerHeader alwaysSolid={true} />;
    }

    // Fallback to the regular, sticky white background Header for everywhere else
    return <Header />;
}
