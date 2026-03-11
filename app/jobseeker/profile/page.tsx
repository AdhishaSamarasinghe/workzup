/* eslint-disable */
"use client";

import React, { useEffect, useState } from "react";
import { apiFetch, API_BASE } from "@/lib/api";
import { 
    User, Briefcase, FileText, Shield, Award, MapPin, Star, 
    Plus, Trash2, Edit2, Link as LinkIcon, Github, Linkedin, Target, CheckCircle2 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
}

export default function JobSeekerProfile() {
    const [profile, setProfile] = useState<JobSeekerProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState("overview");

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const data = await apiFetch("/api/auth/profile");
            setProfile(data);
            setLoading(false);
        } catch (err: any) {
            console.error("Error fetching profile:", err);
            setError("Could not load profile data.");
            setLoading(false);
        }
    };

    const handleSaveProfile = async (updates: Partial<JobSeekerProfileData>) => {
        if (!profile) return false;
        const newProfileData = { ...profile, ...updates };
        try {
            await apiFetch("/api/auth/profile", {
                method: "PUT",
                body: JSON.stringify(newProfileData)
            });
            setProfile(newProfileData);
            return true;
        } catch (err) {
            console.error("Save error", err);
            alert("Failed to save profile.");
            return false;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center pt-24 pb-10">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <div className="text-slate-500 font-medium mt-4">Loading your professional profile...</div>
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center pt-24 pb-10">
                <div className="bg-white p-8 rounded-2xl shadow-sm text-center border border-red-100 max-w-md w-full">
                    <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Shield className="w-8 h-8" />
                    </div>
                    <div className="text-xl font-bold text-slate-800 mb-2">Oops!</div>
                    <div className="text-slate-500">{error || "Profile not found"}</div>
                    <button onClick={fetchProfile} className="mt-6 w-full py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700">
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
        { id: "skills", label: "Docs & Skills", icon: Award },
        { id: "security", label: "Security", icon: Shield },
    ];

    return (
        <div className="min-h-screen bg-[#F8FAFC] pt-32 pb-16 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-[1200px] mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* LEFT SIDEBAR NAVIGATION */}
                    <div className="lg:col-span-3 space-y-6">
                        {/* Mini Profile Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col items-center text-center">
                            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-blue-50 mb-4 bg-slate-100">
                                <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
                            </div>
                            <h2 className="text-lg font-bold text-slate-900">{profile.name}</h2>
                            <p className="text-slate-500 text-sm font-medium mb-1">{profile.title}</p>
                            <div className="flex items-center text-slate-400 text-xs mt-2">
                                <MapPin className="w-3.5 h-3.5 mr-1" />
                                {profile.location}
                            </div>
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
                                                ? "border-blue-600 bg-blue-50/50 text-blue-700" 
                                                : "border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                            }`}
                                        >
                                            <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
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
                                {activeTab === "overview" && <TabOverview profile={profile} />}
                                {activeTab === "personal" && <TabPersonalInfo profile={profile} onSave={handleSaveProfile} />}
                                {activeTab === "experience" && <TabExperience profile={profile} onSave={handleSaveProfile} />}
                                {activeTab === "skills" && <TabSkills profile={profile} onSave={handleSaveProfile} onRefresh={fetchProfile} />}
                                {activeTab === "security" && <TabSecurity />}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ---------------------------------------------------------
// TAB COMPONENTS
// ---------------------------------------------------------

function TabOverview({ profile }: { profile: JobSeekerProfileData }) {
    return (
        <div className="space-y-6">
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

                <div className="prose prose-slate max-w-none text-slate-600 bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-8">
                    {profile.aboutMe || "No summary provided yet."}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Stats */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200">
                        <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider">Performance Stats</h3>
                        <div className="flex items-center justify-around">
                            <div className="text-center">
                                <div className="text-3xl font-black text-blue-600">{profile.stats.jobsCompleted}</div>
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
                                <div className="absolute -left-[9px] top-0 w-4 h-4 bg-white rounded-full border-4 border-blue-500"></div>
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 -mt-2">
                                    <h4 className="font-bold text-slate-900">{item.name}</h4>
                                    <div className="flex items-center justify-between mt-1">
                                        <div className="text-sm text-blue-600 font-medium">{item.role}</div>
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
    const [formData, setFormData] = useState({
        firstName: profile.firstName,
        lastName: profile.lastName,
        title: profile.title,
        location: profile.location,
        aboutMe: profile.aboutMe,
        languages: profile.languages.join(", ")
    });
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setSaved(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        const success = await onSave({
            ...formData,
            languages: formData.languages.split(",").map(s => s.trim()).filter(Boolean)
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
                        <input required type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-slate-900" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Last Name</label>
                        <input required type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-slate-900" />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Professional Headline</label>
                    <input required type="text" name="title" value={formData.title} onChange={handleChange} placeholder="e.g. Senior Software Engineer" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-slate-900" />
                </div>

                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Location / Hometown</label>
                    <input required type="text" name="location" value={formData.location} onChange={handleChange} placeholder="City, Country" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-slate-900" />
                </div>

                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Languages (Comma separated)</label>
                    <input type="text" name="languages" value={formData.languages} onChange={handleChange} placeholder="English, French, Spanish" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-slate-900" />
                </div>

                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Professional Summary</label>
                    <textarea required rows={5} name="aboutMe" value={formData.aboutMe} onChange={handleChange} placeholder="Tell employers about your background and what you are looking for..." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-slate-900 resize-none"></textarea>
                </div>

                <div className="flex items-center justify-end pt-4 border-t border-slate-100">
                    {saved && <span className="text-emerald-600 font-medium flex items-center mr-4"><CheckCircle2 className="w-5 h-5 mr-1" /> Saved successfully</span>}
                    <button type="submit" disabled={saving} className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-70 flex items-center">
                        {saving ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </form>
        </div>
    );
}

function TabExperience({ profile, onSave }: { profile: JobSeekerProfileData, onSave: (p: any) => Promise<boolean> }) {
    // Basic dynamic list forms
    const [education, setEducation] = useState(profile.education || []);
    const [experience, setExperience] = useState(profile.experience || []);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        const success = await onSave({ education, experience });
        setSaving(false);
        if (success) {
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        }
    };

    const addEdu = () => setEducation([...education, { id: Date.now().toString(), institution: "", degree: "", year: "" }]);
    const delEdu = (id: string) => setEducation(education.filter(e => e.id !== id));
    
    const addExp = () => setExperience([...experience, { id: Date.now().toString(), company: "", role: "", duration: "", description: "" }]);
    const delExp = (id: string) => setExperience(experience.filter(e => e.id !== id));

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-slate-900">Work Experience</h2>
                    <button onClick={addExp} className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center bg-blue-50 px-3 py-1.5 rounded-lg">
                        <Plus className="w-4 h-4 mr-1" /> Add Experience
                    </button>
                </div>
                
                {experience.length === 0 && <p className="text-slate-500 italic text-sm">No external work experience added yet.</p>}
                
                <div className="space-y-4">
                    {experience.map((exp, idx) => (
                        <div key={exp.id} className="relative bg-slate-50 p-6 rounded-2xl border border-slate-200">
                            <button onClick={() => delExp(exp.id)} className="absolute top-4 right-4 text-slate-400 hover:text-red-500 bg-white p-1.5 rounded-md shadow-sm border border-slate-200"><Trash2 className="w-4 h-4" /></button>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 pr-8">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Job Title</label>
                                    <input type="text" value={exp.role} onChange={(e) => { const n = [...experience]; n[idx].role = e.target.value; setExperience(n); }} placeholder="Software Engineer" className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium outline-none focus:border-blue-500" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Company</label>
                                    <input type="text" value={exp.company} onChange={(e) => { const n = [...experience]; n[idx].company = e.target.value; setExperience(n); }} placeholder="Tech Inc." className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium outline-none focus:border-blue-500" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Duration (e.g. 2020 - Present)</label>
                                    <input type="text" value={exp.duration} onChange={(e) => { const n = [...experience]; n[idx].duration = e.target.value; setExperience(n); }} placeholder="Jan 2020 - Dec 2022" className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium outline-none focus:border-blue-500" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Description</label>
                                    <textarea rows={2} value={exp.description} onChange={(e) => { const n = [...experience]; n[idx].description = e.target.value; setExperience(n); }} placeholder="Describe your responsibilities..." className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium outline-none focus:border-blue-500 resize-none"></textarea>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-slate-900">Education</h2>
                    <button onClick={addEdu} className="text-emerald-600 hover:text-emerald-700 font-medium text-sm flex items-center bg-emerald-50 px-3 py-1.5 rounded-lg">
                        <Plus className="w-4 h-4 mr-1" /> Add Education
                    </button>
                </div>
                
                {education.length === 0 && <p className="text-slate-500 italic text-sm">No education history added yet.</p>}
                
                <div className="space-y-4">
                    {education.map((edu, idx) => (
                        <div key={edu.id} className="relative bg-slate-50 p-6 rounded-2xl border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <button onClick={() => delEdu(edu.id)} className="absolute top-4 right-4 text-slate-400 hover:text-red-500 bg-white p-1.5 rounded-md shadow-sm border border-slate-200"><Trash2 className="w-4 h-4" /></button>
                            <div className="md:col-span-3 pr-8">
                                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Institution / University</label>
                                <input type="text" value={edu.institution} onChange={(e) => { const n = [...education]; n[idx].institution = e.target.value; setEducation(n); }} placeholder="e.g. University of Westminster" className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium outline-none focus:border-emerald-500" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Degree / Certificate</label>
                                <input type="text" value={edu.degree} onChange={(e) => { const n = [...education]; n[idx].degree = e.target.value; setEducation(n); }} placeholder="BSc Computer Science" className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium outline-none focus:border-emerald-500" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Graduation Year</label>
                                <input type="text" value={edu.year} onChange={(e) => { const n = [...education]; n[idx].year = e.target.value; setEducation(n); }} placeholder="2024" className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium outline-none focus:border-emerald-500" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex items-center justify-end">
                {saved && <span className="text-emerald-600 font-medium flex items-center mr-4 bg-white px-4 py-2 rounded-xl shadow-sm border border-emerald-100"><CheckCircle2 className="w-5 h-5 mr-1" /> Saved!</span>}
                <button onClick={handleSave} disabled={saving} className="px-8 py-3.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-70 flex items-center shadow-lg">
                    {saving ? "Saving..." : "Save Experience & Education"}
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
                                <a href={`${API_BASE}/${profile.cv.replace(/\\/g, '/')}`} target="_blank" className="text-blue-600 hover:underline text-sm font-bold flex items-center">
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
                                        <a href={`${API_BASE}/${profile.idFront.replace(/\\/g, '/')}`} target="_blank" className="text-blue-600 hover:underline text-xs font-bold flex items-center">
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
                                        <a href={`${API_BASE}/${profile.idBack.replace(/\\/g, '/')}`} target="_blank" className="text-blue-600 hover:underline text-xs font-bold flex items-center">
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
                            <button onClick={handleUploadDocs} disabled={uploadingDocs} className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-70 flex items-center shadow-lg">
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
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3.5 outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-900" 
                            />
                            
                            {/* Auto-suggestions Dropdown */}
                            {showSuggestions && filteredSkills.length > 0 && (
                                <div className="absolute z-10 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
                                    {filteredSkills.map(skill => (
                                        <button
                                            key={skill}
                                            type="button"
                                            onClick={() => addSkill(undefined, skill)}
                                            className="w-full text-left px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors border-b border-slate-100 last:border-0"
                                        >
                                            {skill}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <button type="submit" className="px-6 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition">Add</button>
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
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 max-w-2xl">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Security Settings</h2>
            <p className="text-slate-500 mb-8 font-medium">Manage your password and account security preferences here to ensure your account remains safe.</p>

            {status && (
                <div className={`p-4 rounded-xl mb-6 font-medium text-sm flex items-start gap-3 ${status.type === 'error' ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'}`}>
                    {status.type === 'error' ? <Shield className="w-5 h-5 shrink-0" /> : <CheckCircle2 className="w-5 h-5 shrink-0" />}
                    {status.msg}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5 border border-slate-100 p-6 rounded-2xl bg-slate-50">
                <h3 className="font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2">Change Password</h3>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Current Password</label>
                    <input required type="password" value={passwords.current} onChange={e => setPasswords({...passwords, current: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-slate-900" />
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">New Password</label>
                    <input required type="password" value={passwords.new} onChange={e => setPasswords({...passwords, new: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-slate-900" />
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Confirm New Password</label>
                    <input required type="password" value={passwords.confirm} onChange={e => setPasswords({...passwords, confirm: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-slate-900" />
                </div>

                <div className="pt-4 flex justify-end">
                    <button type="submit" disabled={loading} className="px-8 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors disabled:opacity-70 flex items-center shadow-lg shadow-red-200">
                        {loading ? "Updating Security..." : "Change Password"}
                    </button>
                </div>
            </form>
        </div>
    );
}
