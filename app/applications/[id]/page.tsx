"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type ApplicationRecord = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  coverLetter: string;
  resumeFile: string;
  nicFile: string;
  createdAt: string;
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
      if (typeof window !== "undefined") {
        const storedId = window.localStorage.getItem("workzup:lastApplicationId");
        if (storedId) {
          router.replace(`/applications/${storedId}`);
          return;
        }
      }
      setError("Missing application id.");
      setIsLoading(false);
      return;
    }

    setError(null);
    setIsLoading(true);

    const fetchRecord = async () => {
      try {
        const response = await fetch(`/api/applications/${applicationId}`);
        const payload = await response.json();

        if (!response.ok) {
          if (response.status === 404 && typeof window !== "undefined") {
            window.localStorage.removeItem("workzup:lastApplicationId");
          }
          throw new Error(payload?.message || "Unable to load application.");
        }

        setRecord(payload.record as ApplicationRecord);
      } catch (fetchError) {
        const message =
          fetchError instanceof Error
            ? fetchError.message
            : "Unable to load application.";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecord();
  }, [applicationId, router]);

  const resumeUrl = useMemo(() => {
    if (!record?.resumeFile) {
      return null;
    }
    return `/api/uploads/resumes/${record.resumeFile}`;
  }, [record]);

  const nicUrl = useMemo(() => {
    if (!record?.nicFile) {
      return null;
    }
    return `/api/uploads/nic/${record.nicFile}`;
  }, [record]);

  const isPdf = (fileName: string) => fileName.toLowerCase().endsWith(".pdf");
  const isImage = (fileName: string) =>
    [".png", ".jpg", ".jpeg"].some((ext) => fileName.toLowerCase().endsWith(ext));

  return (
    <div className="min-h-screen bg-[#F5F8FC]">
      <section className="mx-auto w-full max-w-6xl px-4 pb-16 pt-10 sm:px-6 lg:px-8">
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
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 7v5l3 3"
                    />
                    <circle cx="12" cy="12" r="9" />
                  </svg>
                </div>
                <h1 className="mt-4 text-3xl font-semibold text-[#111827]">
                  Pending
                </h1>
                <p className="mt-2 text-sm text-[#6B7280]">
                  We will connect you very soon
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-lg font-semibold text-[#111827]">Your Details</h2>

            {isLoading && (
              <p className="mt-4 text-sm text-[#6B7280]">Loading application...</p>
            )}

            {error && !isLoading && (
              <div className="mt-4 space-y-3">
                <p className="text-sm font-medium text-red-600">{error}</p>
                <button
                  type="button"
                  onClick={() => router.push("/apply-form")}
                  className="rounded-xl bg-[#6D83F2] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#5B73F1]"
                >
                  Submit a new application
                </button>
              </div>
            )}

            {record && !isLoading && (
              <>
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
                      Full Name
                    </label>
                    <div className="mt-2 rounded-full bg-[#F3F4F6] px-4 py-2 text-sm text-[#111827]">
                      {record.fullName}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
                      Email Address
                    </label>
                    <div className="mt-2 rounded-full bg-[#F3F4F6] px-4 py-2 text-sm text-[#111827]">
                      {record.email}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
                      Phone Number
                    </label>
                    <div className="mt-2 rounded-full bg-[#F3F4F6] px-4 py-2 text-sm text-[#111827]">
                      {record.phone}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
                      Cover Letter
                    </label>
                    <div className="mt-2 rounded-2xl bg-[#F3F4F6] px-4 py-3 text-sm text-[#111827]">
                      {record.coverLetter}
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
                    CV and NIC
                  </p>
                  <div className="mt-4 space-y-4">
                    <div className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-4">
                      <div className="flex items-center justify-between text-sm font-medium text-[#111827]">
                        <span>CV</span>
                        {record.resumeFile ? (
                          <a
                            href={resumeUrl || "#"}
                            className="text-[#6D83F2] hover:underline"
                            target="_blank"
                            rel="noreferrer"
                          >
                            {record.resumeFile}
                          </a>
                        ) : (
                          <span className="text-[#6B7280]">Not available</span>
                        )}
                      </div>
                      {record.resumeFile && resumeUrl && isImage(record.resumeFile) && (
                        <img
                          src={resumeUrl}
                          alt="Resume preview"
                          className="mt-4 w-full rounded-xl border border-[#E5E7EB]"
                        />
                      )}
                      {record.resumeFile && resumeUrl && isPdf(record.resumeFile) && (
                        <iframe
                          title="Resume preview"
                          src={resumeUrl}
                          className="mt-4 h-64 w-full rounded-xl border border-[#E5E7EB]"
                        />
                      )}
                      {record.resumeFile && resumeUrl && !isPdf(record.resumeFile) && !isImage(record.resumeFile) && (
                        <div className="mt-4 rounded-xl border border-dashed border-[#CBD5F5] bg-white p-4 text-sm text-[#6B7280]">
                          Preview not available. Use the filename link to download.
                        </div>
                      )}
                    </div>

                    <div className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-4">
                      <div className="flex items-center justify-between text-sm font-medium text-[#111827]">
                        <span>NIC</span>
                        {record.nicFile ? (
                          <a
                            href={nicUrl || "#"}
                            className="text-[#6D83F2] hover:underline"
                            target="_blank"
                            rel="noreferrer"
                          >
                            {record.nicFile}
                          </a>
                        ) : (
                          <span className="text-[#6B7280]">Not available</span>
                        )}
                      </div>
                      {record.nicFile && nicUrl && isImage(record.nicFile) && (
                        <img
                          src={nicUrl}
                          alt="NIC preview"
                          className="mt-4 w-full rounded-xl border border-[#E5E7EB]"
                        />
                      )}
                      {record.nicFile && nicUrl && isPdf(record.nicFile) && (
                        <iframe
                          title="NIC preview"
                          src={nicUrl}
                          className="mt-4 h-64 w-full rounded-xl border border-[#E5E7EB]"
                        />
                      )}
                      {record.nicFile && nicUrl && !isPdf(record.nicFile) && !isImage(record.nicFile) && (
                        <div className="mt-4 rounded-xl border border-dashed border-[#CBD5F5] bg-white p-4 text-sm text-[#6B7280]">
                          Preview not available. Use the filename link to download.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
