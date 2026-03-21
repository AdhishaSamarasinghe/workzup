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

const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error && error.message) return error.message;
    return "Unexpected error";
};

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
    const [messaging, setMessaging] = useState(false);

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
            } catch (error: unknown) {
                console.error("Error:", error);
                setErrorMsg(getErrorMessage(error) || "Failed to load applicants");
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
            } catch (error: unknown) {
                console.error("Error:", error);
                setErrorMsg(getErrorMessage(error) || "Failed to load profile");
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

        } catch (error: unknown) {
            console.error("Error updating status:", error);
            setErrorMsg(getErrorMessage(error) || "Failed to update status");
        }
    };

    const handleMessage = () => {
        const selectedApplicant = applicants.find(
            (app) => app.applicantId === selectedApplicantId,
        );

        if (!selectedApplicant) {
            setErrorMsg("Please select an applicant first.");
            return;
        }

        const openConversation = async () => {
            try {
                setMessaging(true);
                setErrorMsg("");

                const response = await apiFetch(
                    `/api/applications/${selectedApplicant.applicationId}/conversation`,
                    {
                        method: "POST",
                    },
                );

                const conversationId = response?.conversationId;
                const recipientId = response?.otherParticipantId;
                const recipientName = response?.otherParticipantName;

                if (!conversationId) {
                    throw new Error("Unable to open conversation for this applicant.");
                }

                const params = new URLSearchParams({
                    conversationId,
                    applicationId: selectedApplicant.applicationId,
                });

                if (recipientId) {
                    params.set("recipientId", recipientId);
                }

                if (recipientName) {
                    params.set("recipientName", recipientName);
                }

                router.push(`/recruiter/messages?${params.toString()}`);
            } catch (error: unknown) {
                setErrorMsg(getErrorMessage(error) || "Unable to open applicant chat.");
            } finally {
                setMessaging(false);
            }
        };

        void openConversation();
    };

    const handleComplete = () => {
        const selectedApplicant = applicants.find(
            (app) => app.applicantId === selectedApplicantId,
        );

        if (!selectedApplicant) {
            setErrorMsg("Please select an applicant first.");
            return;
        }

        router.push(
            `/recruiter/jobs/${jobId}/complete?workerId=${selectedApplicant.applicantId}`,
        );
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

    const selectedApplicant = applicants.find(
        (app) => app.applicantId === selectedApplicantId,
    );
    const isSelectedApplicantHired = selectedApplicant?.status === "HIRED";

    return (
        <div className="min-h-screen bg-slate-50 px-4 py-8 font-sans sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* [UI] Breadcrumb & Header */}
                <div className="text-sm text-slate-500 mb-4 font-medium">
                    Dashboard / Jobs / {jobDetails.title} / Applicants
                </div>

                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h1 className="text-4xl font-extrabold text-[#111827] mb-1 tracking-tight">
                            {jobDetails.title} - Applicants
                        </h1>
                        <p className="text-slate-600 font-medium text-lg flex items-center gap-2">
                            Showing {applicants.length} of {totalItems} applicants
                            {statusFilter !== "ALL" && <span className="inline-block h-4 w-1 bg-blue-400 rounded-full"></span>}
                        </p>
                    </div>
                </div>

                {errorMsg && (
                    <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium animate-in fade-in slide-in-from-top-2 duration-300">
                        {errorMsg}
                    </div>
                )}

                <div className="flex gap-6">
                    {/* [UI] Left Column: List */}
                    <div className="flex-1 min-w-0">
                        {/* Filters Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 mb-6">
                            {/* Search Bar */}
                            <div className="relative mb-5">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                                </span>
                                <input
                                    type="text"
                                    placeholder="Search by name or keyword......"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-slate-100 text-slate-900 rounded-xl border border-slate-200 py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-[#D8E0FF] focus:border-[#6D83F2] focus:bg-white transition-colors"
                                />
                            </div>

                            {/* Dropdowns */}
                            <div className="flex gap-4">
                                <div className="relative">
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="appearance-none bg-slate-100 border border-slate-200 text-sm font-semibold text-slate-700 py-2.5 pl-4 pr-10 rounded-xl outline-none cursor-pointer focus:ring-2 focus:ring-[#D8E0FF] focus:border-[#6D83F2]"
                                    >
                                        <option value="ALL">Status : All</option>
                                        <option value="NEW">Status : New</option>
                                        <option value="CONTACTED">Status : Contacted</option>
                                        <option value="SHORTLISTED">Status : Shortlisted</option>
                                        <option value="HIRED">Status : Hired</option>
                                        <option value="REJECTED">Status : Rejected</option>
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                    </div>
                                </div>

                                <div className="relative">
                                    <select
                                        value={sortMethod}
                                        onChange={(e) => setSortMethod(e.target.value)}
                                        className="appearance-none bg-slate-100 border border-slate-200 text-sm font-semibold text-slate-700 py-2.5 pl-4 pr-10 rounded-xl outline-none cursor-pointer focus:ring-2 focus:ring-[#D8E0FF] focus:border-[#6D83F2]"
                                    >
                                        <option value="match_desc">Sort by : Match Score</option>
                                        <option value="name_asc">Sort by : Name</option>
                                        <option value="newest">Sort by : Newest</option>
                                        <option value="oldest">Sort by : Oldest</option>
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Applicants List */}
                        {loading ? (
                            <div className="py-20 flex flex-col items-center justify-center opacity-70">
                                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#6D83F2] mb-4"></div>
                                <p className="text-slate-500 font-semibold tracking-tight">Loading applicants...</p>
                            </div>
                        ) : applicants.length === 0 ? (
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center text-slate-500 font-medium">
                                No applicants found matching your criteria.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {applicants.map((app) => (
                                    <div
                                        key={app.applicationId}
                                        onClick={() => setSelectedApplicantId(app.applicantId)}
                                        className={`rounded-2xl border p-5 flex items-center justify-between cursor-pointer transition-all duration-200 ${selectedApplicantId === app.applicantId
                                            ? 'bg-[#F4F7FF] border-[#9AAAF8] ring-1 ring-[#D8E0FF] shadow-sm'
                                            : 'bg-white border-slate-200 shadow-sm hover:border-slate-300 hover:bg-slate-50'
                                            }`}
                                    >
                                        <div className="flex items-center">
                                            <div>
                                                <h3 className="text-[19px] font-bold text-[#111827]">{app.name}</h3>
                                                <p className="text-slate-500 font-semibold mt-0.5 text-[15px]">
                                                    {app.matchScore}% Match | {app.relevantSkillsCount} relevant skills
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <span className={`px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${getStatusStyles(app.status)}`}>
                                                {formatStatusDisplay(app.status)}
                                            </span>
                                            <div className="text-slate-300 font-bold text-xl leading-none">›</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* [UI] Right Column: Profile Panel */}
                    <div className="w-[420px] flex-shrink-0">
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 sticky top-8">
                            {!selectedApplicantId ? (
                                <div className="h-[500px] flex flex-col items-center justify-center text-center opacity-40">
                                    <div className="w-20 h-20 bg-slate-100 rounded-full mb-6 flex items-center justify-center">
                                        <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                                    </div>
                                    <p className="font-semibold text-slate-400 uppercase tracking-widest text-xs">Select an applicant to view details</p>
                                </div>
                            ) : profileLoading || !applicantProfile ? (
                                <div className="h-[500px] flex flex-col items-center justify-center space-y-4">
                                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#6D83F2]"></div>
                                    <p className="text-slate-500 font-semibold tracking-tight">Retrieving profile...</p>
                                </div>
                            ) : (
                                <>
                                    {/* Info */}
                                    <div className="flex flex-col items-center text-center mb-10">
                                        <h2 className="text-2xl font-extrabold text-[#111827] leading-tight">{applicantProfile.name}</h2>
                                        <p className="text-lg text-slate-500 font-semibold mt-1">{applicantProfile.title}</p>
                                    </div>

                                    {/* Primary Actions */}
                                    <div className="flex gap-4 mb-10">
                                        <button
                                            onClick={handleMessage}
                                            disabled={messaging}
                                            className="flex-1 bg-[#6D83F2] hover:bg-[#5B73F1] text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-3 transition-all shadow-sm active:scale-95"
                                        >
                                            <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2m0 4l-8 5-8-5V6l8 5 8-5v2z" /></svg>
                                            {messaging ? "Opening..." : "Message"}
                                        </button>
                                        {isSelectedApplicantHired ? (
                                            <button
                                                onClick={handleComplete}
                                                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold border border-green-600 flex items-center justify-center gap-3 transition-all active:scale-95"
                                            >
                                                <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24"><path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
                                                Complete Job
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => updateStatus("HIRED")}
                                                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-semibold border border-slate-200 flex items-center justify-center gap-3 transition-all active:scale-95"
                                            >
                                                <svg className="w-5 h-5 fill-slate-700" viewBox="0 0 24 24"><path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.9-2-2-2m-6 0h-4V4h4v2z" /></svg>
                                                Hire
                                            </button>
                                        )}
                                    </div>

                                    <div className="space-y-8">
                                        {/* Summary */}
                                        <div className="relative">
                                            <div className="absolute top-0 left-0 w-1 h-full bg-blue-100 rounded-full"></div>
                                            <div className="pl-4">
                                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-3">SUMMARY</h3>
                                                <p className="text-[15px] text-slate-600 leading-relaxed font-medium">
                                                    {applicantProfile.summary}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Skills */}
                                        <div>
                                            <h3 className="text-[16px] font-bold text-[#111827] mb-4">Key skills</h3>
                                            <div className="flex flex-wrap gap-2.5">
                                                {applicantProfile.skills.map((skill, index) => (
                                                    <span key={index} className="px-4 py-1.5 bg-[#EEF2FF] text-[#4263eb] text-[12px] font-semibold rounded-full border border-[#dbe4ff]">
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Contact Info */}
                                        <div>
                                            <h3 className="text-[16px] font-bold text-[#111827] mb-4">Contact Info</h3>
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-4 text-slate-500 text-[15px] font-medium group">
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
                                                <div className="flex items-center gap-4 text-slate-500 text-[15px] font-medium group">
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
                                            <h3 className="text-[16px] font-bold text-[#111827] mb-4">Quick Links</h3>
                                            <div className="space-y-4">
                                                {applicantProfile.resumeUrl ? (
                                                <a href={applicantProfile.resumeUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 text-slate-500 hover:text-blue-600 text-[15px] font-medium transition-all group">
                                                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center group-hover:bg-blue-50">
                                                        <svg className="w-5 h-5 text-slate-400 group-hover:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                                    </div>
                                                    Download resume
                                                </a>
                                                ) : (
                                                    <div className="flex items-center gap-4 text-slate-400 text-[15px] font-medium">
                                                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                                                            <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                                        </div>
                                                        Resume not provided
                                                    </div>
                                                )}
                                                {applicantProfile.portfolioUrl ? (
                                                <a href={applicantProfile.portfolioUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 text-slate-500 hover:text-blue-600 text-[15px] font-medium transition-all group">
                                                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center group-hover:bg-blue-50">
                                                        <svg className="w-5 h-5 text-slate-400 group-hover:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
                                                    </div>
                                                    View portfolio
                                                </a>
                                                ) : (
                                                    <div className="flex items-center gap-4 text-slate-400 text-[15px] font-medium">
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
                                                className="text-[#6D83F2] hover:text-[#5B73F1] font-semibold text-sm flex items-center gap-2 transition-all group"
                                            >
                                                View full profile
                                                <span className="group-hover:translate-x-1 transition-transform">→</span>
                                            </button>
                                        </div>

                                        {/* Reject Button */}
                                        <div className="pt-6">
                                            <button
                                                onClick={() => updateStatus("REJECTED")}
                                                className="w-full bg-[#FEF2F2] hover:bg-[#FEE2E2] text-[#DC2626] border border-[#FECACA] font-semibold py-3 rounded-xl transition-all tracking-wide text-[14px] active:scale-[0.98]"
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

