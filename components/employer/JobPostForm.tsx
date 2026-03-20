/* eslint-disable */
"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import TimePicker from "@/components/TimePicker";
import DatePicker from "@/components/jobs/DatePicker";

const LocationMap = dynamic(() => import("@/components/LocationMap"), {
    ssr: false,
});

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

type FieldKey =
    | "title"
    | "description"
    | "pay"
    | "jobDates"
    | "locations"
    | "startTime"
    | "endTime";

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
    const [mapPosition, setMapPosition] = useState({ lat: 6.9271, lng: 79.8612 });

    const [submitError, setSubmitError] = useState("");
    const [missingFields, setMissingFields] = useState<Partial<Record<FieldKey, boolean>>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fieldRefs = React.useRef<Partial<Record<FieldKey, HTMLDivElement | null>>>({});

    const setFieldRef = (key: FieldKey) => (el: HTMLDivElement | null) => {
        fieldRefs.current[key] = el;
    };

    const markFilled = (key: FieldKey) => {
        setMissingFields((prev) => {
            if (!prev[key]) return prev;
            return { ...prev, [key]: false };
        });
    };

    const fieldErrorText = (key: FieldKey) => {
        switch (key) {
            case "title":
                return "Job title is required.";
            case "description":
                return "Job description is required.";
            case "pay":
                return "Enter a valid pay amount.";
            case "locations":
                return "Add at least one location.";
            case "jobDates":
                return "Add at least one job date.";
            case "startTime":
                return "Start time is required.";
            case "endTime":
                return "End time is required.";
            default:
                return "This field is required.";
        }
    };

    const validateForm = (status: JobStatus) => {
        const errors: Partial<Record<FieldKey, boolean>> = {};
        const ordered: FieldKey[] = [
            "title",
            "description",
            "pay",
            "locations",
            "jobDates",
            "startTime",
            "endTime",
        ];

        if (!form.title.trim()) errors.title = true;

        if (status === "PUBLIC" || status === "PRIVATE") {
            if (!form.description.trim()) errors.description = true;
            if (!form.pay || Number(form.pay) <= 0) errors.pay = true;
            if (form.locations.length === 0) errors.locations = true;
            if (form.jobDates.length === 0) errors.jobDates = true;
            if (!form.startTime) errors.startTime = true;
            if (!form.endTime) errors.endTime = true;
        }

        const firstMissing = ordered.find((key) => errors[key]);
        return { errors, firstMissing };
    };

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
        markFilled("locations");
        setLocInput("");
    };

    const removeLocation = (index: number) => {
        setForm((p) => ({ ...p, locations: p.locations.filter((_, i) => i !== index) }));
    };

    const handleMapLocationSelect = (lat: number, lng: number, address: string) => {
        setMapPosition({ lat, lng });
        if (address.trim()) {
            setLocInput(address.trim());
            setMissingFields((prev) => ({ ...prev, locations: false }));
        }
    };

    const addDate = () => {
        if (!dateInput) return;
        if (form.jobDates.includes(dateInput)) return setDateInput("");
        setForm((p) => ({ ...p, jobDates: [...p.jobDates, dateInput] }));
        markFilled("jobDates");
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

        if (name === "title") markFilled("title");
        if (name === "description") markFilled("description");
        if (name === "pay") {
            if (value && Number(value) > 0) markFilled("pay");
        }
    }

    const handleInnerSubmit = async (status: JobStatus) => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        setSubmitError("");
        setMissingFields({});

        const { errors, firstMissing } = validateForm(status);
        if (firstMissing) {
            setMissingFields(errors);

            const target = fieldRefs.current[firstMissing];
            if (target) {
                target.scrollIntoView({ behavior: "smooth", block: "center" });
                const focusable = target.querySelector("input, textarea, select, button") as HTMLElement | null;
                focusable?.focus();
            }

            setIsSubmitting(false);
            return;
        }

        try {
            await onSubmit(form, status);
        } catch (err: any) {
            setSubmitError(err.message || "Submission failed");
        } finally {
            setIsSubmitting(false);
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
                <div ref={setFieldRef("title")}>
                    <input
                        name="title"
                        value={form.title}
                        onChange={handleChange}
                        placeholder="e.g. Event Staff for Charity Gala"
                        className={`w-full h-11 px-3 border rounded-xl outline-none focus:ring-2 ${missingFields.title ? "border-red-400 focus:ring-red-200 bg-red-50/30" : "border-slate-300 focus:ring-blue-200"}`}
                    />
                    {missingFields.title && (
                        <p className="text-xs text-red-600 mt-1">{fieldErrorText("title")}</p>
                    )}
                </div>

                <label className="block text-sm font-semibold text-slate-800 mt-5 mb-2">
                    Job description
                </label>
                <div ref={setFieldRef("description")}>
                    <textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        placeholder="Describe responsibilities, requirements, and important details..."
                        className={`w-full min-h-[120px] px-3 py-2 border rounded-xl outline-none focus:ring-2 resize-y ${missingFields.description ? "border-red-400 focus:ring-red-200 bg-red-50/30" : "border-slate-300 focus:ring-blue-200"}`}
                    />
                    {missingFields.description && (
                        <p className="text-xs text-red-600 mt-1">{fieldErrorText("description")}</p>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
                    <div>
                        <label className="block text-sm font-semibold text-slate-800 mb-2">Pay</label>
                        <div className="flex gap-2">
                            <div ref={setFieldRef("pay")} className="w-full">
                                <input
                                    name="pay"
                                    value={form.pay}
                                    onChange={handleChange}
                                    placeholder="$250.00"
                                    inputMode="numeric"
                                    className={`w-full h-11 px-3 border rounded-xl outline-none focus:ring-2 ${missingFields.pay ? "border-red-400 focus:ring-red-200 bg-red-50/30" : "border-slate-300 focus:ring-blue-200"}`}
                                />
                                {missingFields.pay && (
                                    <p className="text-xs text-red-600 mt-1">{fieldErrorText("pay")}</p>
                                )}
                            </div>
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
                    <div
                        ref={setFieldRef("jobDates")}
                        className={`md:col-span-2 rounded-xl px-2 pt-2 pb-1 ${missingFields.jobDates ? "border border-red-300 bg-red-50/20" : ""}`}
                    >
                        <label className="block text-sm font-semibold text-slate-800 mb-2">Job Dates</label>
                        <div className="flex gap-2 mb-2">
                            <div className="flex-1">
                                <DatePicker value={dateInput} onChange={setDateInput} />
                            </div>
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
                        {missingFields.jobDates && (
                            <p className="text-xs text-red-600 mt-1">{fieldErrorText("jobDates")}</p>
                        )}
                    </div>

                    {/* Locations */}
                    <div
                        ref={setFieldRef("locations")}
                        className={`md:col-span-2 rounded-xl px-2 pt-2 pb-1 ${missingFields.locations ? "border border-red-300 bg-red-50/20" : ""}`}
                    >
                        <label className="block text-sm font-semibold text-slate-800 mb-2">Locations</label>
                        <div className="flex gap-2 mb-2">
                            <input
                                value={locInput}
                                onChange={(e) => setLocInput(e.target.value)}
                                placeholder="e.g. Colombo, Baththaramulla"
                                className="flex-1 h-11 px-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-200"
                                onKeyDown={(e) => e.key === "Enter" && addLocation()}
                            />
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
                        <div className="mt-3 rounded-xl overflow-hidden border border-slate-200">
                            <LocationMap
                                position={mapPosition}
                                onLocationSelect={handleMapLocationSelect}
                            />
                        </div>
                        <p className="text-xs text-slate-500 mt-2">
                            Click on the map to pick a location. The selected address will appear in the input above.
                        </p>
                        {missingFields.locations && (
                            <p className="text-xs text-red-600 mt-1">{fieldErrorText("locations")}</p>
                        )}
                    </div>

                    <div
                        ref={setFieldRef("startTime")}
                        className={`rounded-xl px-2 pt-2 pb-1 ${missingFields.startTime ? "border border-red-300 bg-red-50/20" : ""}`}
                    >
                        <TimePicker
                            label="Start Time"
                            value={form.startTime}
                            onChange={(val) => {
                                setForm(p => ({ ...p, startTime: val }));
                                if (val) markFilled("startTime");
                            }}
                        />
                        {missingFields.startTime && (
                            <p className="text-xs text-red-600 mt-1">{fieldErrorText("startTime")}</p>
                        )}
                    </div>

                    <div
                        ref={setFieldRef("endTime")}
                        className={`rounded-xl px-2 pt-2 pb-1 ${missingFields.endTime ? "border border-red-300 bg-red-50/20" : ""}`}
                    >
                        <TimePicker
                            label="End Time"
                            value={form.endTime}
                            onChange={(val) => {
                                setForm(p => ({ ...p, endTime: val }));
                                if (val) markFilled("endTime");
                            }}
                        />
                        {missingFields.endTime && (
                            <p className="text-xs text-red-600 mt-1">{fieldErrorText("endTime")}</p>
                        )}
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

            {submitError ? <p className="text-sm text-red-600">{submitError}</p> : null}

            {/* Action buttons */}
            <div className="flex items-center gap-4 pt-4">
                {mode === "create" ? (
                    <>
                        <button
                            onClick={() => handleInnerSubmit("PUBLIC")}
                            disabled={loading || isSubmitting}
                            className="btn-primary min-w-[156px] px-6 h-[44px] whitespace-nowrap"
                        >
                            {loading ? "Creating..." : "Post a new job"}
                        </button>
                        <button
                            onClick={() => handleInnerSubmit("DRAFT")}
                            disabled={loading || isSubmitting}
                            className="btn-secondary"
                        >
                            {loading ? "Saving..." : "Save as Draft"}
                        </button>
                    </>
                ) : (
                    <button
                        onClick={() => handleInnerSubmit("PUBLIC")}
                        disabled={loading || isSubmitting}
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
