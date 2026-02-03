"use client";

import React, { useState, useEffect } from "react";
import GigFilters from "@/components/gigs/GigFilters";
import GigHeader from "@/components/gigs/GigHeader";
import GigCard from "@/components/gigs/GigCard";
import Pagination from "@/components/jobs/Pagination";

// Reusing Job type but ensuring it matches backend
type Job = {
    id: number;
    title: string;
    company: string;
    description: string;
    location: string;
    pay: string;
    date: string;
    category: string;
};

export default function FindGigPage() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [filteredJobs, setFilteredJobs] = useState<Job[]>([]); // For client-side sorting if needed

    // Filter States
    const [location, setLocation] = useState("");
    const [payRange, setPayRange] = useState<[number, number]>([0, 500]); // Default Range
    const [date, setDate] = useState("");
    const [category, setCategory] = useState("All Jobs"); // Controlled by both Header Tabs and Sidebar

    // Sort State
    const [sortBy, setSortBy] = useState("Newest");

    // Pagination State
    const [page, setPage] = useState(1);
    const jobsPerPage = 5;

    // Fetch Jobs on Filter Change or Load
    const fetchJobs = () => {
        const params = new URLSearchParams();
        if (location) params.append("district", location); // Using district param as location matches backend
        if (date) params.append("date", date);
        if (category && category !== "All Jobs" && category !== "All Categories") {
            params.append("category", category);
        }

        // Pass min/max pay
        params.append("minPay", payRange[0].toString());
        params.append("maxPay", payRange[1].toString());

        fetch(`http://localhost:5000/jobs?${params.toString()}`)
            .then((res) => res.json())
            .then((data) => {
                setJobs(data);
                setPage(1); // Reset to p1
            })
            .catch(console.error);
    };

    // Initial load
    useEffect(() => {
        fetchJobs();
    }, []); // Run once on mount, then Apply button triggers fetch

    // Handle Sort
    useEffect(() => {
        let sorted = [...jobs];
        if (sortBy === "Newest") {
            // Assuming IDs are timestamp based or we have created_at. 
            // For now using ID desc as proxy for newest
            sorted.sort((a, b) => b.id - a.id);
        } else if (sortBy === "Oldest") {
            sorted.sort((a, b) => a.id - b.id);
        } else if (sortBy === "Pay: High to Low") {
            sorted.sort((a, b) => {
                const payA = parseInt(a.pay.replace(/[^0-9]/g, "")) || 0;
                const payB = parseInt(b.pay.replace(/[^0-9]/g, "")) || 0;
                return payB - payA;
            });
        } else if (sortBy === "Pay: Low to High") {
            sorted.sort((a, b) => {
                const payA = parseInt(a.pay.replace(/[^0-9]/g, "")) || 0;
                const payB = parseInt(b.pay.replace(/[^0-9]/g, "")) || 0;
                return payA - payB;
            });
        }
        setFilteredJobs(sorted);
    }, [jobs, sortBy]);


    // Handlers
    const handleApplyFilters = () => {
        fetchJobs();
    };

    const handleClearFilters = () => {
        setLocation("");
        setPayRange([0, 500]);
        setDate("");
        setCategory("All Jobs");
        // Fetch all (empty params except maybe default range if we wanted)
        fetch("http://localhost:5000/jobs")
            .then(res => res.json())
            .then(data => {
                setJobs(data);
                setPage(1);
            });
    };

    // Sync Category Change from Header
    const handleTabChange = (tab: string) => {
        setCategory(tab);
        // We also want to auto-fetch when tab is clicked for better UX
        // But fetchJobs uses the *current* state. State updates are async.
        // So use a useEffect dependent on category? 
        // Or pass the new category to a helper. 
        // For simplicity, let's rely on the user clicking Apply or handle it via useEffect [category] 
        // IF we want "Live" filtering for category but "Manual" for sidebar. 
        // Let's make Category Tab click trigger fetch immediately.

        // Construct params manually for this specific action to avoid state lag issues
        const params = new URLSearchParams();
        if (location) params.append("district", location);
        if (date) params.append("date", date);
        if (tab !== "All Jobs" && tab !== "All Categories") {
            params.append("category", tab);
        }
        params.append("minPay", payRange[0].toString());
        params.append("maxPay", payRange[1].toString());

        fetch(`http://localhost:5000/jobs?${params.toString()}`)
            .then((res) => res.json())
            .then((data) => {
                setJobs(data);
                setPage(1);
            })
            .catch(console.error);
    };


    /* 📄 PAGINATION LOGIC */
    const start = (page - 1) * jobsPerPage;
    const visibleJobs = filteredJobs.slice(start, start + jobsPerPage);
    const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);


    return (
        <div className="bg-[#f8f9fc] min-h-screen pt-24 pb-8">
            <div className="max-w-7xl mx-auto px-6 flex gap-8">

                {/* SIDEBAR */}
                <div className="w-80 flex-shrink-0">
                    <GigFilters
                        location={location}
                        setLocation={setLocation}
                        payRange={payRange}
                        setPayRange={setPayRange}
                        date={date}
                        setDate={setDate}
                        selectedCategory={category}
                        setSelectedCategory={setCategory}
                        onApply={handleApplyFilters}
                        onClear={handleClearFilters}
                        minPay={0}
                        maxPay={500}
                    />
                </div>

                {/* MAIN CONTENT */}
                <div className="flex-1">
                    <GigHeader
                        resultCount={filteredJobs.length}
                        activeTab={category}
                        setActiveTab={handleTabChange}
                        sortBy={sortBy}
                        setSortBy={setSortBy}
                    />

                    <div className="space-y-4 min-h-[600px]">
                        {visibleJobs.map((job) => (
                            <GigCard key={job.id} {...job} />
                        ))}

                        {visibleJobs.length === 0 && (
                            <div className="text-center py-20 text-gray-500">
                                No gigs found matching your criteria.
                            </div>
                        )}
                    </div>

                    <div className="mt-8">
                        {totalPages > 1 && (
                            <Pagination
                                page={page}
                                totalPages={totalPages}
                                setPage={setPage}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
