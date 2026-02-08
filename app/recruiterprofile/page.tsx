"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

type RecruiterProfile = {
  companyName: string;
  location: string;
  isVerified: boolean;

  about: string;
  industry: string;
  companySize: string;
  memberSince: string;
  website: string;

  logoBase64: string | null;
};

type RecruiterReview = {
  id: string;
  recruiterId: string;
  reviewerName: string;
  rating: number;
  comment: string;
  createdAt: string;
};

type RecruiterJob = {
  id: string;
  recruiterId: string;
  title: string;
  postedDate: string; // ISO
  status: "Active" | "Completed" | "Expired";
  applicants: number;
  icon: string;
};

export default function RecruiterProfilePage() {
  const [activeTab, setActiveTab] = useState<"history" | "reviews">("history");

  // Profile
  const [data, setData] = useState<RecruiterProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Reviews
  const [reviews, setReviews] = useState<RecruiterReview[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  // Jobs (Job History)
  const [jobs, setJobs] = useState<RecruiterJob[]>([]);
  const [jobsLoading, setJobsLoading] = useState(false);

  const loadProfile = async () => {
    const res = await fetch("/api/recruiter-profile", { cache: "no-store" });
    const json = await res.json();
    if (json.ok) setData(json.data);
  };

  const loadReviews = async () => {
    setReviewsLoading(true);
    try {
      const res = await fetch("/api/recruiter-reviews?recruiterId=default", {
        cache: "no-store",
      });
      const json = await res.json();
      if (json.ok) setReviews(json.data); // newest-first from backend
    } finally {
      setReviewsLoading(false);
    }
  };

  const loadJobs = async () => {
    setJobsLoading(true);
    try {
      const res = await fetch("/api/recruiter-jobs?recruiterId=default", {
        cache: "no-store",
      });
      const json = await res.json();
      if (json.ok) setJobs(json.data); // newest-first from backend
    } finally {
      setJobsLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        await Promise.all([loadProfile(), loadReviews(), loadJobs()]);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg grid place-items-center">
        <p className="text-muted">Loading recruiter profile...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-bg grid place-items-center">
        <p className="text-muted">Could not load profile.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg py-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[320px_1fr]">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Profile Card */}
            <div className="rounded-2xl bg-card p-6 shadow-sm">
              <div className="flex flex-col items-center text-center">
                {/* Logo */}
                <div className="mb-4">
                  <div className="relative mx-auto h-28 w-28 overflow-hidden rounded-full bg-[#3d5a4c] sm:h-32 sm:w-32 md:h-36 md:w-36">
                    {data.logoBase64 ? (
                      <Image
                        src={data.logoBase64}
                        alt={`${data.companyName} logo`}
                        fill
                        className="object-cover"
                        priority
                        unoptimized
                      />
                    ) : (
                      <Image
                        src="/company_logo.png"
                        alt={`${data.companyName} logo`}
                        fill
                        className="object-cover"
                        priority
                      />
                    )}
                  </div>
                </div>

                {/* Name + Verified */}
                <div className="mb-1 flex items-center gap-1.5">
                  <h1 className="text-xl font-semibold text-[#1F2937]">
                    {data.companyName}
                  </h1>
                  {data.isVerified && (
                    <svg
                      className="h-5 w-5 text-[#3B82F6]"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <circle cx="12" cy="12" r="10" fill="#3B82F6" />
                      <path
                        d="M9 12l2 2 4-4"
                        stroke="white"
                        strokeWidth="2"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>

                <p className="text-sm text-muted">{data.location}</p>
                <p className="mt-1 text-sm text-muted">Verified Employer</p>

                <Link
                  href="#"
                  className="mt-5 inline-block w-full max-w-[180px] rounded-full bg-accent py-2.5 text-center text-sm font-medium text-white transition-colors hover:bg-accent/90"
                >
                  Contact
                </Link>

                <Link
                  href="/editrecruiter"
                  className="mt-3 inline-block w-full max-w-[180px] rounded-full border border-[#E5E7EB] bg-card py-2.5 text-center text-sm font-medium text-[#1F2937] hover:bg-[#F9FAFB]"
                >
                  Edit recruiter
                </Link>
              </div>
            </div>

            {/* About */}
            <div className="rounded-2xl bg-card p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-[#1F2937]">
                About
              </h2>
              <p className="mb-6 text-sm leading-relaxed text-muted">
                {data.about}
              </p>

              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <span className="text-sm text-muted">Industry</span>
                  <span className="text-right text-sm font-medium text-[#1F2937]">
                    {data.industry}
                  </span>
                </div>
                <div className="flex items-start justify-between">
                  <span className="text-sm text-muted">Company size</span>
                  <span className="text-right text-sm font-medium text-[#1F2937]">
                    {data.companySize}
                  </span>
                </div>
                <div className="flex items-start justify-between">
                  <span className="text-sm text-muted">Member since</span>
                  <span className="text-right text-sm font-medium text-[#1F2937]">
                    {data.memberSince}
                  </span>
                </div>
                <div className="flex items-start justify-between">
                  <span className="text-sm text-muted">Website</span>
                  <a
                    href={data.website ? `https://${data.website}` : "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-accent hover:underline"
                  >
                    {data.website || "—"}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="rounded-2xl bg-card p-6 shadow-sm">
            {/* Tabs */}
            <div className="mb-6 flex gap-6 border-b border-[#E5E7EB]">
              <button
                onClick={() => {
                  setActiveTab("history");
                  loadJobs(); // ✅ refresh jobs when tab opened
                }}
                className={`pb-3 text-sm font-medium transition-colors ${
                  activeTab === "history"
                    ? "border-b-2 border-accent text-accent"
                    : "text-muted hover:text-[#1F2937]"
                }`}
              >
                Job History
              </button>

              <button
                onClick={() => {
                  setActiveTab("reviews");
                  loadReviews(); // ✅ refresh reviews when tab opened
                }}
                className={`pb-3 text-sm font-medium transition-colors ${
                  activeTab === "reviews"
                    ? "border-b-2 border-accent text-accent"
                    : "text-muted hover:text-[#1F2937]"
                }`}
              >
                Reviews
              </button>
            </div>

            {/* Job History Tab */}
            {activeTab === "history" && (
              <div className="space-y-4">
                {jobsLoading ? (
                  <p className="text-muted">Loading jobs...</p>
                ) : jobs.length === 0 ? (
                  <div className="py-8 text-center text-muted">
                    <p>No jobs posted yet.</p>
                  </div>
                ) : (
                  jobs.map((job) => (
                    <div
                      key={job.id}
                      className="flex items-center justify-between rounded-xl border border-[#E5E7EB] p-4 transition-colors hover:bg-[#F9FAFB]"
                    >
                      <div className="flex items-center gap-4">
                        {/* Icon */}
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#F3F4F6] text-lg sm:h-12 sm:w-12 sm:text-xl">
                          {job.icon}
                        </div>

                        {/* Info */}
                        <div>
                          <h3 className="font-medium text-[#1F2937]">
                            {job.title}
                          </h3>
                          <p className="text-sm text-muted">
                            Posted on{" "}
                            {new Date(job.postedDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {/* Status & applicants */}
                      <div className="flex items-center gap-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                            job.status === "Completed"
                              ? "bg-[#D1FAE5] text-[#059669]"
                              : job.status === "Active"
                              ? "bg-[#DBEAFE] text-[#2563EB]"
                              : "bg-[#F3F4F6] text-[#6B7280]"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              job.status === "Completed"
                                ? "bg-[#059669]"
                                : job.status === "Active"
                                ? "bg-[#2563EB]"
                                : "bg-[#6B7280]"
                            }`}
                          />
                          {job.status}
                        </span>

                        <span className="text-sm text-muted">
                          {job.applicants} Applicants
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === "reviews" && (
              <div className="space-y-4">
                {reviewsLoading ? (
                  <p className="text-muted">Loading reviews...</p>
                ) : reviews.length === 0 ? (
                  <div className="py-8 text-center text-muted">
                    <p>No reviews yet.</p>
                  </div>
                ) : (
                  reviews.map((r) => (
                    <div
                      key={r.id}
                      className="rounded-xl border border-[#E5E7EB] p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-[#1F2937]">
                            {r.reviewerName}
                          </p>
                          <p className="text-xs text-muted">
                            {new Date(r.createdAt).toLocaleString()}
                          </p>
                        </div>

                        <div className="flex items-center gap-1 text-sm">
                          <span className="font-semibold text-[#1F2937]">
                            {r.rating}
                          </span>
                          <span className="text-yellow-500">★</span>
                          <span className="text-muted">/ 5</span>
                        </div>
                      </div>

                      <p className="mt-3 text-sm text-muted leading-relaxed">
                        {r.comment}
                      </p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
