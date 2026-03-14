/* eslint-disable */
"use client";

import React, { useEffect, useState } from "react";
import { apiFetch, API_BASE } from "@/lib/api";
import { 
    User, Briefcase, FileText, Shield, Award, MapPin, Star, 
    Plus, Trash2, Edit2, Link as LinkIcon, Github, Linkedin, Target, CheckCircle2, Camera, LoaderCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ProfileAvatar from "@/components/ProfileAvatar";
import { resolveProfileAvatar, resolveUploadUrl } from "@/lib/profile";
import ProfileCompletionWizard from "@/components/ProfileCompletionWizard";

// --- Types ---
interface JobSeekerProfileData {
    id: string;
    name: string;
    firstName: string;
    lastName: string;
    title: string;
    location: string;
    avatar: string;
    isAvailable: boolean;
    stats: { jobsCompleted: number; reliability: number; };
    skills: string[];
    aboutMe: string;
    reviewsSummary: { averageRating: number; totalReviews: number; };
    reviews: any[];
    jobHistory: any[];
    education: { id: string; institution: string; degree: string; year: string; }[];
    experience: { id: string; company: string; role: string; duration: string; description: string; }[];
    cv?: string;
    idDocument?: string;
    idFront?: string;
    idBack?: string;
    languages: string[];
    socialLinks?: {
        linkedin?: string;
        github?: string;
        portfolio?: string;
        avatarUrl?: string;
    };
    phone?: string;
    availableTimes?: string;
}

type PreviewKind = "image" | "pdf" | "file";
export default function JobSeekerProfile() {
    const [profile, setProfile] = useState<JobSeekerProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState("overview");
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [showWizard, setShowWizard] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const data = await apiFetch("/api/auth/profile");
            const resolvedAvatar = resolveProfileAvatar(data.socialLinks?.avatarUrl || data.avatar);
            setProfile({
                ...data,
                avatar: resolvedAvatar,
            });
            setLoading(false);
        } catch (err: any) {
            console.error("Error fetching profile:", err);
            setError("Could not load profile data.");
            setLoading(false);
        }
    };

    const handleSaveProfile = async (updates: Partial<JobSeekerProfileData>) => {
        if (!profile) return false;
        const nextFirstName = updates.firstName ?? profile.firstName;
        const nextLastName = updates.lastName ?? profile.lastName;
        const newProfileData = {
            ...profile,
            ...updates,
            firstName: nextFirstName,
            lastName: nextLastName,
            name: `${nextFirstName || ""} ${nextLastName || ""}`.trim() || profile.name,
            title: updates.title ?? profile.title,
            location: updates.location ?? profile.location,
            aboutMe: updates.aboutMe ?? profile.aboutMe,
            phone: updates.phone ?? profile.phone,
            skills: updates.skills ?? profile.skills,
            languages: updates.languages ?? profile.languages,
            availableTimes: updates.availableTimes ?? profile.availableTimes,
        };
        try {
            await apiFetch("/api/auth/profile", {
                method: "PUT",
                body: JSON.stringify(newProfileData)
            });
            setProfile(newProfileData);
            if (typeof window !== "undefined") {
                window.dispatchEvent(new CustomEvent("profile-updated", {
                    detail: {
                        name: newProfileData.name || `${newProfileData.firstName || ""} ${newProfileData.lastName || ""}`.trim(),
                        avatar: resolveProfileAvatar(newProfileData.avatar),
                    }
                }));
            }
            return true;
        } catch (err) {
            console.error("Save error", err);
            return false;
        }
    };

    const handleAvatarUpload = async (file: File | null) => {
        if (!file || !profile) return;

        const isValidType = ["image/jpeg", "image/png", "image/webp"].includes(file.type);
        if (!isValidType) {
            alert("Please upload a JPG, PNG, or WEBP image.");
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            alert("Please use an image smaller than 2MB.");
            return;
        }

        const formData = new FormData();
        formData.append("avatar", file);

        try {
            setUploadingAvatar(true);
            const uploadResponse = await fetch("/api/profile-avatar", {
                method: "POST",
                body: formData,
            });
            const response = await uploadResponse.json().catch(() => ({}));
            if (!uploadResponse.ok) {
                throw new Error(response.message || "Failed to upload avatar.");
            }

            const avatarPath = response?.data?.avatarPath || "";
            const nextAvatar = resolveProfileAvatar(response?.data?.avatarUrl || avatarPath || profile.avatar);
            const nextProfile = {
                ...profile,
                avatar: nextAvatar,
                socialLinks: {
                    ...(profile.socialLinks || {}),
                    avatarUrl: response?.data?.avatarUrl || avatarPath || profile.socialLinks?.avatarUrl || "",
                },
            };

            try {
                await apiFetch("/api/auth/profile", {
                    method: "PUT",
                    body: JSON.stringify({
                        firstName: nextProfile.firstName,
                        lastName: nextProfile.lastName,
                        location: nextProfile.location,
                        aboutMe: nextProfile.aboutMe,
                        title: nextProfile.title,
                        skills: nextProfile.skills,
                        education: nextProfile.education,
                        experience: nextProfile.experience,
                        languages: nextProfile.languages,
                        socialLinks: nextProfile.socialLinks,
                    }),
                });
            } catch (saveError) {
                console.error("Avatar persistence via backend profile update failed", saveError);
            }

            setProfile(nextProfile as JobSeekerProfileData);
            if (typeof window !== "undefined") {
                window.dispatchEvent(new CustomEvent("profile-updated", {
                    detail: {
                        name: nextProfile.name,
                        avatar: resolveProfileAvatar(nextProfile.socialLinks?.avatarUrl || nextAvatar),
                    }
                }));
            }
        } catch (err) {
            console.error("Avatar upload error", err);
            alert("Failed to upload profile picture.");
        } finally {
            setUploadingAvatar(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center pt-24 pb-10">
                <div className="w-12 h-12 border-4 border-[#6b8bff] border-t-transparent rounded-full animate-spin"></div>
                <div className="text-slate-500 font-medium mt-4">Loading your professional profile...</div>
            </div>
        );
    }

    const calculateStrength = (p: JobSeekerProfileData | null) => {
        if (!p) return 0;
        let score = 0;
        if (p.firstName && p.lastName) score += 10;
        if (p.avatar && !String(p.avatar).includes("default")) score += 10;
        if (p.phone) score += 10;
        if (p.aboutMe && p.aboutMe.length > 2) score += 15;
        if (p.skills && p.skills.length > 0) score += 20;
        if (p.languages && p.languages.length > 0) score += 10;
        if (p.cv) score += 10;
        if (p.idFront && p.idBack) score += 15;
        return Math.min(score, 100);
    };

    const profileStrength = calculateStrength(profile);

    if (error || !profile) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center pt-24 pb-10">
                <div className="bg-white p-8 rounded-2xl shadow-sm text-center border border-red-100 max-w-md w-full">
                    <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Shield className="w-8 h-8" />
                    </div>
                    <div className="text-xl font-bold text-slate-800 mb-2">Oops!</div>
                    <div className="text-slate-500">{error || "Profile not found"}</div>
                    <button onClick={fetchProfile} className="mt-6 w-full py-2.5 bg-[#6b8bff] text-white rounded-xl font-medium hover:bg-[#5a7af0] transition-transform hover:scale-[1.03]">
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    const tabs = [
        { id: "overview", label: "Overview", icon: User },
        { id: "personal", label: "Personal Info", icon: FileText },
        { id: "experience", label: "Experience & Education", icon: Briefcase },
        { id: "skills", label: "Docs & Skills", icon: Award }
    ];

    return (
        <div className="min-h-screen bg-[#F8FAFC] pt-32 pb-16 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-[1200px] mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* LEFT SIDEBAR NAVIGATION */}
                    <div className="lg:col-span-3 space-y-6">
                        {/* Mini Profile Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col items-center text-center">
                            <div className="relative w-24 h-24 mb-4">
                                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-indigo-50 bg-slate-100">
                                    <ProfileAvatar
                                        src={resolveProfileAvatar(profile.avatar)}
                                        name={profile.name}
                                        size={96}
                                        textClassName="text-2xl"
                                    />
                                </div>
                                <label className="absolute bottom-0 right-0 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-white bg-[#6b8bff] text-white shadow-md transition hover:bg-[#5a7af0]">
                                    {uploadingAvatar ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                                    <input
                                        type="file"
                                        accept="image/png,image/jpeg,image/webp"
                                        className="hidden"
                                        disabled={uploadingAvatar}
                                        onChange={(e) => {
                                            handleAvatarUpload(e.target.files?.[0] || null);
                                            e.target.value = "";
                                        }}
                                    />
                                </label>
                            </div>
                            <h2 className="text-lg font-bold text-slate-900">{profile.name}</h2>
                            <p className="text-slate-500 text-sm font-medium mb-1">{profile.title}</p>
                            <div className="flex items-center text-slate-400 text-xs mt-2">
                                <MapPin className="w-3.5 h-3.5 mr-1" />
                                {profile.location}
                            </div>
                            <p className="mt-4 text-xs text-slate-400">Upload a square image up to 2MB.</p>
                        </div>

                        {/* Navigation Menu */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                            <nav className="flex flex-col">
                                {tabs.map((tab) => {
                                    const Icon = tab.icon;
                                    const isActive = activeTab === tab.id;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`flex items-center px-6 py-4 text-sm font-medium transition-all border-l-4 ${
                                                isActive 
                                                ? "border-[#6b8bff] bg-indigo-50/50 text-indigo-700" 
                                                : "border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                            }`}
                                        >
                                            <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-[#6b8bff]' : 'text-slate-400'}`} />
                                            {tab.label}
                                        </button>
                                    );
                                })}
                            </nav>
                        </div>
                    </div>

                    {/* RIGHT CONTENT AREA */}
                    <div className="lg:col-span-9 relative min-h-[600px]">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className="w-full"
                            >
                                {activeTab === "overview" && <TabOverview profile={profile} profileStrength={profileStrength} onOpenWizard={() => setShowWizard(true)} />}
                                {activeTab === "personal" && <TabPersonalInfo profile={profile} onSave={handleSaveProfile} />}
                                {activeTab === "experience" && <TabExperience profile={profile} onSave={handleSaveProfile} onRefresh={fetchProfile} />}
                                {activeTab === "skills" && <TabSkills profile={profile} onSave={handleSaveProfile} onRefresh={fetchProfile} />}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {showWizard && profile && (
                <ProfileCompletionWizard 
                    profile={profile} 
                    onClose={() => setShowWizard(false)}
                    onSaveStep={handleSaveProfile}
                    onUploadDocs={async (cv, idFront, idBack) => {
                        const formData = new FormData();
                        if (cv) formData.append("cv", cv);
                        if (idFront) formData.append("idFront", idFront);
                        if (idBack) formData.append("idBack", idBack);
                        
                        try {
                            await apiFetch("/api/auth/upload-docs", {
                                method: "POST",
                                body: formData
                            });
                            await fetchProfile();
                            return true;
                        } catch (err) {
                            console.error(err);
                            return false;
                        }
                    }}
                />
            )}
        </div>
    );
}

// ---------------------------------------------------------
// TAB COMPONENTS
// ---------------------------------------------------------

function TabOverview({ profile, profileStrength, onOpenWizard }: { profile: JobSeekerProfileData, profileStrength: number, onOpenWizard: () => void }) {
    return (
        <div className="space-y-6">
            {profileStrength < 100 && (
                <div className="bg-white rounded-3xl border border-slate-200 p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.05)] overflow-hidden relative group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#6b8bff]/5 rounded-bl-full translate-x-1/3 -translate-y-1/3 pointer-events-none group-hover:scale-110 transition-transform duration-700"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#6b8bff]/5 rounded-tr-full -translate-x-1/2 translate-y-1/2 pointer-events-none group-hover:scale-110 transition-transform duration-700"></div>
                    
                    <div className="flex items-center gap-6 z-10 w-full md:w-auto">
                        <div className="relative w-24 h-24 flex-shrink-0 flex items-center justify-center">
                            <svg viewBox="0 0 36 36" className="w-24 h-24 -rotate-90 drop-shadow-sm">
                                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#f1f5f9" strokeWidth="3" />
                                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#6b8bff" strokeWidth="3" strokeDasharray={`${profileStrength}, 100`} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
                            </svg>
                            <span className="absolute text-slate-800 font-black text-xl">{profileStrength}%</span>
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-slate-900 leading-tight mb-2 tracking-tight">Complete your profile for a <span className="text-[#6b8bff] relative whitespace-nowrap"><span className="relative z-10">better experience</span><span className="absolute bottom-1 left-0 w-full h-2 bg-[#6b8bff]/20 -z-10 -rotate-1"></span></span></h3>
                            <button onClick={onOpenWizard} className="text-white bg-[#6b8bff] hover:bg-[#5a7af0] shadow-sm shadow-[#6b8bff]/20 px-6 py-2 rounded-xl font-bold text-sm tracking-wide transition-all hover:-translate-y-0.5 mt-2">COMPLETE NOW</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Professional Overview</h1>
                        <p className="text-slate-500 mt-1">This is how employers view your public profile.</p>
                    </div>
                    {profile.isAvailable && (
                        <div className="bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-full text-sm font-semibold flex items-center gap-2 border border-emerald-100">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                            Available
                        </div>
                    )}
                </div>

                <div className="prose prose-slate max-w-none text-slate-600 bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-8 font-medium">
                    {profile.aboutMe || "No summary provided yet. Click complete now to add a summary!"}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Stats */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200">
                        <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider">Performance Stats</h3>
                        <div className="flex items-center justify-around">
                            <div className="text-center">
                                <div className="text-3xl font-black text-[#6b8bff]">{profile.stats.jobsCompleted}</div>
                                <div className="text-xs font-semibold text-slate-500 mt-1">COMPLETED</div>
                            </div>
                            <div className="w-px h-12 bg-slate-200"></div>
                            <div className="text-center">
                                <div className="text-3xl font-black text-emerald-600">{profile.stats.reliability}%</div>
                                <div className="text-xs font-semibold text-slate-500 mt-1">RELIABILITY</div>
                            </div>
                        </div>
                    </div>

                    {/* Ratings */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200">
                        <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider">Overall Rating</h3>
                        <div className="flex flex-col items-center justify-center h-full pb-4">
                            <div className="flex items-end gap-2 mb-2">
                                <span className="text-4xl font-black text-slate-900">{profile.reviewsSummary.averageRating}</span>
                                <span className="text-slate-400 font-medium mb-1">/ 5.0</span>
                            </div>
                            <div className="flex text-amber-400">
                                {[1,2,3,4,5].map((i) => (
                                    <Star key={i} className={`w-5 h-5 ${i <= Math.round(profile.reviewsSummary.averageRating) ? 'fill-current' : 'text-slate-200'}`} />
                                ))}
                            </div>
                            <span className="text-slate-400 text-xs mt-2 font-medium">({profile.reviewsSummary.totalReviews} total reviews)</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
                <h3 className="text-lg font-bold text-slate-900 mb-6">Recent Work History</h3>
                <div className="space-y-0">
                    {profile.jobHistory.length > 0 ? (
                        profile.jobHistory.map((item, idx) => (
                            <div key={item.id} className="relative pl-6 pb-8 border-l-2 border-slate-100 last:border-transparent last:pb-0">
                                <div className="absolute -left-[9px] top-0 w-4 h-4 bg-white rounded-full border-4 border-[#6b8bff]"></div>
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 -mt-2">
                                    <h4 className="font-bold text-slate-900">{item.name}</h4>
                                    <div className="flex items-center justify-between mt-1">
                                        <div className="text-sm text-[#6b8bff] font-medium">{item.role}</div>
                                        <div className="text-xs text-slate-400 font-medium bg-white px-2 py-1 rounded-md border border-slate-200">{item.date}</div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                            No recent work history to show. Complete jobs on the platform to build your history!
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function TabPersonalInfo({ profile, onSave }: { profile: JobSeekerProfileData, onSave: (p: any) => Promise<boolean> }) {
    const defaultPhone = profile.phone ? profile.phone.replace(/^(\+94|0)/, '') : "";
    const [formData, setFormData] = useState({
        firstName: profile.firstName,
        lastName: profile.lastName,
        title: profile.title,
        location: profile.location,
        phone: defaultPhone,
        aboutMe: profile.aboutMe,
        languages: profile.languages ? profile.languages.join(", ") : "",
        availableTimes: profile.availableTimes || ""
    });
    const [phoneError, setPhoneError] = useState("");
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (e.target.name === "phone") setPhoneError("");
        setSaved(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setPhoneError("");
        if (formData.phone) {
            const cleanedPhone = formData.phone.replace(/[\s-]/g, '');
            if (!/^\d{9}$/.test(cleanedPhone)) {
                setPhoneError("Please enter exactly 9 digits without the leading 0 (e.g. 771234567).");
                return;
            }
        }
        setSaving(true);
        const cleanedPhone = formData.phone.replace(/[\s-]/g, '');
        const finalPhone = cleanedPhone ? `+94${cleanedPhone}` : "";
        const success = await onSave({
            ...formData,
            phone: finalPhone,
            languages: formData.languages.split(",").map(s => s.trim()).filter(Boolean),
            availableTimes: formData.availableTimes
        });
        setSaving(false);
        if (success) {
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        }
    };

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Personal Information</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">First Name</label>
                        <input required type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#6b8bff] transition-all font-medium text-slate-900" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Last Name</label>
                        <input required type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#6b8bff] transition-all font-medium text-slate-900" />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Professional Headline</label>
                    <input required type="text" name="title" value={formData.title} onChange={handleChange} placeholder="e.g. Senior Software Engineer" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#6b8bff] transition-all font-medium text-slate-900" />
                </div>

                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Location / Hometown</label>
                    <input required type="text" name="location" value={formData.location} onChange={handleChange} placeholder="City, Country" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#6b8bff] transition-all font-medium text-slate-900" />
                </div>

                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Phone Number</label>
                    <div className="relative flex items-center">
                        <div className="absolute left-0 inset-y-0 flex items-center pl-4 pr-3 text-slate-900 font-bold bg-slate-100 rounded-l-xl border-r border-slate-200 select-none">
                            🇱🇰 +94
                        </div>
                        <input type="text" name="phone" value={formData.phone} onChange={e => { e.target.value = e.target.value.replace(/[^\d\s-]/g, ''); handleChange(e); }} placeholder="77 123 4567" className={`w-full bg-slate-50 border ${phoneError ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:ring-[#6b8bff]'} rounded-xl pl-24 pr-4 py-3 outline-none focus:ring-2 transition-all font-medium text-slate-900`} />
                    </div>
                    {phoneError && <p className="text-red-500 text-sm mt-1 mb-2 font-medium">{phoneError}</p>}
                </div>

                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Languages (Comma separated)</label>
                    <input type="text" name="languages" value={formData.languages} onChange={handleChange} placeholder="English, French, Spanish" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#6b8bff] transition-all font-medium text-slate-900" />
                </div>

                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Available Times</label>
                    <div className="flex flex-wrap gap-2 mb-3">
                        {["Full Time", "Part Time", "Weekdays", "Weekends", "Mornings", "Afternoons", "Evenings", "Night Shifts"].map(opt => {
                            const currentAvails = formData.availableTimes ? formData.availableTimes.split(',').map((s: string) => s.trim()).filter(Boolean) : [];
                            const isSelected = currentAvails.includes(opt);
                            return (
                                <button
                                    key={opt}
                                    type="button"
                                    onClick={() => {
                                        const newAvails = isSelected ? currentAvails.filter((o: string) => o !== opt) : [...currentAvails, opt];
                                        setFormData({ ...formData, availableTimes: newAvails.join(', ') });
                                        setSaved(false);
                                    }}
                                    className={`px-3 py-1.5 border rounded-lg text-xs font-bold transition-all ${
                                        isSelected
                                        ? "bg-[#6b8bff] border-[#6b8bff] text-white shadow-sm"
                                        : "bg-white border-slate-200 text-slate-600 hover:border-[#6b8bff] hover:text-[#6b8bff]"
                                    }`}
                                >
                                    {opt}
                                </button>
                            );
                        })}
                    </div>
                    <input type="text" name="availableTimes" value={formData.availableTimes} onChange={handleChange} placeholder="Or type a custom availability (e.g. Tuesday mornings)" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 transition-all font-medium text-slate-900 text-sm" />
                </div>

                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Professional Summary</label>
                    <textarea required rows={5} name="aboutMe" value={formData.aboutMe} onChange={handleChange} placeholder="Tell employers about your background and what you are looking for..." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#6b8bff] transition-all font-medium text-slate-900 resize-none"></textarea>
                </div>

                <div className="flex items-center justify-end pt-4 border-t border-slate-100">
                    {saved && <span className="text-emerald-600 font-medium flex items-center mr-4"><CheckCircle2 className="w-5 h-5 mr-1" /> Saved successfully</span>}
                    <button type="submit" disabled={saving} className="px-8 py-3 bg-[#6b8bff] text-white font-bold rounded-xl hover:bg-[#5a7af0] transition-transform hover:scale-[1.03] transition-colors disabled:opacity-70 flex items-center">
                        {saving ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </form>
        </div>
    );
}

function TabExperience({ profile, onSave, onRefresh }: { profile: JobSeekerProfileData, onSave: (p: any) => Promise<boolean>, onRefresh: () => Promise<void> }) {
    const [education, setEducation] = useState<any[]>(profile.education || []);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        const success = await onSave({ education });
        setSaving(false);
        if (success) {
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
            onRefresh();
        }
    };

    const experience = profile.experience || [];

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-slate-900">Work Experience</h2>
                </div>
                
                {experience.length === 0 && <p className="text-slate-500 italic text-sm">No confirmed work experience added yet. Jobs completed on Workzup will automatically appear here.</p>}
                
                <div className="space-y-4">
                    {experience.map((exp: any, idx: number) => (
                        <div key={exp.id || idx} className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h3 className="font-bold text-slate-900 text-lg">{exp.title}</h3>
                                    <p className="font-semibold text-[#6b8bff] text-sm">{exp.company}</p>
                                </div>
                                <span className="bg-white px-3 py-1 rounded-full text-xs font-bold text-slate-500 border border-slate-200">
                                    {exp.duration}
                                </span>
                            </div>
                            {exp.description && (
                                <p className="text-slate-600 text-sm mt-3">{exp.description}</p>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-slate-900">Education Levels (Select all that apply)</h2>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {["GCE O/L", "GCE A/L", "Undergraduate", "Degree Holder", "Postgraduate", "Other"].map(opt => {
                        const isSelected = education.some((e: any) => e.level === opt || e.degree === opt); // Fallback for old data
                        return (
                            <button
                                key={opt}
                                type="button"
                                onClick={() => {
                                    if (isSelected) {
                                        setEducation(education.filter((e: any) => e.level !== opt && e.degree !== opt));
                                    } else {
                                        setEducation([...education, { id: Date.now().toString(), level: opt }]);
                                    }
                                    setSaved(false);
                                }}
                                className={`px-4 py-3 border rounded-xl text-sm font-bold transition-all ${
                                    isSelected
                                    ? "bg-slate-900 border-slate-900 text-white shadow-md"
                                    : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-400 hover:text-slate-900"
                                }`}
                            >
                                {opt}
                            </button>
                        );
                    })}
                </div>
                <p className="text-xs text-slate-500 font-medium pt-4">Providing education details builds trust with employers. Select your qualifications here.</p>
            </div>

            <div className="flex items-center justify-end">
                {saved && <span className="text-emerald-600 font-medium flex items-center mr-4 bg-white px-4 py-2 rounded-xl shadow-sm border border-emerald-100"><CheckCircle2 className="w-5 h-5 mr-1" /> Saved!</span>}
                <button onClick={handleSave} disabled={saving} className="px-8 py-3.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-70 flex items-center shadow-lg">
                    {saving ? "Saving..." : "Save Education"}
                </button>
            </div>
        </div>
    );
}

function TabSkills({ profile, onSave, onRefresh }: { profile: JobSeekerProfileData, onSave: (p: any) => Promise<boolean>, onRefresh: () => Promise<void> }) {
    const [skills, setSkills] = useState<string[]>(profile.skills || []);
    const [newSkill, setNewSkill] = useState("");
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    
    // Auto-suggest logic
    const [showSuggestions, setShowSuggestions] = useState(false);
    
    const COMMON_SKILLS = [
        "Customer Service", "Communication", "Teamwork", "Time Management", "Problem Solving",
        "Cleaning", "Deep Cleaning", "Housekeeping", "Sanitation", "Janitorial Services",
        "Food Service", "Waiting Tables", "Bartending", "Barista", "Food Preparation", 
        "Kitchen Help", "Dishwashing", "Catering", "Baking", "Cooking",
        "Retail Sales", "Cash Handling", "Point of Sale (POS)", "Merchandising", "Inventory Management",
        "Salon Assistance", "Hair Styling Setup", "Shampooing", "Reception", "Scheduling",
        "Physical Stamina", "Heavy Lifting", "Warehouse Operations", "Packing", "Sorting",
        "Event Setup", "Event Staffing", "Ushering", "Ticketing", "Security",
        "Delivery", "Driving", "Logistics", "Landscaping", "Gardening",
        "Childcare", "Babysitting", "Pet Care", "Dog Walking", "Tutoring",
        "Multitasking", "Adaptability", "Attention to Detail", "Reliability", "Punctuality"
    ];

    const filteredSkills = newSkill.trim() === "" 
        ? [] 
        : COMMON_SKILLS.filter(skill => 
            skill.toLowerCase().includes(newSkill.toLowerCase()) && !skills.includes(skill)
          ).slice(0, 5); // Show top 5 matches

    const addSkill = (e?: React.FormEvent, skillToAdd?: string) => {
        if (e) e.preventDefault();
        const skill = (skillToAdd || newSkill).trim();
        if (skill && !skills.includes(skill)) {
            setSkills([...skills, skill]);
            setNewSkill("");
            setShowSuggestions(false);
        }
    };

    const removeSkill = (skill: string) => {
        setSkills(skills.filter(s => s !== skill));
    };

    const handleSave = async () => {
        setSaving(true);
        const success = await onSave({ skills });
        setSaving(false);
        if (success) {
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        }
    };

    const [cvFile, setCvFile] = useState<File | null>(null);
    const [idFrontFile, setIdFrontFile] = useState<File | null>(null);
    const [idBackFile, setIdBackFile] = useState<File | null>(null);
    const [uploadingDocs, setUploadingDocs] = useState(false);
    const [docsMessage, setDocsMessage] = useState({ type: "", text: "" });

    const handleUploadDocs = async () => {
        if (!cvFile && !idFrontFile && !idBackFile) return;
        setUploadingDocs(true);
        setDocsMessage({ type: "", text: "" });
        
        try {
            const formData = new FormData();
            if (cvFile) formData.append("cv", cvFile);
            if (idFrontFile) formData.append("idFront", idFrontFile);
            if (idBackFile) formData.append("idBack", idBackFile);

            await apiFetch("/api/auth/upload-docs", {
                method: "POST",
                body: formData
            });
            
            setDocsMessage({ type: "success", text: "Documents uploaded successfully! Refresh page to view changes." });
            setCvFile(null);
            setIdFrontFile(null);
            setIdBackFile(null);
            // Refresh profile to update "View Current" links immediately
            onRefresh();
        } catch (error: any) {
            setDocsMessage({ type: "error", text: error.message || "Failed to upload documents." });
        } finally {
            setUploadingDocs(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* CV & ID Documents */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">CV & ID Documents</h2>
                <p className="text-slate-500 mb-6 font-medium text-sm">Upload your CV and National ID to speed up your job applications.</p>
                
                {docsMessage.text && (
                    <div className={`p-4 rounded-xl mb-6 font-medium text-sm flex items-start gap-3 ${docsMessage.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
                        {docsMessage.type === 'error' ? <Shield className="w-5 h-5 shrink-0" /> : <CheckCircle2 className="w-5 h-5 shrink-0" />}
                        {docsMessage.text}
                    </div>
                )}

                <div className="space-y-6">
                    {/* CV Upload */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-slate-100 bg-slate-50">
                        <div>
                            <h3 className="font-bold text-slate-900">Your CV / Resume</h3>
                            <p className="text-sm text-slate-500 mt-1">
                                {profile.cv ? "You have a CV uploaded on your profile." : "No CV uploaded yet."}
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            {profile.cv && (
                                <a href={`${API_BASE}/${profile.cv.replace(/\\/g, '/')}`} target="_blank" className="text-[#6b8bff] hover:underline text-sm font-bold flex items-center">
                                    <FileText className="w-4 h-4 mr-1" /> View Current
                                </a>
                            )}
                            <label className="cursor-pointer bg-white border border-slate-300 shadow-sm text-slate-700 px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors">
                                {cvFile ? cvFile.name : "Select New CV"}
                                <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={e => { if(e.target.files) setCvFile(e.target.files[0]) }} />
                            </label>
                        </div>
                    </div>

                    {/* ID Upload */}
                    <div className="p-5 rounded-2xl border border-slate-100 bg-slate-50 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                            <div>
                                <h3 className="font-bold text-slate-900">National ID Document (NIC)</h3>
                                <p className="text-sm text-slate-500 mt-1 max-w-xl">
                                    Please upload high-quality images of both the <b>front</b> and <b>back</b> of your National Identity Card (NIC). Ensure all text is clearly legible.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                            {/* Front Side */}
                            <div className="bg-white p-4 rounded-xl border border-slate-200">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Front Side</span>
                                    {profile.idFront && (
                                        <a href={`${API_BASE}/${profile.idFront.replace(/\\/g, '/')}`} target="_blank" className="text-[#6b8bff] hover:underline text-xs font-bold flex items-center">
                                            <FileText className="w-3.5 h-3.5 mr-1" /> View Current
                                        </a>
                                    )}
                                </div>
                                <label className="cursor-pointer block w-full bg-slate-50 border border-dashed border-slate-300 px-4 py-3 rounded-lg text-center text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">
                                    {idFrontFile ? idFrontFile.name : "Select Front Image"}
                                    <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={e => { if(e.target.files) setIdFrontFile(e.target.files[0]) }} />
                                </label>
                            </div>

                            {/* Back Side */}
                            <div className="bg-white p-4 rounded-xl border border-slate-200">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Back Side</span>
                                    {profile.idBack && (
                                        <a href={`${API_BASE}/${profile.idBack.replace(/\\/g, '/')}`} target="_blank" className="text-[#6b8bff] hover:underline text-xs font-bold flex items-center">
                                            <FileText className="w-3.5 h-3.5 mr-1" /> View Current
                                        </a>
                                    )}
                                </div>
                                <label className="cursor-pointer block w-full bg-slate-50 border border-dashed border-slate-300 px-4 py-3 rounded-lg text-center text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">
                                    {idBackFile ? idBackFile.name : "Select Back Image"}
                                    <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={e => { if(e.target.files) setIdBackFile(e.target.files[0]) }} />
                                </label>
                            </div>
                        </div>
                    </div>

                    {(cvFile || idFrontFile || idBackFile) && (
                        <div className="flex justify-end pt-2">
                            <button onClick={handleUploadDocs} disabled={uploadingDocs} className="px-6 py-2.5 bg-[#6b8bff] text-white font-bold rounded-xl hover:bg-[#5a7af0] transition-transform hover:scale-[1.03] transition-colors disabled:opacity-70 flex items-center shadow-lg">
                                {uploadingDocs ? "Uploading..." : "Upload Selected Files"}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Skills */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
                <h2 className="text-xl font-bold text-slate-900 mb-6">Skills & Expertise</h2>
                
                <div className="relative mb-6">
                    <form onSubmit={addSkill} className="flex gap-3">
                        <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                <Target className="w-5 h-5" />
                            </div>
                            <input 
                                type="text" 
                                value={newSkill} 
                                onChange={e => {
                                    setNewSkill(e.target.value);
                                    setShowSuggestions(true);
                                }} 
                                onFocus={() => setShowSuggestions(true)}
                                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} // delay to allow click
                                placeholder="Type a skill and hit Enter (e.g. Cleaning, Customer Service, Bartending)" 
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3.5 outline-none focus:ring-2 focus:ring-[#6b8bff] font-medium text-slate-900" 
                            />
                            
                            {/* Auto-suggestions Dropdown */}
                            {showSuggestions && filteredSkills.length > 0 && (
                                <div className="absolute z-10 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
                                    {filteredSkills.map(skill => (
                                        <button
                                            key={skill}
                                            type="button"
                                            onClick={() => addSkill(undefined, skill)}
                                            className="w-full text-left px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-[#6b8bff] transition-colors border-b border-slate-100 last:border-0"
                                        >
                                            {skill}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <button type="submit" className="px-6 bg-[#6b8bff] text-white font-bold rounded-xl hover:bg-[#5a7af0] transition-transform hover:scale-[1.03] transition">Add</button>
                    </form>
                </div>

                <div className="flex flex-wrap gap-2 min-h-[100px] p-4 bg-slate-50 border border-slate-200 rounded-2xl items-start content-start">
                    {skills.length === 0 && <span className="text-slate-400 font-medium text-sm m-auto">No skills added yet.</span>}
                    {skills.map(skill => (
                        <div key={skill} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-300 shadow-sm text-slate-700 rounded-full font-medium text-sm animate-fade-in group hover:border-red-200 hover:bg-red-50 transition-colors">
                            {skill}
                            <button onClick={() => removeSkill(skill)} className="text-slate-400 group-hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex items-center justify-end">
                {saved && <span className="text-emerald-600 font-medium flex items-center mr-4 bg-white px-4 py-2 rounded-xl shadow-sm border border-emerald-100"><CheckCircle2 className="w-5 h-5 mr-1" /> Saved successfully</span>}
                <button onClick={handleSave} disabled={saving} className="px-8 py-3.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-70 shadow-lg">
                    {saving ? "Saving..." : "Save Skills & Links"}
                </button>
            </div>
        </div>
    );
}


