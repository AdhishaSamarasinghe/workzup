"use client";

import React, { Suspense, useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import GigFilters from "@/components/gigs/GigFilters";
import GigHeader from "@/components/gigs/GigHeader";
import GigCard from "@/components/gigs/GigCard";
import { apiFetch } from "@/lib/api";
import { formatDateLabel, formatPay } from "@/lib/browse";

type Job = {
    id: string;
    title: string;
    companyName: string;
    description: string;
    location: string;
    pay: number;
    payType: string;
    date: string;
    derivedCategory: string;
    createdAt: string;
};

function FindGigPageContent() {
    const searchParams = useSearchParams();
    const requestedCategory = searchParams.get("category") || "";
    const [jobs, setJobs] = useState<Job[]>([]);
    const [location, setLocation] = useState("");
    const [payRange, setPayRange] = useState<[number, number]>([0, 5000]);
    const [date, setDate] = useState("");
    const [category, setCategory] = useState(requestedCategory || "All Jobs");
    const [availableCategories, setAvailableCategories] = useState<string[]>([]);
    const [maxPayBound, setMaxPayBound] = useState(5000);
    const [sortBy, setSortBy] = useState("Newest");
    const quickCategories = useMemo(
        () => ["All Jobs", ...availableCategories.filter((item) => item && item !== "All Jobs" && item !== "All Categories")],
        [availableCategories]
    );

    const fetchJobs = useCallback(async () => {
        const params = new URLSearchParams();
        if (location) params.append("district", location);
        if (date) params.append("date", date);
        if (category && category !== "All Jobs" && category !== "All Categories") {
            params.append("category", category);
        }

        params.append("minPay", payRange[0].toString());
        params.append("maxPay", payRange[1].toString());

        try {
            const data = await apiFetch(`/api/jobs/public-search?${params.toString()}`);
            setJobs(Array.isArray(data.jobs) ? data.jobs : []);
        } catch (err) {
            console.error("Job Fetch Error:", err);
        }
    }, [location, date, category, payRange]);

    useEffect(() => {
        apiFetch("/api/jobs/public-search")
            .then(data => {
                setAvailableCategories(Array.isArray(data.categories) ? data.categories : []);
                if (data.maxPay) {
                    setMaxPayBound(data.maxPay);
                    setPayRange([0, data.maxPay]);
                }
            })
            .catch(err => console.error("Public Search Meta Fetch Error:", err));
    }, []);

    useEffect(() => {
        const initialFetchTimer = window.setTimeout(() => {
            void fetchJobs();
        }, 0);

        return () => window.clearTimeout(initialFetchTimer);
    }, [fetchJobs]);

    useEffect(() => {
        const initialFetchTimer = window.setTimeout(() => {
            void fetchJobs();
        }, 0);

        return () => window.clearTimeout(initialFetchTimer);
    }, [fetchJobs]);

    const filteredJobs = useMemo(() => {
        const sorted = [...jobs];
        if (sortBy === "Newest") {
            sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        } else if (sortBy === "Oldest") {
            sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        } else if (sortBy === "Pay: High to Low") {
            sorted.sort((a, b) => b.pay - a.pay);
        } else if (sortBy === "Pay: Low to High") {
            sorted.sort((a, b) => a.pay - b.pay);
        }
        return sorted;
    }, [jobs, sortBy]);



    const handleClearFilters = () => {
        setLocation("");
        setPayRange([0, maxPayBound]);
        setDate("");
        setCategory("All Jobs");
    };

    const handleTabChange = (tab: string) => {
        setCategory(tab);
    };

    return (
        <div className="min-h-screen bg-[linear-gradient(180deg,#f5f8ff_0%,#eef3f8_36%,#f7f9fc_100%)] pt-24 pb-12">
            <div className="mx-auto w-full max-w-[1500px] px-4 sm:px-6 lg:px-8">
                <section className="mb-8 rounded-[32px] border border-white/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(240,245,255,0.96))] px-6 py-8 shadow-[0_18px_50px_rgba(15,23,42,0.08)] sm:px-8 lg:px-10">
                    <GigHeader
                        resultCount={filteredJobs.length}
                        activeTab={category}
                        tabs={quickCategories}
                        setActiveTab={handleTabChange}
                        sortBy={sortBy}
                        setSortBy={setSortBy}
                    />
                </section>

                <div className="grid gap-8 xl:grid-cols-[320px_minmax(0,1fr)]">
                    <aside className="xl:self-start">
                        <GigFilters
                            location={location}
                            setLocation={setLocation}
                            payRange={payRange}
                            setPayRange={setPayRange}
                            date={date}
                            setDate={setDate}
                            selectedCategory={category}
                            setSelectedCategory={(value) => setCategory(value || "All Jobs")}
                            onClear={handleClearFilters}
                            minPay={0}
                            maxPay={maxPayBound}
                            categories={availableCategories}
                        />
                    </aside>

                    <section className="rounded-[32px] border border-white/70 bg-white/85 p-4 shadow-[0_18px_50px_rgba(15,23,42,0.06)] backdrop-blur-sm sm:p-6">
                        <div className="min-h-[600px] space-y-5">
                            {filteredJobs.map((job, index) => (
                                <div
                                    key={job.id}
                                    className="animate-pop-in"
                                    style={{ animationDelay: `${index * 100}ms` }}
                                >
                                    <GigCard
                                        title={job.title}
                                        company={job.companyName}
                                        description={job.description}
                                        location={job.location}
                                        pay={formatPay(job.pay, job.payType)}
                                        date={formatDateLabel(job.date)}
                                        category={job.derivedCategory}
                                        id={job.id}
                                    />
                                </div>
                            ))}

                            {filteredJobs.length === 0 && (
                                <div className="animate-fade-in rounded-[28px] border border-dashed border-slate-300 bg-slate-50/70 py-20 text-center text-gray-500 shadow-[0_10px_24px_rgba(15,23,42,0.08)]">
                                    No gigs found matching your criteria.
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}

export default function FindGigPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[linear-gradient(180deg,#f5f8ff_0%,#eef3f8_36%,#f7f9fc_100%)] pt-24 pb-12" />}>
            <FindGigPageContent />
        </Suspense>
    );
}
