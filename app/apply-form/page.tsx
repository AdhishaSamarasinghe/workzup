/* eslint-disable */
"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ApplicationSuccessPopup from "@/components/ApplicationSuccessPopup";
import { apiFetch } from "@/lib/api";
import { BrowseJob, formatPay, formatDateLabel } from "@/lib/browse";
import { CheckCircle2 } from "lucide-react";

function ApplicationFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const jobId = searchParams.get("jobId");

  const [job, setJob] = useState<BrowseJob | null>(null);
  const [jobLoading, setJobLoading] = useState(true);
  const [jobError, setJobError] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null);
  const [cvFileName, setCvFileName] = useState<string | null>(null);
  const [nicFileName, setNicFileName] = useState<string | null>(null);
  const [profileDocs, setProfileDocs] = useState({ cv: false, nicFront: false, nicBack: false });
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [missingFieldMap, setMissingFieldMap] = useState<Record<string, string>>({});
  const [showValidationPopup, setShowValidationPopup] = useState(false);

  useEffect(() => {
    if (!jobId) {
      setJobLoading(false);
      setJobError("No job specified. Please go back and select a job to apply to.");
      return;
    }

    const fetchData = async () => {
      try {
        setJobLoading(true);
        const data = await apiFetch(`/api/jobs/${jobId}`);
        setJob(data.job || data);

        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        if (token) {
          try {
            const profileRes = await fetch("/api/auth/profile", { headers: { Authorization: `Bearer ${token}` } });
            if (profileRes.ok) {
              const profile = await profileRes.json();
              setProfileDocs({ 
                cv: !!profile.cv, 
                nicFront: !!profile.idFront, 
                nicBack: !!profile.idBack 
              });
            }
          } catch (e) {
             console.error("Could not fetch profile", e);
          }
        }

      } catch (err: any) {
        console.error("Failed to load job details:", err);
        setJobError("Failed to load job details. The job may have been removed.");
      } finally {
        setJobLoading(false);
      }
    };

    fetchData();
  }, [jobId]);

  const getFieldLabel = (
    form: HTMLFormElement,
    field: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
  ) => {
    if (field.id) {
      const fieldLabel = form.querySelector(`label[for="${field.id}"]`);
      if (fieldLabel?.textContent) {
        return fieldLabel.textContent.trim();
      }
    }

    return field.name || "This field";
  };

  const validateRequiredFields = (form: HTMLFormElement) => {
    const requiredFields = Array.from(
      form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>("[required]")
    );

    const nextMissingFieldMap: Record<string, string> = {};

    for (const field of requiredFields) {
      const isFileInput = field instanceof HTMLInputElement && field.type === "file";
      const isMissing = isFileInput
        ? !field.files || field.files.length === 0
        : !field.value.trim();

      if (isMissing) {
        const fieldLabel = getFieldLabel(form, field);
        const fieldKey = field.id || field.name;
        if (fieldKey) {
          nextMissingFieldMap[fieldKey] = fieldLabel;
        }
      }
    }

    if (Object.keys(nextMissingFieldMap).length > 0) {
      const firstMissingField = requiredFields.find((field) => {
        const isFileInput = field instanceof HTMLInputElement && field.type === "file";
        return isFileInput ? !field.files || field.files.length === 0 : !field.value.trim();
      });

      if (firstMissingField) {
        const isFileInput =
          firstMissingField instanceof HTMLInputElement && firstMissingField.type === "file";
        if (isFileInput && firstMissingField.id) {
          const clickableLabel = form.querySelector(
            `label[for="${firstMissingField.id}"]`
          ) as HTMLElement | null;
          clickableLabel?.scrollIntoView({ behavior: "smooth", block: "center" });
          clickableLabel?.focus();
        } else {
          firstMissingField.focus();
        }
      }

      setMissingFieldMap(nextMissingFieldMap);
      setShowValidationPopup(true);
      return false;
    }

    setMissingFieldMap({});
    setShowValidationPopup(false);

    return true;
  };

  const isFieldMissing = (fieldId: string) => Boolean(missingFieldMap[fieldId]);

  const clearMissingField = (fieldId: string) => {
    setMissingFieldMap((prev) => {
      if (!prev[fieldId]) {
        return prev;
      }

      const updated = { ...prev };
      delete updated[fieldId];
      return updated;
    });
  };

  const clearMissingTextFieldIfFilled = (fieldId: string, value: string) => {
    if (value.trim()) {
      clearMissingField(fieldId);
    }
  };

  const openSuccessPopup = () => {
    setShowSuccessPopup(true);
  };

  const handleViewApplications = () => {
    setShowSuccessPopup(false);
    const targetId = applicationId ||
      (typeof window !== "undefined"
        ? window.localStorage.getItem("workzup:lastApplicationId")
        : null);
    router.push(targetId ? `/applications/${targetId}` : "/jobseeker/applications");
  };

  const handleBrowseJobs = () => {
    setShowSuccessPopup(false);
    router.push("/jobseeker/browse");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const form = event.currentTarget;
    const isValid = validateRequiredFields(form);
    if (!isValid) {
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);
    setIsSuccess(null);
    setMissingFieldMap({});
    setShowValidationPopup(false);

    try {
      const formData = new FormData(form);

      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

      const response = await fetch("/api/apply-form", {
        method: "POST",
        headers: {
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: formData,
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.message || "Submission failed.");
      }

      setIsSuccess(true);
      setStatusMessage(null);
      if (payload?.id) {
        setApplicationId(payload.id);
        if (typeof window !== "undefined") {
          window.localStorage.setItem("workzup:lastApplicationId", payload.id);
        }
      }
      openSuccessPopup();
      form.reset();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Something went wrong.";
      setIsSuccess(false);
      setStatusMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (jobLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-slate-500 font-medium text-lg">Loading application form...</div>
      </div>
    );
  }

  if (jobError || !job) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-sm">
          <h2 className="text-xl font-semibold text-slate-800 mb-2">Job Not Found</h2>
          <p className="text-slate-500 mb-6">{jobError}</p>
          <button 
            onClick={() => router.push("/jobseeker/browse")}
            className="inline-flex items-center justify-center rounded-xl bg-[#6D83F2] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#5B73F1]"
          >
            Back to Browse
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F8FAFC] min-h-screen">
      <section className="mx-auto w-full max-w-6xl px-4 pb-16 pt-24 sm:pt-28 md:px-6 lg:px-8">
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#6B7280]">
                Job Apply
              </p>
              <h1 className="mt-2 text-3xl font-semibold text-[#111827] sm:text-4xl">
                {job.title}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-[#6B7280]">
                <span className="font-medium text-[#111827]">{job.companyName}</span>
                <span className="h-1 w-1 rounded-full bg-[#CBD5F5]" />
                <span>{job.location}</span>
                <span className="h-1 w-1 rounded-full bg-[#CBD5F5]" />
                <span>{job.derivedCategory}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 text-sm text-[#6B7280]">
              <div className="rounded-full border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-2">
                Pay Rate: <span className="font-semibold text-[#111827]">{formatPay(job.pay, job.payType)}</span>
              </div>
              <div className="rounded-full border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-2">
                Posted: <span className="font-semibold text-[#111827]">{formatDateLabel(job.date)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-6">
            <section className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-xl font-semibold text-[#111827]">Job Description</h2>
              <div className="mt-3 text-sm leading-6 text-[#4B5563] whitespace-pre-line">
                {job.description}
              </div>
            </section>
          </div>

          <section className="h-fit rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-xl font-semibold text-[#111827]">Apply for this role</h2>
            <p className="mt-2 text-sm text-[#6B7280]">
              Fill out the application form and upload your CV. We will review your details and get back to
              you soon.
            </p>

            <form
              className="mt-6 space-y-5"
              onSubmit={handleSubmit}
              encType="multipart/form-data"
              noValidate
            >
              <input type="hidden" name="jobId" value={jobId || ""} />
              
              <div className="space-y-2">
                <label
                  htmlFor="fullName"
                  className={`text-sm font-medium ${isFieldMissing("fullName") ? "text-red-600" : "text-[#111827]"
                    }`}
                >
                  Full Name
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  required
                  onInput={(event) =>
                    clearMissingTextFieldIfFilled("fullName", event.currentTarget.value)
                  }
                  className={`w-full rounded-xl border px-4 py-3 text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 ${isFieldMissing("fullName")
                      ? "border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-200"
                      : "border-[#E5E7EB] bg-white focus:border-[#6D83F2] focus:ring-[#6D83F2]/30"
                    }`}
                />
                {isFieldMissing("fullName") && (
                  <p className="text-xs font-medium text-red-600">Please fill this field.</p>
                )}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className={`text-sm font-medium ${isFieldMissing("email") ? "text-red-600" : "text-[#111827]"}`}
                >
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@email.com"
                  required
                  onInput={(event) =>
                    clearMissingTextFieldIfFilled("email", event.currentTarget.value)
                  }
                  className={`w-full rounded-xl border px-4 py-3 text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 ${isFieldMissing("email")
                      ? "border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-200"
                      : "border-[#E5E7EB] bg-white focus:border-[#6D83F2] focus:ring-[#6D83F2]/30"
                    }`}
                />
                {isFieldMissing("email") && (
                  <p className="text-xs font-medium text-red-600">Please fill this field.</p>
                )}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="phone"
                  className={`text-sm font-medium ${isFieldMissing("phone") ? "text-red-600" : "text-[#111827]"}`}
                >
                  Phone Number
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="(+94) 123-456-789"
                  required
                  onInput={(event) =>
                    clearMissingTextFieldIfFilled("phone", event.currentTarget.value)
                  }
                  className={`w-full rounded-xl border px-4 py-3 text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 ${isFieldMissing("phone")
                      ? "border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-200"
                      : "border-[#E5E7EB] bg-white focus:border-[#6D83F2] focus:ring-[#6D83F2]/30"
                    }`}
                />
                {isFieldMissing("phone") && (
                  <p className="text-xs font-medium text-red-600">Please fill this field.</p>
                )}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="cv"
                  className={`text-sm font-medium ${isFieldMissing("cv") ? "text-red-600" : "text-[#111827]"}`}
                >
                  Upload CV
                </label>
                {/* Profile CV Badge */}
                {profileDocs.cv && !cvFileName && (
                    <div className="flex items-center gap-2 mb-2 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        <span className="text-sm font-medium text-emerald-800">CV attached from your profile.</span>
                    </div>
                )}
                <label
                  htmlFor="cv"
                  className={`flex cursor-pointer items-center justify-between rounded-xl border border-dashed px-4 py-3 text-sm ${isFieldMissing("cv")
                      ? "border-red-500 bg-red-50 text-red-700"
                      : "border-[#CBD5F5] bg-[#F8FAFC] text-[#6B7280]"
                    }`}
                >
                  <span className="truncate mr-4 flex-1">
                    {cvFileName ? cvFileName : (profileDocs.cv ? "Select a new file to override profile CV" : "Drag and drop or click to upload")}
                  </span>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#6D83F2] whitespace-nowrap">
                    Browse
                  </span>
                </label>
                <input
                  id="cv"
                  name="cv"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  required={!profileDocs.cv}
                  onChange={(event) => {
                    const file = event.currentTarget.files?.[0];
                    setCvFileName(file ? file.name : null);
                    if (file) {
                      clearMissingField("cv");
                    }
                  }}
                />
                {isFieldMissing("cv") && (
                  <p className="text-xs font-medium text-red-600">Please upload your CV.</p>
                )}
              </div>

              <div className="space-y-2 mt-4">
                <label
                  htmlFor="nic"
                  className={`text-sm font-medium ${isFieldMissing("nic") ? "text-red-600" : "text-[#111827]"}`}
                >
                  Upload NIC
                </label>
                {/* Profile ID Badge - Show only if both front and back are present */}
                {profileDocs.nicFront && profileDocs.nicBack && !nicFileName && (
                    <div className="flex items-center gap-2 mb-2 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        <span className="text-sm font-medium text-emerald-800">NIC (Front & Back) attached from your profile.</span>
                    </div>
                )}
                {/* Partial ID Badge */}
                {((profileDocs.nicFront && !profileDocs.nicBack) || (!profileDocs.nicFront && profileDocs.nicBack)) && !nicFileName && (
                    <div className="flex items-center gap-2 mb-2 p-3 bg-amber-50 rounded-xl border border-amber-100">
                        <span className="text-sm font-medium text-amber-800">Partial NIC on profile. Please upload a full scan or visit profile to update.</span>
                    </div>
                )}
                <label
                  htmlFor="nic"
                  className={`flex cursor-pointer flex-col gap-3 rounded-xl border border-dashed px-4 py-4 text-sm ${isFieldMissing("nic")
                      ? "border-red-500 bg-red-50 text-red-700"
                      : "border-[#CBD5F5] bg-[#F8FAFC] text-[#6B7280]"
                    }`}
                >
                  <img
                    src="/nic-guide.jpg"
                    alt="NIC upload guide"
                    className="w-full rounded-lg border border-[#E5E7EB] object-cover bg-white"
                  />
                  <span>
                    {nicFileName ? (
                      <span className="font-semibold">{nicFileName}</span>
                    ) : (
                      <>
                        {profileDocs.nicFront && profileDocs.nicBack ? "Select a new file to override profile ID" : (
                            <>
                                Please upload high-quality images of both the <strong>front</strong> and
                                <strong> back</strong> of your National Identity Card (NIC). Ensure all text
                                is clearly legible.
                            </>
                        )}
                      </>
                    )}
                  </span>
                  <span className="self-start rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#6D83F2]">
                    Browse
                  </span>
                </label>
                <input
                  id="nic"
                  name="nic"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                  required={!(profileDocs.nicFront && profileDocs.nicBack)}
                  onChange={(event) => {
                    const file = event.currentTarget.files?.[0];
                    setNicFileName(file ? file.name : null);
                    if (file) {
                      clearMissingField("nic");
                    }
                  }}
                />
                {isFieldMissing("nic") && (
                  <p className="text-xs font-medium text-red-600">Please upload your NIC.</p>
                )}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="coverLetter"
                  className={`text-sm font-medium ${isFieldMissing("coverLetter") ? "text-red-600" : "text-[#111827]"
                    }`}
                >
                  Cover Letter
                </label>
                <textarea
                  id="coverLetter"
                  name="coverLetter"
                  rows={5}
                  placeholder="Write a short cover letter..."
                  required
                  onInput={(event) =>
                    clearMissingTextFieldIfFilled("coverLetter", event.currentTarget.value)
                  }
                  className={`w-full resize-none rounded-xl border px-4 py-3 text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 ${isFieldMissing("coverLetter")
                      ? "border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-200"
                      : "border-[#E5E7EB] bg-white focus:border-[#6D83F2] focus:ring-[#6D83F2]/30"
                    }`}
                />
                {isFieldMissing("coverLetter") && (
                  <p className="text-xs font-medium text-red-600">Please fill this field.</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl bg-[#6D83F2] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#5B73F1] disabled:cursor-not-allowed disabled:bg-[#9AA9F7]"
              >
                {isSubmitting ? "Submitting..." : "Submit Application"}
              </button>

              {statusMessage && isSuccess === false && (
                <p className="text-sm font-medium text-red-600">{statusMessage}</p>
              )}
            </form>
          </section>
        </div>
      </section>

      <ApplicationSuccessPopup
        isOpen={showSuccessPopup}
        onViewApplications={handleViewApplications}
        onBrowseJobs={handleBrowseJobs}
      />

      {showValidationPopup && Object.keys(missingFieldMap).length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl sm:p-7"
            role="dialog"
            aria-modal="true"
            aria-labelledby="validation-popup-title"
          >
            <h3 id="validation-popup-title" className="text-lg font-semibold text-[#111827] sm:text-xl">
              Please complete required fields
            </h3>
            <p className="mt-3 text-sm text-[#4B5563] sm:text-base">
              Your application could not be submitted because some required details are missing.
            </p>
            <ul className="mt-3 list-inside list-disc space-y-1.5 text-sm text-[#111827] sm:text-base">
              {Object.entries(missingFieldMap).map(([fieldId, fieldLabel]) => (
                <li key={fieldId}>{fieldLabel}</li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => setShowValidationPopup(false)}
              className="mt-5 w-full rounded-xl bg-[#6D83F2] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#5B73F1] sm:text-base"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ApplyFormPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-slate-500 font-medium text-lg">Loading...</div>
      </div>
    }>
      <ApplicationFormContent />
    </Suspense>
  );
}
