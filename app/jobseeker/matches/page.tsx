"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { BrowseJob } from "@/lib/browse";
import { RecommendedJobsSection } from "@/components/jobs/BrowseHomepageSections";
import { Loader2, Sparkles, Cpu } from "lucide-react";
import { useWorkzupAuth } from "@/lib/auth/useWorkzupAuth";

export default function AIMatchesPage() {
    const { loading: authLoading, isAuthenticated } = useWorkzupAuth();
    const router = useRouter();
    const [recommendedJobs, setRecommendedJobs] = useState<(BrowseJob & { matchScore?: number })[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        const fetchRecommendations = async () => {
            if (authLoading) return;
            if (!isAuthenticated) {
                router.push("/auth/login?redirectTo=/jobseeker/matches");
                return;
            }

            try {
                setIsLoading(true);
                const data = await apiFetch("/api/jobs/recommendations/ai");
                if (isMounted && Array.isArray(data)) {
                    setRecommendedJobs(data);
                }
            } catch (err) {
                console.error("Failed to fetch AI recommendations", err);
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        fetchRecommendations();
        return () => { isMounted = false; };
    }, [authLoading, isAuthenticated, router]);

    const handleJobClick = (jobId: string) => {
        window.open(`/jobseeker/jobs/${jobId}`, "_blank");
    };

    return (
        <div className="min-h-screen bg-[linear-gradient(180deg,#f5f8ff_0%,#eef3f8_36%,#f7f9fc_100%)] pt-24 pb-12">
            <div className="mx-auto w-full max-w-[1500px] px-4 sm:px-6 lg:px-8">
                <div className="relative mb-8 overflow-hidden rounded-[32px] border border-white/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(240,245,255,0.96))] px-6 py-8 shadow-[0_18px_50px_rgba(15,23,42,0.08)] sm:px-8 lg:px-10">
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between max-w-4xl gap-6">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-4 py-1.5 mb-4 shadow-sm">
                                <Sparkles className="h-4 w-4 text-indigo-500" />
                                <span className="text-sm font-semibold tracking-wide text-indigo-700 uppercase">Powered by WorkzUp AI</span>
                            </div>
                            <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
                                Your <span className="bg-gradient-to-r from-indigo-500 to-blue-500 bg-clip-text text-transparent">AI Matches</span>
                            </h1>
                            <p className="mt-3 text-lg leading-7 text-slate-500 max-w-2xl">
                                We&apos;ve analyzed your profile, skills, and CV to find the perfect gigs that align with your unique expertise.
                            </p>
                        </div>
                        <div className="hidden md:flex h-24 w-24 items-center justify-center rounded-full border border-indigo-100 bg-white shadow-sm">
                            <Cpu className="h-12 w-12 text-indigo-400" />
                        </div>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex min-h-[400px] items-center justify-center rounded-[32px] border border-white/70 bg-white/85 shadow-[0_18px_50px_rgba(15,23,42,0.06)] backdrop-blur-sm">
                        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                    </div>
                ) : (
                    <div className="rounded-[32px] border border-white/70 bg-white/85 p-2 shadow-[0_18px_50px_rgba(15,23,42,0.06)] backdrop-blur-sm sm:p-4">
                        <RecommendedJobsSection jobs={recommendedJobs} onJobClick={handleJobClick} />
                    </div>
                )}
            </div>
        </div>
    );
}
