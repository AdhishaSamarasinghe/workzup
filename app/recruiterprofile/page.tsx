"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Hammer, Home, Truck, Star, CheckCircle } from "lucide-react";
import { apiFetch } from "@/lib/api";

// --- Types ---

interface Recruiter {
  id: string;
  companyName: string;
  logoUrl: string;
  verified: boolean;
  location: string;
  tagline: string;
  about: string;
  industry: string;
  companySize: string;
  memberSince: string;
  website: string;
}

interface Job {
  id: string;
  title: string;
  postedOn: string;
  status: "Completed" | "Expired" | "Active";
  applicants: number;
  icon: string;
}

interface Review {
  id: string;
  reviewerName: string;
  rating: number;
  date: string;
  comment: string;
}

// --- Icons ---

const VerifiedBadge = () => <CheckCircle className="w-4 h-4 text-green-500 fill-current bg-white rounded-full" />;

const StarIcon = ({ filled }: { filled: boolean }) => (
  <Star className={`w-3.5 h-3.5 ${filled ? "text-yellow-400 fill-current" : "text-gray-200"}`} />
);

const JobIconWrapper = ({ type }: { type: string }) => {
  const iconClass = "w-6 h-6 text-[#111827]";
  switch (type) {
    case "tool":
      return <Hammer className={iconClass} />;
    case "home":
      return <Home className={iconClass} />;
    case "truck":
      return <Truck className={iconClass} />;
    default:
      return <Hammer className={iconClass} />;
  }
};

// --- Page ---

export default function RecruiterProfilePage() {
  const [recruiter, setRecruiter] = useState<Recruiter | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [activeTab, setActiveTab] = useState<"jobs" | "reviews">("jobs");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await apiFetch("/api/recruiter/profile");
        setRecruiter((data?.profile || null) as Recruiter | null);
        setJobs(Array.isArray(data?.jobs) ? (data.jobs as Job[]) : []);
        setReviews(Array.isArray(data?.reviews) ? (data.reviews as Review[]) : []);
      } catch (err: any) {
        console.error("Failed to load recruiter data:", err);
        const message = typeof err?.message === "string" ? err.message : "Unknown error";
        if (/401|403|Missing token|Invalid token/i.test(message)) {
          setError("Please sign in as a recruiter to view your profile.");
        } else {
          setError(`Failed to load recruiter profile. ${message}`);
        }
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F9FC]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0090FF] mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F9FC] px-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full border border-red-100">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Connection Error</h1>
          <p className="text-gray-600 mb-6 leading-relaxed">
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-[#0090FF] text-white py-3 rounded-xl font-bold hover:bg-[#0070CC] transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!recruiter) {
    return <div className="min-h-screen flex items-center justify-center bg-[#F7F9FC] text-gray-500 font-medium">Recruiter not found</div>;
  }

  return (
    <div className="min-h-screen bg-[#F7F9FC] pb-14 font-sans antialiased text-[#111827]">
      {/* Main Container */}
      <main className="max-w-[1080px] mx-auto px-4 mt-7 pb-7">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">

          {/* LEFT COLUMN */}
          <div className="space-y-4">
            {/* Company Card */}
            <div className="bg-white rounded-[24px] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] text-center flex flex-col items-center border border-white">
              <div className="w-[82px] h-[82px] bg-[#F3F4F6] rounded-full flex items-center justify-center mb-3 border-[3px] border-white shadow-sm overflow-hidden p-2.5">
                {recruiter.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={recruiter.logoUrl} alt={`${recruiter.companyName} logo`} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-[#6B7280] text-[18px] leading-none font-bold text-center uppercase tracking-tight select-none">
                    {(recruiter.companyName || "R").trim().charAt(0)}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <h1 className="text-[18px] font-bold text-[#111827] tracking-tight">{recruiter.companyName}</h1>
                {recruiter.verified && <VerifiedBadge />}
              </div>
              <div className="text-[#9CA3AF] font-bold text-[11px] leading-relaxed mb-4">
                <div>{recruiter.location || "Location not set"}</div>
                {recruiter.tagline ? <div>{recruiter.tagline}</div> : null}
              </div>
              <Link
                href="/editrecruiter"
                className="w-full text-center text-white py-2.5 rounded-[16px] font-bold text-[14px] shadow-lg transition-all transform active:scale-95 bg-[#758FFF] hover:bg-[#657EF5] shadow-[#758FFF]/25"
              >
                Edit Profile
              </Link>
            </div>

            {/* About Card */}
            <div className="bg-white rounded-[28px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-white">
              <h2 className="text-[18px] font-bold text-[#111827] mb-3">About</h2>
              <p className="text-[#6B7280] font-bold text-[13px] leading-relaxed mb-6">
                {recruiter.about || "No company description provided yet."}
              </p>

              <div className="space-y-3">
                <div className="flex justify-between items-center text-[13px] font-bold">
                  <span className="text-[#9CA3AF]">Industry</span>
                  <span className="text-[#111827]">{recruiter.industry || "-"}</span>
                </div>
                <div className="flex justify-between items-center text-[13px] font-bold">
                  <span className="text-[#9CA3AF]">Company size</span>
                  <span className="text-[#111827] text-right">{recruiter.companySize || "-"}</span>
                </div>
                <div className="flex justify-between items-center text-[13px] font-bold">
                  <span className="text-[#9CA3AF]">Member since</span>
                  <span className="text-[#111827]">{recruiter.memberSince || "-"}</span>
                </div>
                <div className="flex justify-between items-center text-[13px] font-bold">
                  <span className="text-[#9CA3AF]">Website</span>
                  {recruiter.website ? (
                    <a
                      href={recruiter.website.startsWith("http") ? recruiter.website : `https://${recruiter.website}`}
                      className="text-[#0090FF] hover:underline transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {recruiter.website}
                    </a>
                  ) : (
                    <span className="text-[#111827]">-</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div>
            <div className="bg-white rounded-[22px] border border-slate-200 overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.04)] min-h-[520px] flex flex-col">

              {/* Tabs */}
              <div className="flex border-b border-[#E5E7EB] px-5 pt-3">
                <button
                  onClick={() => setActiveTab("jobs")}
                  className={`pb-2.5 px-3 font-bold text-[15px] transition-all relative ${activeTab === "jobs" ? "text-[#0090FF]" : "text-[#9CA3AF] hover:text-[#111827]"
                    }`}
                >
                  Job History
                  {activeTab === "jobs" && <div className="absolute bottom-[-2px] left-4 right-4 h-[3px] bg-[#0090FF] rounded-full" />}
                </button>
                <button
                  onClick={() => setActiveTab("reviews")}
                  className={`pb-2.5 px-3 font-bold text-[15px] transition-all relative ${activeTab === "reviews" ? "text-[#0090FF]" : "text-[#9CA3AF] hover:text-[#111827]"
                    }`}
                >
                  Reviews
                  {activeTab === "reviews" && <div className="absolute bottom-[-2px] left-4 right-4 h-[3px] bg-[#0090FF] rounded-full" />}
                </button>
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto">
                {activeTab === "jobs" ? (
                  <div className="divide-y divide-[#E5E7EB]">
                    {jobs.map((job) => (
                      <div key={job.id} className="p-6 flex items-center justify-between hover:bg-[#F9FAFB] transition-all duration-300">
                        <div className="flex items-center gap-4">
                          <div className="w-[56px] h-[56px] bg-[#F3F4F6] rounded-[16px] flex items-center justify-center border border-[#E5E7EB] shadow-sm">
                            <JobIconWrapper type={job.icon} />
                          </div>
                          <div>
                            <h3 className="text-[17px] font-bold text-[#111827] mb-0.5 tracking-tight">{job.title}</h3>
                            <p className="text-[#9CA3AF] text-[13px] font-bold tracking-tight">Posted on {job.postedOn}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-5">
                          <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full font-bold text-[12px] border ${job.status === "Completed"
                            ? "bg-[#E6FAF1] text-[#00C853] border-transparent"
                            : "bg-[#F3F4F6] text-[#6B7280] border-transparent"
                            }`}>
                            <div className={`w-2 h-2 rounded-full ${job.status === "Completed" ? "bg-[#00C853]" : "bg-[#6B7280]"}`} />
                            {job.status}
                          </div>
                          <span className="text-[#9CA3AF] text-[13px] font-bold min-w-[92px] text-right">
                            {job.applicants} Applicants
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="divide-y divide-[#E5E7EB]">
                    {reviews.map((review) => (
                      <div key={review.id} className="p-6 hover:bg-[#F9FAFB] transition-all duration-300">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 bg-[#DEEBFF] text-[#0090FF] rounded-full flex items-center justify-center font-bold text-[15px] uppercase border-2 border-white shadow-sm">
                              {review.reviewerName[0]}
                            </div>
                            <div>
                              <h4 className="text-[15px] font-bold text-[#111827] mb-0.5 tracking-tight">{review.reviewerName}</h4>
                              <div className="flex gap-0.5">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <StarIcon key={s} filled={s <= review.rating} />
                                ))}
                              </div>
                            </div>
                          </div>
                          <span className="text-[#9CA3AF] text-[11px] font-bold uppercase tracking-[0.1em]">{review.date}</span>
                        </div>
                        <p className="text-[#4B5563] font-bold text-[14px] leading-relaxed italic opacity-90">"{review.comment}"</p>
                      </div>
                    ))}
                    {reviews.length === 0 && (
                      <div className="p-12 text-center text-gray-400 font-bold">No reviews yet</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
