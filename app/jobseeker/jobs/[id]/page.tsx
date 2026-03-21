"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { BrowseJob, formatPay, formatDateLabel } from "@/lib/browse";
import { MapPin, Calendar, DollarSign, Building2, BriefcaseBusiness } from "lucide-react";

export default function JobApplyPage() {
  const params = useParams();
  const id = params?.id as string;

  const [job, setJob] = useState<BrowseJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    const fetchJob = async () => {
      try {
        setLoading(true);
        const data = await apiFetch(`/api/jobs/${id}`);
        setJob(data.job || data);
      } catch (err: unknown) {
        console.error("Failed to load job details:", err);
        setError("Failed to load job details. The job may have been removed.");
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F7FB] flex items-center justify-center">
        <div className="text-slate-500 font-medium">Loading job details...</div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-[#F5F7FB] flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-sm">
          <BriefcaseBusiness className="mx-auto h-12 w-12 text-slate-300 mb-4" />
          <h2 className="text-xl font-semibold text-slate-800 mb-2">Job Not Found</h2>
          <p className="text-slate-500 mb-6">{error || "The job you are looking for does not exist."}</p>
          <Link
            href="/jobseeker/browse"
            className="inline-flex items-center justify-center rounded-xl bg-[#6b8bff] px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Back to Browse
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7FB] text-[#111827]">
      <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-24 sm:pt-28 md:px-6 lg:px-8">
        <section className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold text-[#111827] sm:text-4xl">
                {job.title}
              </h1>
              <div className="mt-3 flex items-center gap-2 text-slate-500">
                <Building2 className="h-4 w-4" />
                <span className="font-medium">{job.companyName}</span>
                <span className="px-2">&bull;</span>
                <span className="text-sm">{job.derivedCategory}</span>
              </div>
            </div>
            <span className="rounded-full bg-[#E8F7F2] px-3 py-1 text-xs font-semibold text-[#0F766E]">
              Urgent Hire
            </span>
          </div>

          <div className="mt-8 grid gap-4 border-t border-[#E5E7EB] pt-6 sm:grid-cols-4">
            <div className="flex gap-3 items-start">
              <div className="rounded-full bg-blue-50 p-2 text-[#6b8bff]">
                <DollarSign className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Pay Rate</p>
                <p className="mt-1 text-sm font-semibold text-[#111827]">{formatPay(job.pay, job.payType)}</p>
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <div className="rounded-full bg-blue-50 p-2 text-[#6b8bff]">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Location</p>
                <p className="mt-1 text-sm font-semibold text-[#111827]">{job.location}</p>
              </div>
            </div>

            <div className="flex gap-3 items-start sm:col-span-2">
              <div className="rounded-full bg-blue-50 p-2 text-[#6b8bff]">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Date</p>
                <p className="mt-1 text-sm font-semibold text-[#111827]">{formatDateLabel(job.date)}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.45fr_0.95fr]">
          <div className="space-y-6">
            <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-xl font-semibold">Job Description</h2>
              <div className="mt-4 text-sm leading-relaxed text-[#4B5563] whitespace-pre-line">
                {job.description}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm sm:p-8 lg:sticky lg:top-24">
              <div className="space-y-3">
                <Link
                  href={`/apply-form?jobId=${id}`}
                  className="inline-flex w-full items-center justify-center rounded-xl bg-[#6b8bff] px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#5a78e8]"
                >
                  Apply Now
                </Link>
                <p className="text-center text-xs text-[#6B7280] pt-2">
                  Posted {formatDateLabel(job.date)}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm sm:p-8">
              <h3 className="text-lg font-semibold">About the Employer</h3>
              <div className="mt-4 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#E5E7EB] bg-slate-50 text-sm font-semibold text-[#6B7280]">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#111827]">
                    {job.companyName}
                  </p>
                  <button
                    type="button"
                    className="mt-1 text-xs font-semibold text-[#6b8bff] hover:underline"
                  >
                    View company profile
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
