"use client";

type ApplicationSuccessPopupProps = {
  isOpen: boolean;
  onViewApplications: () => void;
  onBrowseJobs: () => void;
};

export default function ApplicationSuccessPopup({
  isOpen,
  onViewApplications,
  onBrowseJobs,
}: ApplicationSuccessPopupProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="application-success-title"
    >
      <div className="popup-fade-in w-full max-w-2xl rounded-[32px] bg-white px-6 py-10 text-center shadow-2xl sm:px-10">
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
          id="application-success-title"
          className="mt-6 text-3xl font-semibold text-[#111827] sm:text-4xl"
        >
          Application submitted successfully!
        </h2>
        <p className="mt-4 text-base leading-7 text-[#4B5563] sm:text-lg">
          Thanks for applying. We have received your application and will notify you
          once the employer reviews it.
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={onViewApplications}
            className="rounded-2xl bg-[#EEF0F4] px-8 py-4 text-base font-semibold text-[#111827] shadow-sm transition hover:bg-[#E2E6EE]"
          >
            View My Applications
          </button>
          <button
            type="button"
            onClick={onBrowseJobs}
            className="rounded-2xl bg-[#6D83F2] px-8 py-4 text-base font-semibold text-white shadow-sm transition hover:bg-[#5B73F1]"
          >
            Browse More Jobs
          </button>
        </div>
      </div>
    </div>
  );
}
