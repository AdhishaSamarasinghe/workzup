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
    EyeOff,
    CreditCard,
    Smartphone,
    Globe,
    Mail,
    Palette,
    ShieldAlert,
    Clock,
    UserPlus,
    MapPin,
    Phone,
    Calendar
} from "lucide-react";

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState("account");
    const [profileVisibility, setProfileVisibility] = useState(true);
    const [jobMatches, setJobMatches] = useState(true);
    const [appUpdates, setAppUpdates] = useState(false);
    const [marketingEmails, setMarketingEmails] = useState(false);
    const [securityEmails, setSecurityEmails] = useState(true);
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
    const [theme, setTheme] = useState("light");
    const [isLoading, setIsLoading] = useState(false);
    const [saveStatus, setSaveStatus] = useState<string | null>(null);

    // Profile states
    const [name, setName] = useState("Alex Doe");
    const [title, setTitle] = useState("Product Designer");
    const [bio, setBio] = useState("Passionate about creating seamless user experiences and connecting talent with great opportunities.");
    const [avatar, setAvatar] = useState("https://api.dicebear.com/7.x/avataaars/svg?seed=Alex");
    const [userPhone, setUserPhone] = useState("");
    const [userLocation, setUserLocation] = useState("");
    const [userBirthday, setUserBirthday] = useState("");

    // Form states
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await fetch("/api/user/settings");
                if (response.ok) {
                    const data = await response.json();
                    if (data.user) {
                        setName(data.user.name || "");
                        setTitle(data.user.title || "");
                        setBio(data.user.bio || "");
                        setAvatar(data.user.avatar || "");
                        setUserPhone(data.user.phone || "");
                        setUserLocation(data.user.location || "");
                        setUserBirthday(data.user.birthday || "");
                    }
                    setProfileVisibility(data.profileVisibility ?? true);
                    setJobMatches(data.newJobMatches ?? true);
                    setAppUpdates(data.applicationUpdates ?? false);
                    setMarketingEmails(data.marketingEmails ?? false);
                    setSecurityEmails(data.securityEmails ?? true);
                    setTwoFactorEnabled(data.twoFactorEnabled ?? false);
                    setTheme(data.theme ?? "light");
                }
            } catch (error) {
                console.error("Failed to fetch settings:", error);
            }
        };

        fetchSettings();
    }, []);

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
                        marketingEmails,
                        securityEmails,
                        twoFactorEnabled,
                        theme,
                        ...(section === "profile" && { name, title, bio, avatar, phone: userPhone, location: userLocation, birthday: userBirthday }),
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
        { id: "account", label: "Profile", icon: <User className="w-5 h-5" /> },
        { id: "security", label: "Security", icon: <ShieldAlert className="w-5 h-5" /> },
        { id: "notifications", label: "Notifications", icon: <Bell className="w-5 h-5" /> },
        { id: "billing", label: "Billing", icon: <CreditCard className="w-5 h-5" /> },
        { id: "privacy", label: "Privacy", icon: <ShieldCheck className="w-5 h-5" /> },
        { id: "preferences", label: "General", icon: <Settings className="w-5 h-5" /> },
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex flex-col lg:flex-row gap-10">
                {/* Sidebar */}
                <aside className="w-full lg:w-80 flex-shrink-0">
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden sticky top-24">
                        <div className="p-8 border-b border-gray-50 bg-gradient-to-br from-indigo-50/30 to-white">
                            <div className="flex flex-col items-center text-center">
                                <div className="relative group mb-4">
                                    <div className="w-24 h-24 rounded-3xl overflow-hidden ring-4 ring-white shadow-xl transition-transform group-hover:scale-105 duration-300">
                                        <img
                                            src={avatar}
                                            alt={name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-4 border-white rounded-full"></div>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">{name}</h3>
                                <p className="text-sm font-medium text-indigo-600">{title}</p>
                                <p className="text-xs text-gray-400 mt-1">alex.doe@workzup.com</p>
                            </div>
                        </div>

                        <nav className="p-4 bg-white">
                            <ul className="space-y-1.5">
                                {navItems.map((item) => (
                                    <li key={item.id}>
                                        <button
                                            onClick={() => setActiveTab(item.id)}
                                            className={`w-full flex items-center gap-3.5 px-5 py-3 text-sm font-semibold rounded-2xl transition-all duration-200 ${activeTab === item.id
                                                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200 translate-x-1"
                                                : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                                                }`}
                                        >
                                            <span className={`${activeTab === item.id ? "text-white" : "text-gray-400 group-hover:text-gray-900"}`}>
                                                {item.icon}
                                            </span>
                                            {item.label}
                                            {activeTab === item.id && <ChevronRight className="ml-auto w-4 h-4 opacity-70" />}
                                        </button>
                                    </li>
                                ))}
                                <li className="pt-4 mt-4 border-t border-gray-100">
                                    <button className="group w-full flex items-center gap-3.5 px-5 py-3 text-sm font-semibold text-red-500 rounded-2xl hover:bg-red-50 transition-all duration-200">
                                        <LogOut className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                                        Log Out
                                    </button>
                                </li>
                            </ul>
                        </nav>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 space-y-10">
                    <div className="animate-in fade-in slide-in-from-top-4 duration-700">
                        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Account Settings</h1>
                        <p className="mt-2 text-lg text-gray-500">Customize your profile, set preferences, and manage your security.</p>
                    </div>

                    {activeTab === "account" && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* General Profile */}
                            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden border-t-4 border-t-indigo-500">
                                <div className="p-8">
                                    <div className="flex items-center gap-3 mb-8">
                                        <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600">
                                            <User className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-gray-900">Personal Information</h2>
                                            <p className="text-sm text-gray-500">Update your public profile and contact details.</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                                        <div className="space-y-2.5">
                                            <label className="text-sm font-bold text-gray-700 ml-1">Full Name</label>
                                            <div className="relative group">
                                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                                                <input
                                                    type="text"
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-[15px] font-medium"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2.5">
                                            <label className="text-sm font-bold text-gray-700 ml-1">Professional Title</label>
                                            <div className="relative group">
                                                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                                                <input
                                                    type="text"
                                                    value={title}
                                                    onChange={(e) => setTitle(e.target.value)}
                                                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-[15px] font-medium"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2.5">
                                            <label className="text-sm font-bold text-gray-700 ml-1">Phone Number</label>
                                            <div className="relative group">
                                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                                                <input
                                                    type="tel"
                                                    value={userPhone}
                                                    onChange={(e) => setUserPhone(e.target.value)}
                                                    placeholder="+1 (555) 000-0000"
                                                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-[15px] font-medium"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2.5">
                                            <label className="text-sm font-bold text-gray-700 ml-1">Location</label>
                                            <div className="relative group">
                                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                                                <input
                                                    type="text"
                                                    value={userLocation}
                                                    onChange={(e) => setUserLocation(e.target.value)}
                                                    placeholder="City, Country"
                                                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-[15px] font-medium"
                                                />
                                            </div>
                                        </div>
                                        <div className="md:col-span-2 space-y-2.5">
                                            <label className="text-sm font-bold text-gray-700 ml-1">Bio</label>
                                            <textarea
                                                value={bio}
                                                onChange={(e) => setBio(e.target.value)}
                                                rows={4}
                                                className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-[15px] font-medium resize-none leading-relaxed"
                                            />
                                            <p className="text-xs text-gray-400 text-right">Character count: {bio.length}/500</p>
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-3 pt-6 border-t border-gray-50">
                                        <button className="px-6 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50 rounded-2xl transition-all">Cancel</button>
                                        <button
                                            onClick={() => handleSave("profile")}
                                            disabled={isLoading}
                                            className="px-8 py-3 bg-indigo-600 text-white rounded-2xl text-[15px] font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 hover:shadow-indigo-200 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2.5"
                                        >
                                            {isLoading ? "Saving changes..." : "Save Changes"}
                                            {saveStatus === "success" && <CheckCircle2 className="w-5 h-5 animate-in zoom-in duration-300" />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-red-50/40 rounded-3xl border border-red-100 overflow-hidden group">
                                <div className="p-8 flex flex-col md:flex-row items-center justify-between gap-8">
                                    <div className="text-center md:text-left">
                                        <h3 className="text-xl font-bold text-red-900 mb-1">Danger Zone</h3>
                                        <p className="text-[15px] text-red-600 max-w-lg">
                                            Permanently delete your account and all associated data. This action is **irreversible**.
                                        </p>
                                    </div>
                                    <button className="px-8 py-3.5 bg-white text-red-600 border-2 border-red-100 hover:bg-red-600 hover:text-white hover:border-red-600 rounded-2xl text-[15px] font-bold shadow-sm transition-all duration-300 flex items-center gap-3 flex-shrink-0 group-hover:shake">
                                        <Trash2 className="w-5 h-5" />
                                        Delete My Account
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "security" && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden border-t-4 border-t-amber-500">
                                <div className="p-8">
                                    <div className="flex items-center gap-3 mb-8">
                                        <div className="p-2.5 bg-amber-50 rounded-xl text-amber-600">
                                            <Lock className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-gray-900">Login & Security</h2>
                                            <p className="text-sm text-gray-500">Manage your password and account access.</p>
                                        </div>
                                    </div>

                                    <div className="space-y-8 max-w-3xl">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-2.5">
                                                <label className="text-sm font-bold text-gray-700 ml-1">Current Password</label>
                                                <input
                                                    type="password"
                                                    value={currentPassword}
                                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                                    placeholder="••••••••"
                                                    className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm"
                                                />
                                            </div>
                                            <div className="space-y-2.5">
                                                <label className="text-sm font-bold text-gray-700 ml-1">New Password</label>
                                                <input
                                                    type="password"
                                                    value={newPassword}
                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                    placeholder="••••••••"
                                                    className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex justify-start">
                                            <button
                                                onClick={() => handleSave("password")}
                                                disabled={!currentPassword || !newPassword}
                                                className="px-8 py-3 bg-indigo-600 text-white rounded-2xl text-[15px] font-bold shadow-md hover:bg-indigo-700 transition-all disabled:opacity-30 flex items-center gap-2.5"
                                            >
                                                Update Password
                                            </button>
                                        </div>

                                        <div className="pt-8 border-t border-gray-50">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600">
                                                        <Smartphone className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-gray-900">Two-factor Authentication (2FA)</h3>
                                                        <p className="text-sm text-gray-500">Add an extra layer of security to your account.</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                                                    className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 ${twoFactorEnabled ? "bg-green-500" : "bg-gray-200"}`}
                                                >
                                                    <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${twoFactorEnabled ? "translate-x-5" : "translate-x-0"}`} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "notifications" && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden border-t-4 border-t-blue-500">
                                <div className="p-8">
                                    <div className="flex items-center gap-3 mb-8">
                                        <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600">
                                            <Bell className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
                                            <p className="text-sm text-gray-500">Choose when and how you want to be notified.</p>
                                        </div>
                                    </div>

                                    <div className="divide-y divide-gray-50">
                                        {[
                                            {
                                                id: "matches",
                                                title: "Job Match Alerts",
                                                desc: "New jobs matching your profile and saved searches.",
                                                state: jobMatches,
                                                setter: setJobMatches,
                                                icon: <Search className="w-5 h-5" />
                                            },
                                            {
                                                id: "status",
                                                title: "Application Updates",
                                                desc: "Status changes, interview invitations, and offers.",
                                                state: appUpdates,
                                                setter: setAppUpdates,
                                                icon: <Clock className="w-5 h-5" />
                                            },
                                            {
                                                id: "marketing",
                                                title: "Marketing & News",
                                                desc: "Tips, career advice, and platform updates.",
                                                state: marketingEmails,
                                                setter: setMarketingEmails,
                                                icon: <Mail className="w-5 h-5" />
                                            },
                                            {
                                                id: "security",
                                                title: "Security & Login",
                                                desc: "New logins, password changes, and account alerts.",
                                                state: securityEmails,
                                                setter: setSecurityEmails,
                                                icon: <ShieldCheck className="w-5 h-5" />
                                            }
                                        ].map((item) => (
                                            <div key={item.id} className="py-6 flex items-center justify-between gap-6 first:pt-0 last:pb-0">
                                                <div className="flex-1 flex gap-4">
                                                    <div className="mt-0.5 text-gray-400">
                                                        {item.icon}
                                                    </div>
                                                    <div>
                                                        <h3 className="text-md font-bold text-gray-900">{item.title}</h3>
                                                        <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">{item.desc}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => item.setter(!item.state)}
                                                    className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 ${item.state ? "bg-indigo-600" : "bg-gray-200"}`}
                                                >
                                                    <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${item.state ? "translate-x-5" : "translate-x-0"}`} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "billing" && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden border-t-4 border-t-purple-500">
                                <div className="p-8">
                                    <div className="flex items-center gap-3 mb-8">
                                        <div className="p-2.5 bg-purple-50 rounded-xl text-purple-600">
                                            <CreditCard className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-gray-900">Plan & Billing</h2>
                                            <p className="text-sm text-gray-500">Manage your subscription and payment methods.</p>
                                        </div>
                                    </div>

                                    <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-indigo-900 rounded-3xl p-8 mb-8 text-white relative overflow-hidden">
                                        <div className="relative z-10">
                                            <div className="flex justify-between items-start mb-10">
                                                <div>
                                                    <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-lg text-xs font-bold uppercase tracking-wider">Premium Plan</span>
                                                    <h3 className="text-3xl font-extrabold mt-4">$29.00 <span className="text-lg font-medium text-indigo-200">/ month</span></h3>
                                                </div>
                                                <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-sm">
                                                    <div className="w-10 h-6 bg-white rounded-md flex items-center justify-center">
                                                        <div className="w-2 h-2 bg-indigo-600 rounded-full mx-0.5"></div>
                                                        <div className="w-2 h-2 bg-indigo-400 rounded-full mx-0.5"></div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between pt-6 border-t border-white/10">
                                                <div className="flex items-center gap-3">
                                                    <Clock className="w-5 h-5 text-indigo-300" />
                                                    <p className="text-sm font-medium">Next payment: <span className="font-bold">March 09, 2026</span></p>
                                                </div>
                                                <button className="px-6 py-2.5 bg-white text-indigo-900 rounded-xl text-sm font-bold shadow-xl active:scale-95 transition-all">Manage Plan</button>
                                            </div>
                                        </div>
                                        {/* Decorative elements */}
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl"></div>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-6">Payment Methods</h3>
                                        <div className="border border-gray-100 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 group hover:border-indigo-200 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-10 bg-gray-50 border border-gray-100 rounded-lg flex items-center justify-center font-bold italic text-indigo-800 text-lg">VISA</div>
                                                <div>
                                                    <p className="font-bold text-gray-900">Visa ending in 4242</p>
                                                    <p className="text-sm text-gray-500">Expires 12/28 • Default method</p>
                                                </div>
                                            </div>
                                            <button className="text-sm font-bold text-indigo-600 hover:text-indigo-700 decoration-2 underline-offset-4 hover:underline">Edit Method</button>
                                        </div>
                                        <button className="mt-6 w-full py-4 border-2 border-dashed border-gray-200 rounded-3xl text-sm font-bold text-gray-500 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50/30 transition-all flex items-center justify-center gap-2">
                                            <Plus className="w-4 h-4" />
                                            Add New Payment Method
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "privacy" && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden border-t-4 border-t-teal-500">
                                <div className="p-8">
                                    <div className="flex items-center gap-3 mb-8">
                                        <div className="p-2.5 bg-teal-50 rounded-xl text-teal-600">
                                            <ShieldCheck className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-gray-900">Privacy & Data</h2>
                                            <p className="text-sm text-gray-500">Control your visibility and data privacy settings.</p>
                                        </div>
                                    </div>

                                    <div className="divide-y divide-gray-50">
                                        <div className="py-8 flex items-center justify-between gap-8 first:pt-0">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-1">
                                                    <h3 className="text-lg font-bold text-gray-900">Profile Visibility</h3>
                                                    {profileVisibility ? (
                                                        <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
                                                            <Eye className="w-3 h-3" /> Public
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-500 bg-gray-50 px-2.5 py-1 rounded-full">
                                                            <EyeOff className="w-3 h-3" /> Hidden
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-500 leading-relaxed max-w-xl">
                                                    When enabled, your profile, resume, and skills are visible to logged-in recruiters and hiring managers.
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setProfileVisibility(!profileVisibility);
                                                    handleSave("privacy");
                                                }}
                                                className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2 ${profileVisibility ? "bg-teal-600" : "bg-gray-200"}`}
                                            >
                                                <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${profileVisibility ? "translate-x-5" : "translate-x-0"}`} />
                                            </button>
                                        </div>

                                        <div className="py-8 flex items-center justify-between gap-8">
                                            <div className="flex-1">
                                                <h3 className="text-lg font-bold text-gray-900 mb-1">Search Engine Indexing</h3>
                                                <p className="text-sm text-gray-500 leading-relaxed max-w-xl">
                                                    Allow external search engines like Google and Bing to index your professional profile.
                                                </p>
                                            </div>
                                            <button className="relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none bg-gray-200">
                                                <span className="pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 translate-x-0" />
                                            </button>
                                        </div>

                                        <div className="py-8 flex items-center justify-between gap-8 last:pb-0">
                                            <div className="flex-1">
                                                <h3 className="text-lg font-bold text-gray-900 mb-1">Download your Data</h3>
                                                <p className="text-sm text-gray-500 leading-relaxed max-w-xl">
                                                    Generate a machine-readable JSON archive of all your activities, profile data, and job application history.
                                                </p>
                                            </div>
                                            <button className="px-6 py-3 bg-gray-50 border border-gray-200 text-gray-700 rounded-2xl text-[14px] font-bold hover:bg-gray-100 active:scale-95 transition-all flex items-center gap-2.5 flex-shrink-0">
                                                <Download className="w-4 h-4" />
                                                Request Archive
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "preferences" && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden border-t-4 border-t-gray-500">
                                <div className="p-8">
                                    <div className="flex items-center gap-3 mb-8">
                                        <div className="p-2.5 bg-gray-50 rounded-xl text-gray-600">
                                            <Settings className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-gray-900">General Preferences</h2>
                                            <p className="text-sm text-gray-500">Customize your overall experience and interface.</p>
                                        </div>
                                    </div>

                                    <div className="space-y-10">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                            <div className="flex items-center gap-4">
                                                <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600">
                                                    <Palette className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-gray-900">Interface Theme</h3>
                                                    <p className="text-sm text-gray-500">Select how the platform looks on your device.</p>
                                                </div>
                                            </div>
                                            <div className="flex bg-gray-100 p-1 rounded-2xl w-fit">
                                                {["light", "dark", "system"].map((t) => (
                                                    <button
                                                        key={t}
                                                        onClick={() => setTheme(t)}
                                                        className={`px-5 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${theme === t ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                                                    >
                                                        {t}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-10 border-t border-gray-50">
                                            <div className="flex items-center gap-4">
                                                <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600">
                                                    <Globe className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-gray-900">Language & Region</h3>
                                                    <p className="text-sm text-gray-500">Set your preferred language and date formatting.</p>
                                                </div>
                                            </div>
                                            <select className="px-5 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm font-bold min-w-[200px]">
                                                <option>English (United States)</option>
                                                <option>English (United Kingdom)</option>
                                                <option>Spanish</option>
                                                <option>French</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {saveStatus === "success" && (
                        <div className="fixed bottom-10 right-10 animate-in slide-in-from-right-10 duration-500 z-50">
                            <div className="bg-gray-900/90 backdrop-blur-md text-white px-8 py-4 rounded-3xl shadow-2xl flex items-center gap-4 border border-white/10">
                                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                    <CheckCircle2 className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="font-bold text-sm">Update Successful</p>
                                    <p className="text-xs text-gray-400">All changes have been synchronized.</p>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

// Additional missing icons for the loop
function Search(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
        </svg>
    )
}

function Plus(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M5 12h14" />
            <path d="M12 5v14" />
        </svg>
    )
}
