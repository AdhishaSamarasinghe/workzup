"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

type RecruiterJobApiItem = {
  id: string;
  title: string;
  status?: string;
  applicantsCount?: number;
  postedAt?: string;
};

type RecruiterJobsApiResponse = {
  items?: RecruiterJobApiItem[];
};

type RecruiterJob = {
  id: string;
  title: string;
  status: string;
  applicantsCount: number;
  postedAt: string | null;
};

const PAGE_SIZE = 8;

const normalizeStatus = (value?: string | null) => {
  const raw = String(value || "").trim().toUpperCase();
  if (!raw) return "UNKNOWN";
  if (raw === "ACTIVE") return "ACTIVE";
  if (raw === "COMPLETED") return "COMPLETED";
  if (raw === "PENDING") return "PENDING";
  return raw;
};

const statusClassName = (status: string) => {
  switch (status) {
    case "ACTIVE":
      return "bg-[#eafaf2] text-[#1f8a57] border border-[#c8efd9]";
    case "PENDING":
      return "bg-[#fff7e8] text-[#a26710] border border-[#ffe2b6]";
    case "COMPLETED":
      return "bg-[#edf2ff] text-[#3457d5] border border-[#d6e0ff]";
    default:
      return "bg-slate-100 text-slate-700 border border-slate-200";
  }
};

const formatStatus = (status: string) =>
  status
    .toLowerCase()
    .split("_")
    .map((piece) => piece.charAt(0).toUpperCase() + piece.slice(1))
    .join(" ");

const formatDate = (value?: string | null) => {
  if (!value) return "Unknown";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export default function RecruiterJobsPage() {
  const router = useRouter();

  const [jobs, setJobs] = useState<RecruiterJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    let active = true;

    const loadJobs = async () => {
      try {
        setLoading(true);
        setError(null);

        const payload = (await apiFetch("/api/recruiter/jobs")) as RecruiterJobsApiResponse;
        const rawItems = Array.isArray(payload?.items) ? payload.items : [];

        const normalized: RecruiterJob[] = rawItems.map((item) => ({
          id: String(item.id),
          title: item.title || "Untitled Job",
          status: normalizeStatus(item.status),
          applicantsCount: Number(item.applicantsCount || 0),
          postedAt: item.postedAt || null,
        }));

        if (!active) return;
        setJobs(normalized);
      } catch (fetchError) {
        if (!active) return;
        const message =
          fetchError instanceof Error ? fetchError.message : "Unable to load recruiter jobs.";
        setError(message);
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadJobs();

    return () => {
      active = false;
    };
  }, []);

  const filteredJobs = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return jobs.filter((job) => {
      const titleMatch = !needle || job.title.toLowerCase().includes(needle);
      const statusMatch = statusFilter === "ALL" || job.status === statusFilter;
      return titleMatch && statusMatch;
    });
  }, [jobs, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredJobs.length / PAGE_SIZE));

  const paginatedJobs = useMemo(() => {
    const safePage = Math.min(currentPage, totalPages);
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredJobs.slice(start, start + PAGE_SIZE);
  }, [filteredJobs, currentPage, totalPages]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const summary = useMemo(() => {
    const active = jobs.filter((job) => job.status === "ACTIVE").length;
    const completed = jobs.filter((job) => job.status === "COMPLETED").length;
    const totalApplicants = jobs.reduce((acc, job) => acc + job.applicantsCount, 0);
    return { active, completed, totalApplicants };
  }, [jobs]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#eef3ff,_#f8fbff_60%)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_12px_38px_rgba(52,87,213,0.08)] sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#60708e]">Recruiter Workspace</p>
              <h1 className="mt-2 text-3xl font-semibold text-[#0f172a]">My Jobs</h1>
              <p className="mt-2 text-sm text-slate-500">Manage openings, review applicants, and track progress from one place.</p>
            </div>
            <button
              type="button"
              onClick={() => router.push("/employer/create-job")}
              className="rounded-xl bg-[#3457d5] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2d4dbf]"
            >
              Post New Job
            </button>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-[#f8faff] p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">Total Jobs</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">{jobs.length}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-[#f8faff] p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">Active Jobs</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">{summary.active}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-[#f8faff] p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">Total Applicants</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">{summary.totalApplicants}</p>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-md">
              <input
                value={search}
                onChange={(event) => {
                  setCurrentPage(1);
                  setSearch(event.target.value);
                }}
                placeholder="Search jobs by title"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#3457d5] focus:ring-2 focus:ring-[#d7e0ff]"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(event) => {
                setCurrentPage(1);
                setStatusFilter(event.target.value);
              }}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#3457d5] focus:ring-2 focus:ring-[#d7e0ff]"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="PENDING">Pending</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>

          <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
            <div className="hidden grid-cols-[1.8fr_0.9fr_0.9fr_1.4fr] bg-[#f5f8ff] px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 md:grid">
              <span>Job</span>
              <span>Status</span>
              <span>Applicants</span>
              <span>Actions</span>
            </div>

            {loading ? (
              <div className="p-8 text-center text-sm text-slate-500">Loading jobs...</div>
            ) : error ? (
              <div className="p-8 text-center text-sm font-medium text-red-600">{error}</div>
            ) : paginatedJobs.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500">No jobs found for the current filters.</div>
            ) : (
              <div className="divide-y divide-slate-200">
                {paginatedJobs.map((job) => (
                  <div key={job.id} className="grid gap-3 px-5 py-4 md:grid-cols-[1.8fr_0.9fr_0.9fr_1.4fr] md:items-center">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{job.title}</p>
                      <p className="mt-1 text-xs text-slate-500">Posted {formatDate(job.postedAt)}</p>
                    </div>
                    <div>
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClassName(job.status)}`}>
                        {formatStatus(job.status)}
                      </span>
                    </div>
                    <div className="text-sm font-medium text-slate-700">{job.applicantsCount}</div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => router.push(`/recruiter/jobs/${job.id}/applicants`)}
                        className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                      >
                        View Applicants
                      </button>
                      <button
                        type="button"
                        onClick={() => router.push(`/employer/create-job/my-postings`)}
                        className="rounded-lg border border-[#3457d5] px-3 py-1.5 text-xs font-semibold text-[#3457d5] transition hover:bg-[#eef3ff]"
                      >
                        Manage Post
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-5 flex items-center justify-between text-sm text-slate-600">
            <p>
              Showing {paginatedJobs.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}
              {" - "}
              {Math.min(currentPage * PAGE_SIZE, filteredJobs.length)} of {filteredJobs.length}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-50"
              >
                Prev
              </button>
              <span className="text-xs font-semibold text-slate-500">Page {currentPage} / {totalPages}</span>
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
