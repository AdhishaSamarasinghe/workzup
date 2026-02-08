"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddReviewPage() {
  const router = useRouter();
  const [reviewerName, setReviewerName] = useState("");
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/recruiter-reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recruiterId: "default", reviewerName, comment, rating }),
      });

      const json = await res.json();
      if (!json.ok) throw new Error(json.message || "Failed");

      router.push("/recruiterprofile");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg py-8">
      <div className="mx-auto max-w-xl px-4">
        <h1 className="text-2xl font-bold text-[#1F2937] mb-4">Add Review (Test)</h1>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="rounded-2xl bg-card p-6 shadow-sm space-y-4">
          <input
            className="w-full rounded-lg border border-[#E5E7EB] px-4 py-2.5 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
            placeholder="Your name"
            value={reviewerName}
            onChange={(e) => setReviewerName(e.target.value)}
          />
          <textarea
            className="w-full rounded-lg border border-[#E5E7EB] px-4 py-2.5 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
            placeholder="Write your review..."
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <input
            type="number"
            min={1}
            max={5}
            className="w-full rounded-lg border border-[#E5E7EB] px-4 py-2.5 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
          />
          <button
            onClick={submit}
            disabled={saving}
            className="rounded-lg bg-accent px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent/90 disabled:opacity-60"
          >
            {saving ? "Posting..." : "Post Review"}
          </button>
        </div>
      </div>
    </div>
  );
}
