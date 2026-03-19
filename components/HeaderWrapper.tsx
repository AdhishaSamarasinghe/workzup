"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";
import PublicHeader from "./PublicHeader";
import AuthHeader from "./AuthHeader";
import JobSeekerHeader from "./JobSeekerHeader";
import EditRecruiterHeader from "./editrecruiter/Header";
import { useWorkzupAuth } from "@/lib/auth/useWorkzupAuth";


export default function HeaderWrapper() {
    const pathname = usePathname();
    const { isAuthenticated } = useWorkzupAuth();

    // Hide header for admin routes
    if (pathname.startsWith("/admin")) {
        return null;
    }

    // Show minimal header on login and register pages
    if (pathname.includes("/auth/")) {
        return <AuthHeader />;
    }

    // Marketing pages use the public navigation bar.
    if (pathname === "/about" || pathname === "/help") {
        return <PublicHeader alwaysSolid={true} />;
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

    // Show the Recruiter/Employer Header for employer/recruiter dashboard routes
    if (pathname?.startsWith("/employer") || pathname?.startsWith("/recruiter")) {
        return <EditRecruiterHeader />;
    }

    // Fallback to the regular, sticky white background Header for everywhere else
    return <Header />;
}
