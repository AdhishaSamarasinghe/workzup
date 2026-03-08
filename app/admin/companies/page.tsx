"use client";

import React, { useEffect, useState } from "react";
import { Search, Loader2, CheckCircle2, Shield, XCircle, Building2 } from "lucide-react";

type Company = {
    id: string;
    name: string;
    industry: string;
    isVerified: boolean;
    createdAt: string;
    recruiter: {
        firstName: string | null;
        lastName: string | null;
        email: string;
    };
};

export default function AdminCompaniesPage() {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    useEffect(() => {
        fetchCompanies();
    }, []);

    const fetchCompanies = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("http://localhost:5000/api/admin/companies", {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error("Failed to fetch");
            const data = await res.json();
            setCompanies(data.companies || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const toggleVerify = async (id: string, currentStatus: boolean) => {
        setActionLoading(id);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`http://localhost:5000/api/admin/companies/${id}/verify`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ isVerified: !currentStatus })
            });
            if (res.ok) {
                setCompanies(companies.map(c => c.id === id ? { ...c, isVerified: !currentStatus } : c));
            }
        } catch (err) {
            console.error(err);
        } finally {
            setActionLoading(null);
        }
    };

    const filteredCompanies = companies.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        (c.industry && c.industry.toLowerCase().includes(search.toLowerCase())) ||
        c.recruiter.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Company Verification</h1>
                    <p className="text-slate-500 mt-1">Review and verify employer companies on the platform.</p>
                </div>
                <div className="relative w-full sm:w-auto">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search companies..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full sm:w-80 pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                    />
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm">
                                <th className="px-6 py-4 font-medium">Company Name</th>
                                <th className="px-6 py-4 font-medium">Recruiter</th>
                                <th className="px-6 py-4 font-medium">Industry</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                                        <Loader2 className="animate-spin mx-auto mb-2" size={24} />
                                        Loading companies...
                                    </td>
                                </tr>
                            ) : filteredCompanies.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                        No companies found matching your search.
                                    </td>
                                </tr>
                            ) : (
                                filteredCompanies.map((company) => (
                                    <tr key={company.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center border border-slate-200">
                                                    <Building2 size={20} />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-900">{company.name}</p>
                                                    <p className="text-xs text-slate-500">{new Date(company.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-medium text-slate-800">
                                                {company.recruiter.firstName} {company.recruiter.lastName}
                                            </p>
                                            <p className="text-xs text-slate-500">{company.recruiter.email}</p>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 text-sm">
                                            {company.industry || "Not specified"}
                                        </td>
                                        <td className="px-6 py-4">
                                            {company.isVerified ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                                    <Shield size={14} className="text-blue-500" /> Verified
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100">
                                                    <XCircle size={14} className="text-amber-500" /> Unverified
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => toggleVerify(company.id, company.isVerified)}
                                                disabled={actionLoading === company.id}
                                                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${company.isVerified
                                                        ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                        : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                                                    }`}
                                            >
                                                {actionLoading === company.id ? (
                                                    <Loader2 size={16} className="animate-spin" />
                                                ) : company.isVerified ? (
                                                    <>Revoke</>
                                                ) : (
                                                    <><CheckCircle2 size={16} /> Verify</>
                                                )}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
