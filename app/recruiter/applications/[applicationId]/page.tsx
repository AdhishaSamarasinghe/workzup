"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";

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

    const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

    useEffect(() => {
        if (!applicationId) return;

        fetch(`${API_BASE}/api/recruiter/applications/${applicationId}`)
            .then(async (res) => {
                if (!res.ok) {
                    throw new Error("Failed to fetch application details.");
                }
                return res.json();
            })
            .then((json: ApplicationDetails) => {
                setData(json);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setError(err.message);
                setLoading(false);
            });
    }, [applicationId, API_BASE]);

    const handleHire = async () => {
        setHiringStatus("loading");
        try {
            const res = await fetch(`${API_BASE}/api/recruiter/applications/${applicationId}/status`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "HIRED" }),
            });
            if (!res.ok) throw new Error("Failed to hire.");

            // Update local state if needed
            if (data) {
                setData({
                    ...data,
                    application: { ...data.application, status: "HIRED" }
                });
            }
            setHiringStatus("success");
        } catch (err) {
            console.error(err);
            setHiringStatus("error");
        }
    };

    const handleMessage = () => {
        console.log("message", data?.applicant._id);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-500">
                <p className="mb-4 text-lg">{error || "Application not found."}</p>
                <button onClick={() => router.back()} className="text-blue-500 hover:underline">
                    Go back
                </button>
            </div>
        );
    }

    const { applicant, application } = data;

    const renderStars = (rating: number) => {
        const fullStars = Math.floor(rating);
        const totalStars = 5;
        const stars = [];

        for (let i = 0; i < totalStars; i++) {
            if (i < fullStars) {
                stars.push(
                    <svg key={i} className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                );
            } else {
                stars.push(
                    <svg key={i} className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                );
            }
        }
        return stars;
    };

    const getExperienceIcon = (role: string) => {
        if (role.toLowerCase().includes("cater") || role.toLowerCase().includes("food")) {
            return (
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
            );
        }
        if (role.toLowerCase().includes("retail") || role.toLowerCase().includes("store")) {
            return (
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
            );
        }
        return (
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-start justify-center p-4 sm:p-8 font-sans">
            <div className="bg-white max-w-xl w-full rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 relative">

                {/* Close Button */}
                <button
                    onClick={() => router.back()}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Close"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Header Profile Section */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
                    <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0">
                        <Image
                            src={applicant.avatarUrl}
                            alt={`${applicant.name} avatar`}
                            fill
                            className="rounded-full object-cover shadow-sm border-2 border-white"
                        />
                    </div>

                    <div className="flex-1 w-full text-center sm:text-left mt-2">
                        <h1 className="text-2xl font-bold text-black mb-1">{applicant.name}</h1>

                        {/* Rating Row */}
                        <div className="flex items-center justify-center sm:justify-start space-x-2 mb-4">
                            <div className="flex space-x-0.5">
                                {renderStars(applicant.rating || 4.5)}
                            </div>
                            <span className="text-gray-600 text-xs font-semibold">{applicant.rating || 4.5}/5 Stars</span>
                        </div>

                        {/* Actions */}
                        <div className="flex space-x-3 mt-4">
                            <button
                                onClick={handleHire}
                                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors ${application.status === "HIRED" || hiringStatus === "success"
                                        ? "bg-green-500 text-white"
                                        : "bg-[#647DF5] hover:bg-blue-600 text-white"
                                    }`}
                            >
                                {application.status === "HIRED" || hiringStatus === "success" ? "Hired ✓" : hiringStatus === "loading" ? "..." : "Hire for job"}
                            </button>
                            <button
                                onClick={handleMessage}
                                className="flex-1 bg-gray-100 hover:bg-gray-200 text-black py-2.5 rounded-lg text-sm font-semibold transition-colors"
                            >
                                Message
                            </button>
                        </div>
                        {hiringStatus === "error" && <p className="text-red-500 text-xs mt-2">Failed to update status.</p>}
                    </div>
                </div>

                <hr className="my-8 border-gray-100" />

                {/* About Section */}
                <div className="mb-8">
                    <h2 className="text-lg font-bold text-black mb-3">About</h2>
                    <p className="text-gray-500 text-sm leading-relaxed">
                        {applicant.about || "No about information provided."}
                    </p>
                </div>

                {/* Skills Section */}
                <div className="mb-8">
                    <h2 className="text-lg font-bold text-black mb-3">Skills</h2>
                    <div className="flex flex-wrap gap-x-4 gap-y-2">
                        {applicant.skills.map((skill, index) => (
                            <span
                                key={skill}
                                className={`text-sm font-medium ${index % 2 === 0 ? 'text-[#647DF5]' : 'text-gray-900'}`}
                            >
                                {skill}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Recent Experience Section */}
                <div>
                    <h2 className="text-lg font-bold text-black mb-4">Recent Experience</h2>
                    <div className="space-y-4">
                        {applicant.recentExperience && applicant.recentExperience.length > 0 ? (
                            applicant.recentExperience.map((exp) => (
                                <div key={`${exp.role}-${exp.company}`} className="flex items-center space-x-4">
                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                                        {getExperienceIcon(exp.role)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-black">{exp.role}</p>
                                        <p className="text-xs font-medium text-gray-500">{exp.company}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-gray-500">No recent experience listed.</p>
                        )}
                    </div>
                </div>

                <hr className="my-8 border-gray-100" />

                {/* Footer Link */}
                <div className="text-center pb-2">
                    <button
                        onClick={() => {
                            if (applicant.portfolioUrl && applicant.portfolioUrl !== "#") {
                                window.open(applicant.portfolioUrl, "_blank");
                            } else {
                                router.push(`/recruiter/applicants/${applicant._id}`);
                            }
                        }}
                        className="text-[#647DF5] font-semibold text-sm hover:underline flex items-center justify-center mx-auto space-x-1"
                    >
                        <span>View full profile</span>
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </button>
                </div>

            </div>
        </div>
    );
}
