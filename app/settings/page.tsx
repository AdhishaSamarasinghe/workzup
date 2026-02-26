"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
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
    Plus,
    Star,
    Award,
    History,
    TrendingUp,
    ShieldAlert,
    Globe,
    Phone,
    MapPin,
    Clock,
    Mail,
    Palette,
    AlertCircle,
    Calendar,
    UserPlus,
    Search
} from "lucide-react";

const countries = [
    { name: "Sri Lanka", code: "+94" },
    { name: "United States", code: "+1" },
    { name: "United Kingdom", code: "+44" },
    { name: "India", code: "+91" },
    { name: "Australia", code: "+61" },
    { name: "Canada", code: "+1" },
    { name: "Germany", code: "+49" },
    { name: "Singapore", code: "+65" },
    { name: "United Arab Emirates", code: "+971" },
];

interface Experience {
    id: number;
    company: string;
    role: string;
    rating: number;
    feedback: string;
}

interface RatingsData {
    overallRating: number;
    workQualities: {
        reliability: number;
        technicalSkill: number;
        communication: number;
        punctuality: number;
    };
    pastExperiences: Experience[];
}

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState("account");
    const [profileVisibility, setProfileVisibility] = useState(true);
    const [jobMatches, setJobMatches] = useState(true);
    const [appUpdates, setAppUpdates] = useState(false);
    const [marketingEmails, setMarketingEmails] = useState(false);
    const [securityEmails, setSecurityEmails] = useState(true);
    const [theme, setTheme] = useState("light");
    const [language, setLanguage] = useState("English (United States)");
    const [isLoading, setIsLoading] = useState(false);
    const [saveStatus, setSaveStatus] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [ratings, setRatings] = useState<RatingsData | null>(null);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    // Profile states
    const [name, setName] = useState("Alex Doe");
    const [title, setTitle] = useState("Product Designer");
    const [bio, setBio] = useState("Passionate about creating seamless user experiences and connecting talent with great opportunities.");
    const [avatar, setAvatar] = useState("https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=250&h=250&auto=format&fit=crop");
    const [userPhone, setUserPhone] = useState("+94 ");
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
                        const phone = data.user.phone || "";
                        setUserPhone(phone);
                        setUserLocation(data.user.location || "");
                        setUserBirthday(data.user.birthday || "");
                    }
                    setProfileVisibility(data.profileVisibility ?? true);
                    setJobMatches(data.newJobMatches ?? true);
                    setAppUpdates(data.applicationUpdates ?? false);
                    setMarketingEmails(data.marketingEmails ?? false);
                    setSecurityEmails(data.securityEmails ?? true);
                    setTheme(data.theme ?? "light");
                    setLanguage(data.language ?? "English (United States)");
                    setRatings(data.ratings ?? null);
                }
            } catch (error) {
                console.error("Failed to fetch settings:", error);
            }
        };

        fetchSettings();
    }, []);

    useEffect(() => {
        const root = window.document.documentElement;
        const applyTheme = (t: string) => {
            if (t === "dark") {
                root.classList.add("dark");
            } else if (t === "light") {
                root.classList.remove("dark");
            } else if (t === "system") {
                const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
                if (systemTheme === "dark") {
                    root.classList.add("dark");
                } else {
                    root.classList.remove("dark");
                }
            }
        };

        applyTheme(theme);

        // Listener for system theme changes
        if (theme === "system") {
            const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
            const handleChange = () => applyTheme("system");
            mediaQuery.addEventListener("change", handleChange);
            return () => mediaQuery.removeEventListener("change", handleChange);
        }
    }, [theme]);

    const handleSave = async (section: string) => {
        if (section === "password" && currentPassword === newPassword && currentPassword !== "") {
            setSaveStatus("error");
            setErrorMessage("New password cannot be the same as your current password.");
            setTimeout(() => setSaveStatus(null), 4000);
            return;
        }

        setIsLoading(true);
        setSaveStatus(null);
        setErrorMessage(null);

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
                        theme,
                        language,
                        ...(section === "profile" && { name, title, bio, avatar, phone: userPhone, location: userLocation, birthday: userBirthday }),
                        ...(section === "password" && { currentPassword, newPassword })
                    }
                }),
            });

            if (response.ok) {
                setSaveStatus("success");
                setErrorMessage(null);
                if (section === "password") {
                    setCurrentPassword("");
                    setNewPassword("");
                }
            } else {
                setSaveStatus("error");
                setErrorMessage("Something went wrong. Please try again.");
            }
        } catch (error) {
            setSaveStatus("error");
            setErrorMessage("Failed to connect to the server.");
        } finally {
            setIsLoading(false);
            setTimeout(() => setSaveStatus(null), 3000);
        }
    };

    const navItems = [
        { id: "account", label: "Profile", icon: <User className="w-5 h-5" /> },
        { id: "security", label: "Security", icon: <ShieldAlert className="w-5 h-5" /> },
        { id: "notifications", label: "Notifications", icon: <Bell className="w-5 h-5" /> },
        { id: "ratings", label: "Ratings", icon: <Star className="w-5 h-5" /> },
        { id: "privacy", label: "Privacy", icon: <ShieldCheck className="w-5 h-5" /> },
        { id: "preferences", label: "General", icon: <Settings className="w-5 h-5" /> },
    ];

    const handleLogout = async () => {
        setIsLoggingOut(true);
        // Simulate cleanup/API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        window.location.href = "/"; // Redirect to home
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex flex-col lg:flex-row gap-10">
                {/* Sidebar */}
                <aside className="w-full lg:w-80 flex-shrink-0">
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden sticky top-24">
                        <div className="p-8 border-b border-gray-50 bg-gradient-to-br from-indigo-50/30 to-white">
                            <div className="flex flex-col items-center text-center">
                                <div className="relative group mb-4">
                                    <div className="w-24 h-24 rounded-3xl overflow-hidden ring-4 ring-white shadow-xl transition-transform group-hover:scale-105 duration-300 relative">
                                        <Image
                                            src={avatar}
                                            alt={name}
                                            fill
                                            className="object-cover"
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
                                    <button
                                        onClick={() => setShowLogoutModal(true)}
                                        className="group w-full flex items-center gap-3.5 px-5 py-3 text-sm font-semibold text-red-500 rounded-2xl hover:bg-red-50 transition-all duration-200"
                                    >
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
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        // Only allow numbers and the plus sign
                                                        const numericVal = val.replace(/[^\d+]/g, "");
                                                        setUserPhone(numericVal);
                                                    }}
                                                    onFocus={(e) => {
                                                        // Only clear if it's just a dial code or empty
                                                        const isDialCode = countries.some(c => c.code === userPhone);
                                                        if (isDialCode || userPhone === "") {
                                                            // Keep the dial code but allow typing after it
                                                        }
                                                    }}
                                                    placeholder="+94 77-123-4567"
                                                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-[15px] font-medium"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2.5">
                                            <label className="text-sm font-bold text-gray-700 ml-1">Location</label>
                                            <div className="relative group">
                                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                                                <select
                                                    value={userLocation}
                                                    onChange={(e) => {
                                                        const selectedCountry = countries.find(c => c.name === e.target.value);
                                                        setUserLocation(e.target.value);
                                                        if (selectedCountry) {
                                                            setUserPhone(selectedCountry.code);
                                                        }
                                                    }}
                                                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-[15px] font-medium appearance-none"
                                                >
                                                    <option value="" disabled>Select Country</option>
                                                    {countries.map(c => (
                                                        <option key={c.name} value={c.name}>{c.name}</option>
                                                    ))}
                                                </select>
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                                    <ChevronRight className="w-4 h-4 rotate-90" />
                                                </div>
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

                    {activeTab === "ratings" && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden border-t-4 border-t-yellow-500">
                                <div className="p-8">
                                    <div className="flex items-center gap-3 mb-8">
                                        <div className="p-2.5 bg-yellow-50 rounded-xl text-yellow-600">
                                            <Star className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-gray-900">Performance & Ratings</h2>
                                            <p className="text-sm text-gray-500">Track your work quality and historical reputation.</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                                        <div className="bg-gradient-to-br from-yellow-500 to-amber-600 rounded-3xl p-6 text-white shadow-lg shadow-yellow-100">
                                            <p className="text-sm font-bold opacity-80 uppercase tracking-wider mb-1">Overall Rating</p>
                                            <div className="flex items-end gap-2">
                                                <h3 className="text-4xl font-black">{ratings?.overallRating || "0.0"}</h3>
                                                <div className="flex mb-1">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star key={i} className={`w-4 h-4 ${i < Math.floor(ratings?.overallRating || 0) ? "fill-white" : "fill-white/30 text-white/30"}`} />
                                                    ))}
                                                </div>
                                            </div>
                                            <p className="text-xs mt-4 font-medium opacity-90 flex items-center gap-1.5">
                                                <TrendingUp className="w-3.5 h-3.5" /> Top 5% of all talent
                                            </p>
                                        </div>

                                        <div className="col-span-1 md:col-span-2 bg-gray-50 rounded-3xl p-6 border border-gray-100">
                                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Work Qualities</h3>
                                            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                                                {Object.entries(ratings?.workQualities || {}).map(([key, value]) => (
                                                    <div key={key} className="space-y-1.5">
                                                        <div className="flex justify-between items-center text-xs font-bold text-gray-500 capitalize">
                                                            <span>{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                                            <span className="text-indigo-600">{value}/5.0</span>
                                                        </div>
                                                        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-indigo-500 transition-all duration-1000"
                                                                style={{ width: `${(value / 5) * 100}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="flex items-center gap-2 mb-2">
                                            <History className="w-5 h-5 text-gray-400" />
                                            <h3 className="text-lg font-bold text-gray-900">Past Experience Ratings</h3>
                                        </div>

                                        <div className="grid grid-cols-1 gap-4">
                                            {ratings?.pastExperiences?.map((exp) => (
                                                <ExpItem key={exp.id} exp={exp} />
                                            ))}
                                        </div>

                                        <div className="bg-indigo-50/50 rounded-2xl p-6 border border-indigo-100 flex items-center gap-4">
                                            <div className="p-3 bg-white rounded-xl shadow-sm">
                                                <Award className="w-6 h-6 text-indigo-600" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900">Professional Reputation</h4>
                                                <p className="text-sm text-gray-600 leading-relaxed">Your rating is calculated based on feedback from past clients and employers. High ratings help you stand out to recruiters.</p>
                                            </div>
                                        </div>
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
                                                        onClick={() => {
                                                            setTheme(t);
                                                            handleSave("preferences");
                                                        }}
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
                                            <select
                                                value={language}
                                                onChange={(e) => {
                                                    setLanguage(e.target.value);
                                                    handleSave("preferences");
                                                }}
                                                className="px-5 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm font-bold min-w-[200px]"
                                            >
                                                <option>English (United States)</option>
                                                <option>Sinhala (සිංහල)</option>
                                                <option>Tamil (தமிழ்)</option>
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

                    {saveStatus === "error" && (
                        <div className="fixed bottom-10 right-10 animate-in slide-in-from-right-10 duration-500 z-50">
                            <div className="bg-red-600/95 backdrop-blur-md text-white px-8 py-4 rounded-3xl shadow-2xl flex items-center gap-4 border border-red-500/30">
                                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                                    <AlertCircle className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="font-bold text-sm">Update Failed</p>
                                    <p className="text-xs text-red-100">{errorMessage || "Please check your inputs and try again."}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* Logout Confirmation Modal */}
            {showLogoutModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-300">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 mb-6">
                                <LogOut className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Confirm Logout</h3>
                            <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                                Are you sure you want to log out? You&apos;ll need to sign back in to access your dashboard.
                            </p>

                            <div className="grid grid-cols-2 gap-3 w-full">
                                <button
                                    onClick={() => !isLoggingOut && setShowLogoutModal(false)}
                                    disabled={isLoggingOut}
                                    className="px-4 py-3 text-sm font-bold text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-all disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleLogout}
                                    disabled={isLoggingOut}
                                    className="px-4 py-3 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-2xl shadow-lg shadow-red-100 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isLoggingOut ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Wait...
                                        </>
                                    ) : (
                                        "Log Out"
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function ExpItem({ exp }: { exp: Experience }) {
    return (
        <div className="p-5 bg-white border border-gray-100 rounded-2xl group hover:border-yellow-200 transition-all">
            <div className="flex justify-between items-start mb-3">
                <div>
                    <h4 className="font-bold text-gray-900 group-hover:text-yellow-700 transition-colors">{exp.role}</h4>
                    <p className="text-sm text-gray-500 font-medium">{exp.company}</p>
                </div>
                <div className="flex items-center gap-1 px-2.5 py-1 bg-yellow-50 text-yellow-700 rounded-full text-xs font-bold ring-1 ring-yellow-100">
                    <Star className="w-3 h-3 fill-yellow-600" />
                    {exp.rating.toFixed(1)}
                </div>
            </div>
            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-xl italic border-l-4 border-yellow-400">&quot;{exp.feedback}&quot;</p>
        </div>
    );
}
