"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ExternalLink, FileText, X } from "lucide-react";
import { resolveUploadUrl } from "@/lib/profile";

type ApplicationRecord = {
  id: string;
  status: string;
  appliedAt: string;
  updatedAt: string;
  matchScore?: number | null;
  relevantSkillsCount?: number | null;
  coverLetter?: string | null;
  submittedCv?: string | null;
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

type PreviewKind = "image" | "pdf" | "file";

const getPreviewKind = (source?: string | null): PreviewKind => {
  const value = String(source || "").toLowerCase();
  if (/\.(jpg|jpeg|png|webp|gif|bmp|svg)$/.test(value)) return "image";
  if (/\.pdf$/.test(value)) return "pdf";
  return "file";
};

function DocumentCard({
  label,
  fileName,
  url,
  kind,
  onOpen,
}: {
  label: string;
  fileName: string;
  url: string;
  kind: PreviewKind;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[#6D83F2] hover:shadow-md"
    >
      <div className="h-36 overflow-hidden bg-[#F8FAFC] p-2">
        {kind === "image" ? (
          <img
            src={url}
            alt={label}
            className="h-full w-full rounded-xl object-cover transition-transform duration-200 group-hover:scale-[1.02]"
          />
        ) : kind === "pdf" ? (
          <div className="h-full w-full overflow-hidden rounded-xl bg-white shadow-[0_1px_2px_rgba(15,23,42,0.08)]">
            <iframe
              src={`${url}#toolbar=0&navpanes=0&scrollbar=0&view=FitH&zoom=page-width`}
              title={label}
              className="pointer-events-none ml-[-10px] mt-[-10px] h-[calc(100%+20px)] w-[calc(100%+20px)] border-0 bg-white"
            />
          </div>
        ) : (
          <div className="flex h-full items-center justify-center rounded-xl bg-white">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#111827] text-white">
              <FileText className="h-6 w-6" />
            </div>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-[#EEF2F7] px-4 py-3">
        <div className="min-w-0">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7C8AA5]">
            {label}
          </div>
          <div className="truncate text-sm font-medium text-[#111827]">{fileName}</div>
        </div>
        <span className="shrink-0 text-sm font-semibold text-[#6D83F2]">Open</span>
      </div>
    </button>
  );
}

export default function ApplicationDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const applicationId = String(params?.id || "");
  const [record, setRecord] = useState<ApplicationRecord | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activePreview, setActivePreview] = useState<{
    title: string;
    fileName: string;
    url: string;
    kind: PreviewKind;
  } | null>(null);
  const [availableDocuments, setAvailableDocuments] = useState<{
    title: string;
    url: string;
    fileName: string;
    kind: PreviewKind;
  }[]>([]);
  const [missingDocuments, setMissingDocuments] = useState<string[]>([]);

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

  const submittedDocuments = useMemo(() => {
    const docs = [
      {
        title: "CV / Resume",
        path: record?.submittedCv || record?.applicant?.cv || null,
      },
      {
        title: "NIC Front",
        path: record?.applicant?.idFront || null,
      },
      ...(record?.applicant?.idBack
        ? [{
            title: "NIC Back",
            path: record.applicant.idBack,
          }]
        : []),
    ];

    return docs
      .map((doc) => {
        const url = resolveUploadUrl(doc.path);
        if (!url || !doc.path) return null;
        return {
          title: doc.title,
          url,
          fileName: doc.path.split(/[\\/]/).pop() || doc.title,
          kind: getPreviewKind(doc.path),
        };
      })
      .filter(Boolean) as { title: string; url: string; fileName: string; kind: PreviewKind }[];
  }, [record]);

  useEffect(() => {
    let cancelled = false;

    const verifyDocuments = async () => {
      if (!submittedDocuments.length) {
        setAvailableDocuments([]);
        setMissingDocuments([]);
        return;
      }

      const checks = await Promise.all(
        submittedDocuments.map(async (doc) => {
          try {
            const response = await fetch(doc.url, { method: "HEAD", cache: "no-store" });
            return { doc, available: response.ok };
          } catch {
            return { doc, available: false };
          }
        })
      );

      if (cancelled) return;

      setAvailableDocuments(checks.filter((item) => item.available).map((item) => item.doc));
      setMissingDocuments(checks.filter((item) => !item.available).map((item) => item.doc.title));
    };

    verifyDocuments();

    return () => {
      cancelled = true;
    };
  }, [submittedDocuments]);

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

          <div className="space-y-6">
            {record && !isLoading && (availableDocuments.length > 0 || missingDocuments.length > 0) && (
              <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm sm:p-8">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-[#111827]">Submitted Documents</h2>
                    <p className="mt-1 text-sm text-[#6B7280]">
                      Preview the CV and identity documents attached to this application.
                    </p>
                  </div>
                </div>

                {missingDocuments.length > 0 && (
                  <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    Some previously uploaded files are missing from storage: {missingDocuments.join(", ")}. Please re-upload them from your profile settings.
                  </div>
                )}

                <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {availableDocuments.map((document) => (
                    <DocumentCard
                      key={`${document.title}-${document.fileName}`}
                      label={document.title}
                      fileName={document.fileName}
                      url={document.url}
                      kind={document.kind}
                      onOpen={() => setActivePreview({
                        title: document.title,
                        fileName: document.fileName,
                        url: document.url,
                        kind: document.kind,
                      })}
                    />
                  ))}
                </div>
              </div>
            )}

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
        </div>
      </section>

      {activePreview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#111827]/70 p-4"
          onClick={() => setActivePreview(null)}
        >
          <div
            className="relative flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-[28px] bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-4 border-b border-[#E5E7EB] px-5 py-4">
              <div className="min-w-0">
                <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#7C8AA5]">
                  {activePreview.title}
                </div>
                <div className="truncate text-base font-semibold text-[#111827]">
                  {activePreview.fileName}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={activePreview.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm font-semibold text-[#374151] hover:bg-[#F9FAFB]"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open in new tab
                </a>
                <button
                  type="button"
                  onClick={() => setActivePreview(null)}
                  className="rounded-xl border border-[#E5E7EB] p-2 text-[#6B7280] hover:bg-[#F9FAFB]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="min-h-0 flex-1 bg-[#F5F8FC] p-4">
              {activePreview.kind === "image" ? (
                <img
                  src={activePreview.url}
                  alt={activePreview.title}
                  className="h-full max-h-[72vh] w-full rounded-2xl object-contain"
                />
              ) : activePreview.kind === "pdf" ? (
                <iframe
                  src={activePreview.url}
                  title={activePreview.title}
                  className="h-[72vh] w-full rounded-2xl border-0 bg-white"
                />
              ) : (
                <div className="flex h-[72vh] flex-col items-center justify-center rounded-2xl bg-white px-6 text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#111827] text-white">
                    <FileText className="h-8 w-8" />
                  </div>
                  <div className="text-lg font-semibold text-[#111827]">
                    This file can’t be previewed inline.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
