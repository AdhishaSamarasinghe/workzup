"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ApplicationsPage() {
  const router = useRouter();
  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    const storedId = window.localStorage.getItem("workzup:lastApplicationId");
    if (storedId) {
      router.replace(`/applications/${storedId}`);
      return;
    }
    // Make it asynchronous to avoid cascading render warning in React 19 rules
    Promise.resolve().then(() => setIsChecked(true));
  }, [router]);

  return (
    <div className="min-h-screen bg-[#F5F8FC]">
      <section className="mx-auto w-full max-w-6xl px-4 pb-16 pt-10 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 text-center shadow-sm sm:p-10">
          <h1 className="text-2xl font-semibold text-[#111827]">
            {isChecked ? "Select an application to view" : "Loading application"}
          </h1>
          <p className="mt-2 text-sm text-[#6B7280]">
            {isChecked
              ? "Please return to the confirmation popup and click “View My Applications.”"
              : "Checking your latest application..."}
          </p>
        </div>
      </section>
    </div>
  );
}
