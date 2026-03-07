"use client";

import JobPostedMessagePage from "@/components/JobPostedMessagePage";

export default function JobPostedMessagePreviewPage() {
  return (
    <main className="min-h-screen bg-[#f7fafc]">
      <JobPostedMessagePage
        isOpen={true}
        onViewMyApplications={() => {}}
        onBrowseJobs={() => {}}
      />
    </main>
  );
}