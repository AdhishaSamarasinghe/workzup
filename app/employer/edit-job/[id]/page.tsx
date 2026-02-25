"use client";

/**
 * edit-job/[id]/page.tsx — Edit Job Posting form (employer-facing)
 * Fetches an existing job by ID from the URL param, pre-fills the form,
 * and allows the employer to save changes or delete the posting.
 
 */

import { use, useEffect, useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { SRI_LANKA_LOCATIONS } from "@/app/data/locations";
import TimePicker from "@/components/TimePicker";

type Status = "DRAFT" | "PUBLIC" | "PRIVATE";

type JobForm = {
    title: string;
    description: string;
    pay: string;           // stored as string in the form; converted to Number on submit
    payType: "hour" | "day";
    category: string;
    locations: string[];
    jobDates: string[];    
    startTime: string;     
    endTime: string;       
    requirements: string[];
};


export default function EditJobPage({ params }: { params: Promise<{ id: string }> }) {
    // unwraps the async params object in Next.js App Router

    const { id } = use(params);
    const router = useRouter();

    // [API] Base URL 
    const API_BASE = useMemo(
        () => process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000",
        []
    );

    //  Flatten the district→cities map into a sorted "City, District" list
    const ALL_CITIES = useMemo(() => {
        const list: string[] = [];
        Object.entries(SRI_LANKA_LOCATIONS).forEach(([dist, cities]) => {
            cities.forEach(city => list.push(`${city}, ${dist}`));
        });
        return list.sort();
    }, []);


    //Form fields — initialized empty; overwritten by the fetch in useEffect
    const [form, setForm] = useState<JobForm>({
        title: "",
        description: "",
        pay: "",
        payType: "hour",
        category: "Hospitality",
        locations: [],
        jobDates: [],
        startTime: "",
        endTime: "",
        requirements: [],
    });

    // Status is kept separate from form so it can be changed independently
    
    const [status, setStatus] = useState<Status>("DRAFT");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Staging inputs for array fields
    const [reqInput, setReqInput] = useState("");
    const [locInput, setLocInput] = useState("");
    const [dateInput, setDateInput] = useState("");

    
    // Requirements
    const addRequirement = () => {
        if (!reqInput.trim()) return;
        setForm((p) => ({ ...p, requirements: [...p.requirements, reqInput.trim()] }));
        setReqInput("");
    };

    const removeRequirement = (index: number) => {
        setForm((p) => ({ ...p, requirements: p.requirements.filter((_, i) => i !== index) }));
    };

    // Locations — deduplicated
    const addLocation = () => {
        if (!locInput.trim()) return;
        if (form.locations.includes(locInput.trim())) return;
        setForm((p) => ({ ...p, locations: [...p.locations, locInput.trim()] }));
        setLocInput("");
    };

    const removeLocation = (index: number) => {
        setForm((p) => ({ ...p, locations: p.locations.filter((_, i) => i !== index) }));
    };

    // Job dates — duplicates silently dropped
    const addDate = () => {
        if (!dateInput) return;
        if (form.jobDates.includes(dateInput)) return setDateInput("");
        setForm((p) => ({ ...p, jobDates: [...p.jobDates, dateInput] }));
        setDateInput("");
    };

    const removeDate = (index: number) => {
        setForm((p) => ({ ...p, jobDates: p.jobDates.filter((_, i) => i !== index) }));
    };

    
    // [API] GET /api/jobs/:id — loads the existing job and pre-fills the form.
    // Handles legacy single-value fields (location, jobDate) by converting them
    // to arrays so the rest of the form logic stays consistent.
    useEffect(() => {
        if (!id) {
            console.error("No Job ID provided in params");
            return;
        }

        console.log(`Fetching job with ID: ${id} from ${API_BASE}`);
        fetch(`${API_BASE}/api/jobs/${id}`, { cache: "no-store" })
            .then(async (res) => {
                if (!res.ok) {
                    const data = await res.json().catch(() => ({}));
                    throw new Error(data?.message || "Job not found");
                }
                return res.json();
            })
            .then((data) => {
                setForm({
                    title: data.title,
                    description: data.description,
                    pay: String(data.pay),
                    payType: data.payType,
                    category: data.category,
                    //Prefer array field; fall back to wrapping legacy single value
                    locations: data.locations || (data.location ? [data.location] : []),
                    // Strip the time portion from ISO dates if present 
                    jobDates: data.jobDates || (data.jobDate ? [data.jobDate.split('T')[0]] : []),
                    startTime: data.startTime || "",
                    endTime: data.endTime || "",
                    requirements: data.requirements || [],
                });
                setStatus(data.status);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Fetch error:", err);
                setError(err.message);
                setLoading(false);
            });
    }, [id, API_BASE]);


    function handleChange(
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) {
        const { name, value } = e.target;
        setForm((p) => ({ ...p, [name]: value }));
    }

    // VALIDATION Edit page always validates as if the job is PUBLIC/PRIVATE
    // because a saved edit should always produce a complete listing.
  
    // Consider allowing DRAFT saves from the edit page too (currently not supported).
    function validate(): string {
        if (!form.title.trim()) return "Job title is required.";
        if (!form.description.trim()) return "Job description is required.";
        if (!form.pay || Number(form.pay) <= 0) return "Pay must be a positive number.";
        if (form.locations.length === 0) return "At least one location is required.";
        if (form.jobDates.length === 0) return "At least one job date is required.";
        if (!form.startTime) return "Start time is required.";
        if (!form.endTime) return "End time is required.";
        return "";
    }

    // [API] PUT /api/jobs/:id — saves changes and redirects to the job list on success
    async function handleSave() {
        setError("");
        const err = validate();
        if (err) return setError(err);

        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/jobs/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                // Merge form fields with the current status
                body: JSON.stringify({ ...form, status }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.message || "Failed to update job");
            }

            //  Navigate back to the job list after a successful save
            router.push("/employer/create-job/my-postings");
        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    }

    //DELETE /api/jobs/:id — deletes the job after a confirmation dialog
    async function handleDelete() {
        // Guard against accidental clicks — browser native confirm is intentional here
        if (!confirm("Are you sure you want to delete this job posting?")) return;

        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/jobs/${id}`, {
                method: "DELETE",
            });

            if (!res.ok) throw new Error("Failed to delete job");

            // Navigate back to the job list after deletion
            router.push("/employer/create-job/my-postings");
        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    }

    
    if (loading) return <div className="p-8 text-center text-slate-500">Loading job details...</div>;
    if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;

    
    return (
        <div className="min-h-screen bg-slate-50">
            <main className="max-w-5xl mx-auto px-4 py-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <div className="text-xs text-slate-500 mb-3 uppercase tracking-wider font-bold">My postings / Edit Job</div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Edit Job Posting</h1>
                        <p className="text-slate-600 mt-1">
                            Update the details for your {form.title || 'job'} position.
                        </p>
                    </div>

                </div>


                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-8">
                    {/*Job Details */}
                    <section>
                        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <span className="w-1 h-6 bg-accent rounded-full inline-block"></span>
                            Job Details
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-1">
                                <label className="block text-sm font-semibold text-slate-800 mb-2">Job Title</label>
                                <input
                                    name="title"
                                    value={form.title}
                                    onChange={handleChange}
                                    placeholder="e.g. Senior Frontend Developer"
                                    className="w-full h-11 px-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-200"
                                />
                            </div>
                            <div className="md:col-span-1">
                                <label className="block text-sm font-semibold text-slate-800 mb-2">
                                    Job Categories
                                </label>
                                <select
                                    name="category"
                                    value={form.category}
                                    onChange={handleChange}
                                    className="w-full h-11 px-3 border border-slate-300 rounded-xl bg-white outline-none focus:ring-2 focus:ring-blue-200"
                                >
                                    <option>Hospitality</option>
                                    <option>Retail</option>
                                    <option>Event Staff</option>
                                    <option>Delivery</option>
                                    <option>Cleaning</option>
                                    <option>Admin</option>
                                    <option>Software Development</option>
                                    <option>Other</option>
                                </select>
                            </div>
                        </div>

                        <label className="block text-sm font-semibold text-slate-800 mt-5 mb-2">
                            Job Description
                        </label>
                        <textarea
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            placeholder="Describe responsibilities, requirements, and important details..."
                            className="w-full min-h-[120px] px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-200 resize-y"
                        />

                        <div className="mt-5">
                            <label className="block text-sm font-semibold text-slate-800 mb-2">
                                Pay/Salary
                            </label>
                            <div className="relative w-full md:w-1/2">
                                <span className="absolute left-3 top-2.5 text-slate-500 font-semibold">$</span>
                                <input
                                    name="pay"
                                    value={form.pay}
                                    onChange={handleChange}
                                    placeholder="Rs.250.00"
                                    inputMode="numeric"
                                    className="w-full h-11 pl-7 pr-16 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-200"
                                />
                                <span className="absolute right-3 top-2.5 text-slate-500 text-sm">/ {form.payType}</span>
                            </div>
                        </div>
                    </section>

                    <hr className="border-slate-100" />

                    {/*Location & Schedule */}
                    <section>
                        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <span className="w-1 h-6 bg-purple-600 rounded-full inline-block"></span>
                            Location & Schedule
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Locations — autocomplete from SRI_LANKA_LOCATIONS datalist */}
                            <div className="md:col-span-1">
                                <label className="block text-sm font-semibold text-slate-800 mb-2">Location/Address</label>
                                <div className="flex gap-2">
                                    <input
                                        value={locInput}
                                        onChange={(e) => setLocInput(e.target.value)}
                                        placeholder="e.g. Colombo, Kandy"
                                        list="city-list"
                                        className="flex-1 h-11 px-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-200"
                                        onKeyDown={(e) => e.key === "Enter" && addLocation()}
                                    />
                                    <datalist id="city-list">
                                        {ALL_CITIES.map((loc) => (
                                            <option key={loc} value={loc} />
                                        ))}
                                    </datalist>
                                    <button
                                        onClick={addLocation}
                                        type="button"
                                        className="px-4 h-11 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-colors"
                                    >
                                        Add
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {form.locations.map((loc, idx) => (
                                        <span key={idx} className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded border border-slate-200">
                                            {loc} <button onClick={() => removeLocation(idx)} className="text-slate-400 hover:text-red-500">×</button>
                                        </span>
                                    ))}
                                </div>

                            </div>

                            {/*  Job dates — YYYY-MM-DD strings from <input type="date">. */}
                            <div className="md:col-span-1">
                                <label className="block text-sm font-semibold text-slate-800 mb-2">Job Date</label>
                                <div className="flex gap-2">
                                    <input
                                        type="date"
                                        value={dateInput}
                                        onChange={(e) => setDateInput(e.target.value)}
                                        className="w-full h-11 px-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-200"
                                    />
                                    <button
                                        onClick={addDate}
                                        type="button"
                                        className="px-4 h-11 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-colors"
                                    >
                                        Add
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {form.jobDates.map((date, idx) => (
                                        <span key={idx} className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded border border-slate-200">
                                            {date.split('T')[0]} <button onClick={() => removeDate(idx)} className="text-slate-400 hover:text-red-500">×</button>
                                        </span>
                                    ))}
                                </div>
                            </div>


                            {/*  TimePicker produces "HH:mm AM/PM" strings */}
                            <div>
                                <TimePicker
                                    label="Start Time"
                                    value={form.startTime}
                                    onChange={(val) => setForm(p => ({ ...p, startTime: val }))}
                                />
                            </div>

                            <div>
                                <TimePicker
                                    label="End Time"
                                    value={form.endTime}
                                    onChange={(val) => setForm(p => ({ ...p, endTime: val }))}
                                />
                            </div>
                        </div>
                    </section>

                    <hr className="border-slate-100" />

                    {/*  Requirements */}
                    <section>
                        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <span className="w-1 h-6 bg-green-600 rounded-full inline-block"></span>
                            Requirements
                        </h2>
                        <div className="flex gap-2 mb-4">
                            <input
                                value={reqInput}
                                onChange={(e) => setReqInput(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && addRequirement()}
                                placeholder="Add a requirement (e.g. Must have own vehicle)"
                                className="flex-1 h-11 px-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-200"
                            />
                            <button
                                onClick={addRequirement}
                                type="button"
                                className="px-4 h-11 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-colors"
                            >
                                Add
                            </button>
                        </div>

                        {form.requirements.length === 0 && (
                            <p className="text-slate-400 text-sm italic">No requirements added yet.</p>
                        )}

                        <ul className="space-y-2">
                            {form.requirements.map((req, idx) => (
                                <li
                                    key={idx}
                                    className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded-lg border border-slate-200"
                                >
                                    <span className="text-slate-700">{req}</span>
                                    <button
                                        onClick={() => removeRequirement(idx)}
                                        className="text-red-500 hover:text-red-700 text-sm font-medium"
                                    >
                                        Remove
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </section>

                    <hr className="border-slate-100" />

                    {/* Action bar — Save / Cancel (left) and Delete (right) */}
                    <div className="flex items-center justify-between pt-8 mt-8 border-t border-slate-100">
                        <div className="flex items-center gap-6">
                            {/* [API] PUT /api/jobs/:id */}
                            <button
                                onClick={handleSave}
                                disabled={loading}
                                className="min-w-[180px] h-11 rounded-[14px] bg-[#6B8CFF] px-6 
                                           text-white font-semibold shadow-sm 
                                           hover:bg-[#5979F0] 
                                           disabled:opacity-60 disabled:cursor-not-allowed 
                                           transition-all duration-200"
                            >
                                {loading ? "Saving..." : "Save Changes"}
                            </button>
                            {/* Cancel navigates back without saving */}
                            <button
                                onClick={() => router.push("/employer/create-job/my-postings")}
                                className="text-slate-900 font-semibold hover:text-slate-500 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>

                        {/*  DELETE /api/jobs/:id — destructive action, guarded by confirm() */}
                        <button
                            onClick={handleDelete}
                            disabled={loading}
                            className="btn-danger flex items-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                            Delete Posting
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}
