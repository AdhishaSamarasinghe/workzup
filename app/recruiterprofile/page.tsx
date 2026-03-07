"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, User, Hammer, Home, Truck, Star, CheckCircle } from "lucide-react";
import { fetchRecruiter, fetchRecruiterJobs, fetchRecruiterReviews, contactRecruiter } from "@/lib/api";

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

const VerifiedBadge = () => <CheckCircle className="w-5 h-5 text-green-500 fill-current bg-white rounded-full" />;

const StarIcon = ({ filled }: { filled: boolean }) => (
  <Star className={`w-4 h-4 ${filled ? "text-yellow-400 fill-current" : "text-gray-200"}`} />
);

const JobIconWrapper = ({ type }: { type: string }) => {
  const iconClass = "w-8 h-8 text-[#111827]";
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
  const router = useRouter();
  const [recruiter, setRecruiter] = useState<Recruiter | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [activeTab, setActiveTab] = useState<"jobs" | "reviews">("jobs");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contactStatus, setContactStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  useEffect(() => {
    async function loadData() {
      try {
        const id = "default";
        const [profileRes, jobsRes, reviewsRes] = await Promise.all([
          fetchRecruiter(id),
          fetchRecruiterJobs(id),
          fetchRecruiterReviews(id),
        ]);

        if (profileRes.success) setRecruiter(profileRes.data);
        if (jobsRes.success) setJobs(jobsRes.data);
        if (reviewsRes.success) setReviews(reviewsRes.data);
      } catch (err: any) {
        console.error("Failed to load recruiter data:", err);
        setError(`Backend not reachable. ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handleContact = async () => {
    if (!recruiter) return;
    setContactStatus("sending");
    try {
      await contactRecruiter("default");
      setContactStatus("sent");
      setTimeout(() => setContactStatus("idle"), 3000);
    } catch {
      setContactStatus("error");
      setTimeout(() => setContactStatus("idle"), 3000);
    }
  };

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
    <div className="min-h-screen bg-[#F7F9FC] pb-20 font-sans antialiased text-[#111827]">
      {/* Main Container */}
      <main className="max-w-[1240px] mx-auto px-6 mt-12 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-12">

          {/* LEFT COLUMN */}
          <div className="space-y-8">
            {/* Company Card */}
            <div className="bg-white rounded-[40px] p-10 shadow-[0_4px_20px_rgba(0,0,0,0.03)] text-center flex flex-col items-center border border-white">
              <div className="w-[124px] h-[124px] bg-[#67805F] rounded-full flex items-center justify-center mb-6 border-[6px] border-white shadow-sm overflow-hidden p-4">
                <span className="text-white text-[12px] leading-[1.1] font-bold text-center uppercase tracking-tighter opacity-90 select-none">CONSTRUCT...C<br /><span className="text-[6px] opacity-60">NATIONALFOUNDATION</span></span>
              </div>
              <div className="flex items-center justify-center gap-2 mb-1">
                <h1 className="text-[28px] font-bold text-[#111827] tracking-tight">{recruiter.companyName}</h1>
                <VerifiedBadge />
              </div>
              <div className="text-[#9CA3AF] font-bold text-[15px] leading-relaxed mb-8">
                {recruiter.location}<br />
                {recruiter.tagline}
              </div>
              <button
                onClick={handleContact}
                disabled={contactStatus === "sending"}
                className={`w-full text-white py-4 rounded-[24px] font-bold text-[18px] shadow-lg transition-all transform active:scale-95 ${contactStatus === "sending"
                    ? "bg-[#A0AFFF] cursor-not-allowed"
                    : "bg-[#758FFF] hover:bg-[#657EF5] shadow-[#758FFF]/25"
                  }`}
              >
                {contactStatus === "sending" ? "Sending..." : "Contact"}
              </button>
              {contactStatus === "sent" && (
                <p className="mt-3 text-center text-[14px] font-bold text-green-600 animate-pulse">
                  ✓ Message request sent!
                </p>
              )}
              {contactStatus === "error" && (
                <p className="mt-3 text-center text-[14px] font-bold text-red-500">
                  ✗ Failed to send. Try again.
                </p>
              )}
            </div>

            {/* About Card */}
            <div className="bg-white rounded-[40px] p-10 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-white">
              <h2 className="text-[24px] font-bold text-[#111827] mb-6">About</h2>
              <p className="text-[#6B7280] font-bold text-[16px] leading-relaxed mb-10">
                {recruiter.about}
              </p>

              <div className="space-y-6">
                <div className="flex justify-between items-center text-[15px] font-bold">
                  <span className="text-[#9CA3AF]">Industry</span>
                  <span className="text-[#111827]">{recruiter.industry}</span>
                </div>
                <div className="flex justify-between items-center text-[15px] font-bold">
                  <span className="text-[#9CA3AF]">Company size</span>
                  <span className="text-[#111827] text-right">{recruiter.companySize}</span>
                </div>
                <div className="flex justify-between items-center text-[15px] font-bold">
                  <span className="text-[#9CA3AF]">Member since</span>
                  <span className="text-[#111827]">{recruiter.memberSince}</span>
                </div>
                <div className="flex justify-between items-center text-[15px] font-bold">
                  <span className="text-[#9CA3AF]">Website</span>
                  <a href={`https://${recruiter.website}`} className="text-[#0090FF] hover:underline transition-colors" target="_blank" rel="noopener noreferrer">
                    {recruiter.website}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div>
            <div className="bg-white rounded-[32px] border-[3px] border-[#0090FF] overflow-hidden shadow-[0_8px_30px_rgba(0,144,255,0.04)] min-h-[640px] flex flex-col">

              {/* Tabs */}
              <div className="flex border-b border-[#E5E7EB] px-8 pt-6">
                <button
                  onClick={() => setActiveTab("jobs")}
                  className={`pb-4 px-6 font-bold text-[18px] transition-all relative ${activeTab === "jobs" ? "text-[#0090FF]" : "text-[#9CA3AF] hover:text-[#111827]"
                    }`}
                >
                  Job History
                  {activeTab === "jobs" && <div className="absolute bottom-[-3px] left-6 right-6 h-[4px] bg-[#0090FF] rounded-full" />}
                </button>
                <button
                  onClick={() => setActiveTab("reviews")}
                  className={`pb-4 px-6 font-bold text-[18px] transition-all relative ${activeTab === "reviews" ? "text-[#0090FF]" : "text-[#9CA3AF] hover:text-[#111827]"
                    }`}
                >
                  Reviews
                  {activeTab === "reviews" && <div className="absolute bottom-[-3px] left-6 right-6 h-[4px] bg-[#0090FF] rounded-full" />}
                </button>
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto">
                {activeTab === "jobs" ? (
                  <div className="divide-y divide-[#E5E7EB]">
                    {jobs.map((job) => (
                      <div key={job.id} className="p-10 flex items-center justify-between hover:bg-[#F9FAFB] transition-all duration-300">
                        <div className="flex items-center gap-6">
                          <div className="w-[72px] h-[72px] bg-[#F3F4F6] rounded-[24px] flex items-center justify-center border border-[#E5E7EB] shadow-sm">
                            <JobIconWrapper type={job.icon} />
                          </div>
                          <div>
                            <h3 className="text-[22px] font-bold text-[#111827] mb-0.5 tracking-tight">{job.title}</h3>
                            <p className="text-[#9CA3AF] text-[16px] font-bold tracking-tight">Posted on {job.postedOn}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-10">
                          <div className={`flex items-center gap-2.5 px-6 py-2 rounded-full font-bold text-[16px] border ${job.status === "Completed"
                            ? "bg-[#E6FAF1] text-[#00C853] border-transparent"
                            : "bg-[#F3F4F6] text-[#6B7280] border-transparent"
                            }`}>
                            <div className={`w-2.5 h-2.5 rounded-full ${job.status === "Completed" ? "bg-[#00C853]" : "bg-[#6B7280]"}`} />
                            {job.status}
                          </div>
                          <span className="text-[#9CA3AF] text-[16px] font-bold min-w-[120px] text-right">
                            {job.applicants} Applicants
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="divide-y divide-[#E5E7EB]">
                    {reviews.map((review) => (
                      <div key={review.id} className="p-10 hover:bg-[#F9FAFB] transition-all duration-300">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-[#DEEBFF] text-[#0090FF] rounded-full flex items-center justify-center font-bold text-[20px] uppercase border-2 border-white shadow-sm">
                              {review.reviewerName[0]}
                            </div>
                            <div>
                              <h4 className="text-[18px] font-bold text-[#111827] mb-0.5 tracking-tight">{review.reviewerName}</h4>
                              <div className="flex gap-0.5">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <StarIcon key={s} filled={s <= review.rating} />
                                ))}
                              </div>
                            </div>
                          </div>
                          <span className="text-[#9CA3AF] text-[14px] font-bold uppercase tracking-[0.15em]">{review.date}</span>
                        </div>
                        <p className="text-[#4B5563] font-bold text-[17px] leading-relaxed italic opacity-90">"{review.comment}"</p>
                      </div>
                    ))}
                    {reviews.length === 0 && (
                      <div className="p-20 text-center text-gray-400 font-bold">No reviews yet</div>
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
