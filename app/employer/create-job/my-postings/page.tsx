"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import CustomSelect from "@/components/ui/CustomSelect";

// Safe mock Job type
type EmployerJob = {
  id: string;
  title: string;
  location: string;
  postedDate: string;
  jobDate: string;
  hourlyRate: number;
  status: "DRAFT" | "PUBLIC" | "PRIVATE";
  newApplicants: number;
  totalApplicants: number;
};

export default function MyJobPostingsPage() {

  const [jobs, setJobs] = useState<EmployerJob[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [hasToken, setHasToken] = useState<boolean>(false);
  const [checkedToken, setCheckedToken] = useState<boolean>(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Custom simple debounce hook to avoid needing to install new packages
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("token");
    setHasToken(!!token);
    setCheckedToken(true);
  }, []);

  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(timerId);
  }, [searchTerm]);

  const fetchJobs = useCallback(async () => {
    if (!checkedToken) return;

    setLoading(true);
    setError("");

    if (!hasToken) {
      setJobs([]);
      setError("Please sign in as recruiter or employer to view your job postings.");
      setLoading(false);
      return;
    }

    try {
      const queryParams = new URLSearchParams();
      if (debouncedSearchTerm) queryParams.append("search", debouncedSearchTerm);
      if (statusFilter !== "ALL") queryParams.append("status", statusFilter);

      const data = await apiFetch(`/api/employer/my-postings?${queryParams.toString()}`);
      setJobs(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || "Failed to load jobs. The backend might be unreachable.");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchTerm, statusFilter, hasToken, checkedToken]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
          <div>
            <div className="text-xs text-slate-500 mb-2 uppercase tracking-wider font-bold">Employer / Hub</div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">My Job Postings</h1>
            <p className="text-slate-600 mt-1 text-lg">Manage your active job listings and drafts.</p>
          </div>
          <Link
            href="/employer/create-job"
            className="btn-primary min-w-[156px] w-fit px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 whitespace-nowrap text-center"
          >
            Post a new job
          </Link>
        </div>

        {/* Filters */}
        <div className="mt-5 flex flex-col sm:flex-row items-center gap-3 mb-6 bg-white p-4 rounded-xl border border-slate-200">
          <input
            type="text"
            placeholder="Search by title or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-auto flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm outline-none focus:border-blue-500"
          />
          <div className="w-full sm:w-[190px]">
            <CustomSelect
              value={statusFilter}
              onChange={(val) => setStatusFilter(val || "ALL")}
              options={["ALL", "PUBLIC", "PRIVATE", "DRAFT"]}
              placeholder="All Status"
              searchable={false}
              showAllOption={false}
            />
          </div>
          <button
            onClick={fetchJobs}
            className="w-full sm:w-auto rounded-lg border border-slate-300 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-100"
          >
            Refresh
          </button>
        </div>

        {/* Status Indicators */}
        {loading && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 text-slate-600">
            Fetching jobs...
          </div>
        )}

        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-700">
            <div className="space-y-3">
              <p>{error}</p>
              {!hasToken && (
                <Link
                  href="/auth/login/recruiter"
                  className="inline-flex items-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  Go to Recruiter Login
                </Link>
              )}
            </div>
          </div>
        )}

        {!loading && !error && jobs.length === 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center">
            <h2 className="text-xl font-bold text-slate-900">No jobs found</h2>
            <p className="text-slate-600 mt-2">Try adjusting your search or create a new job.</p>
          </div>
        )}

        {/* Job Listings */}
        {!loading && !error && jobs.length > 0 && (
          <div className="grid grid-cols-1 gap-4">
            {jobs.map((job) => (
              <div key={job.id} className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-blue-200 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-bold text-slate-900">{job.title}</h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${job.status === 'PUBLIC' ? 'bg-green-100 text-green-700' :
                      job.status === 'DRAFT' ? 'bg-slate-100 text-slate-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                      {job.status}
                    </span>
                  </div>
                  <div className="text-sm text-slate-600 mb-3">
                    {job.location} • ${job.hourlyRate}/hr
                  </div>
                  <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                    <div><span className="font-medium text-slate-700">Posted:</span> {formatDate(job.postedDate)}</div>
                    <div><span className="font-medium text-slate-700">Job Date:</span> {formatDate(job.jobDate)}</div>
                  </div>
                </div>

                <div className="flex flex-col sm:items-end gap-3 min-w-[200px]">
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex flex-col items-center">
                      <span className="font-bold text-blue-600 text-lg leading-none">{job.newApplicants}</span>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">New</span>
                    </div>
                    <div className="w-px h-8 bg-slate-200"></div>
                    <div className="flex flex-col items-center">
                      <span className="font-bold text-slate-700 text-lg leading-none">{job.totalApplicants}</span>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Total</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto mt-2">
                    {/* Safe placeholders for navigation, using # layout without breaking existing routes if they do not exist */}
                    <Link
                      href={`/employer/edit-job/${job.id}`}
                      className="flex-1 sm:flex-none text-center rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Edit Job
                    </Link>
                    <Link
                      href={`/recruiter/jobs/${job.id}/applicants`}
                      className="flex-1 sm:flex-none text-center rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
                    >
                      View Applicants
                    </Link>
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}