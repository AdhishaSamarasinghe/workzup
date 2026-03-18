"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

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
    email?: string;
    phone?: string;
    resumeUrl?: string;
    portfolioUrl?: string;
}

export default function JobApplicantsPage() {
    const params = useParams();
    const router = useRouter();
    const jobId = params.id as string;

    // [STATE] Left Column State
    const [applicants, setApplicants] = useState<ApplicantItem[]>([]);
    const [totalItems, setTotalItems] = useState(0);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [sortMethod, setSortMethod] = useState("match_desc");
    const [errorMsg, setErrorMsg] = useState("");

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
            setErrorMsg("");
            try {
                const queryParams = new URLSearchParams({
                    q: searchQuery,
                    status: statusFilter,
                    sort: sortMethod,
                    page: "1",
                    limit: "8"
                }).toString();

                const data = await apiFetch(`/api/recruiter/jobs/${jobId}/applicants?${queryParams}`);

                setApplicants(data.items);
                setTotalItems(data.totalItems);
                if (data.job) {
                    setJobDetails(data.job);
                }

                // Auto-select first applicant if list is not empty and none selected or list changed
                if (data.items.length > 0) {
                    setSelectedApplicantId(data.items[0].applicantId);
                } else {
                    setSelectedApplicantId(null);
                    setApplicantProfile(null);
                }
            } catch (error: any) {
                console.error("Error:", error);
                setErrorMsg(error.message || "Failed to load applicants");
            } finally {
                setLoading(false);
            }
        };

        // Debounce search
        const timeoutId = setTimeout(() => {
            fetchApplicants();
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [jobId, searchQuery, statusFilter, sortMethod]);

    // [API] Fetch Full Profile
    useEffect(() => {
        if (!selectedApplicantId) {
            setApplicantProfile(null);
            return;
        }

        const fetchProfile = async () => {
            setProfileLoading(true);
            try {
                const data = await apiFetch(`/api/recruiter/applicants/${selectedApplicantId}`);
                setApplicantProfile(data);
            } catch (error: any) {
                console.error("Error:", error);
                setErrorMsg(error.message || "Failed to load profile");
            } finally {
                setProfileLoading(false);
            }
        };

        fetchProfile();
    }, [selectedApplicantId]);

    // [ACTIONS] Update Application Status
    const updateStatus = async (status: string) => {
        // We need the applicationId, not just applicantId.
        // Find the application ID in the list.
        const applicantItem = applicants.find(a => a.applicantId === selectedApplicantId);
        if (!applicantItem) return;

        try {
            await apiFetch(`/api/recruiter/applications/${applicantItem.applicationId}/status`, {
                method: "PUT",
                body: JSON.stringify({ status })
            });

            // Update local state to reflect change without refetching entire list
            setApplicants(prev => prev.map(app =>
                app.applicationId === applicantItem.applicationId
                    ? { ...app, status }
                    : app
            ));

        } catch (error: any) {
            console.error("Error updating status:", error);
            setErrorMsg(error.message || "Failed to update status");
        }
    };

    const handleMessage = () => {
        console.log("Messaging applicant:", applicantProfile?.name);
    };

    // [UI] Helper: Status Badge Colors
    const getStatusStyles = (status: string) => {
        switch (status) {
            case "NEW": return "bg-gray-100 text-gray-500 border border-gray-200";
            case "CONTACTED": return "bg-[#e6fcf5] text-[#0ca678] border border-[#c3fae8]";
            case "SHORTLISTED": return "bg-[#edf2ff] text-[#4263eb] border border-[#dbe4ff]";
            case "HIRED": return "bg-[#ebfbee] text-[#2b8a3e] border border-[#d3f9d8]";
            case "REJECTED": return "bg-[#fff5f5] text-[#fa5252] border border-[#ffe3e3]";
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

                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h1 className="text-[34px] font-extrabold text-[#111827] mb-1 tracking-tight">
                            {jobDetails.title} - Applicants
                        </h1>
                        <p className="text-slate-500 font-medium text-lg flex items-center gap-2">
                            Showing {applicants.length} of {totalItems} applicants
                            {statusFilter !== "ALL" && <span className="inline-block h-4 w-1 bg-blue-400 rounded-full"></span>}
                        </p>
                    </div>
                    <button
                        onClick={() => console.log("Add applicant clicked")}
                        className="bg-[#6b8bff] hover:bg-[#5a78f0] text-white px-6 py-3 rounded-xl font-bold transition-all shadow-sm hover:translate-y-[-1px]"
                    >
                        + Add applicant
                    </button>
                </div>

                {errorMsg && (
                    <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium animate-in fade-in slide-in-from-top-2 duration-300">
                        {errorMsg}
                    </div>
                )}

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
                            <div className="py-20 flex flex-col items-center justify-center opacity-50">
                                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#5c7cfa] mb-4"></div>
                                <p className="text-slate-500 font-bold tracking-tight">Loading applicants...</p>
                            </div>
                        ) : applicants.length === 0 ? (
                            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-12 text-center text-slate-500 font-medium">
                                No applicants found matching your criteria.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {applicants.map((app) => (
                                    <div
                                        key={app.applicationId}
                                        onClick={() => setSelectedApplicantId(app.applicantId)}
                                        className={`bg-white rounded-[20px] shadow-sm border-2 p-5 flex items-center justify-between cursor-pointer transition-all duration-300 transform ${selectedApplicantId === app.applicantId
                                            ? 'border-[#6b8bff] bg-slate-50/50 scale-[1.01]'
                                            : 'border-transparent hover:border-slate-200 hover:translate-x-1'
                                            }`}
                                    >
                                        <div className="flex items-center">
                                            <div>
                                                <h3 className="text-[19px] font-black text-[#111827]">{app.name}</h3>
                                                <p className="text-slate-500 font-bold mt-0.5 text-[15px]">
                                                    {app.matchScore}% Match | {app.relevantSkillsCount} relevant skills
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-6">
                                            <span className={`px-4 py-1.5 rounded-full text-[12px] font-black uppercase tracking-wider ${getStatusStyles(app.status)}`}>
                                                {formatStatusDisplay(app.status)}
                                            </span>
                                            <div className="text-slate-300 font-black text-xl leading-none">›</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* [UI] Right Column: Profile Panel */}
                    <div className="w-[440px] flex-shrink-0">
                        <div className="bg-white rounded-[32px] shadow-lg shadow-slate-200/50 border border-slate-50 p-10 sticky top-8">
                            {!selectedApplicantId ? (
                                <div className="h-[500px] flex flex-col items-center justify-center text-center opacity-40">
                                    <div className="w-20 h-20 bg-slate-100 rounded-full mb-6 flex items-center justify-center">
                                        <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                                    </div>
                                    <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Select an applicant to view details</p>
                                </div>
                            ) : profileLoading || !applicantProfile ? (
                                <div className="h-[500px] flex flex-col items-center justify-center space-y-4">
                                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#5c7cfa]"></div>
                                    <p className="text-slate-500 font-bold tracking-tight">Retrieving profile...</p>
                                </div>
                            ) : (
                                <>
                                    {/* Info */}
                                    <div className="flex flex-col items-center text-center mb-10">
                                        <h2 className="text-2xl font-black text-[#111827] leading-tight">{applicantProfile.name}</h2>
                                        <p className="text-lg text-slate-500 font-bold mt-1">{applicantProfile.title}</p>
                                    </div>

                                    {/* Primary Actions */}
                                    <div className="flex gap-4 mb-10">
                                        <button
                                            onClick={handleMessage}
                                            className="flex-1 bg-[#6b8bff] hover:bg-[#5a78f0] text-white py-3.5 rounded-2xl font-black flex items-center justify-center gap-3 transition-all shadow-md active:scale-95"
                                        >
                                            <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2m0 4l-8 5-8-5V6l8 5 8-5v2z" /></svg>
                                            Message
                                        </button>
                                        <button
                                            onClick={() => updateStatus("HIRED")}
                                            className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 py-3.5 rounded-2xl font-black flex items-center justify-center gap-3 transition-all active:scale-95"
                                        >
                                            <svg className="w-5 h-5 fill-slate-700" viewBox="0 0 24 24"><path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2m-6 0h-4V4h4v2z" /></svg>
                                            Hire
                                        </button>
                                    </div>

                                    <div className="space-y-8">
                                        {/* Summary */}
                                        <div className="relative">
                                            <div className="absolute top-0 left-0 w-1 h-full bg-blue-100 rounded-full"></div>
                                            <div className="pl-4">
                                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-3">SUMMARY</h3>
                                                <p className="text-[15px] text-slate-600 leading-relaxed font-bold">
                                                    {applicantProfile.summary}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Skills */}
                                        <div>
                                            <h3 className="text-[16px] font-black text-[#111827] mb-4">Key skills</h3>
                                            <div className="flex flex-wrap gap-2.5">
                                                {applicantProfile.skills.map((skill, index) => (
                                                    <span key={index} className="px-5 py-2 bg-[#dbe4ff] text-[#4263eb] text-[13px] font-black rounded-full shadow-sm">
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Contact Info */}
                                        <div>
                                            <h3 className="text-[16px] font-black text-[#111827] mb-4">Contact Info</h3>
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-4 text-slate-500 text-[15px] font-bold group">
                                                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                                                        <svg className="w-5 h-5 text-slate-400 group-hover:text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path></svg>
                                                    </div>
                                                    {applicantProfile.email ? (
                                                        <a href={`mailto:${applicantProfile.email}`} className="hover:text-blue-600 transition-colors">
                                                            {applicantProfile.email}
                                                        </a>
                                                    ) : (
                                                        <span className="text-slate-400">Not provided</span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-4 text-slate-500 text-[15px] font-bold group">
                                                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                                                        <svg className="w-5 h-5 text-slate-400 group-hover:text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path></svg>
                                                    </div>
                                                    {applicantProfile.phone ? (
                                                        <a href={`tel:${applicantProfile.phone}`} className="hover:text-blue-600 transition-colors">
                                                            {applicantProfile.phone}
                                                        </a>
                                                    ) : (
                                                        <span className="text-slate-400">Not provided</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Quick Links */}
                                        <div>
                                            <h3 className="text-[16px] font-black text-[#111827] mb-4">Quick Links</h3>
                                            <div className="space-y-4">
                                                {applicantProfile.resumeUrl ? (
                                                <a href={applicantProfile.resumeUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 text-slate-500 hover:text-blue-600 text-[15px] font-bold transition-all group">
                                                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center group-hover:bg-blue-50">
                                                        <svg className="w-5 h-5 text-slate-400 group-hover:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                                    </div>
                                                    Download resume
                                                </a>
                                                ) : (
                                                    <div className="flex items-center gap-4 text-slate-400 text-[15px] font-bold">
                                                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                                                            <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                                        </div>
                                                        Resume not provided
                                                    </div>
                                                )}
                                                {applicantProfile.portfolioUrl ? (
                                                <a href={applicantProfile.portfolioUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 text-slate-500 hover:text-blue-600 text-[15px] font-bold transition-all group">
                                                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center group-hover:bg-blue-50">
                                                        <svg className="w-5 h-5 text-slate-400 group-hover:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
                                                    </div>
                                                    View portfolio
                                                </a>
                                                ) : (
                                                    <div className="flex items-center gap-4 text-slate-400 text-[15px] font-bold">
                                                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                                                            <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
                                                        </div>
                                                        Portfolio not provided
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* View Full Profile Link */}
                                        <div className="pt-8 border-t border-slate-100 flex justify-center">
                                            <button
                                                onClick={() => {
                                                    const applicantItem = applicants.find(a => a.applicantId === selectedApplicantId);
                                                    if (applicantItem) {
                                                        router.push(`/recruiter/applications/${applicantItem.applicationId}`);
                                                    }
                                                }}
                                                className="text-[#6b8bff] hover:text-[#5a78f0] font-black text-sm flex items-center gap-2 transition-all group"
                                            >
                                                View full profile
                                                <span className="group-hover:translate-x-1 transition-transform">→</span>
                                            </button>
                                        </div>

                                        {/* Reject Button */}
                                        <div className="pt-6">
                                            <button
                                                onClick={() => updateStatus("REJECTED")}
                                                className="w-full bg-[#fa5252]/10 hover:bg-[#fa5252]/20 text-[#fa5252] font-black py-4 rounded-2xl transition-all tracking-wider text-[15px] active:scale-[0.98]"
                                            >
                                                Reject
                                            </button>
                                        </div>

                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

