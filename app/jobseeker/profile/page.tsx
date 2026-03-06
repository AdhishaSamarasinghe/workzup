"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";

// Define the interface for the profile data
interface JobSeekerProfileData {
    id: string;
    name: string;
    title: string;
    location: string;
    avatar: string;
    isAvailable: boolean;
    stats: {
        jobsCompleted: number;
        reliability: number;
    };
    skills: string[];
    aboutMe: string;
    reviewsSummary: {
        averageRating: number;
        totalReviews: number;
    };
    reviews: {
        id: number;
        name: string;
        role: string;
        date: string;
        rating: number;
        text: string;
    }[];
    jobHistory: {
        id: number;
        name: string;
        role: string;
        date: string;
    }[];
}

export default function JobSeekerProfile() {
    const [profile, setProfile] = useState<JobSeekerProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Fetch profile data from the backend
        fetch("http://localhost:5000/user/profile")
            .then((res) => {
                if (!res.ok) {
                    throw new Error("Failed to fetch profile");
                }
                return res.json();
            })
            .then((data) => {
                setProfile(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error fetching profile:", err);
                setError("Could not load profile data.");
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center pt-24 pb-10">
                <div className="text-slate-500 font-medium animate-pulse">Loading Profile...</div>
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center pt-24 pb-10">
                <div className="text-red-500 font-medium">{error || "Profile not found"}</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pt-24 pb-10 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* LEFT COLUMN - PROFILE CARD */}
                <div className="lg:col-span-4 space-y-6">
                    <ProfileCard profile={profile} />
                    <StatsCard stats={profile.stats} />
                    <SkillsCard skills={profile.skills} />
                </div>

                {/* RIGHT COLUMN - CONTENT */}
                <div className="lg:col-span-8 space-y-6">
                    <AboutMeCard aboutMe={profile.aboutMe} />
                    <ReviewsCard reviews={profile.reviews} summary={profile.reviewsSummary} />
                    <JobHistoryCard history={profile.jobHistory} />
                </div>
            </div>
        </div>
    );
}

// --- Components ---

function ProfileCard({ profile }: { profile: JobSeekerProfileData }) {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col items-center text-center">
            <div className="relative mb-4">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-blue-50">
                    <img
                        src={profile.avatar}
                        alt={profile.name}
                        className="w-full h-full object-cover"
                    />
                </div>
            </div>

            <h2 className="text-xl font-bold text-slate-900">{profile.name}</h2>
            <p className="text-slate-500 font-medium mb-1">{profile.title}</p>

            <div className="flex items-center justify-center gap-2 text-slate-500 text-sm mb-4">
                <MapPinIcon className="w-4 h-4" />
                <span>{profile.location}</span>
            </div>

            {profile.isAvailable && (
                <div className="bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-sm font-semibold mb-6 flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    Available for hire
                </div>
            )}

            <div className="grid grid-cols-2 gap-3 w-full">
                <button className="flex-1 py-2.5 px-4 bg-slate-100 text-slate-700 font-medium rounded-xl hover:bg-slate-200 transition-colors">
                    Messaging
                </button>
                <button className="flex-1 py-2.5 px-4 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">
                    Hire for a Job
                </button>
            </div>
        </div>
    );
}

function StatsCard({ stats }: { stats: JobSeekerProfileData["stats"] }) {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex items-center justify-around">
            <div className="text-center">
                <div className="text-3xl font-bold text-slate-900">{stats.jobsCompleted}</div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mt-1">Jobs Completed</div>
            </div>
            <div className="w-px h-12 bg-slate-100"></div>
            <div className="text-center">
                <div className="text-3xl font-bold text-slate-900">{stats.reliability}%</div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mt-1">Reliability</div>
            </div>
        </div>
    );
}

function SkillsCard({ skills }: { skills: string[] }) {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Skills</h3>
            <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                    <span key={skill} className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-sm font-medium">
                        {skill}
                    </span>
                ))}
            </div>
        </div>
    );
}

function AboutMeCard({ aboutMe }: { aboutMe: string }) {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
            <h3 className="text-lg font-bold text-slate-900 mb-3">About Me</h3>
            <p className="text-slate-600 leading-relaxed">
                {aboutMe}
            </p>
        </div>
    );
}

function ReviewsCard({ reviews, summary }: { reviews: JobSeekerProfileData["reviews"], summary: JobSeekerProfileData["reviewsSummary"] }) {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-900">Rating and Reviews</h3>
                <div className="flex items-center gap-2">
                    <div className="flex text-yellow-400">
                        {[...Array(Math.floor(summary.averageRating))].map((_, i) => <StarIcon key={i} className="w-5 h-5 fill-current" />)}
                        {/* Simple star logic, can be improved for half stars */}
                        {(summary.averageRating % 1 !== 0) && <StarIcon className="w-5 h-5 text-yellow-400" />}
                    </div>
                    <span className="text-slate-900 font-bold">{summary.averageRating}</span>
                    <span className="text-slate-400 text-sm">({summary.totalReviews} reviews)</span>
                </div>
            </div>

            <div className="space-y-6">
                {reviews.map((review, index) => (
                    <div key={review.id}>
                        <ReviewItem
                            name={review.name}
                            role={review.role}
                            date={review.date}
                            rating={review.rating}
                            text={review.text}
                        />
                        {index < reviews.length - 1 && <div className="h-px bg-slate-50 my-6"></div>}
                    </div>
                ))}
            </div>
        </div>
    );
}

function ReviewItem({ name, role, date, rating, text }: { name: string, role: string, date: string, rating: number, text: string }) {
    return (
        <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-slate-200 flex-shrink-0 overflow-hidden">
                <img src={`https://ui-avatars.com/api/?name=${name}&background=random`} alt={name} />
            </div>
            <div>
                <div className="flex items-baseline justify-between w-full mb-1">
                    <h4 className="font-bold text-slate-900 text-sm">{name}</h4>

                </div>
                <div className="text-xs text-slate-400 mb-2">{role} • {date}</div>
                <div className="flex text-yellow-400 mb-2">
                    {[...Array(5)].map((_, i) => (
                        <StarIcon key={i} className={`w-3 h-3 ${i < rating ? 'fill-current' : 'text-slate-200'}`} />
                    ))}
                </div>
                <p className="text-slate-600 text-sm italic">"{text}"</p>
            </div>
        </div>
    );
}

function JobHistoryCard({ history }: { history: JobSeekerProfileData["jobHistory"] }) {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Job History</h3>

            <div className="relative pl-4 border-l-2 border-slate-100 space-y-8">
                {history.map((item, index) => (
                    <HistoryItem
                        key={item.id}
                        name={item.name}
                        role={item.role}
                        date={item.date}
                        isLast={index === history.length - 1}
                    />
                ))}
            </div>
        </div>
    );
}

function HistoryItem({ name, role, date, isLast }: { name: string, role: string, date: string, isLast: boolean }) {
    return (
        <div className="relative">
            {/* Dot on the timeline */}
            <div className="absolute -left-[21px] top-1.5 w-3 h-3 bg-blue-500 rounded-full border-2 border-white ring-1 ring-blue-100"></div>

            <h4 className="font-bold text-slate-900 text-sm">{name}</h4>
            <div className="text-slate-500 text-sm">{role}</div>
            <div className="text-slate-400 text-xs mt-1">{date}</div>
        </div>
    );
}

// --- Icons (Inline SVG) ---

function MapPinIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
            <circle cx="12" cy="10" r="3" />
        </svg>
    );
}

function StarIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
    );
}
