/* eslint-disable */
"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";



interface CompletionSummary {
    jobId: string;
    workerId: string;
    jobTitle: string;
    workerName: string;
    completionDate: string;
    hoursWorked: number;
    finalPayment: number;
}

type PayHerePayload = {
    action: string;
    [key: string]: string | number | boolean | null | undefined;
};

function submitPayHereForm(payload: PayHerePayload) {
    if (typeof document === "undefined") return;
    if (!payload?.action) {
        throw new Error("PayHere action URL is missing");
    }

    const form = document.createElement("form");
    form.method = "POST";
    form.action = String(payload.action);

    Object.entries(payload).forEach(([key, value]) => {
        if (key === "action" || value == null) return;
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = String(value);
        form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
}

// [UI] Content Component that uses useSearchParams
function CompleteJobContent() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();

    // Use 'id' to match the existing folder structure [id]
    const jobId = params.id as string;
    const workerId = searchParams.get("workerId");

    // [STATE]
    const [summary, setSummary] = useState<CompletionSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    // [API] Fetch Summary
    useEffect(() => {
        if (!jobId || !workerId) {
            setError("Missing jobId or workerId");
            setLoading(false);
            return;
        }

        const fetchSummary = async () => {
            try {
                const data = await apiFetch(`/api/recruiter/jobs/${jobId}/completion-summary?workerId=${workerId}`);
                setSummary(data);
            } catch (err: any) {
                setError(err.message || "Something went wrong");
            } finally {
                setLoading(false);
            }
        };

        fetchSummary();
    }, [jobId, workerId]);

    // [ACTIONS] Confirm Completion
    const handleConfirm = async () => {
        if (!summary) return;
        setSubmitting(true);
        try {
            const data = await apiFetch(`/api/recruiter/jobs/${jobId}/complete`, {
                method: "POST",
                body: JSON.stringify({
                    workerId: summary.workerId,
                    completionDate: summary.completionDate,
                    hoursWorked: summary.hoursWorked,
                    finalPayment: summary.finalPayment,
                }),
            });

            if (!data?.payhere?.action) {
                throw new Error("PayHere checkout payload missing from server response");
            }

            setSuccess(true);
            submitPayHereForm(data.payhere as PayHerePayload);
        } catch (err: any) {
            alert(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    // [UI] Formatting
    const formatDate = (dateStr: string) => {
        const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateStr).toLocaleDateString('en-US', options);
    };

    // [UI] Loading & Error
    if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    if (error) return <div className="flex items-center justify-center min-h-screen text-red-500">{error}</div>;
    if (!summary) return null;

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-[520px] relative overflow-hidden">
                <button
                    onClick={() => router.back()}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="p-8 md:p-10 flex flex-col items-center">
                    <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-6">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                    </div>

                    <h1 className="text-[32px] font-black text-[#111827] mb-2 leading-tight">Confirm Job Completion</h1>
                    <p className="text-gray-500 text-center mb-8">
                        Please review details below to firm this job is complete.
                    </p>

                    <div className="w-full border-t border-gray-100 mb-6"></div>

                    <div className="w-full space-y-4 mb-8">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500">Job Title</span>
                            <span className="text-[#111827] font-black">{summary.jobTitle}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500">Worker</span>
                            <span className="text-[#111827] font-black italic">{summary.workerName}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500">Date of Completion</span>
                            <span className="text-[#111827] font-black">{formatDate(summary.completionDate)}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500">Hours Worked</span>
                            <span className="text-[#111827] font-black">{summary.hoursWorked} hours</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500">Final payment</span>
                            <span className="text-[#111827] font-black text-lg">LKR {summary.finalPayment.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="w-full border-t border-gray-100 mb-6"></div>

                    <p className="text-xs text-gray-400 text-center mb-8 px-4">
                        By confirming, you agree the job was completed as expected and authorize the final payment.
                    </p>

                    <div className="w-full space-y-3">
                        <button
                            onClick={handleConfirm}
                            disabled={submitting || success}
                            className={`w-full py-3.5 rounded-xl font-semibold transition-all ${success
                                ? "bg-green-500 text-white"
                                : "bg-[#6D83F2] hover:bg-[#5B73F1] text-white shadow-md shadow-[#6D83F2]/30"
                                } disabled:opacity-70`}
                        >
                            {success ? "Completed successfully" : submitting ? "Processing..." : "Confirm Completion"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// [MAIN] Page Component with Suspense
export default function CompleteJobPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
            <CompleteJobContent />
        </Suspense>
    );
}
