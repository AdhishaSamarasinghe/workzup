"use client";

type JobPostedMessagePageProps = {
  isOpen: boolean;
  onViewMyApplications: () => void;
  onBrowseJobs: () => void;
};

export default function JobPostedMessagePage({
  isOpen,
  onViewMyApplications,
  onBrowseJobs,
}: JobPostedMessagePageProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="job-posted-message-title"
    >
      <div className="popup-fade-in w-full max-w-3xl rounded-[28px] bg-white px-6 py-10 text-center shadow-2xl sm:px-10">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#97E8CF]">
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="h-10 w-10 text-white"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h2
          id="job-posted-message-title"
          className="mt-6 text-3xl font-bold text-[#111827] sm:text-5xl"
        >
          Job Posted!
        </h2>

        <div className="mx-auto mt-6 max-w-2xl text-[#111827]">
          <p className="text-base leading-7 sm:text-lg sm:leading-8">
            The employer has been notified.
          </p>
          <p className="text-base font-bold leading-7 sm:text-lg sm:leading-8">
            We will send you an update on your application status soon.
          </p>
        </div>

        <div className="mx-auto mt-10 flex max-w-2xl flex-col gap-4 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={onViewMyApplications}
            className="w-full rounded-2xl bg-[#EEF0F4] px-8 py-4 text-base font-semibold text-[#111827] transition hover:bg-[#E2E6EE] sm:w-1/2 sm:text-lg"
          >
            View My Applications
          </button>
          <button
            type="button"
            onClick={onBrowseJobs}
            className="w-full rounded-2xl bg-[#6D83F2] px-8 py-4 text-base font-semibold text-white transition hover:bg-[#5B73F1] sm:w-1/2 sm:text-lg"
          >
            Browse More Jobs
          </button>
        </div>
      </div>
    </div>
  );
}