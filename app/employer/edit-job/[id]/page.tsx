/* eslint-disable */
"use client";

import { useMemo, useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import JobPostForm, { JobForm, JobStatus } from "@/components/employer/JobPostForm";
import RecruiterSuccess from "@/components/employer/RecruiterSuccess";


export default function EditJobPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id } = use(params);

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [initialData, setInitialData] = useState<JobForm | undefined>(undefined);
    const [showSuccess, setShowSuccess] = useState(false);
    const [msg, setMsg] = useState<{ type: "success" | "error" | ""; text: string }>({

        type: "",
        text: "",
    });

    // Fetch existing job data
    useEffect(() => {
        if (!id) return;

        async function fetchJob() {
            try {
                const data = await apiFetch(`/api/employer/my-postings/${id}`);

                // Map backend data to JobForm type
                setInitialData({
                    title: data.title || "",
                    description: data.description || "",
                    pay: data.hourlyRate ? String(data.hourlyRate) : (data.pay ? String(data.pay) : ""),
                    payType: data.payType || "hour",
                    category: data.category || "Hospitality",
                    locations: data.locations || (data.location ? [data.location] : []),
                    jobDates: data.jobDates || (data.jobDate ? [data.jobDate.split('T')[0]] : []),
                    startTime: data.startTime || "",
                    endTime: data.endTime || "",
                    requirements: data.requirements || data.requiredSkills || [],
                });
            } catch (err: any) {
                setMsg({ type: "error", text: err.message });
            } finally {
                setFetching(false);
            }
        }

        fetchJob();
    }, [id]);

    // [VALIDATION] Mirror backend rules
    function validate(form: JobForm, status: JobStatus): string {
        if (!form.title.trim()) return "Job title is required.";
        // For edit, we assume they want to keep it valid if it was already public
        if (status === "PUBLIC" || status === "PRIVATE") {
            if (!form.description.trim()) return "Job description is required.";
            if (!form.pay || Number(form.pay) <= 0) return "Pay must be a positive number.";
            if (form.locations.length === 0) return "At least one location is required.";
            if (form.jobDates.length === 0) return "At least one job date is required.";
            if (!form.startTime) return "Start time is required.";
            if (!form.endTime) return "End time is required.";
        }
        return "";
    }

    async function handleFormSubmit(form: JobForm, status: JobStatus) {
        setMsg({ type: "", text: "" });

        const err = validate(form, status);
        if (err) {
            setMsg({ type: "error", text: err });
            throw new Error(err);
        }

        setLoading(true);
        try {
            // Map form back to backend expected fields
            const payload = {
                ...form,
                pay: Number(form.pay),
                status
            };

            await apiFetch(`/api/employer/my-postings/${id}`, {
                method: "PUT",
                body: JSON.stringify(payload),
            });

            setMsg({ type: "success", text: "Job updated successfully! ✅" });
            setShowSuccess(true);
        } catch (error: any) {
            if (!msg.text) setMsg({ type: "error", text: error.message || "Failed to update job." });
            throw error;
        } finally {
            setLoading(false);
        }


    }

    if (fetching) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <main className="max-w-5xl mx-auto px-4 py-8">
                <div className="text-xs text-slate-500 mb-3 uppercase tracking-wider font-bold">My postings / Edit Job</div>

                <>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Edit Job Posting</h1>
                    <p className="text-slate-600 mt-1 text-lg">
                        Update the details for your <span className="font-semibold text-slate-800">{initialData?.title}</span> position.
                    </p>

                    <div className="mt-8">
                        <JobPostForm
                            mode="edit"
                            initialData={initialData}
                            loading={loading}
                            onSubmit={handleFormSubmit}
                            onCancel={() => router.push("/employer/create-job/my-postings")}
                        />
                        {msg.text && msg.type === "error" && (
                            <div className="mt-6 px-4 py-3 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm">
                                {msg.text}
                            </div>
                        )}
                    </div>
                </>

                {showSuccess && (
                    <RecruiterSuccess
                        title="Posting Updated"
                        message="You've successfully updated your job posting. The changes are now live. We'll notify you when new applications are received."
                        onReset={() => setShowSuccess(false)}
                    />
                )}
            </main>
        </div>

    );
}
