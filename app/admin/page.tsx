"use client";

import React, { useEffect, useState } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import StatCard from "@/components/admin/StatCard";
import StatusBadge from "@/components/admin/StatusBadge";
import { getAdminMetrics, AdminMetrics } from "@/lib/admin/api";

function timeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return `${seconds} secs ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} mins ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hrs ago`;
  const days = Math.floor(hours / 24);
  return `${days} days ago`;
}

const trafficBars = [48, 72, 58, 84, 100, 50, 37];

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<AdminMetrics>({
    users: 0,
    jobs: 0,
    active_jobs: 0,
    applications: 0,
    payouts_completed: 0,
  });
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchMetrics() {
      try {
        setError("");
        const res = await getAdminMetrics();
        if (res.success && res.data) {
          setMetrics(res.data.metrics);
          return;
        }
        setError(res.error || res.message || "Failed to load admin metrics.");
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Failed to load admin metrics."
        );
      }
    }
    fetchMetrics();
  }, []);

  return (
    <>
      <AdminHeader title="Dashboard" />

      <div className="bg-slate-100 p-6 md:p-8">
        {error ? (
          <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total Users"
            value={metrics.users.toLocaleString()}
            change="+12%"
            icon="👥"
            changeType="positive"
          />
          <StatCard
            label="Active Jobs"
            value={metrics.active_jobs.toLocaleString()}
            change="+5.2%"
            icon="💼"
            changeType="positive"
          />
          <StatCard
            label="Total Applications"
            value={metrics.applications.toLocaleString()}
            change="+18%"
            icon="🛡️"
            changeType="positive"
          />
          <StatCard
            label="Payouts"
            value={`LKR ${metrics.payouts_completed.toLocaleString()}`}
            change="+15%"
            icon="💲"
            changeType="positive"
          />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-[1.8fr_1fr]">
          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <h3 className="text-lg font-semibold text-slate-900">
                Recent Activity
              </h3>
              <button className="btn-primary text-sm">
                View All
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold text-slate-500">
                      User
                    </th>
                    <th className="px-6 py-4 text-left font-semibold text-slate-500">
                      Action
                    </th>
                    <th className="px-6 py-4 text-left font-semibold text-slate-500">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left font-semibold text-slate-500">
                      Date
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {(metrics.recent_activity || []).length > 0 ? (
                    (metrics.recent_activity || []).map((item, index) => (
                      <tr
                        key={`${item.name}-${index}`}
                        className="border-t border-slate-100"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                              {item.initials}
                            </div>
                            <span className="font-medium text-slate-900">
                              {item.name}
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-slate-600">{item.action}</td>

                        <td className="px-6 py-4">
                          <StatusBadge
                            status={item.status}
                            type={
                              item.status === "Success"
                                ? "success"
                                : item.status === "Pending"
                                ? "warning"
                                : "error"
                            }
                          />
                        </td>

                        <td className="px-6 py-4 text-slate-500">{timeAgo(item.date)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-sm text-slate-500">
                        No recent activity available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">
                System Health
              </h3>
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
            </div>

            <div className="mt-8 space-y-6">
              <div>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-slate-500">Server Uptime</span>
                  <span className="font-semibold text-slate-900">99.9%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100">
                  <div className="h-2 w-[99.9%] rounded-full bg-emerald-500" />
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-slate-500">Database Load</span>
                  <span className="font-semibold text-slate-900">24%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100">
                  <div className="h-2 w-[24%] rounded-full bg-emerald-500" />
                </div>
              </div>
            </div>

            <div className="mt-8">
              <p className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
                Traffic Performance (7D)
              </p>

              <div className="mt-5 flex h-40 items-end gap-3">
                {trafficBars.map((height, index) => (
                  <div key={index} className="flex flex-1 flex-col items-center gap-2">
                    <div
                      className="w-full rounded-t-md bg-indigo-100"
                      style={{ height: `${height}%` }}
                    />
                    <span className="text-[10px] text-slate-400">
                      {["M", "T", "W", "T", "F", "S", "S"][index]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">
                  i
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    System Update Available
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Version 2.4.1 contains security patches.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
