"use client";

import React, { useMemo, useState, useEffect, useCallback } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import StatusBadge from "@/components/admin/StatusBadge";
import { Search, Filter, ChevronDown, ArrowUpRight } from "lucide-react";
import { getAdminReports, updateReportStatus, AdminReport } from "@/lib/admin/api";

type ReportStatus = "Open" | "In Review" | "Resolved";
type ReportPriority = "High" | "Medium" | "Low";
type ReportTab = "Open" | "In Review" | "Resolved" | "All Tickets";

type ReportRow = {
  id: string;
  reporter: string;
  entity: string;
  reason: string;
  date: string;
  priority: ReportPriority;
  status: ReportStatus;
  raw?: AdminReport;
};

// Initial reports removed
const tabs: ReportTab[] = ["Open", "In Review", "Resolved", "All Tickets"];

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

export default function AdminReportsPage() {
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<ReportTab>("Open");
  const [loading, setLoading] = useState(true);

  const loadReports = useCallback(async (q = "") => {
    try {
      setLoading(true);
      const res = await getAdminReports(q);
      if (res.success && res.data) {
        setReports(res.data.map(r => ({
          id: r.id,
          reporter: `${r.reporter?.firstName || ""} ${r.reporter?.lastName || ""}`.trim() || "Unknown",
          entity: r.reportedName || "Unknown",
          reason: r.reason || "No Reason",
          date: new Date(r.createdAt).toLocaleDateString(),
          priority: r.priority as ReportPriority,
          status: r.status as ReportStatus,
          raw: r
        })));
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadReports(search);
    }, 400);
    return () => clearTimeout(timer);
  }, [search, loadReports]);

  const filteredReports = useMemo(() => {
    let result = [...reports];

    if (activeTab !== "All Tickets") {
      result = result.filter((item) => item.status === activeTab);
    }

    return result;
  }, [reports, activeTab]);

  const openCount = reports.filter((r) => r.status === "Open").length;
  const inReviewCount = reports.filter((r) => r.status === "In Review").length;
  const resolvedCount = reports.filter((r) => r.status === "Resolved").length;

  const handleCycleStatus = async (id: string, currentStatus: string) => {
    let nextStatus = "In Review";
    if (currentStatus === "Open") nextStatus = "In Review";
    if (currentStatus === "In Review") nextStatus = "Resolved";
    if (currentStatus === "Resolved") nextStatus = "Open";

    const res = await updateReportStatus(id, nextStatus);
    if (res.success) {
      loadReports(search);
    }
  };

  return (
    <>
      <AdminHeader title="Reports" />

      <div className="bg-slate-100 p-6 md:p-8">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <SummaryCard
            label="Open Tickets"
            value={String(openCount).padStart(2, "0")}
            hint="+3 today"
            hintColor="text-rose-500"
          />
          <SummaryCard
            label="In Review"
            value={String(inReviewCount).padStart(2, "0")}
            hint="Need follow-up"
            hintColor="text-amber-500"
          />
          <SummaryCard
            label="Resolved"
            value={String(resolvedCount).padStart(2, "0")}
            hint="This week"
            hintColor="text-emerald-500"
          />
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
                      placeholder="Search ticket ID, reporter, entity..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-6">
                    {tabs.map((tab) => {
                      const isActive = activeTab === tab;

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
                          {tab}
                          {isActive ? (
                            <span className="absolute bottom-0 left-0 h-0.5 w-full rounded-full bg-blue-600" />
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button className="inline-flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 min-w-[130px]">
                    <span>Priority</span>
                    <ChevronDown size={16} />
                  </button>

                  <button className="inline-flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 min-w-[120px]">
                    <span>Type</span>
                    <ChevronDown size={16} />
                  </button>

                  <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50">
                    <Filter size={16} />
                    Filter
                  </button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold text-slate-500">
                      Ticket ID
                    </th>
                    <th className="px-6 py-4 text-left font-semibold text-slate-500">
                      Reporter
                    </th>
                    <th className="px-6 py-4 text-left font-semibold text-slate-500">
                      Reported Entity
                    </th>
                    <th className="px-6 py-4 text-left font-semibold text-slate-500">
                      Reason
                    </th>
                    <th className="px-6 py-4 text-left font-semibold text-slate-500">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left font-semibold text-slate-500">
                      Priority
                    </th>
                    <th className="px-6 py-4 text-left font-semibold text-slate-500">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left font-semibold text-slate-500">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-10 text-center text-slate-500">
                        Loading reports...
                      </td>
                    </tr>
                  ) : filteredReports.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-6 py-10 text-center text-slate-500"
                      >
                        No reports available
                      </td>
                    </tr>
                  ) : (
                    filteredReports.map((item) => (
                      <tr key={item.id} className="border-t border-slate-100">
                        <td className="px-6 py-4 font-medium text-slate-900">
                          {item.id}
                        </td>

                        <td className="px-6 py-4 text-slate-700">
                          {item.reporter}
                        </td>

                        <td className="px-6 py-4 text-slate-600">
                          {item.entity}
                        </td>

                        <td className="px-6 py-4 text-slate-600">
                          {item.reason}
                        </td>

                        <td className="px-6 py-4 text-slate-500">{item.date}</td>

                        <td className="px-6 py-4">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                              item.priority === "High"
                                ? "bg-rose-100 text-rose-600"
                                : item.priority === "Medium"
                                ? "bg-amber-100 text-amber-600"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {item.priority}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <StatusBadge
                            status={item.status}
                            type={
                              item.status === "Resolved"
                                ? "success"
                                : item.status === "In Review"
                                ? "warning"
                                : "error"
                            }
                          />
                        </td>

                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleCycleStatus(item.id, item.status)}
                            className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-100"
                          >
                            View Details
                            <ArrowUpRight size={13} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-100 px-6 py-4 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
              <p>
                Showing 1 to {filteredReports.length} of {reports.length} tickets
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
              Case Summary
            </h3>

            <div className="mt-6 space-y-5">
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Escalation Risk
                </p>
                <p className="mt-2 text-2xl font-bold text-rose-500">High</p>
                <p className="mt-1 text-xs text-slate-500">
                  4 tickets may require urgent review.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Average Resolution Time
                </p>
                <p className="mt-2 text-2xl font-bold text-slate-900">18h</p>
                <p className="mt-1 text-xs text-slate-500">
                  Improved by 12% this week.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Most Common Category
                </p>
                <p className="mt-2 text-base font-semibold text-slate-900">
                  Job Listing Abuse
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  39% of all active reports.
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-4">
              <p className="text-sm font-semibold text-slate-900">
                Moderator Note
              </p>
              <p className="mt-2 text-sm text-slate-600">
                Focus on high-priority open cases first to keep response times low.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
