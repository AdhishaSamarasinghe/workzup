"use client";

type PostingUpdatedPopupProps = {
  isOpen: boolean;
  onViewMyJobPosts: () => void;
  onViewMyProfile: () => void;
};

export default function PostingUpdatedPopup({
  isOpen,
  onViewMyJobPosts,
  onViewMyProfile,
}: PostingUpdatedPopupProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="posting-updated-title"
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
          id="posting-updated-title"
          className="mt-6 text-3xl font-bold text-[#111827] sm:text-4xl"
        >
          Posting Updated
        </h2>

        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[#111827] sm:text-lg sm:leading-8">
          You’ve successfully updated your job posting.
          <br />
          The changes are now live. We’ll notify you when new applications are received.
        </p>

        <div className="mx-auto mt-10 flex max-w-2xl flex-col gap-4 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={onViewMyJobPosts}
            className="w-full rounded-2xl bg-[#EEF0F4] px-8 py-4 text-base font-semibold text-[#111827] transition hover:bg-[#E2E6EE] sm:w-1/2 sm:text-lg"
          >
            View My Job Posts
          </button>
          <button
            type="button"
            onClick={onViewMyProfile}
            className="w-full rounded-2xl bg-[#6D83F2] px-8 py-4 text-base font-semibold text-white transition hover:bg-[#5B73F1] sm:w-1/2 sm:text-lg"
          >
            View My Profile
          </button>
        </div>
      </div>
    </div>
  );
}