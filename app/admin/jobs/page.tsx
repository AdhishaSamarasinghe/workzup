"use client";

import React, { useState, useEffect, useCallback } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import StatusBadge from "@/components/admin/StatusBadge";
import { getAdminJobs, toggleJobStatus as apiToggleJobStatus } from "@/lib/admin/api";
import {
  Search,
  Filter,
  Plus,
  MoreVertical,
  EyeOff,
  Flag,
  RotateCcw,
} from "lucide-react";

type JobStatus = "Published" | "Flagged" | "Closed" | "PUBLIC" | "PRIVATE" | "DRAFT" | "CANCELLED" | "COMPLETED" | "FLAGGED";
type JobTab = "All Jobs" | "PUBLIC" | "FLAGGED" | "COMPLETED" | "DRAFT";

type JobRow = {
  id: string;
  title: string;
  company: string;
  postedDate: string;
  applicants: number;
  status: JobStatus;
  boosted?: boolean;
};

const tabs: JobTab[] = ["All Jobs", "PUBLIC", "FLAGGED", "COMPLETED", "DRAFT"];

function MetricCard({
  label,
  value,
  subtext,
  subtextColor = "text-slate-500",
}: {
  label: string;
  value: string;
  subtext?: string;
  subtextColor?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-5 py-5 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <div className="mt-2 flex items-center justify-between">
        <p className="text-[2rem] font-bold leading-none text-slate-900">
          {value}
        </p>
        {subtext ? (
          <span className={`text-xs font-semibold ${subtextColor}`}>{subtext}</span>
        ) : null}
      </div>
    </div>
  );
}

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<JobTab>("All Jobs");
  const [loading, setLoading] = useState(true);

  const loadJobs = useCallback(async (q = "", tab: JobTab = "All Jobs") => {
    try {
      setLoading(true);
      const res = await getAdminJobs(q, tab === "All Jobs" ? "" : tab);
      if (res.success && res.data) {
        setJobs(res.data.map(job => ({
          id: job.id,
          title: job.title,
          company: job.company?.name || "Independent",
          postedDate: new Date(job.createdAt).toLocaleDateString(),
          applicants: job._count?.applications || 0,
          status: job.status as JobStatus,
        })));
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadJobs(search, activeTab);
    }, 400);
    return () => clearTimeout(timer);
  }, [search, activeTab, loadJobs]);

  const flaggedCount = jobs.filter((job) => job.status === "FLAGGED").length;

  const handlePrimaryAction = async (id: string, currentStatus: string) => {
    let newStatus = "PUBLIC";
    if (currentStatus === "PUBLIC") newStatus = "FLAGGED";
    else if (currentStatus === "FLAGGED") newStatus = "PUBLIC";

    const res = await apiToggleJobStatus(id, newStatus);
    if (res.success) {
      loadJobs(search, activeTab);
    }
  };

  return (
    <>
      <AdminHeader title="Jobs" />

      <div className="bg-slate-100 p-6 md:p-8">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <MetricCard label="Total Postings" value="1,284" subtext="+5.2%" subtextColor="text-emerald-500" />
          <MetricCard label="Flagged Jobs" value="12" subtext="Action Required" subtextColor="text-rose-500" />
          <MetricCard label="New Today" value="48" subtext="In moderation" subtextColor="text-blue-500" />
        </div>

        <div className="mt-6">
          <h2 className="text-[2rem] font-bold leading-none text-slate-900">
            Job Postings
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Manage, moderate and boost job listings.
          </p>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-4">
              <div className="relative w-full lg:w-[320px]">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Search job title, company, or ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="flex flex-wrap items-center gap-6">
                {tabs.map((tab) => {
                  const isActive = activeTab === tab;
                  const count =
                    tab === "FLAGGED" ? flaggedCount : undefined;

                  return (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`relative pb-3 text-sm font-medium transition ${
                        isActive
                          ? "text-blue-600"
                          : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      <span className="inline-flex items-center gap-1.5">
                        {tab}
                        {typeof count === "number" ? (
                          <span className="rounded-full bg-rose-100 px-1.5 py-0.5 text-[10px] font-semibold text-rose-500">
                            {count}
                          </span>
                        ) : null}
                      </span>
                      {isActive ? (
                        <span className="absolute bottom-0 left-0 h-0.5 w-full rounded-full bg-blue-600" />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-3 self-start lg:self-auto">
              <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50">
                <Filter size={16} />
                Filter
              </button>

              <button className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-100 hover:bg-blue-700">
                <Plus size={16} />
                Post New Job
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold text-slate-500">
                    Job Title & Company
                  </th>
                  <th className="px-6 py-4 text-left font-semibold text-slate-500">
                    Posted Date
                  </th>
                  <th className="px-6 py-4 text-left font-semibold text-slate-500">
                    Applicants
                  </th>
                  <th className="px-6 py-4 text-left font-semibold text-slate-500">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left font-semibold text-slate-500">
                    Moderation Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-slate-500">
                      Loading jobs...
                    </td>
                  </tr>
                ) : jobs.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-10 text-center text-slate-500"
                    >
                      No jobs available
                    </td>
                  </tr>
                ) : (
                  jobs.map((job) => (
                    <tr key={job.id} className="border-t border-slate-100">
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                            💼
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-slate-900">
                                {job.title}
                              </p>
                              {job.boosted ? (
                                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-blue-600">
                                  Boosted
                                </span>
                              ) : null}
                            </div>
                            <p className="mt-1 text-xs text-slate-400">
                              {job.company}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-slate-600">{job.postedDate}</td>

                      <td className="px-6 py-4">
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                          {job.applicants}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <StatusBadge
                          status={job.status}
                          type={
                            job.status === "PUBLIC"
                              ? "success"
                              : job.status === "FLAGGED"
                              ? "error"
                              : "default"
                          }
                        />
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {job.status === "FLAGGED" ? (
                            <button
                              onClick={() => handlePrimaryAction(job.id, job.status)}
                              className="rounded-lg bg-rose-500 px-3 py-2 text-xs font-semibold text-white hover:bg-rose-600"
                            >
                              Review Flag
                            </button>
                          ) : job.status === "COMPLETED" || job.status === "CANCELLED" ? (
                            <button
                              onClick={() => handlePrimaryAction(job.id, job.status)}
                              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                            >
                              Reopen
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={() => handlePrimaryAction(job.id, job.status)}
                                className="rounded-lg bg-blue-50 p-2 text-blue-600 hover:bg-blue-100"
                                title="Flag Job"
                              >
                                <Flag size={14} />
                              </button>
                              <button
                                className="rounded-lg bg-slate-50 p-2 text-slate-500 hover:bg-slate-100"
                                title="Hide Job"
                              >
                                <EyeOff size={14} />
                              </button>
                              <button
                                className="rounded-lg bg-slate-50 p-2 text-slate-500 hover:bg-slate-100"
                                title="More"
                              >
                                <MoreVertical size={14} />
                              </button>
                            </>
                          )}

                          {job.status !== "COMPLETED" && job.status !== "FLAGGED" ? (
                            <button
                              className="rounded-lg bg-slate-50 p-2 text-slate-500 hover:bg-slate-100"
                              title="Reopen"
                            >
                              <RotateCcw size={14} />
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-100 px-6 py-4 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
            <p>Showing 1 to {jobs.length} of {jobs.length} entries</p>

            <div className="flex items-center gap-2">
              <button className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-slate-400">
                Previous
              </button>
              <button className="rounded-lg bg-blue-600 px-3 py-1.5 text-white">
                1
              </button>
              <button className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-slate-600">
                2
              </button>
              <button className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-slate-600">
                3
              </button>
              <button className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-slate-600">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}