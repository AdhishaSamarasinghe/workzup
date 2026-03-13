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
  const [applicantDetails, setApplicantDetails] = useState({
    fullName: "",
    email: "",
    phone: "",
  });
  const [autofilledFields, setAutofilledFields] = useState<Record<string, boolean>>({});

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null);
  const [cvFileName, setCvFileName] = useState<string | null>(null);
  const [nicFrontFileName, setNicFrontFileName] = useState<string | null>(null);
  const [nicBackFileName, setNicBackFileName] = useState<string | null>(null);
  const [profileDocs, setProfileDocs] = useState({
    cv: false,
    idDocument: false,
    nicFront: false,
    nicBack: false,
  });
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
            const profile = await apiFetch("/api/auth/profile");
            setProfileDocs({
              cv: !!profile.cv,
              idDocument: !!profile.idDocument,
              nicFront: !!profile.idFront,
              nicBack: !!profile.idBack,
            });
            const nextFullName = [profile.firstName, profile.lastName].filter(Boolean).join(" ");
            const nextEmail = profile.email || "";

            const animateAutofill = (field: "fullName" | "email", value: string, startDelay: number) => {
              if (!value) return;

              setTimeout(() => {
                let cursor = 0;
                const timer = window.setInterval(() => {
                  cursor += 1;
                  setApplicantDetails((prev) => {
                    if (prev[field] && prev[field] !== value.slice(0, cursor - 1)) {
                      window.clearInterval(timer);
                      return prev;
                    }

                    return {
                      ...prev,
                      [field]: value.slice(0, cursor),
                    };
                  });

                  if (cursor >= value.length) {
                    window.clearInterval(timer);
                    setAutofilledFields((prev) => ({ ...prev, [field]: true }));
                    window.setTimeout(() => {
                      setAutofilledFields((prev) => ({ ...prev, [field]: false }));
                    }, 900);
                  }
                }, 18);
              }, startDelay);
            };

            setApplicantDetails((prev) => ({
              ...prev,
              phone: prev.phone || "",
            }));

            setApplicantDetails((prev) => {
              if (prev.fullName || prev.email) return prev;
              return { ...prev, fullName: "", email: "" };
            });

            if (!applicantDetails.fullName) animateAutofill("fullName", nextFullName, 120);
            if (!applicantDetails.email) animateAutofill("email", nextEmail, 360);
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

  const hasProfileNic = profileDocs.idDocument || (profileDocs.nicFront && profileDocs.nicBack);

  const openSuccessPopup = () => {
    setShowSuccessPopup(true);
  };

  const handleViewApplications = () => {
    setShowSuccessPopup(false);
    const targetId = applicationId ||
      (typeof window !== "undefined"
        ? window.localStorage.getItem("workzup:lastApplicationId")
        : null);
    router.push(targetId ? `/applications/${targetId}` : "/applications");
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

      if (!hasProfileNic) {
        const idFront = formData.get("idFront");
        const idBack = formData.get("idBack");

        if (!(idFront instanceof File) || idFront.size === 0 || !(idBack instanceof File) || idBack.size === 0) {
          throw new Error("Please upload both the front and back of your NIC.");
        }

        const docsFormData = new FormData();
        docsFormData.append("idFront", idFront);
        docsFormData.append("idBack", idBack);

        await apiFetch("/api/auth/upload-docs", {
          method: "POST",
          body: docsFormData,
        });

        setProfileDocs((prev) => ({
          ...prev,
          nicFront: true,
          nicBack: true,
        }));
      }

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
      setCvFileName(null);
      setNicFrontFileName(null);
      setNicBackFileName(null);
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
                  value={applicantDetails.fullName}
                  onChange={(event) => {
                    const value = event.currentTarget.value;
                    setApplicantDetails((prev) => ({ ...prev, fullName: value }));
                    setAutofilledFields((prev) => ({ ...prev, fullName: false }));
                    clearMissingTextFieldIfFilled("fullName", value);
                  }}
                  className={`w-full rounded-xl border px-4 py-3 text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 transition-all duration-500 ${autofilledFields.fullName ? "bg-[#EEF4FF]" : ""} ${isFieldMissing("fullName")
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
                  value={applicantDetails.email}
                  onChange={(event) => {
                    const value = event.currentTarget.value;
                    setApplicantDetails((prev) => ({ ...prev, email: value }));
                    setAutofilledFields((prev) => ({ ...prev, email: false }));
                    clearMissingTextFieldIfFilled("email", value);
                  }}
                  className={`w-full rounded-xl border px-4 py-3 text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 transition-all duration-500 ${autofilledFields.email ? "bg-[#EEF4FF]" : ""} ${isFieldMissing("email")
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
                  value={applicantDetails.phone}
                  onChange={(event) => {
                    const value = event.currentTarget.value;
                    setApplicantDetails((prev) => ({ ...prev, phone: value }));
                    clearMissingTextFieldIfFilled("phone", value);
                  }}
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
                  CV
                </label>
                {profileDocs.cv ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 p-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      <span className="text-sm font-medium text-emerald-800">
                        CV already available from your profile.
                      </span>
                    </div>
                    <div className="rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-medium text-[#111827]">Optional: upload a job-specific CV</p>
                          <p className="mt-1 text-xs text-[#6B7280]">
                            Only upload another CV if you want to tailor it specifically for this application.
                          </p>
                        </div>
                        {cvFileName && (
                          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#6D83F2]">
                            New file selected
                          </span>
                        )}
                      </div>
                      <label
                        htmlFor="cv"
                        className="mt-4 flex cursor-pointer items-center justify-between rounded-xl border border-dashed border-[#CBD5F5] bg-white px-4 py-3 text-sm text-[#6B7280]"
                      >
                        <span className="truncate mr-4 flex-1">
                          {cvFileName ? cvFileName : "Upload a separate CV for this job (optional)"}
                        </span>
                        <span className="rounded-full bg-[#F8FAFC] px-3 py-1 text-xs font-semibold text-[#6D83F2] whitespace-nowrap">
                          Browse
                        </span>
                      </label>
                    </div>
                  </div>
                ) : (
                  <>
                    <label
                      htmlFor="cv"
                      className={`flex cursor-pointer items-center justify-between rounded-xl border border-dashed px-4 py-3 text-sm ${isFieldMissing("cv")
                          ? "border-red-500 bg-red-50 text-red-700"
                          : "border-[#CBD5F5] bg-[#F8FAFC] text-[#6B7280]"
                        }`}
                    >
                      <span className="truncate mr-4 flex-1">
                        {cvFileName ? cvFileName : "Drag and drop or click to upload"}
                      </span>
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#6D83F2] whitespace-nowrap">
                        Browse
                      </span>
                    </label>
                    {isFieldMissing("cv") && (
                      <p className="text-xs font-medium text-red-600">Please upload your CV.</p>
                    )}
                  </>
                )}
                <label
                  htmlFor="cv"
                  className="sr-only"
                >
                  Upload CV
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
              </div>

              <div className="space-y-2 mt-4">
                <label
                  htmlFor="nic"
                  className={`text-sm font-medium ${isFieldMissing("nic") ? "text-red-600" : "text-[#111827]"}`}
                >
                  ID / NIC
                </label>
                {hasProfileNic ? (
                  <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      <span className="text-sm font-medium text-emerald-800">
                        ID / NIC already verified from your profile.
                      </span>
                    </div>
                  </div>
                ) : (
                  <>
                    {((profileDocs.nicFront && !profileDocs.nicBack) || (!profileDocs.nicFront && profileDocs.nicBack)) && !profileDocs.idDocument && !nicFrontFileName && !nicBackFileName && (
                      <div className="flex items-center gap-2 mb-2 rounded-xl border border-amber-100 bg-amber-50 p-3">
                        <span className="text-sm font-medium text-amber-800">
                          Partial NIC found on your profile. Please complete it from your profile page before applying.
                        </span>
                      </div>
                    )}
                    <div className="space-y-4 rounded-xl border border-dashed border-[#CBD5F5] bg-[#F8FAFC] px-4 py-4">
                      <img
                        src="/nic-guide.jpg"
                        alt="NIC upload guide"
                        className="w-full rounded-lg border border-[#E5E7EB] object-cover bg-white"
                      />
                      <p className="text-sm text-[#6B7280]">
                        Please upload high-quality images of both the <strong>front</strong> and <strong>back</strong> of your National Identity Card (NIC). Ensure all text is clearly legible.
                      </p>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-2">
                          <label
                            htmlFor="idFront"
                            className={`block text-sm font-medium ${isFieldMissing("idFront") ? "text-red-600" : "text-[#111827]"}`}
                          >
                            NIC Front
                          </label>
                          <label
                            htmlFor="idFront"
                            className={`flex cursor-pointer items-center justify-between rounded-xl border border-dashed px-4 py-3 text-sm ${isFieldMissing("idFront")
                              ? "border-red-500 bg-red-50 text-red-700"
                              : "border-[#CBD5F5] bg-white text-[#6B7280]"
                              }`}
                          >
                            <span className="truncate mr-4 flex-1">
                              {nicFrontFileName || "Upload front side"}
                            </span>
                            <span className="rounded-full bg-[#F8FAFC] px-3 py-1 text-xs font-semibold text-[#6D83F2] whitespace-nowrap">
                              Browse
                            </span>
                          </label>
                          {isFieldMissing("idFront") && (
                            <p className="text-xs font-medium text-red-600">Please upload the front of your NIC.</p>
                          )}
                          <input
                            id="idFront"
                            name="idFront"
                            type="file"
                            accept=".jpg,.jpeg,.png,.pdf"
                            className="hidden"
                            required={!hasProfileNic}
                            onChange={(event) => {
                              const file = event.currentTarget.files?.[0];
                              setNicFrontFileName(file ? file.name : null);
                              if (file) clearMissingField("idFront");
                            }}
                          />
                        </div>

                        <div className="space-y-2">
                          <label
                            htmlFor="idBack"
                            className={`block text-sm font-medium ${isFieldMissing("idBack") ? "text-red-600" : "text-[#111827]"}`}
                          >
                            NIC Back
                          </label>
                          <label
                            htmlFor="idBack"
                            className={`flex cursor-pointer items-center justify-between rounded-xl border border-dashed px-4 py-3 text-sm ${isFieldMissing("idBack")
                              ? "border-red-500 bg-red-50 text-red-700"
                              : "border-[#CBD5F5] bg-white text-[#6B7280]"
                              }`}
                          >
                            <span className="truncate mr-4 flex-1">
                              {nicBackFileName || "Upload back side"}
                            </span>
                            <span className="rounded-full bg-[#F8FAFC] px-3 py-1 text-xs font-semibold text-[#6D83F2] whitespace-nowrap">
                              Browse
                            </span>
                          </label>
                          {isFieldMissing("idBack") && (
                            <p className="text-xs font-medium text-red-600">Please upload the back of your NIC.</p>
                          )}
                          <input
                            id="idBack"
                            name="idBack"
                            type="file"
                            accept=".jpg,.jpeg,.png,.pdf"
                            className="hidden"
                            required={!hasProfileNic}
                            onChange={(event) => {
                              const file = event.currentTarget.files?.[0];
                              setNicBackFileName(file ? file.name : null);
                              if (file) clearMissingField("idBack");
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </>
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
