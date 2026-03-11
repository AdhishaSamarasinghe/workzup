"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

type ApplicationRecord = {
  id: string;
  status: string;
  appliedAt: string;
  updatedAt: string;
  matchScore?: number | null;
  relevantSkillsCount?: number | null;
  job?: {
    id: string;
    title: string;
    description?: string | null;
    category?: string | null;
    locations?: string[] | null;
    pay?: number | null;
    payType?: string | null;
    company?: {
      name?: string | null;
      industry?: string | null;
    } | null;
  } | null;
  applicant?: {
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
    phone?: string | null;
    homeTown?: string | null;
    cv?: string | null;
    idDocument?: string | null;
    idFront?: string | null;
    idBack?: string | null;
  } | null;
};

const formatStatus = (status?: string | null) => {
  if (!status) return "";
  return status
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

const formatDate = (value?: string | null) => {
  if (!value) return "Recently";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatPay = (pay?: number | null, payType?: string | null) => {
  if (typeof pay !== "number") return null;
  return `$${pay}/${payType || "hour"}`;
};

export default function ApplicationDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const applicationId = String(params?.id || "");
  const [record, setRecord] = useState<ApplicationRecord | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!applicationId) {
      setError("Missing application id.");
      setIsLoading(false);
      return;
    }

    const fetchRecord = async () => {
      try {
        setError(null);
        setIsLoading(true);
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        const response = await fetch(`/api/applications/${applicationId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          cache: "no-store",
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(payload?.message || `Request failed (Status: ${response.status})`);
        }
        setRecord(payload.application as ApplicationRecord);

        if (typeof window !== "undefined") {
          window.localStorage.setItem("workzup:lastApplicationId", applicationId);
        }
      } catch (fetchError) {
        const message =
          fetchError instanceof Error ? fetchError.message : "Unable to load application.";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecord();
  }, [applicationId]);

  const applicantName = useMemo(() => {
    const firstName = record?.applicant?.firstName?.trim() || "";
    const lastName = record?.applicant?.lastName?.trim() || "";
    return [firstName, lastName].filter(Boolean).join(" ");
  }, [record]);

  return (
    <div className="min-h-screen bg-[#F5F8FC]">
      <section className="mx-auto w-full max-w-6xl px-4 pb-16 pt-10 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link href="/applications" className="text-sm font-medium text-[#6D83F2] hover:underline">
            Back to My Applications
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
          <div className="space-y-6">
            <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
              <div className="flex flex-col items-center text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#EEF2FF]">
                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    className="h-7 w-7 text-[#6D83F2]"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 3" />
                    <circle cx="12" cy="12" r="9" />
                  </svg>
                </div>
                <h1 className="mt-4 text-3xl font-semibold text-[#111827]">
                  {formatStatus(record?.status)}
                </h1>
                <p className="mt-2 text-sm text-[#6B7280]">
                  Applied on {formatDate(record?.appliedAt)}
                </p>
              </div>
            </div>

            {record?.job && (
              <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6B7280]">
                  Job
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-[#111827]">{record.job.title}</h2>
                <div className="mt-3 space-y-2 text-sm text-[#6B7280]">
                  {record.job.company?.name ? <div>{record.job.company.name}</div> : null}
                  {record.job.category ? <div>{record.job.category}</div> : null}
                  {record.job.locations?.[0] ? <div>{record.job.locations[0]}</div> : null}
                  {formatPay(record.job.pay, record.job.payType) ? (
                    <div>{formatPay(record.job.pay, record.job.payType)}</div>
                  ) : null}
                </div>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-lg font-semibold text-[#111827]">Application Details</h2>

            {isLoading && (
              <p className="mt-4 text-sm text-[#6B7280]">Loading application...</p>
            )}

            {error && !isLoading && (
              <div className="mt-4 space-y-3">
                <p className="text-sm font-medium text-red-600">{error}</p>
                <button
                  type="button"
                  onClick={() => router.push("/applications")}
                  className="rounded-xl bg-[#6D83F2] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#5B73F1]"
                >
                  Back to applications
                </button>
              </div>
            )}

            {record && !isLoading && (
              <>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {applicantName ? (
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
                        Applicant
                      </label>
                      <div className="mt-2 rounded-2xl bg-[#F3F4F6] px-4 py-3 text-sm text-[#111827]">
                        {applicantName}
                      </div>
                    </div>
                  ) : null}
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
                      Status
                    </label>
                    <div className="mt-2 rounded-2xl bg-[#F3F4F6] px-4 py-3 text-sm text-[#111827]">
                      {formatStatus(record.status)}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
                      Applied Date
                    </label>
                    <div className="mt-2 rounded-2xl bg-[#F3F4F6] px-4 py-3 text-sm text-[#111827]">
                      {formatDate(record.appliedAt)}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
                      Last Updated
                    </label>
                    <div className="mt-2 rounded-2xl bg-[#F3F4F6] px-4 py-3 text-sm text-[#111827]">
                      {formatDate(record.updatedAt)}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
                      Match Score
                    </label>
                    <div className="mt-2 rounded-2xl bg-[#F3F4F6] px-4 py-3 text-sm text-[#111827]">
                      {typeof record.matchScore === "number" ? `${record.matchScore}%` : ""}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
                      Relevant Skills
                    </label>
                    <div className="mt-2 rounded-2xl bg-[#F3F4F6] px-4 py-3 text-sm text-[#111827]">
                      {typeof record.relevantSkillsCount === "number"
                        ? record.relevantSkillsCount
                        : ""}
                    </div>
                  </div>
                </div>

                {record.job?.description ? (
                  <div className="mt-8">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
                      Job Description
                    </p>
                    <div className="mt-3 rounded-2xl bg-[#F3F4F6] px-4 py-4 text-sm leading-6 text-[#111827] whitespace-pre-line">
                      {record.job.description}
                    </div>
                  </div>
                ) : null}
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
