"use client";

import React, { useState, useEffect } from "react";
import { Shield, Key, Mail, Trash2, CheckCircle2, AlertTriangle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { signOutWorkzupAuth } from "@/lib/auth/workzupAuth";

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState("security");
    
    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20 pt-32">
            
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <Link href="/jobseeker/profile" className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-[#6b8bff] transition-colors mb-4">
                        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Profile
                    </Link>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Account Settings</h1>
                    <p className="text-slate-500 mt-2 font-medium">Manage your security preferences, email address, and account status.</p>
                </div>
                
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Navigation Sidebar */}
                    <div className="w-full md:w-64 shrink-0">
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-2 sticky top-24">
                            <button
                                onClick={() => setActiveTab("security")}
                                className={`w-full text-left px-4 py-3 rounded-xl font-bold flex items-center transition-colors ${activeTab === 'security' ? 'bg-blue-50 text-[#6b8bff]' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                            >
                                <Shield className={`w-5 h-5 mr-3 ${activeTab === 'security' ? 'text-[#6b8bff]' : 'text-slate-400'}`} />
                                Security Settings
                            </button>
                            <button
                                onClick={() => setActiveTab("danger-zone")}
                                className={`w-full text-left px-4 py-3 rounded-xl font-bold flex items-center transition-colors mt-1 ${activeTab === 'danger-zone' ? 'bg-red-50 text-red-600' : 'text-slate-600 hover:bg-slate-50 hover:text-red-500'}`}
                            >
                                <Trash2 className={`w-5 h-5 mr-3 ${activeTab === 'danger-zone' ? 'text-red-500' : 'text-slate-400'}`} />
                                Danger Zone
                            </button>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 max-w-2xl">
                        {activeTab === "security" && (
                            <div className="space-y-6">
                                <TabSecurity />
                                <TabEmail />
                            </div>
                        )}
                        {activeTab === "danger-zone" && (
                            <TabDangerZone />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ---------------------------------------------
// CHANGE PASSWORD
// ---------------------------------------------
function TabSecurity() {
    const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
    const [status, setStatus] = useState<{type: "error"|"success", msg: string} | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus(null);

        if (passwords.new !== passwords.confirm) {
            return setStatus({ type: "error", msg: "New passwords do not match." });
        }
        if (passwords.new.length < 6) {
            return setStatus({ type: "error", msg: "New password must be at least 6 characters." });
        }

        setLoading(true);
        try {
            await apiFetch("/api/auth/password", {
                method: "PUT",
                body: JSON.stringify({ currentPassword: passwords.current, newPassword: passwords.new })
            });
            setStatus({ type: "success", msg: "Password successfully changed!" });
            setPasswords({ current: "", new: "", confirm: "" });
        } catch (err: any) {
            setStatus({ type: "error", msg: err.message || "Failed to change password." });
        }
        setLoading(false);
    };

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
            <h2 className="text-xl font-bold text-slate-900 mb-2 flex items-center">
                <Key className="w-5 h-5 mr-2 text-slate-400" /> Change Password
            </h2>
            <p className="text-slate-500 mb-6 text-sm">Update your password to keep your account secure.</p>

            {status && (
                <div className={`p-4 rounded-xl mb-6 font-medium text-sm flex items-start gap-3 ${status.type === 'error' ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'}`}>
                    {status.type === 'error' ? <Shield className="w-5 h-5 shrink-0" /> : <CheckCircle2 className="w-5 h-5 shrink-0" />}
                    {status.msg}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Current Password</label>
                    <input required type="password" value={passwords.current} onChange={e => setPasswords({...passwords, current: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:bg-white focus:border-[#6b8bff] focus:ring-2 focus:ring-blue-50 transition-all font-medium text-slate-900" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">New Password</label>
                        <input required type="password" value={passwords.new} onChange={e => setPasswords({...passwords, new: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:bg-white focus:border-[#6b8bff] focus:ring-2 focus:ring-blue-50 transition-all font-medium text-slate-900" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Confirm New</label>
                        <input required type="password" value={passwords.confirm} onChange={e => setPasswords({...passwords, confirm: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:bg-white focus:border-[#6b8bff] focus:ring-2 focus:ring-blue-50 transition-all font-medium text-slate-900" />
                    </div>
                </div>

                <div className="pt-2 flex justify-end">
                    <button type="submit" disabled={loading} className="px-6 py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-70 flex items-center shadow-lg">
                        {loading ? "Updating..." : "Update Password"}
                    </button>
                </div>
            </form>
        </div>
    );
}

// ---------------------------------------------
// CHANGE EMAIL
// ---------------------------------------------
function TabEmail() {
    const [newEmail, setNewEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [step, setStep] = useState<"request"|"verify">("request");
    const [status, setStatus] = useState<{type: "error"|"success", msg: string} | null>(null);
    const [loading, setLoading] = useState(false);

    const handleRequestOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!newEmail || !newEmail.includes('@')) return setStatus({ type: "error", msg: "Please enter a valid email." });
        
        setLoading(true);
        setStatus(null);
        try {
            await apiFetch("/api/auth/profile/send-email-otp", {
                method: "POST",
                body: JSON.stringify({ newEmail })
            });
            setStatus({ type: "success", msg: `Verification code sent to ${newEmail}` });
            setStep("verify");
        } catch (err: any) {
            setStatus({ type: "error", msg: err.message || "Failed to send code." });
        }
        setLoading(false);
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if(otp.length < 6) return setStatus({ type: "error", msg: "Please enter a valid 6-digit code." });

        setLoading(true);
        setStatus(null);
        try {
            await apiFetch("/api/auth/profile/verify-email-otp", {
                method: "POST",
                body: JSON.stringify({ newEmail, otp })
            });
            setStatus({ type: "success", msg: "Email address changed successfully!" });
            setStep("request");
            setNewEmail("");
            setOtp("");
        } catch (err: any) {
            setStatus({ type: "error", msg: err.message || "Invalid verification code." });
        }
        setLoading(false);
    };

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
            <h2 className="text-xl font-bold text-slate-900 mb-2 flex items-center">
                <Mail className="w-5 h-5 mr-2 text-slate-400" /> Change Email
            </h2>
            <p className="text-slate-500 mb-6 text-sm">Update your primary login email. We'll send a code to verify the new address.</p>

            {status && (
                <div className={`p-4 rounded-xl mb-6 font-medium text-sm flex items-start gap-3 ${status.type === 'error' ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'}`}>
                    {status.type === 'error' ? <AlertTriangle className="w-5 h-5 shrink-0" /> : <CheckCircle2 className="w-5 h-5 shrink-0" />}
                    {status.msg}
                </div>
            )}

            {step === "request" ? (
                <form onSubmit={handleRequestOtp} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">New Email Address</label>
                        <input required type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="name@example.com" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:bg-white focus:border-[#6b8bff] focus:ring-2 focus:ring-blue-50 transition-all font-medium text-slate-900" />
                    </div>
                    <div className="pt-2 flex justify-end">
                        <button type="submit" disabled={loading} className="px-6 py-2.5 bg-[#6b8bff] text-white font-bold rounded-xl hover:bg-[#5a7af0] transition-colors disabled:opacity-70 flex items-center shadow-lg shadow-blue-100">
                            {loading ? "Sending..." : "Send Verification Code"}
                        </button>
                    </div>
                </form>
            ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">6-Digit Code sent to {newEmail}</label>
                        <input required type="text" maxLength={6} value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))} placeholder="123456" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-center tracking-[0.5em] text-lg outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-50 transition-all font-bold text-slate-900" />
                    </div>
                    <div className="pt-2 flex justify-between items-center">
                        <button type="button" onClick={() => { setStep("request"); setStatus(null); }} className="text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors">
                            Cancel
                        </button>
                        <button type="submit" disabled={loading} className="px-6 py-2.5 bg-[#6b8bff] text-white font-bold rounded-xl hover:bg-[#5a7af0] transition-colors disabled:opacity-70 flex items-center shadow-lg shadow-blue-100">
                            {loading ? "Verifying..." : "Verify & Change Email"}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}

// ---------------------------------------------
// DANGER ZONE
// ---------------------------------------------
function TabDangerZone() {
    const [confirmText, setConfirmText] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleDelete = async () => {
        if(confirmText !== "DELETE") {
            setError("Please type DELETE to confirm.");
            return;
        }

        setLoading(true);
        setError("");
        try {
            await apiFetch("/api/auth/profile", {
                method: "DELETE"
            });
            // Clear local storage and redirect to home
            await signOutWorkzupAuth();
            window.location.href = "/";
        } catch (err: any) {
            setError(err.message || "Failed to delete account. Try again later.");
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-red-200 p-8 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-red-500"></div>
            
            <h2 className="text-xl font-bold text-red-600 mb-2 flex items-center">
                <Trash2 className="w-5 h-5 mr-2" /> Delete Account
            </h2>
            <p className="text-slate-600 mb-6 text-sm leading-relaxed">
                Permanently delete your Workzup account. This action is <b>irreversible</b>. 
                All your profile data, applied jobs, resume, and associated reviews will be permanently wiped out.
            </p>

            <div className="bg-red-50 rounded-2xl p-6 border border-red-100">
                {error && (
                    <div className="mb-4 text-sm font-bold text-red-600 flex items-center">
                        <AlertTriangle className="w-4 h-4 mr-1.5" /> {error}
                    </div>
                )}
                <label className="block text-xs font-bold text-red-800 mb-2 tracking-wider">Type "DELETE" to confirm</label>
                <div className="flex flex-col sm:flex-row gap-3">
                    <input 
                        type="text" 
                        value={confirmText} 
                        onChange={e => setConfirmText(e.target.value)} 
                        placeholder="DELETE" 
                        className="flex-1 min-w-0 bg-white border border-red-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all font-bold text-slate-900 uppercase" 
                    />
                    <button 
                        onClick={handleDelete} 
                        disabled={confirmText !== "DELETE" || loading} 
                        className="w-full sm:w-auto px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-200 flex items-center justify-center whitespace-nowrap"
                    >
                        {loading ? "Deleting..." : "Delete Account"}
                    </button>
                </div>
            </div>
        </div>
    );
}
