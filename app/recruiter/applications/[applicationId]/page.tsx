"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { apiFetch } from "@/lib/api";

// Types based on the backend response
interface ApplicationDetails {
    application: {
        _id: string;
        jobId: string;
        applicantId: string;
        status: string;
        matchScore: number;
        relevantSkillsCount: number;
        appliedAt: string;
    };
    job: {
        _id: string;
        title: string;
    };
    applicant: {
        _id: string;
        name: string;
        rating: number;
        avatarUrl: string;
        title: string;
        about: string;
        skills: string[];
        recentExperience: { role: string; company: string }[];
        portfolioUrl: string;
        email: string;
        phone: string;
    };
}

export default function ViewApplication() {
    const router = useRouter();
    const params = useParams();
    const applicationId = params.applicationId as string;

    const [data, setData] = useState<ApplicationDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [hiringStatus, setHiringStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

    useEffect(() => {
        if (!applicationId) return;

        const fetchApplicationDetails = async () => {
            setLoading(true);
            try {
                const resData = await apiFetch(`/api/recruiter/applications/${applicationId}`);
                setData(resData);
            } catch (err) {
                console.error("Error fetching application:", err);
                setError(err instanceof Error ? err.message : "Failed to fetch application details.");
            } finally {
                setLoading(false);
            }
        };

        fetchApplicationDetails();
    }, [applicationId]);

    const handleHire = async () => {
        setHiringStatus("loading");
        try {
            await apiFetch(`/api/recruiter/applications/${applicationId}/status`, {
                method: "PUT",
                body: JSON.stringify({ status: "HIRED" }),
            });

            // Update local state
            if (data) {
                setData({
                    ...data,
                    application: { ...data.application, status: "HIRED" }
                });
            }
            setHiringStatus("success");
        } catch (err) {
            console.error("Error updating status:", err);
            setHiringStatus("error");
        }
    };

    const handleMessage = () => {
        console.log("message", data?.applicant._id);
    };

    const renderStars = (rating: number) => {
        const fullStars = Math.floor(rating);
        const totalStars = 5;
        return (
            <div className="flex gap-1">
                {[...Array(totalStars)].map((_, i) => (
                    <svg key={i} className={`w-4 h-4 ${i < fullStars ? "text-[#6B8BFF]" : "text-slate-200"}`} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                ))}
            </div>
        );
    };

    const getExperienceIcon = (role: string) => {
        const r = role.toLowerCase();
        if (r.includes("event") || r.includes("staff")) {
            return <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 005.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>;
        }
        if (r.includes("cater") || r.includes("food") || r.includes("pizza")) {
            return <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>;
        }
        return <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#6B8BFF] mb-4"></div>
                <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Loading Application...</p>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC] text-slate-500 p-6 text-center">
                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
                    <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                </div>
                <h2 className="text-2xl font-black text-slate-800 mb-2">Oops! Something went wrong</h2>
                <p className="max-w-md font-bold mb-8 text-slate-400 leading-relaxed">{error || "The application you're looking for was not found."}</p>
                <button
                    onClick={() => router.back()}
                    className="bg-slate-800 text-white px-8 py-3 rounded-2xl font-black hover:bg-slate-700 transition-all active:scale-95 shadow-lg"
                >
                    Return to Dashboard
                </button>
            </div>
        );
    }

    const { applicant, application, job } = data;

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex items-start justify-center p-6 sm:p-12">
            <div className="bg-white max-w-2xl w-full rounded-[40px] shadow-2xl shadow-slate-200/60 border border-slate-50 overflow-hidden relative pb-12">

                {/* Close/Back Button */}
                <button
                    onClick={() => router.back()}
                    className="absolute top-8 right-8 w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-all active:scale-90 z-10"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>

                {/* Cover Strip */}
                <div className="h-32 bg-gradient-to-r from-[#6B8BFF] to-[#8E7CFF] w-full"></div>

                <div className="px-10 sm:px-14">
                    {/* Header Profile Section */}
                    <div className="relative -mt-16 flex flex-col items-center sm:items-start mb-10">
                        <div className="relative w-32 h-32 rounded-[40px] overflow-hidden bg-slate-100 shadow-xl border-4 border-white mb-6">
                            <Image
                                src={applicant.avatarUrl}
                                alt={applicant.name}
                                fill
                                className="object-cover"
                            />
                        </div>

                        <div className="text-center sm:text-left">
                            <h1 className="text-[32px] font-black text-[#111827] leading-tight flex items-center gap-3 justify-center sm:justify-start">
                                {applicant.name}
                                <span className="bg-blue-50 text-[#4263eb] text-[10px] uppercase font-black px-3 py-1 rounded-full tracking-widest border border-blue-100">Verified</span>
                            </h1>
                            <p className="text-xl text-slate-500 font-bold mt-1 mb-4">{applicant.title} for <span className="text-[#6B8BFF]">{job.title}</span></p>

                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-6 font-bold text-slate-400 text-sm">
                                <div className="flex items-center gap-2">
                                    {renderStars(applicant.rating || 4.5)}
                                    <span className="text-slate-800 font-black">{applicant.rating || 4.5}</span>
                                </div>
                                <div className="w-1.5 h-1.5 bg-slate-200 rounded-full"></div>
                                <div className="flex items-center gap-2">
                                    <span className="text-green-500 font-black">92% Match</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex gap-4 mb-12">
                        <button
                            onClick={() => {
                                if (application.status === "HIRED" || hiringStatus === "success") {
                                    router.push(`/recruiter/jobs/${job._id}/complete?workerId=${applicant._id}`);
                                } else {
                                    handleHire();
                                }
                            }}
                            className={`flex-1 py-4 rounded-2xl font-black text-base shadow-lg transition-all active:scale-95 ${application.status === "HIRED" || hiringStatus === "success"
                                ? "bg-emerald-500 text-white shadow-emerald-200"
                                : "bg-[#6B8BFF] hover:bg-[#5A78F0] text-white shadow-[#6B8BFF]/30"
                                }`}
                        >
                            {application.status === "HIRED" || hiringStatus === "success"
                                ? "Complete Job & Pay →"
                                : hiringStatus === "loading" ? "Processing..." : "Hire for this Job"}
                        </button>

                        <button
                            onClick={handleMessage}
                            className="w-16 h-16 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl flex items-center justify-center transition-all active:scale-95 shadow-md"
                        >
                            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2m0 4l-8 5-8-5V6l8 5 8-5v2z"></path></svg>
                        </button>
                    </div>

                    <div className="space-y-12">
                        {/* Summary / About */}
                        <div className="relative">
                            <div className="absolute top-0 left-[-20px] w-2 h-full bg-[#6B8BFF]/10 rounded-full"></div>
                            <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Summary</h2>
                            <p className="text-[17px] text-slate-600 leading-relaxed font-bold">
                                {applicant.about || "No about information provided."}
                            </p>
                        </div>

                        {/* Skills */}
                        <div>
                            <h2 className="text-lg font-black text-[#111827] mb-6 flex items-center gap-3">
                                <span className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                                    <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.3 1.047a1 1 0 00-1.3 0c-1.348 1.177-2.618 3.014-3.048 4.674a9.96 9.96 0 00-1.288 3.518 13.911 13.911 0 01-1.152 4.1a1 1 0 00.569 1.35c1.474.653 3.197 1.011 5 1.011 1.803 0 3.526-.358 5-1.01a1 1 0 00.569-1.35c-.328-.737-.714-1.467-1.152-4.102a9.96 9.96 0 00-1.288-3.518c-.43-1.66-1.7-3.497-3.048-4.674zM10 12a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path></svg>
                                </span>
                                Key Expertise
                            </h2>
                            <div className="flex flex-wrap gap-3">
                                {applicant.skills.map((skill) => (
                                    <span
                                        key={skill}
                                        className="px-6 py-2.5 bg-white border-2 border-slate-100 text-slate-600 rounded-2xl text-sm font-black shadow-sm"
                                    >
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Recent Experience Section */}
                        <div>
                            <h2 className="text-lg font-black text-[#111827] mb-6 flex items-center gap-3">
                                <span className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center">
                                    <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20"><path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"></path></svg>
                                </span>
                                Professional Background
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {applicant.recentExperience && applicant.recentExperience.length > 0 ? (
                                    applicant.recentExperience.map((exp) => (
                                        <div key={`${exp.role}-${exp.company}`} className="bg-slate-50/50 rounded-3xl p-6 border border-slate-100 flex items-center gap-5 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all group">
                                            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center flex-shrink-0 shadow-sm group-hover:bg-slate-50">
                                                {getExperienceIcon(exp.role)}
                                            </div>
                                            <div>
                                                <p className="text-[15px] font-black text-slate-800">{exp.role}</p>
                                                <p className="text-[13px] font-bold text-slate-400">{exp.company}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-slate-400 font-bold col-span-2">No recent experience listed.</p>
                                )}
                            </div>
                        </div>


                    </div>
                </div>
            </div>
        </div>
    );
}
