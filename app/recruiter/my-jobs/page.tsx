"use client";

import React, { useState, useEffect } from "react";
import MyJobsHeader from "@/components/recruiter/MyJobsHeader";
import MyJobCard from "@/components/recruiter/MyJobCard";

// Helper type matching backend + recruiter extensions
type Job = {
    id: number;
    title: string;
    company: string;
    description: string;
    location: string;
    pay: string;
    date: string;       // The Job Date
    category: string;
    status: string;     // Active, Pending, Completed
    applicants: number; // Total count
    postedDate: string; // Date posted
};

type RawJob = Partial<Job> & {
    id?: number;
    title?: string;
    company?: string;
    description?: string;
    location?: string;
    pay?: string;
    date?: string;
    category?: string;
};

const getMockNewApplicants = (id: number) => (id % 5) + 1;
const getMockTotalApplicants = (id: number) => 5 + (id % 20);

export default function MyJobsPage() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("All Status");
    const [loading, setLoading] = useState(true);

    // Fetch Jobs
    useEffect(() => {
        fetch("http://localhost:5000/jobs")
            .then(res => res.json())
            .then(data => {
                // Ensure data has the new fields (defaults) since legacy data might not
                const apiJobs: RawJob[] = Array.isArray(data) ? data : [];
                const enhancedData: Job[] = apiJobs.map((job, index) => ({
                    id: typeof job.id === "number" ? job.id : index + 1,
                    title: job.title || "Untitled Job",
                    company: job.company || "Unknown Company",
                    description: job.description || "",
                    location: job.location || "Not specified",
                    pay: job.pay || "Not specified",
                    date: job.date || "Not specified",
                    category: job.category || "General",
                    status: job.status || "Active",
                    applicants: job.applicants || 0,
                    postedDate: job.postedDate || "2026-02-01" // Fallback for legacy
                }));
                // In a real app, we would verify the user ID here. 
                // For now, show ALL jobs as "My Jobs"
                setJobs(enhancedData);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error fetching jobs:", err);
                setLoading(false);
            });
    }, []);

    // Client-side Filtering
    const filteredJobs = jobs.filter(job => {
        const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus =
            statusFilter === "All Status" ||
            statusFilter === "" ||
            job.status.toLowerCase() === statusFilter.toLowerCase();

        return matchesSearch && matchesStatus;
    });

    return (
        <div className="bg-[#f7fafc] min-h-screen pt-24 pb-12 px-6">
            <div className="max-w-6xl mx-auto">

                {/* Top Action Bar */}
                <div className="flex justify-end mb-4">
                    {/* Placeholder for 'Post a new job' provided in design, usually sits in nav or here */}
                    {/* The image shows it in top Right next to profile. Assuming NavBar handles it or we add a button here */}
                </div>

                <MyJobsHeader
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    statusFilter={statusFilter}
                    setStatusFilter={setStatusFilter}
                />

                <div className="space-y-4">
                    {loading ? (
                        <div className="text-center py-20 text-gray-400">Loading your jobs...</div>
                    ) : (
                        <>
                            {filteredJobs.map((job) => (
                                <div key={job.id} className="animate-pop-in">
                                    <MyJobCard
                                        title={job.title}
                                        location={job.location}
                                        status={job.status}
                                        newApplicants={getMockNewApplicants(job.id)}
                                        totalApplicants={job.applicants || getMockTotalApplicants(job.id)}
                                        postedDate={job.postedDate}
                                        jobDate={job.date}
                                        pay={job.pay}
                                        onEdit={() => console.log("Edit", job.id)}
                                        onViewApplicants={() => console.log("View Applicants", job.id)}
                                    />
                                </div>
                            ))}

                            {filteredJobs.length === 0 && (
                                <div className="text-center py-20 text-gray-500 bg-white rounded-2xl shadow-sm">
                                    No job postings found matching your criteria.
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
