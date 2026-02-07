"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

// Sample data for the recruiter profile
const recruiterData = {
  companyName: "Construct Co.",
  location: "San Francisco, CA",
  isVerified: true,
  about:
    "We are a leading construction firm dedicated to building the future with quality, integrity, and innovation",
  industry: "Construction & Real Estate",
  companySize: "50-100 employees",
  memberSince: "August 2023",
  website: "constructco.com",
};

const jobHistory = [
  {
    id: 1,
    title: "General Laborer",
    postedDate: "Oct 26, 2023",
    status: "Completed",
    applicants: 35,
    icon: "🔧",
  },
  {
    id: 2,
    title: "Warehouse Associate",
    postedDate: "Sep 15, 2023",
    status: "Completed",
    applicants: 52,
    icon: "📦",
  },
  {
    id: 3,
    title: "Delivery Driver",
    postedDate: "Aug 02, 2023",
    status: "Expired",
    applicants: 18,
    icon: "🚚",
  },
];

export default function RecruiterProfilePage() {
  const [activeTab, setActiveTab] = useState<"history" | "reviews">("history");

  return (
    <div className="min-h-screen bg-bg py-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[320px_1fr]">
          {/* Left Column - Profile Card & About */}
          <div className="space-y-6">
            {/* Profile Card */}
            <div className="rounded-2xl bg-card p-6 shadow-sm">
              <div className="flex flex-col items-center text-center">
                {/* Company Logo */}
                <div className="mb-4">
                  <div className="relative h-28 w-28 sm:h-32 sm:w-32 md:h-36 md:w-36 mx-auto rounded-full overflow-hidden bg-[#3d5a4c]">
                    <Image
                      src="/company_logo.png"
                      alt={`${recruiterData.companyName} logo`}
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>
                </div>

                {/* Company Name with Verified Badge */}
                <div className="mb-1 flex items-center gap-1.5">
                  <h1 className="text-xl font-semibold text-[#1F2937]">
                    {recruiterData.companyName}
                  </h1>
                  {recruiterData.isVerified && (
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

                {/* Location */}
                <p className="text-sm text-muted">{recruiterData.location}</p>

                {/* Verified Employer Text */}
                <p className="mt-1 text-sm text-muted">Verified Employer</p>

                {/* Contact Button - links to messages (placeholder) */}
                <Link
                  href="#"
                  aria-label="Contact company"
                  className="mt-5 inline-block w-full max-w-[180px] rounded-full bg-accent py-2.5 text-center text-sm font-medium text-white transition-colors hover:bg-accent/90"
                >
                  Contact
                </Link>
                {/* Edit Recruiter Button - links to edit recruiter page (placeholder) */}
                <Link
                  href="/editrecruiter"
                  aria-label="Edit recruiter"
                  className="mt-3 inline-block w-full max-w-[180px] rounded-full border border-[#E5E7EB] bg-card py-2.5 text-center text-sm font-medium text-[#1F2937] hover:bg-[#F9FAFB]"
                >
                  Edit recruiter
                </Link>
              </div>
            </div>

            {/* About Section */}
            <div className="rounded-2xl bg-card p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-[#1F2937]">
                About
              </h2>
              <p className="mb-6 text-sm leading-relaxed text-muted">
                {recruiterData.about}
              </p>

              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <span className="text-sm text-muted">Industry</span>
                  <span className="text-right text-sm font-medium text-[#1F2937]">
                    {recruiterData.industry}
                  </span>
                </div>
                <div className="flex items-start justify-between">
                  <span className="text-sm text-muted">Company size</span>
                  <span className="text-right text-sm font-medium text-[#1F2937]">
                    {recruiterData.companySize}
                  </span>
                </div>
                <div className="flex items-start justify-between">
                  <span className="text-sm text-muted">Member since</span>
                  <span className="text-right text-sm font-medium text-[#1F2937]">
                    {recruiterData.memberSince}
                  </span>
                </div>
                <div className="flex items-start justify-between">
                  <span className="text-sm text-muted">Website</span>
                  <a
                    href={`https://${recruiterData.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-accent hover:underline"
                  >
                    {recruiterData.website}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Job History & Reviews */}
          <div className="rounded-2xl bg-card p-6 shadow-sm">
            {/* Tabs */}
            <div className="mb-6 flex gap-6 border-b border-[#E5E7EB]">
              <button
                onClick={() => setActiveTab("history")}
                className={`pb-3 text-sm font-medium transition-colors ${
                  activeTab === "history"
                    ? "border-b-2 border-accent text-accent"
                    : "text-muted hover:text-[#1F2937]"
                }`}
              >
                Job History
              </button>
              <button
                onClick={() => setActiveTab("reviews")}
                className={`pb-3 text-sm font-medium transition-colors ${
                  activeTab === "reviews"
                    ? "border-b-2 border-accent text-accent"
                    : "text-muted hover:text-[#1F2937]"
                }`}
              >
                Reviews
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === "history" && (
              <div className="space-y-4">
                {jobHistory.map((job) => (
                  <div
                    key={job.id}
                    className="flex items-center justify-between rounded-xl border border-[#E5E7EB] p-4 transition-colors hover:bg-[#F9FAFB]"
                  >
                    <div className="flex items-center gap-4">
                      {/* Job Icon */}
                      <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-[#F3F4F6] text-lg sm:text-xl">
                        {job.icon}
                      </div>

                      {/* Job Info */}
                      <div>
                        <h3 className="font-medium text-[#1F2937]">
                          {job.title}
                        </h3>
                        <p className="text-sm text-muted">
                          Posted on {job.postedDate}
                        </p>
                      </div>
                    </div>

                    {/* Status & Applicants */}
                    <div className="flex items-center gap-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                          job.status === "Completed"
                            ? "bg-[#D1FAE5] text-[#059669]"
                            : "bg-[#F3F4F6] text-[#6B7280]"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            job.status === "Completed"
                              ? "bg-[#059669]"
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
                ))}
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="py-8 text-center text-muted">
                <p>No reviews yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
