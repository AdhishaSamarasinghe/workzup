"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

type ApplicationListItem = {
  id: string;
  status: string;
  appliedAt: string;
  matchScore?: number | null;
  relevantSkillsCount?: number | null;
  job: {
    id: string;
    employerId?: string | null;
    title: string;
    category?: string | null;
    locations?: string[] | null;
    company?: {
      name?: string | null;
    } | null;
  };
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

export default function ApplicationsPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<ApplicationListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [messageActionError, setMessageActionError] = useState<string | null>(null);
  const [messagingApplicationId, setMessagingApplicationId] = useState<string | null>(null);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        setError(null);
        const payload = await apiFetch("/api/applications/my-applications");
        const records = Array.isArray(payload?.applications) ? payload.applications : [];
        setApplications(records);

        if (typeof window !== "undefined") {
          const storedId = window.localStorage.getItem("workzup:lastApplicationId");
          const matchingStored = storedId
            ? records.find((item: ApplicationListItem) => item.id === storedId)
            : null;
          if (!matchingStored && records[0]?.id) {
            window.localStorage.setItem("workzup:lastApplicationId", records[0].id);
          }
        }
      } catch (fetchError) {
        const message =
          fetchError instanceof Error ? fetchError.message : "Unable to load applications.";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const handleMessageRecruiter = async (application: ApplicationListItem) => {
    setMessageActionError(null);

    try {
      setMessagingApplicationId(application.id);
      const created = await apiFetch(`/api/applications/${application.id}/conversation`, {
        method: "POST",
      });
      let conversationId = created?.conversationId;

      if (!conversationId) {
        const payload = await apiFetch("/conversations");
        const conversations = Array.isArray(payload?.data) ? payload.data : [];
        const targetConversation = conversations.find(
          (item: { applicationId?: string }) => item?.applicationId === application.id,
        );
        conversationId = targetConversation?.id;
      }

      if (!conversationId) {
        throw new Error("Chat is not ready for this application yet. Please try again in a moment.");
      }

      router.push(`/jobseeker/messages?conversationId=${encodeURIComponent(conversationId)}`);
    } catch (messageError) {
      const message =
        messageError instanceof Error ? messageError.message : "Unable to open recruiter chat.";
      setMessageActionError(message);
    } finally {
      setMessagingApplicationId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F8FC]">
      <section className="mx-auto w-full max-w-6xl px-4 pb-16 pt-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-[#111827]">My Applications</h1>
            <p className="mt-2 text-sm text-[#6B7280]">
              Track the jobs you have already applied for.
            </p>
          </div>
        </div>

        {loading && (
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 text-sm text-[#6B7280] shadow-sm">
            Loading your applications...
          </div>
        )}

        {error && !loading && (
          <div className="rounded-2xl border border-red-100 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-red-600">{error}</p>
          </div>
        )}

        {messageActionError && !loading && !error && (
          <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
            <p className="text-sm font-medium text-amber-800">{messageActionError}</p>
          </div>
        )}

        {!loading && !error && applications.length === 0 && (
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-8 text-center shadow-sm">
            <h2 className="text-2xl font-semibold text-[#111827]">No applications yet</h2>
            <p className="mt-2 text-sm text-[#6B7280]">
              Apply for a job first and it will appear here automatically.
            </p>
            <button
              type="button"
              onClick={() => router.push("/jobseeker/browse")}
              className="mt-6 rounded-xl bg-[#6D83F2] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#5B73F1]"
            >
              Browse Jobs
            </button>
          </div>
        )}

        {!loading && !error && applications.length > 0 && (
          <div className="grid gap-4">
            {applications.map((application) => (
              <article
                key={application.id}
                className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-[#CBD5F5] hover:shadow-md"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6B7280]">
                      {formatStatus(application.status)}
                    </p>
                    <Link href={`/applications/${application.id}`} className="mt-2 inline-block text-xl font-semibold text-[#111827] hover:text-[#4B63D3]">
                      {application.job?.title || "Untitled Job"}
                    </Link>
                    <div className="mt-2 flex flex-wrap gap-3 text-sm text-[#6B7280]">
                      {application.job?.company?.name ? <span>{application.job.company.name}</span> : null}
                      {application.job?.category ? <span>{application.job.category}</span> : null}
                      {application.job?.locations?.[0] ? <span>{application.job.locations[0]}</span> : null}
                    </div>
                  </div>
                  <div className="text-sm text-[#6B7280] sm:text-right">
                    <div>Applied {formatDate(application.appliedAt)}</div>
                    {typeof application.matchScore === "number" ? (
                      <div className="mt-1 font-medium text-[#111827]">
                        Match score: {application.matchScore}%
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => handleMessageRecruiter(application)}
                    disabled={messagingApplicationId === application.id}
                    className="rounded-xl bg-[#6D83F2] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#5B73F1] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {messagingApplicationId === application.id ? "Opening chat..." : "Message Recruiter"}
                  </button>
                  <Link
                    href={`/applications/${application.id}`}
                    className="rounded-xl border border-[#D1D5DB] px-4 py-2 text-sm font-semibold text-[#111827] transition hover:bg-[#F3F4F6]"
                  >
                    View Application
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
