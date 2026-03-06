"use client";

import PostingUpdatedPopup from "@/components/PostingUpdatedPopup";

export default function PostingUpdatedPreviewPage() {
  return (
    <main className="min-h-screen bg-[#f7fafc]">
      <PostingUpdatedPopup
        isOpen={true}
        onViewMyJobPosts={() => {}}
        onViewMyProfile={() => {}}
      />
    </main>
  );
}
