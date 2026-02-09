"use client";

import React, { useState, useEffect } from "react";
import {
    User,
    Lock,
    Settings,
    LogOut,
    ShieldCheck,
    Bell,
    Download,
    Trash2,
    CheckCircle2,
    ChevronRight,
    Eye,
    EyeOff
} from "lucide-react";

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState("account");
    const [profileVisibility, setProfileVisibility] = useState(true);
    const [jobMatches, setJobMatches] = useState(true);
    const [appUpdates, setAppUpdates] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [saveStatus, setSaveStatus] = useState<string | null>(null);

    // Profile states
    const [name, setName] = useState("Alex Doe");
    const [title, setTitle] = useState("Product Designer");
    const [bio, setBio] = useState("Passionate about creating seamless user experiences and connecting talent with great opportunities.");
    const [avatar, setAvatar] = useState("https://api.dicebear.com/7.x/avataaars/svg?seed=Alex");

    // Form states
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");

    const handleSave = async (section: string) => {
        setIsLoading(true);
        setSaveStatus(null);

        try {
            const response = await fetch("/api/user/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    section,
                    data: {
                        profileVisibility,
                        jobMatches,
                        appUpdates,
                        ...(section === "profile" && { name, title, bio, avatar }),
                        ...(section === "password" && { currentPassword, newPassword })
                    }
                }),
            });

            if (response.ok) {
                setSaveStatus("success");
                if (section === "password") {
                    setCurrentPassword("");
                    setNewPassword("");
                }
            } else {
                setSaveStatus("error");
            }
        } catch (error) {
            setSaveStatus("error");
        } finally {
            setIsLoading(false);
            setTimeout(() => setSaveStatus(null), 3000);
        }
    };

    const navItems = [
        { id: "account", label: "Account", icon: <User className="w-5 h-5" /> },
        { id: "privacy", label: "Privacy", icon: <ShieldCheck className="w-5 h-5" /> },
        { id: "preferences", label: "Preferences", icon: <Settings className="w-5 h-5" /> },
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar */}
                <aside className="w-full md:w-64 lg:w-72 flex-shrink-0">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden sticky top-24">
                        <div className="p-6 border-b border-gray-50 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full overflow-hidden bg-indigo-100 flex items-center justify-center border-2 border-white shadow-sm ring-1 ring-gray-100">
                                <img
                                    src={avatar}
                                    alt={name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900 truncate">{name}</p>
                                <p className="text-xs text-gray-500 truncate">alex.doe@workzup.com</p>
                            </div>
                        </div>

                        <nav className="p-2">
                            <ul className="space-y-1">
                                {navItems.map((item) => (
                                    <li key={item.id}>
                                        <button
                                            onClick={() => setActiveTab(item.id)}
                                            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${activeTab === item.id
                                                ? "bg-indigo-50 text-indigo-600 shadow-sm"
                                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                                }`}
                                        >
                                            {item.icon}
                                            {item.label}
                                            {activeTab === item.id && <ChevronRight className="ml-auto w-4 h-4 opacity-70" />}
                                        </button>
                                    </li>
                                ))}
                                <li className="pt-2 mt-2 border-t border-gray-50">
                                    <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-500 rounded-xl hover:bg-red-50 transition-all">
                                        <LogOut className="w-5 h-5" />
                                        Log Out
                                    </button>
                                </li>
                            </ul>
                        </nav>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Settings</h1>
                        <p className="mt-1 text-gray-500">Manage your account, privacy, and application preferences.</p>
                    </div>

                    {activeTab === "account" && (
                        <>
                            <section className="space-y-6">
                                {/* General Profile Section */}
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                                        <User className="w-4 h-4" />
                                    </div>
                                    <h2 className="text-lg font-semibold text-gray-900">General Profile</h2>
                                </div>

                                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-in fade-in duration-500">
                                    <div className="p-6 md:p-8">
                                        {/* Avatar Upload */}
                                        <div className="flex flex-col md:flex-row items-start gap-8 mb-10">
                                            <div className="relative group">
                                                <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gray-100 border-4 border-white shadow-md">
                                                    <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
                                                </div>
                                                <label className="absolute -bottom-2 -right-2 bg-indigo-600 text-white p-2 rounded-xl shadow-lg cursor-pointer hover:bg-indigo-700 transition-all border-2 border-white">
                                                    <Settings className="w-4 h-4" />
                                                    <input
                                                        type="file"
                                                        className="hidden"
                                                        accept="image/*"
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) {
                                                                const url = URL.createObjectURL(file);
                                                                setAvatar(url);
                                                            }
                                                        }}
                                                    />
                                                </label>
                                            </div>
                                            <div className="flex-1 space-y-1">
                                                <h3 className="text-base font-semibold text-gray-900">Profile Picture</h3>
                                                <p className="text-sm text-gray-500">Upload a high-resolution image. PNG, JPG or GIF up to 5MB.</p>
                                                <div className="pt-2 flex gap-3">
                                                    <button
                                                        onClick={() => setAvatar(`https://api.dicebear.com/7.x/avataaars/svg?seed=${Math.random()}`)}
                                                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors"
                                                    >
                                                        Generate Random
                                                    </button>
                                                    <button className="text-xs font-semibold text-gray-500 hover:text-gray-700 px-3 py-1.5 transition-colors">
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-700">Full Name</label>
                                                <input
                                                    type="text"
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    placeholder="John Doe"
                                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-700">Professional Title</label>
                                                <input
                                                    type="text"
                                                    value={title}
                                                    onChange={(e) => setTitle(e.target.value)}
                                                    placeholder="Software Engineer"
                                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                                                />
                                            </div>
                                            <div className="md:col-span-2 space-y-2">
                                                <label className="text-sm font-medium text-gray-700">Bio</label>
                                                <textarea
                                                    value={bio}
                                                    onChange={(e) => setBio(e.target.value)}
                                                    rows={3}
                                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm resize-none"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex justify-end">
                                            <button
                                                onClick={() => handleSave("profile")}
                                                disabled={isLoading}
                                                className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold shadow-md hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-500/10 transition-all disabled:opacity-50 flex items-center gap-2"
                                            >
                                                {isLoading && saveStatus !== "success" ? "Saving..." : "Update Profile"}
                                                {saveStatus === "success" && <CheckCircle2 className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 pt-4">
                                    <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                                        <Lock className="w-4 h-4" />
                                    </div>
                                    <h2 className="text-lg font-semibold text-gray-900">Account Security</h2>
                                </div>

                                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                    <div className="p-6 md:p-8">
                                        <div className="mb-6">
                                            <h3 className="text-md font-semibold text-gray-900">Change Password</h3>
                                            <p className="text-sm text-gray-500">Update your account security regularly.</p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-700">Current Password</label>
                                                <input
                                                    type="password"
                                                    value={currentPassword}
                                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                                    placeholder="••••••••"
                                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-700">New Password</label>
                                                <input
                                                    type="password"
                                                    value={newPassword}
                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                    placeholder="••••••••"
                                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                                                />
                                            </div>
                                        </div>

                                        <div className="mt-8 flex items-center justify-between">
                                            <p className="text-xs text-gray-400 max-w-sm">
                                                For security, you may be logged out of active sessions after updating.
                                            </p>
                                            <button
                                                onClick={() => handleSave("password")}
                                                disabled={isLoading || !currentPassword || !newPassword}
                                                className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold shadow-md hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-500/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                            >
                                                {isLoading ? "Saving..." : "Save Changes"}
                                                {saveStatus === "success" && <CheckCircle2 className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-red-50/50 rounded-2xl border border-red-100 overflow-hidden">
                                    <div className="p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                                        <div className="text-center md:text-left">
                                            <h3 className="text-md font-semibold text-red-900">Delete Account</h3>
                                            <p className="text-sm text-red-600 mt-1 max-w-md">
                                                Permanently remove your profile and all associated data. This action cannot be reversed.
                                            </p>
                                        </div>
                                        <button className="px-6 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold shadow-sm hover:bg-red-700 focus:ring-4 focus:ring-red-500/10 transition-all flex items-center gap-2 flex-shrink-0">
                                            <Trash2 className="w-4 h-4" />
                                            Delete Account
                                        </button>
                                    </div>
                                </div>
                            </section>
                        </>
                    )}

                    {activeTab === "privacy" && (
                        <section className="space-y-4">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                                    <ShieldCheck className="w-4 h-4" />
                                </div>
                                <h2 className="text-lg font-semibold text-gray-900">Privacy Settings</h2>
                            </div>

                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                <div className="divide-y divide-gray-50">
                                    {/* Toggle Item */}
                                    <div className="p-6 md:p-8 flex items-center justify-between gap-6">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-md font-semibold text-gray-900">Profile Visibility</h3>
                                                {profileVisibility ? (
                                                    <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                                                        <Eye className="w-2.5 h-2.5" /> Public
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full">
                                                        <EyeOff className="w-2.5 h-2.5" /> Private
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-500 mt-1">Make your profile visible to potential employers on the platform.</p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setProfileVisibility(!profileVisibility);
                                                handleSave("privacy");
                                            }}
                                            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 ${profileVisibility ? "bg-indigo-600" : "bg-gray-200"}`}
                                        >
                                            <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${profileVisibility ? "translate-x-5" : "translate-x-0"}`} />
                                        </button>
                                    </div>

                                    {/* Button Item */}
                                    <div className="p-6 md:p-8 flex items-center justify-between gap-6">
                                        <div className="flex-1">
                                            <h3 className="text-md font-semibold text-gray-900">Download your Data</h3>
                                            <p className="text-sm text-gray-500 mt-1">Request a machine-readable copy of your personal data held by Workzup.</p>
                                        </div>
                                        <button className="px-6 py-2 bg-gray-50 border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-100 transition-all flex items-center gap-2 flex-shrink-0">
                                            <Download className="w-4 h-4" />
                                            Request Data
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}

                    {activeTab === "preferences" && (
                        <section className="space-y-4">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                                    <Bell className="w-4 h-4" />
                                </div>
                                <h2 className="text-lg font-semibold text-gray-900">Application Preferences</h2>
                            </div>

                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                <div className="divide-y divide-gray-50">
                                    <div className="p-6 md:p-8 flex items-center justify-between gap-6">
                                        <div className="flex-1">
                                            <h3 className="text-md font-semibold text-gray-900">New Job Matches</h3>
                                            <p className="text-sm text-gray-500 mt-1">Receive email notifications when new jobs matching your profile are posted.</p>
                                        </div>
                                        <button
                                            onClick={() => setJobMatches(!jobMatches)}
                                            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 ${jobMatches ? "bg-indigo-600" : "bg-gray-200"}`}
                                        >
                                            <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${jobMatches ? "translate-x-5" : "translate-x-0"}`} />
                                        </button>
                                    </div>

                                    <div className="p-6 md:p-8 flex items-center justify-between gap-6">
                                        <div className="flex-1">
                                            <h3 className="text-md font-semibold text-gray-900">Application Updates</h3>
                                            <p className="text-sm text-gray-500 mt-1">Get instant updates about the status of your active job applications.</p>
                                        </div>
                                        <button
                                            onClick={() => setAppUpdates(!appUpdates)}
                                            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 ${appUpdates ? "bg-indigo-600" : "bg-gray-200"}`}
                                        >
                                            <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${appUpdates ? "translate-x-5" : "translate-x-0"}`} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}

                    {saveStatus === "success" && (
                        <div className="fixed bottom-8 right-8 animate-in slide-in-from-right-10 duration-500">
                            <div className="bg-green-600 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 font-medium">
                                <CheckCircle2 className="w-5 h-5" />
                                Changes saved successfully!
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
