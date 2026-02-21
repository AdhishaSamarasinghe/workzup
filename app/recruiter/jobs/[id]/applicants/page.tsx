"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";

// Types
interface ApplicantSummary {
    applicationId: string;
    applicantId: string;
    name: string;
    rating: number;
    skills: string[];
    status: string;
    appliedAt: string;
}

interface Experience {
    title: string;
    company: string;
}

interface ApplicantProfile {
    _id: string;
    name: string;
    avatarUrl?: string;
    rating: number;
    about: string;
    skills: string[];
    recentExperience: Experience[];
}

export default function JobApplicantsPage() {
    const params = useParams();
    const router = useRouter();
    const jobId = params.id as string;
    const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

    const [applicants, setApplicants] = useState<ApplicantSummary[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [selectedApplicantId, setSelectedApplicantId] = useState<string | null>(null);
    const [applicantProfile, setApplicantProfile] = useState<ApplicantProfile | null>(null);
    const [profileLoading, setProfileLoading] = useState(false);

    // Fetch Applicants List
    useEffect(() => {
        if (!jobId) return;

        const fetchApplicants = async () => {
            try {
                const res = await fetch(`${API_BASE}/api/recruiter/jobs/${jobId}/applicants`);
                if (!res.ok) throw new Error("Failed to fetch applicants");
                const data = await res.json();
                setApplicants(data);
            } catch (error) {
                console.error("Error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchApplicants();
    }, [jobId, API_BASE]);

    // Fetch Full Profile when Modal Opens
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

    const closeModal = () => setSelectedApplicantId(null);

    // Helper for stars
    const renderStars = (rating: number) => {
        return (
            <div className="flex items-center text-blue-500">
                {[...Array(5)].map((_, i) => (
                    <svg key={i} className={`w-5 h-5 ${i < Math.floor(rating) ? "fill-current" : "text-gray-300 fill-current"}`} viewBox="0 0 24 24">
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                ))}
                <span className="ml-2 text-gray-600 text-sm font-medium">{rating}/5 Stars</span>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-[#f7fafc] p-8 font-sans">
            <div className="max-w-5xl mx-auto">
                <div className="flex items-center mb-8">
                    <button onClick={() => router.back()} className="mr-4 text-gray-500 hover:text-gray-700">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900">Applicants for Job</h1>
                </div>

                {loading ? (
                    <div className="text-center py-20">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                        <p className="mt-2 text-gray-500">Loading applicants...</p>
                    </div>
                ) : applicants.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-500">
                        No applicants found for this job yet.
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Candidate</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applied</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {applicants.map((app) => (
                                    <tr key={app.applicationId} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                                    {app.name.charAt(0)}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{app.name}</div>
                                                    <div className="text-xs text-gray-500">{app.skills.join(", ")}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex text-yellow-400 text-sm">
                                                <span className="text-gray-700 font-medium mr-1">{app.rating}</span> ★
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                        ${app.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    app.status === 'Reviewed' ? 'bg-blue-100 text-blue-800' :
                                                        'bg-green-100 text-green-800'}`}>
                                                {app.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(app.appliedAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => setSelectedApplicantId(app.applicantId)}
                                                className="text-blue-600 hover:text-blue-900 bg-blue-50 px-3 py-1 rounded-md hover:bg-blue-100 transition-colors"
                                            >
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Modal */}
                {selectedApplicantId && (
                    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={closeModal} aria-hidden="true"></div>
                            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                            <div className="relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
                                {/* Close Button */}
                                <div className="absolute top-4 right-4 z-10">
                                    <button onClick={closeModal} className="text-gray-400 hover:text-gray-500 bg-white rounded-full p-1 shadow-sm">
                                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                {profileLoading || !applicantProfile ? (
                                    <div className="p-12 text-center">
                                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                                    </div>
                                ) : (
                                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                        {/* Header: Avatar, Name, Rating */}
                                        <div className="flex flex-col items-start mb-6">
                                            <div className="flex items-center w-full mb-4">
                                                <div className="relative h-20 w-20 rounded-full overflow-hidden border-2 border-gray-100 flex-shrink-0">
                                                    {applicantProfile.avatarUrl && !applicantProfile.avatarUrl.includes("placeholder") ? (
                                                        <Image src={applicantProfile.avatarUrl} alt={applicantProfile.name} layout="fill" objectFit="cover" />
                                                    ) : (
                                                        <div className="h-full w-full bg-gray-200 flex items-center justify-center text-2xl text-gray-500 font-bold">
                                                            {applicantProfile.name.charAt(0)}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="ml-4">
                                                    <h3 className="text-2xl font-bold text-gray-900">{applicantProfile.name}</h3>
                                                    {renderStars(applicantProfile.rating)}
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex space-x-3 w-full mb-6">
                                                <button className="flex-1 bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors shadow-sm">
                                                    Hire for job
                                                </button>
                                                <button className="flex-1 bg-gray-100 text-gray-800 font-semibold py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors">
                                                    Message
                                                </button>
                                            </div>
                                        </div>

                                        {/* About Section */}
                                        <div className="mb-6">
                                            <h4 className="text-lg font-bold text-gray-900 mb-2">About</h4>
                                            <p className="text-gray-600 text-sm leading-relaxed">
                                                {applicantProfile.about}
                                            </p>
                                        </div>

                                        {/* Skills Section */}
                                        <div className="mb-6">
                                            <h4 className="text-lg font-bold text-gray-900 mb-2">Skills</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {applicantProfile.skills.map((skill, index) => (
                                                    <span key={index} className="px-3 py-1 bg-blue-50 text-blue-600 text-sm font-medium rounded-md">
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Recent Experience Section */}
                                        <div className="mb-6">
                                            <h4 className="text-lg font-bold text-gray-900 mb-2">Recent Experience</h4>
                                            <div className="space-y-4">
                                                {applicantProfile.recentExperience.map((exp, index) => (
                                                    <div key={index} className="flex items-start">
                                                        <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 mr-3 mt-1">
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                            </svg>
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-bold text-gray-900">{exp.title}</div>
                                                            <div className="text-xs text-gray-500">{exp.company}</div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Bottom Link */}
                                        <div className="pt-4 border-t border-gray-100 text-center">
                                            <button className="text-blue-500 font-medium hover:text-blue-700 flex items-center justify-center mx-auto">
                                                View full profile
                                                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
            );
}
