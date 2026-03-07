"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";

// [DATA] Types based on API responses
interface ApplicantItem {
    applicationId: string;
    applicantId: string;
    name: string;
    title: string;
    avatarUrl?: string;
    matchScore: number;
    relevantSkillsCount: number;
    status: string;
    appliedAt: string;
}

interface ApplicantProfile {
    _id: string;
    name: string;
    title: string;
    avatarUrl?: string;
    summary: string;
    skills: string[];
    email: string;
    phone: string;
    resumeUrl: string;
    portfolioUrl: string;
}

export default function JobApplicantsPage() {
    const params = useParams();
    const router = useRouter();
    const jobId = params.id as string;
    const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

    // [STATE] Left Column State
    const [applicants, setApplicants] = useState<ApplicantItem[]>([]);
    const [totalItems, setTotalItems] = useState(0);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [sortMethod, setSortMethod] = useState("match_desc");

    // [STATE] Right Column (Selected Profile) State
    const [selectedApplicantId, setSelectedApplicantId] = useState<string | null>(null);
    const [applicantProfile, setApplicantProfile] = useState<ApplicantProfile | null>(null);
    const [profileLoading, setProfileLoading] = useState(false);
    const [jobDetails, setJobDetails] = useState({ title: "Loading..." });

    // [API] Fetch Applicants List
    useEffect(() => {
        if (!jobId) return;

        const fetchApplicants = async () => {
            setLoading(true);
            try {
                const queryParams = new URLSearchParams({
                    q: searchQuery,
                    status: statusFilter,
                    sort: sortMethod,
                    page: "1",
                    limit: "8"
                }).toString();

                const res = await fetch(`${API_BASE}/api/recruiter/jobs/${jobId}/applicants?${queryParams}`);
                if (!res.ok) throw new Error("Failed to fetch applicants");
                const data = await res.json();

                setApplicants(data.items);
                setTotalItems(data.totalItems);
                if (data.job) {
                    setJobDetails(data.job);
                }

                // Auto-select first applicant if list is not empty and none selected or list changed
                if (data.items.length > 0) {
                    // Always select the first one when search/filter changes
                    setSelectedApplicantId(data.items[0].applicantId);
                } else {
                    setSelectedApplicantId(null);
                    setApplicantProfile(null);
                }
            } catch (error) {
                console.error("Error:", error);
            } finally {
                setLoading(false);
            }
        };

        // Debounce search
        const timeoutId = setTimeout(() => {
            fetchApplicants();
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [jobId, API_BASE, searchQuery, statusFilter, sortMethod]);

    // [API] Fetch Full Profile
    useEffect(() => {
        if (!selectedApplicantId) {
            setApplicantProfile(null);
            return;
        }

        const fetchProfile = async () => {
            setProfileLoading(true);
            try {
                const res = await fetch(`${API_BASE}/api/recruiter/applicants/${selectedApplicantId}`);
                if (!res.ok) throw new Error("Failed to fetch profile");
                const data = await res.json();
                setApplicantProfile(data);
            } catch (error) {
                console.error("Error:", error);
            } finally {
                setProfileLoading(false);
            }
        };

        fetchProfile();
    }, [selectedApplicantId, API_BASE]);

    // [ACTIONS] Update Application Status
    const updateStatus = async (status: string) => {
        // We need the applicationId, not just applicantId.
        // Find the application ID in the list.
        const applicantItem = applicants.find(a => a.applicantId === selectedApplicantId);
        if (!applicantItem) return;

        try {
            const res = await fetch(`${API_BASE}/api/recruiter/applications/${applicantItem.applicationId}/status`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status })
            });

            if (!res.ok) throw new Error("Failed to update status");

            // Update local state to reflect change without refetching entire list
            setApplicants(prev => prev.map(app =>
                app.applicationId === applicantItem.applicationId
                    ? { ...app, status }
                    : app
            ));

        } catch (error) {
            console.error("Error updating status:", error);
            alert("Failed to update status");
        }
    };

    const handleMessage = () => {
        console.log("Messaging applicant:", applicantProfile?.name);
    };

    // [UI] Helper: Status Badge Colors
    const getStatusStyles = (status: string) => {
        switch (status) {
            case "NEW": return "bg-gray-100 text-gray-600";
            case "CONTACTED": return "bg-green-100 text-green-700";
            case "SHORTLISTED": return "bg-blue-100 text-blue-700";
            case "HIRED": return "bg-emerald-100 text-emerald-800";
            case "REJECTED": return "bg-red-100 text-red-700";
            default: return "bg-gray-100 text-gray-600";
        }
    };

    // [UI] Helper: Format Status Display
    const formatStatusDisplay = (status: string) => {
        return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] p-8 font-sans">
            <div className="max-w-7xl mx-auto">
                {/* [UI] Breadcrumb & Header */}
                <div className="text-sm text-gray-500 mb-4 font-medium">
                    Dashboard / Jobs / {jobDetails.title} / Applicants
                </div>

                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">{jobDetails.title} - Applicants</h1>
                        <p className="text-gray-600">Showing {applicants.length} of {totalItems} applicants</p>
                    </div>
                    <button
                        onClick={() => console.log("Add applicant clicked")}
                        className="bg-[#5c7cfa] hover:bg-[#4c6bf0] text-white px-5 py-2.5 rounded-lg font-medium transition-colors"
                    >
                        + Add applicant
                    </button>
                </div>

                <div className="flex gap-6">
                    {/* [UI] Left Column: List */}
                    <div className="flex-1">
                        {/* Filters Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
                            {/* Search Bar */}
                            <div className="relative mb-5">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                                </span>
                                <input
                                    type="text"
                                    placeholder="Search by name or keyword......"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-gray-100 text-gray-900 rounded-full py-3.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-[#5c7cfa] focus:bg-white transition-colors"
                                />
                            </div>

                            {/* Dropdowns */}
                            <div className="flex gap-4">
                                <div className="relative">
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="appearance-none bg-gray-200 text-sm font-medium text-gray-700 py-2.5 pl-4 pr-10 rounded-full focus:outline-none cursor-pointer"
                                    >
                                        <option value="ALL">Status : All</option>
                                        <option value="NEW">Status : New</option>
                                        <option value="CONTACTED">Status : Contacted</option>
                                        <option value="SHORTLISTED">Status : Shortlisted</option>
                                        <option value="HIRED">Status : Hired</option>
                                        <option value="REJECTED">Status : Rejected</option>
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                    </div>
                                </div>

                                <div className="relative">
                                    <select
                                        value={sortMethod}
                                        onChange={(e) => setSortMethod(e.target.value)}
                                        className="appearance-none bg-gray-200 text-sm font-medium text-gray-700 py-2.5 pl-4 pr-10 rounded-full focus:outline-none cursor-pointer"
                                    >
                                        <option value="match_desc">Sort by : Match Score</option>
                                        <option value="name_asc">Sort by : Name</option>
                                        <option value="newest">Sort by : Newest</option>
                                        <option value="oldest">Sort by : Oldest</option>
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Applicants List */}
                        {loading ? (
                            <div className="text-center py-12">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#5c7cfa]"></div>
                            </div>
                        ) : applicants.length === 0 ? (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center text-gray-500">
                                No applicants found matching your criteria.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {applicants.map((app) => (
                                    <div
                                        key={app.applicationId}
                                        onClick={() => setSelectedApplicantId(app.applicantId)}
                                        className={`bg-white rounded-xl shadow-sm border p-4 flex items-center justify-between cursor-pointer transition-all ${selectedApplicantId === app.applicantId
                                            ? 'border-[#5c7cfa] ring-1 ring-[#5c7cfa]'
                                            : 'border-transparent hover:border-gray-200'
                                            }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="relative h-14 w-14 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                                                {app.avatarUrl && !app.avatarUrl.includes("placeholder") ? (
                                                    <Image src={app.avatarUrl} alt={app.name} layout="fill" objectFit="cover" />
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center text-xl text-gray-500 font-bold bg-gray-200">
                                                        {app.name.charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="text-[17px] font-bold text-gray-900">{app.name}</h3>
                                                <p className="text-[15px] text-gray-600 mt-1.5">
                                                    {app.matchScore}% Match | {app.relevantSkillsCount} relevant skills
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 sm:gap-6">
                                            <span className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusStyles(app.status)}`}>
                                                {formatStatusDisplay(app.status)}
                                            </span>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    router.push(`/recruiter/applications/${app.applicationId}`);
                                                }}
                                                className="text-[#647DF5] hover:underline font-semibold text-sm"
                                            >
                                                View
                                            </button>
                                            <span className="text-gray-400 font-medium hidden sm:inline">›</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* [UI] Right Column: Profile Panel */}
                    {selectedApplicantId && (
                        <div className="w-[420px] flex-shrink-0">
                            <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-8 sticky top-8">
                                {profileLoading || !applicantProfile ? (
                                    <div className="text-center py-12">
                                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#5c7cfa]"></div>
                                    </div>
                                ) : (
                                    <>
                                        {/* Avatar & Info */}
                                        <div className="flex flex-col items-center text-center mb-8">
                                            <div className="relative h-28 w-28 rounded-full overflow-hidden mb-4 bg-gray-200">
                                                {applicantProfile.avatarUrl ? (
                                                    <Image src={applicantProfile.avatarUrl} alt={applicantProfile.name} layout="fill" objectFit="cover" />
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center text-3xl text-gray-500 font-bold bg-gray-200">
                                                        {applicantProfile.name.charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                            <h2 className="text-2xl font-bold text-gray-900">{applicantProfile.name}</h2>
                                            <p className="text-lg text-gray-600">{applicantProfile.title}</p>
                                        </div>

                                        {/* Primary Actions */}
                                        <div className="flex gap-4 mb-8">
                                            <button
                                                onClick={handleMessage}
                                                className="flex-1 bg-[#5c7cfa] hover:bg-[#4c6bf0] text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                                                Message
                                            </button>
                                            <button
                                                onClick={() => updateStatus("HIRED")}
                                                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                                                Hire
                                            </button>
                                        </div>

                                        <div className="space-y-6">
                                            {/* Summary */}
                                            <div>
                                                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3">SUMMARY</h3>
                                                <p className="text-[15px] text-gray-700 leading-relaxed font-medium">
                                                    {applicantProfile.summary}
                                                </p>
                                            </div>

                                            <hr className="border-gray-100" />

                                            {/* Skills */}
                                            <div>
                                                <h3 className="text-[16px] font-bold text-gray-900 mb-3">Key skills</h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {applicantProfile.skills.map((skill, index) => (
                                                        <span key={index} className="px-4 py-1.5 bg-[#dbe4ff] text-[#4263eb] text-[13px] font-bold rounded-full">
                                                            {skill}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            <hr className="border-gray-100" />

                                            {/* Contact Info */}
                                            <div>
                                                <h3 className="text-[16px] font-bold text-gray-900 mb-3">Contact Info</h3>
                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-3 text-gray-600 text-[15px] font-medium">
                                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path></svg>
                                                        {applicantProfile.email}
                                                    </div>
                                                    <div className="flex items-center gap-3 text-gray-600 text-[15px] font-medium">
                                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path></svg>
                                                        {applicantProfile.phone}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Quick Links */}
                                            <div>
                                                <h3 className="text-[16px] font-bold text-gray-900 mb-3">Quick Links</h3>
                                                <div className="space-y-3">
                                                    <a href={applicantProfile.resumeUrl} className="flex items-center gap-3 text-gray-500 hover:text-gray-800 text-[15px] font-medium transition-colors">
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                                        Download resume
                                                    </a>
                                                    <a href={applicantProfile.portfolioUrl} className="flex items-center gap-3 text-gray-500 hover:text-gray-800 text-[15px] font-medium transition-colors">
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
                                                        View portfolio
                                                    </a>
                                                </div>
                                            </div>

                                            {/* Reject Button */}
                                            <div className="pt-6 border-t border-gray-100">
                                                <button
                                                    onClick={() => updateStatus("REJECTED")}
                                                    className="w-full bg-[#ffe3e3] hover:bg-[#ffc9c9] text-[#fa5252] font-bold py-3 rounded-lg transition-colors text-[14px]"
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

