"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Job = {
  _id: string;
  title: string;
  description: string;
  pay: number;
  payType: "hour" | "day";
  category: string;
  location: string;
  jobDate: string;
  status: "DRAFT" | "PUBLISHED";
  createdAt: string;
};

export default function MyPostingsPage() {
  const API_BASE = useMemo(
    () => process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000",
    []
  );

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadJobs() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/jobs`, { cache: "no-store" });
      const data = await res.json();

      if (!res.ok) {
        setError(data?.message || "Failed to load jobs");
        return;
      }

      setJobs(Array.isArray(data) ? data : []);
    } catch {
      setError("Backend not reachable. Is it running on :5000?");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function formatDate(iso: string) {
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString();
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs text-slate-500 mb-2">Dashboard / My postings</div>
            <h1 className="text-3xl font-extrabold text-slate-900">My Job Postings</h1>
            <p className="text-slate-600 mt-1">View drafts and published job posts.</p>
          </div>

          <Link
            href="/employer/create-job"
            className="bg-blue-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-blue-700 transition"
          >
            + Create Job
          </Link>
        </div>

        <div className="mt-5 flex items-center gap-3">
          <button
            onClick={loadJobs}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-100"
          >
            Refresh
          </button>

          <div className="text-sm text-slate-500">
            Total: <span className="font-semibold text-slate-800">{jobs.length}</span>
          </div>
        </div>

        {loading && (
          <div className="mt-6 bg-white border border-slate-200 rounded-2xl p-6">
            Loading...
          </div>
        )}

        {error && !loading && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-2xl p-6 text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && jobs.length === 0 && (
          <div className="mt-6 bg-white border border-slate-200 rounded-2xl p-10 text-center">
            <h2 className="text-xl font-bold text-slate-900">No jobs yet</h2>
            <p className="text-slate-600 mt-2">Create your first job to see it here.</p>
          </div>
        )}

        {!loading && !error && jobs.length > 0 && (
          <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr className="text-slate-600">
                    <th className="px-4 py-3 font-semibold">Title</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Pay</th>
                    <th className="px-4 py-3 font-semibold">Category</th>
                    <th className="px-4 py-3 font-semibold">Location</th>
                    <th className="px-4 py-3 font-semibold">Job Date</th>
                    <th className="px-4 py-3 font-semibold">Created</th>
                  </tr>
                </thead>

                <tbody>
                  {jobs.map((job) => (
                    <tr key={job._id} className="border-b border-slate-100 last:border-0">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">{job.title}</div>
                        <div className="text-xs text-slate-500 line-clamp-1">
                          {job.description}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold border ${
                            job.status === "PUBLISHED"
                              ? "bg-green-50 text-green-700 border-green-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}
                        >
                          {job.status}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-slate-800">
                        ${job.pay} / {job.payType}
                      </td>

                      <td className="px-4 py-3 text-slate-700">{job.category || "—"}</td>

                      <td className="px-4 py-3 text-slate-700">{job.location}</td>

                      <td className="px-4 py-3 text-slate-700">{formatDate(job.jobDate)}</td>

                      <td className="px-4 py-3 text-slate-500">{formatDate(job.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
