/* eslint-disable */
"use client";

import React, { useMemo, useState, useEffect } from "react";
import { SRI_LANKA_LOCATIONS } from "@/app/data/locations";
import TimePicker from "@/components/TimePicker";

// ─── Types ────────────────────────────────────────────────────────────────────
export type JobStatus = "DRAFT" | "PUBLIC" | "PRIVATE";

export type JobForm = {
    title: string;
    description: string;
    pay: string;
    payType: "hour" | "day";
    category: string;
    locations: string[];
    jobDates: string[];
    startTime: string;
    endTime: string;
    requirements: string[];
};

interface JobPostFormProps {
    initialData?: JobForm;
    onSubmit: (form: JobForm, status: JobStatus) => Promise<void>;
    onCancel: () => void;
    loading: boolean;
    mode: "create" | "edit";
}

export default function JobPostForm({
    initialData,
    onSubmit,
    onCancel,
    loading,
    mode
}: JobPostFormProps) {
    // [STATE] Main form state
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

    // Sync initialData if provided
    useEffect(() => {
        if (initialData) {
            setForm(initialData);
        }
    }, [initialData]);

    // user types here then clicks Add
    const [reqInput, setReqInput] = useState("");
    const [locInput, setLocInput] = useState("");
    const [dateInput, setDateInput] = useState("");

    const [localMsg, setLocalMsg] = useState<{ type: "error" | ""; text: string }>({
        type: "",
        text: "",
    });

    // Flatten locations for autocomplete
    const ALL_CITIES = useMemo(() => {
        const list: string[] = [];
        Object.entries(SRI_LANKA_LOCATIONS).forEach(([dist, cities]) => {
            cities.forEach(city => list.push(`${city}, ${dist}`));
        });
        return list.sort();
    }, []);

    // Handlers
    const addRequirement = () => {
        if (!reqInput.trim()) return;
        setForm((p) => ({ ...p, requirements: [...p.requirements, reqInput.trim()] }));
        setReqInput("");
    };

    const removeRequirement = (index: number) => {
        setForm((p) => ({ ...p, requirements: p.requirements.filter((_, i) => i !== index) }));
    };

    const addLocation = () => {
        if (!locInput.trim()) return;
        if (form.locations.includes(locInput.trim())) return;
        setForm((p) => ({ ...p, locations: [...p.locations, locInput.trim()] }));
        setLocInput("");
    };

    const removeLocation = (index: number) => {
        setForm((p) => ({ ...p, locations: p.locations.filter((_, i) => i !== index) }));
    };

    const addDate = () => {
        if (!dateInput) return;
        if (form.jobDates.includes(dateInput)) return setDateInput("");
        setForm((p) => ({ ...p, jobDates: [...p.jobDates, dateInput] }));
        setDateInput("");
    };

    const removeDate = (index: number) => {
        setForm((p) => ({ ...p, jobDates: p.jobDates.filter((_, i) => i !== index) }));
    };

    function handleChange(
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) {
        const { name, value } = e.target;
        setForm((p) => ({ ...p, [name]: value }));
    }

    const handleInnerSubmit = async (status: JobStatus) => {
        setLocalMsg({ type: "", text: "" });

        // Simple validation shim (Parent usually validates too, but good to have here)
        if (!form.title.trim()) {
            setLocalMsg({ type: "error", text: "Job title is required." });
            return;
        }

        try {
            await onSubmit(form, status);
        } catch (err: any) {
            setLocalMsg({ type: "error", text: err.message || "Submission failed" });
        }
    };

    return (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-8">
            {/* Job Details */}
            <section>
                <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <span className="w-1 h-6 bg-accent rounded-full inline-block"></span>
                    Job Details
                </h2>

                <label className="block text-sm font-semibold text-slate-800 mb-2">Job title</label>
                <input
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="e.g. Event Staff for Charity Gala"
                    className="w-full h-11 px-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-200"
                />

                <label className="block text-sm font-semibold text-slate-800 mt-5 mb-2">
                    Job description
                </label>
                <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Describe responsibilities, requirements, and important details..."
                    className="w-full min-h-[120px] px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-200 resize-y"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
                    <div>
                        <label className="block text-sm font-semibold text-slate-800 mb-2">Pay</label>
                        <div className="flex gap-2">
                            <input
                                name="pay"
                                value={form.pay}
                                onChange={handleChange}
                                placeholder="$250.00"
                                inputMode="numeric"
                                className="w-full h-11 px-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-200"
                            />
                            <select
                                name="payType"
                                value={form.payType}
                                onChange={handleChange}
                                className="h-11 px-3 border border-slate-300 rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-blue-200"
                            >
                                <option value="hour">/ hour</option>
                                <option value="day">/ day</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-800 mb-2">
                            Job Category
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
                            <option>Other</option>
                        </select>
                    </div>
                </div>
            </section>

            <hr className="border-slate-100" />

            {/* Location & Schedule */}
            <section>
                <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <span className="w-1 h-6 bg-purple-600 rounded-full inline-block"></span>
                    Location & Schedule
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Job Dates */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-slate-800 mb-2">Job Dates</label>
                        <div className="flex gap-2 mb-2">
                            <input
                                type="date"
                                value={dateInput}
                                onChange={(e) => setDateInput(e.target.value)}
                                className="flex-1 h-11 px-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-200"
                            />
                            <button
                                onClick={addDate}
                                type="button"
                                className="px-4 h-11 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-colors"
                            >
                                Add
                            </button>
                        </div>
                        {form.jobDates.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {form.jobDates.map((date, idx) => (
                                    <span
                                        key={idx}
                                        className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-lg border border-blue-100"
                                    >
                                        {date}
                                        <button
                                            onClick={() => removeDate(idx)}
                                            className="text-blue-400 hover:text-blue-600 focus:outline-none"
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Locations */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-slate-800 mb-2">Locations</label>
                        <div className="flex gap-2 mb-2">
                            <input
                                value={locInput}
                                onChange={(e) => setLocInput(e.target.value)}
                                placeholder="e.g. Colombo, Baththaramulla"
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
                        {form.locations.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {form.locations.map((loc, idx) => (
                                    <span
                                        key={idx}
                                        className="inline-flex items-center gap-2 px-3 py-1 bg-purple-50 text-purple-700 text-sm font-medium rounded-lg border border-purple-100"
                                    >
                                        {loc}
                                        <button
                                            onClick={() => removeLocation(idx)}
                                            className="text-purple-400 hover:text-purple-600 focus:outline-none"
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

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

            {/* Requirements */}
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

            {/* Error feedback banner */}
            {localMsg.text ? (
                <div className="px-4 py-3 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm">
                    {localMsg.text}
                </div>
            ) : null}

            {/* Action buttons */}
            <div className="flex items-center gap-4 pt-4">
                {mode === "create" ? (
                    <>
                        <button
                            onClick={() => handleInnerSubmit("PUBLIC")}
                            disabled={loading}
                            className="btn-primary min-w-[156px] px-6 h-[44px] whitespace-nowrap"
                        >
                            {loading ? "Creating..." : "Post a new job"}
                        </button>
                        <button
                            onClick={() => handleInnerSubmit("DRAFT")}
                            disabled={loading}
                            className="btn-secondary"
                        >
                            {loading ? "Saving..." : "Save as Draft"}
                        </button>
                    </>
                ) : (
                    <button
                        onClick={() => handleInnerSubmit("PUBLIC")}
                        disabled={loading}
                        className="btn-primary min-w-[156px] px-6 h-[44px] whitespace-nowrap"
                    >
                        {loading ? "Saving..." : "Save Changes"}
                    </button>
                )}

                <button
                    onClick={onCancel}
                    className="btn-tertiary"
                    type="button"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}
