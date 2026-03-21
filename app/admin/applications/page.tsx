"use client";

import React, { useMemo, useState, useEffect, useCallback } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import StatusBadge from "@/components/admin/StatusBadge";
import { getAdminApplications, updateApplicationStatus, AdminApplication } from "@/lib/admin/api";
import {
  Search,
  Filter,
  ShieldAlert,
  ChevronDown,
  Eye,
  Ban,
  CheckCircle2,
} from "lucide-react";

type ApplicationStatus = "Pending" | "Under Review" | "Rejected" | "Flagged" | "NEW" | "CONTACTED" | "SHORTLISTED" | "HIRED" | "UNDER_REVIEW" | "FLAGGED" | "REJECTED";
type RiskLevel = "Low" | "Medium" | "High";

type ApplicationRow = {
  id: string;
  candidate: string;
  jobTitle: string;
  company: string;
  appliedDate: string;
  status: ApplicationStatus;
  risk: RiskLevel;
  indicator: string;
  raw?: AdminApplication;
};

// Removed initial hardcoded apps

function SummaryCard({
  label,
  value,
  hint,
  hintColor = "text-slate-500",
}: {
  label: string;
  value: string;
  hint?: string;
  hintColor?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-5 py-5 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <div className="mt-2 flex items-center justify-between">
        <p className="text-[2rem] font-bold leading-none text-slate-900">
          {value}
        </p>
        {hint ? (
          <span className={`text-xs font-semibold ${hintColor}`}>{hint}</span>
        ) : null}
      </div>
    </div>
  );
}

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<ApplicationRow[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const loadApps = useCallback(async (q = "") => {
    try {
      setLoading(true);
      const res = await getAdminApplications(q);
      if (res.success && res.data) {
        setApplications(res.data.map(app => ({
          id: app.id,
          candidate: `${app.applicant?.firstName || ""} ${app.applicant?.lastName || ""}`.trim() || "Unknown",
          jobTitle: app.job?.title || "Unknown",
          company: app.job?.company?.name || "Independent",
          appliedDate: new Date(app.appliedAt).toLocaleDateString(),
          status: app.status as ApplicationStatus,
          risk: (app.riskLevel as RiskLevel) || "Low",
          indicator: app.riskIndicator || "Standard Application",
          raw: app
        })));
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadApps(search);
    }, 400);
    return () => clearTimeout(timer);
  }, [search, loadApps]);

  const filteredApplications = useMemo(() => {
    return applications; // For tabs, we'd add it here if tabs existed on this page
  }, [applications]);

  const handleCycleStatus = async (id: string, currentStatus: string) => {
    let nextStatus = "UNDER_REVIEW";
    if (currentStatus === "NEW" || currentStatus === "Pending") nextStatus = "UNDER_REVIEW";
    if (currentStatus === "UNDER_REVIEW" || currentStatus === "Under Review") nextStatus = "FLAGGED";
    if (currentStatus === "FLAGGED" || currentStatus === "Flagged") nextStatus = "REJECTED";
    if (currentStatus === "REJECTED" || currentStatus === "Rejected") nextStatus = "NEW";

    const res = await updateApplicationStatus(id, nextStatus);
    if (res.success) {
      loadApps(search);
    }
  };

  const flaggedCount = applications.filter((a) => a.status === "FLAGGED" || a.status === "Flagged").length;
  const underReviewCount = applications.filter((a) => a.status === "UNDER_REVIEW" || a.status === "Under Review").length;
  const rejectedCount = applications.filter((a) => a.status === "REJECTED" || a.status === "Rejected").length;

  return (
    <>
      <AdminHeader title="Applications" />

      <div className="bg-slate-100 p-6 md:p-8">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <SummaryCard
            label="Flagged Applications"
            value={String(flaggedCount).padStart(2, "0")}
            hint="Immediate review"
            hintColor="text-rose-500"
          />
          <SummaryCard
            label="Under Review"
            value={String(underReviewCount).padStart(2, "0")}
            hint="Needs action"
            hintColor="text-amber-500"
          />
          <SummaryCard
            label="Rejected"
            value={String(rejectedCount).padStart(2, "0")}
            hint="Spam blocked"
            hintColor="text-slate-500"
          />
        </div>

        <div className="mt-6">
          <h2 className="text-[2rem] font-bold leading-none text-slate-900">
            Applications Oversight
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Review suspicious submissions, spam signals and risky behavior.
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-[1.7fr_340px]">
          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-6 py-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-col gap-4">
                  <div className="relative w-full lg:w-[340px]">
                    <Search
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      size={18}
                    />
                    <input
                      type="text"
                      placeholder="Search candidate, company, or application ID"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <button className="inline-flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 min-w-[150px]">
                      <span>Risk: All</span>
                      <ChevronDown size={16} />
                    </button>

                    <button className="inline-flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 min-w-[160px]">
                      <span>Status: All</span>
                      <ChevronDown size={16} />
                    </button>

                    <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50">
                      <Filter size={16} />
                      Filter
                    </button>
                  </div>
                </div>

                <button className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-100 hover:bg-blue-700">
                  <ShieldAlert size={16} />
                  Review Flagged
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold text-slate-500">
                      Candidate / Job
                    </th>
                    <th className="px-6 py-4 text-left font-semibold text-slate-500">
                      Company
                    </th>
                    <th className="px-6 py-4 text-left font-semibold text-slate-500">
                      Applied Date
                    </th>
                    <th className="px-6 py-4 text-left font-semibold text-slate-500">
                      Indicator
                    </th>
                    <th className="px-6 py-4 text-left font-semibold text-slate-500">
                      Risk
                    </th>
                    <th className="px-6 py-4 text-left font-semibold text-slate-500">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left font-semibold text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-10 text-center text-slate-500">
                        Loading applications...
                      </td>
                    </tr>
                  ) : filteredApplications.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-6 py-10 text-center text-slate-500"
                      >
                        No applications available
                      </td>
                    </tr>
                  ) : (
                    filteredApplications.map((item) => (
                      <tr key={item.id} className="border-t border-slate-100">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-semibold text-slate-900">
                              {item.candidate}
                            </p>
                            <p className="mt-1 text-xs text-slate-400">
                              {item.jobTitle} · {item.id}
                            </p>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-slate-600">
                          {item.company}
                        </td>

                        <td className="px-6 py-4 text-slate-500">
                          {item.appliedDate}
                        </td>

                        <td className="px-6 py-4 text-slate-600">
                          {item.indicator}
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                              item.risk === "High"
                                ? "bg-rose-100 text-rose-600"
                                : item.risk === "Medium"
                                ? "bg-amber-100 text-amber-600"
                                : "bg-emerald-100 text-emerald-600"
                            }`}
                          >
                            {item.risk}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <StatusBadge
                            status={item.status}
                            type={
                              item.status === "Pending" || item.status === "NEW"
                                ? "warning"
                                : item.status === "Under Review" || item.status === "UNDER_REVIEW"
                                ? "default"
                                : item.status === "Rejected" || item.status === "REJECTED"
                                ? "error"
                                : "error"
                            }
                          />
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              className="rounded-lg bg-slate-50 p-2 text-slate-500 hover:bg-slate-100"
                              title="View"
                            >
                              <Eye size={14} />
                            </button>
                            <button
                              className="rounded-lg bg-rose-50 p-2 text-rose-500 hover:bg-rose-100"
                              title="Block"
                              onClick={() => handleCycleStatus(item.id, item.status)}
                            >
                              <Ban size={14} />
                            </button>
                            <button
                              className="rounded-lg bg-emerald-50 p-2 text-emerald-500 hover:bg-emerald-100"
                              title="Approve"
                              onClick={() => handleCycleStatus(item.id, item.status)}
                            >
                              <CheckCircle2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-100 px-6 py-4 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
              <p>
                Showing 1 to {filteredApplications.length} of {applications.length} applications
              </p>

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
                  Next
                </button>
              </div>
            </div>
          </section>

          <aside className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">
              Risk Summary
            </h3>

            <div className="mt-6 space-y-5">
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  High Risk Signals
                </p>
                <p className="mt-2 text-2xl font-bold text-rose-500">
                  {applications.filter((a) => a.risk === "High").length}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Immediate review recommended.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Duplicate Patterns
                </p>
                <p className="mt-2 text-2xl font-bold text-slate-900">07</p>
                <p className="mt-1 text-xs text-slate-500">
                  Includes repeated IP and profile behavior.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Cleared This Week
                </p>
                <p className="mt-2 text-2xl font-bold text-emerald-500">14</p>
                <p className="mt-1 text-xs text-slate-500">
                  Low-risk applications restored.
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-4">
              <p className="text-sm font-semibold text-slate-900">
                Moderator Insight
              </p>
              <p className="mt-2 text-sm text-slate-600">
                Watch accounts with multi-account behavior and repeated rapid submissions.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}