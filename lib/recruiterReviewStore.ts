// lib/recruiterReviewStore.ts

export type RecruiterReview = {
  id: string;
  recruiterId: string;
  reviewerName: string;
  rating: number; // 1-5
  comment: string;
  createdAt: string; // ISO
};

const defaultReviews: RecruiterReview[] = [
  {
    id: "r1",
    recruiterId: "default",
    reviewerName: "Kasun Perera",
    rating: 5,
    comment: "Fast response and clear job details. Recommended!",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: "r2",
    recruiterId: "default",
    reviewerName: "Nimali Silva",
    rating: 4,
    comment: "Good experience overall. Payment was on time.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
];

declare global {
  // eslint-disable-next-line no-var
  var __recruiterReviews: RecruiterReview[] | undefined;
}

function ensure() {
  if (!globalThis.__recruiterReviews) globalThis.__recruiterReviews = defaultReviews;
  return globalThis.__recruiterReviews;
}

export function getRecruiterReviews(recruiterId = "default") {
  const all = ensure();
  return all
    .filter((r) => r.recruiterId === recruiterId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt)); // ✅ newest first
}

export function addRecruiterReview(input: Omit<RecruiterReview, "id" | "createdAt">) {
  const all = ensure();

  const newReview: RecruiterReview = {
    ...input,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };

  all.push(newReview);
  return getRecruiterReviews(input.recruiterId); // ✅ return newest first
}
