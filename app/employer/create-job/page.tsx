/* eslint-disable */
"use client";

/**
 * create-job/page.tsx — Create Job Posting form (employer-facing)
 */

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import JobPostForm, { JobForm, JobStatus } from "@/components/employer/JobPostForm";
import RecruiterSuccess from "@/components/employer/RecruiterSuccess";


export default function CreateJobPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastJobTitle, setLastJobTitle] = useState("");
  const [msg, setMsg] = useState<{ type: "success" | "error" | ""; text: string }>({
    type: "",
    text: "",
  });

  // [VALIDATION] Mirror backend rules
  function validate(form: JobForm, status: JobStatus): string {
    if (!form.title.trim()) return "Job title is required.";
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
      const data = await apiFetch(`/api/jobs`, {
        method: "POST",
        body: JSON.stringify({ ...form, status }),
      });

      setLastJobTitle(form.title);

      setMsg({
        type: "success",
        text: status === "DRAFT" ? "Saved as draft ✅" : "Job posted ✅",
      });

      if (status === "PUBLIC" || status === "PRIVATE") {
        setShowSuccess(true);
      }
    } catch (error: any) {
      const rawMessage = String(error?.message || "");
      const isRoleError =
        rawMessage.includes("Forbidden: Requires one of") ||
        rawMessage.includes("cannot sign in here") ||
        rawMessage.includes("No role assigned");

      if (isRoleError) {
        setMsg({
          type: "error",
          text: "Please sign in with a recruiter/employer account to post jobs.",
        });
      } else if (!msg.text) {
        setMsg({ type: "error", text: rawMessage || "Backend not reachable." });
      }
      throw error;
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-5xl mx-auto px-4 py-8">
        {!showSuccess && (
          <>
            <div className="text-xs text-slate-500 mb-3 uppercase tracking-wider font-bold">My postings / Post a new job</div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Post a new job</h1>
            <p className="text-slate-600 mt-1 text-lg">
              Fill out the details below to find the right person for your one-day job
            </p>
          </>
        )}

        {showSuccess ? (
          <RecruiterSuccess
            title="Job Posted!"
            message="The employer has been notified. We will send you an update on your application status soon."
            onReset={() => { setShowSuccess(false); setMsg({ type: "", text: "" }); }}
            showPostAnother={true}
          />
        ) : (

          <div className="mt-8 shadow-2xl shadow-slate-200/50 rounded-3xl overflow-hidden">
            <JobPostForm
              mode="create"
              loading={loading}
              onSubmit={handleFormSubmit}
              onCancel={() => router.push("/employer/create-job/my-postings")}
            />
          </div>
        )}
      </main>
    </div>
  );
}
