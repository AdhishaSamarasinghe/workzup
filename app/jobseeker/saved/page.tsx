"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { BrowseJob, formatDateLabel, formatPay } from "@/lib/browse";
import { Bookmark, BriefcaseBusiness, Building2, MapPin, Trash2 } from "lucide-react";

type SavedJobRecord = {
  id: string;
  savedAt: string;
  job: BrowseJob;
};

export default function SavedJobsPage() {
  const router = useRouter();
  const [savedJobs, setSavedJobs] = useState<SavedJobRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [removingJobId, setRemovingJobId] = useState<string | null>(null);

  useEffect(() => {
    const hasToken = typeof window !== "undefined" && !!localStorage.getItem("token");
    if (!hasToken) {
      router.push("/auth/login?redirectTo=/jobseeker/saved");
      return;
    }

    const fetchSavedJobs = async () => {
      try {
        setIsLoading(true);
        const data = await apiFetch("/api/saved-jobs");
        setSavedJobs(Array.isArray(data.savedJobs) ? data.savedJobs : []);
        setError("");
      } catch (err: unknown) {
        console.error("Failed to load saved jobs:", err);
        setError(err instanceof Error ? err.message : "Failed to load saved jobs.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSavedJobs();
  }, [router]);

  const handleRemove = async (jobId: string) => {
    try {
      setRemovingJobId(jobId);
      await apiFetch(`/api/saved-jobs/${jobId}`, { method: "DELETE" });
      setSavedJobs((current) => current.filter((entry) => entry.job.id !== jobId));
    } catch (err) {
      console.error("Failed to remove saved job:", err);
    } finally {
      setRemovingJobId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FB] text-[#111827]">
      <main className="mx-auto w-full max-w-[1600px] px-4 pb-16 pt-24 sm:px-6 sm:pt-28 lg:px-8">
        <section className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#6B7280]">
                Saved Jobs
              </p>
              <h1 className="mt-2 text-3xl font-semibold text-[#111827] sm:text-4xl">
                Jobs you want to revisit
              </h1>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#EEF2FF] px-4 py-2 text-sm font-semibold text-[#4F46E5]">
              <Bookmark className="h-4 w-4" />
              {savedJobs.length} saved
            </div>
          </div>
        </section>

        {isLoading ? (
          <section className="mt-8 rounded-2xl border border-[#E5E7EB] bg-white p-8 text-center text-slate-500 shadow-sm">
            Loading saved jobs...
          </section>
        ) : error ? (
          <section className="mt-8 rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm">
            <p className="text-sm font-medium text-red-600">{error}</p>
          </section>
        ) : savedJobs.length === 0 ? (
          <section className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
              <BriefcaseBusiness className="h-8 w-8" />
            </div>
            <h2 className="mt-5 text-xl font-semibold text-slate-900">No saved jobs yet</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500">
              Save jobs from the job details page and they will appear here.
            </p>
            <Link
              href="/jobseeker/browse"
              className="mt-6 inline-flex items-center rounded-full bg-[#6b8bff] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Browse Jobs
            </Link>
          </section>
        ) : (
          <section className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {savedJobs.map(({ id, savedAt, job }) => (
              <article key={id} className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-semibold text-[#111827]">{job.title}</h2>
                    <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
                      <Building2 className="h-4 w-4" />
                      <span>{job.companyName}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemove(job.id)}
                    disabled={removingJobId === job.id}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#E5E7EB] text-slate-500 transition hover:bg-slate-50 disabled:opacity-60"
                    aria-label={`Remove ${job.title} from saved jobs`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <p className="mt-4 text-sm leading-6 text-slate-600">{job.description}</p>

                <div className="mt-6 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
                  <div className="rounded-xl bg-[#F8FAFC] px-4 py-3">
                    <div className="inline-flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {job.location}
                    </div>
                  </div>
                  <div className="rounded-xl bg-[#F8FAFC] px-4 py-3">{formatPay(job.pay, job.payType)}</div>
                  <div className="rounded-xl bg-[#F8FAFC] px-4 py-3">{formatDateLabel(job.date)}</div>
                  <div className="rounded-xl bg-[#F8FAFC] px-4 py-3">
                    Saved {formatDateLabel(savedAt)}
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <Link
                    href={`/jobseeker/jobs/${job.id}`}
                    className="inline-flex flex-1 items-center justify-center rounded-xl border border-[#E5E7EB] px-4 py-3 text-sm font-semibold text-[#111827] transition hover:bg-slate-50"
                  >
                    View Details
                  </Link>
                  <Link
                    href={`/apply-form?jobId=${job.id}`}
                    className="inline-flex flex-1 items-center justify-center rounded-xl bg-[#6b8bff] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#5a78e8]"
                  >
                    Apply Now
                  </Link>
                </div>
              </article>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}
