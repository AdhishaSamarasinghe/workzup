"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiFetch } from "@/lib/api";

type PaymentState = {
  id: string;
  status: string;
  amount: number;
  currency: string;
  jobId: string;
};

export default function RecruiterPaymentResultPage() {
  return (
    <Suspense fallback={<PaymentResultLoadingFallback />}>
      <RecruiterPaymentResultContent />
    </Suspense>
  );
}

function RecruiterPaymentResultContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paymentId = searchParams.get("paymentId");
  const status = (searchParams.get("status") || "pending").toLowerCase();

  const [loading, setLoading] = useState(Boolean(paymentId));
  const [payment, setPayment] = useState<PaymentState | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchStatus = async () => {
      if (!paymentId) {
        setLoading(false);
        return;
      }

      try {
        const data = await apiFetch(`/api/payhere/payment/${paymentId}`);
        if (isMounted) {
          setPayment(data);
        }
      } catch (err: unknown) {
        if (isMounted) {
          const message =
            err instanceof Error ? err.message : "Failed to load payment status";
          setError(message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchStatus();
    return () => {
      isMounted = false;
    };
  }, [paymentId]);

  const statusText = payment?.status || status.toUpperCase();

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <section className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Payment Result</h1>
        <p className="mt-2 text-sm text-gray-600">
          Your PayHere checkout has returned. Final status is verified from the backend webhook.
        </p>

        <div className="mt-6 space-y-2 text-sm">
          <p><span className="font-semibold">Requested status:</span> {status.toUpperCase()}</p>
          <p><span className="font-semibold">Payment ID:</span> {paymentId || "N/A"}</p>
          <p><span className="font-semibold">Backend status:</span> {loading ? "Loading..." : statusText}</p>
          {payment && (
            <p>
              <span className="font-semibold">Amount:</span> {payment.currency} {Number(payment.amount || 0).toFixed(2)}
            </p>
          )}
        </div>

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        <div className="mt-6 flex gap-3">
          <button
            onClick={() => router.push("/employer/create-job/my-postings")}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Back to My Postings
          </button>
          <button
            onClick={() => router.refresh()}
            className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-100"
          >
            Refresh Status
          </button>
        </div>
      </section>
    </main>
  );
}

function PaymentResultLoadingFallback() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <section className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Payment Result</h1>
        <p className="mt-2 text-sm text-gray-600">Loading payment status...</p>
      </section>
    </main>
  );
}
