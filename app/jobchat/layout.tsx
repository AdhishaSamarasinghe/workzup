import React from "react";
import JobChatHeader from "@/components/jobchat/Header";

export default function JobChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Page-specific header */}
      <JobChatHeader />

      {/* Main content */}
      <main className="flex-1 flex flex-col">{children}</main>
    </div>
  );
}
