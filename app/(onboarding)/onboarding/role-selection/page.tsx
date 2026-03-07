"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import CenteredCard from "@/components/CenteredCard";
import RoleCard from "@/components/RoleCard";
import { apiFetch } from "@/lib/api";

import Logo from "@/components/Logo";

export default function RoleSelectionPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleRoleSelect = async (role: "JOB_SEEKER" | "EMPLOYER") => {
        setLoading(true);
        const token = localStorage.getItem("token");

        if (!token) {
            // router.push("/auth/register/step-1");
            // return;
            console.warn("No token found - bypassing API calls for UI testing");

            // 3. Redirect based on role (Bypass persistence)
            if (role === "JOB_SEEKER") {
                router.push("/auth/register/job-seeker");
            } else {
                router.push("/auth/register/recruiter");
            }
            return;
        }

        try {
            // 1. Persist Role
            await apiFetch("/api/auth/role", {
                method: "PATCH",
                body: JSON.stringify({ role }),
            });

            // 2. Update Onboarding Step
            await apiFetch("/api/onboarding/step", {
                method: "PATCH",
                body: JSON.stringify({ step: 3 }),
            });

            // 3. Redirect based on role
            if (role === "JOB_SEEKER") {
                router.push("/auth/register/job-seeker");
            } else {
                router.push("/auth/register/recruiter");
            }
        } catch (error) {
            console.error("Failed to update role:", error);
            // Fallback
            router.push("/auth/register/step-1");
        } finally {
            setLoading(false);
        }
    };

    return (
        <CenteredCard className="max-w-xl"> {/* Slightly wider for role cards */}
            <div className="mb-6 flex justify-center">
                <Logo />
            </div>

            <h1 className="mb-6 text-center text-3xl font-extrabold text-slate-900">
                How will you be using Workzup?
            </h1>
            <p className="mb-8 text-center text-slate-500">
                Select an option below to personalize your experience.
            </p>

            <div className="flex flex-col gap-4">
                <RoleCard
                    title="I am a Job Seeker"
                    description="Find flexible, one-day jobs and get paid quickly"
                    icon={
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="h-6 w-6 text-blue-500"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z"
                            />
                        </svg>
                    }
                    onClick={() => handleRoleSelect("JOB_SEEKER")}
                    disabled={loading}
                />

                <RoleCard
                    title="I am a Employer"
                    description="Hire reliable, on-demand workers for your short-term needs"
                    icon={
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="h-6 w-6 text-emerald-500"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z"
                            />
                        </svg>
                    }
                    onClick={() => handleRoleSelect("EMPLOYER")}
                    disabled={loading}
                />
            </div>
        </CenteredCard>
    );
}
