"use client";

import React, { useEffect, useState } from "react";
import { Users, Briefcase, PlayCircle, FileText, DollarSign, TrendingUp } from "lucide-react";

type Metrics = {
    users: number;
    jobs: number;
    active_jobs: number;
    applications: number;
    payouts_completed: number;
};

export default function AdminOverviewPage() {
    const [metrics, setMetrics] = useState<Metrics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await fetch("http://localhost:5000/api/admin/metrics", {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (!res.ok) {
                    throw new Error("Failed to fetch metrics");
                }

                const data = await res.json();
                setMetrics(data.metrics);
            } catch (err: any) {
                setError(err.message || "An error occurred");
            } finally {
                setLoading(false);
            }
        };

        fetchMetrics();
    }, []);

    const statCards = metrics ? [
        { label: "Total Users", value: metrics.users, icon: Users, color: "bg-blue-500/10 text-blue-500", trend: "+12%" },
        { label: "Total Jobs", value: metrics.jobs, icon: Briefcase, color: "bg-purple-500/10 text-purple-500", trend: "+8%" },
        { label: "Active Jobs", value: metrics.active_jobs, icon: PlayCircle, color: "bg-green-500/10 text-green-500", trend: "+15%" },
        { label: "Applications", value: metrics.applications, icon: FileText, color: "bg-orange-500/10 text-orange-500", trend: "+24%" },
        { label: "Total Payouts (£)", value: metrics.payouts_completed, icon: DollarSign, color: "bg-emerald-500/10 text-emerald-500", trend: "+4%" },
    ] : [];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard Overview</h1>
                    <p className="text-slate-500 mt-1">Monitor platform activity and key metrics.</p>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 h-32 animate-pulse flex flex-col justify-between">
                            <div className="h-4 bg-slate-200 w-1/3 rounded"></div>
                            <div className="h-8 bg-slate-200 w-1/2 rounded pb-2"></div>
                        </div>
                    ))}
                </div>
            ) : error ? (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 flex items-center gap-3">
                    <div className="bg-red-100 p-2 rounded-full">
                        <TrendingUp size={20} className="text-red-500 rotate-45" />
                    </div>
                    <div>
                        <p className="font-medium">Failed to load metrics</p>
                        <p className="text-sm opacity-80">{error}</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {statCards.map((stat, idx) => {
                        const Icon = stat.icon;
                        return (
                            <div
                                key={stat.label}
                                className="bg-white rounded-2xl p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 hover:shadow-lg transition-shadow duration-300 relative overflow-hidden group"
                                style={{ animationDelay: `${idx * 100}ms` }}
                            >
                                <div className="flex justify-between items-start z-10 relative">
                                    <div>
                                        <p className="text-sm font-medium text-slate-500 mb-1">{stat.label}</p>
                                        <h3 className="text-3xl font-bold text-slate-800">{stat.value.toLocaleString()}</h3>
                                    </div>
                                    <div className={`p-3 rounded-xl ${stat.color}`}>
                                        <Icon size={24} />
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center gap-2 text-sm z-10 relative">
                                    <span className="flex items-center text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded-md">
                                        <TrendingUp size={14} className="mr-1" />
                                        {stat.trend}
                                    </span>
                                    <span className="text-slate-400">vs last month</span>
                                </div>
                                {/* Decorative background glow */}
                                <div className={`absolute -right-6 -bottom-6 w-24 h-24 ${stat.color} opacity-20 blur-2xl rounded-full group-hover:scale-150 transition-transform duration-500 z-0`}></div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    );
}
