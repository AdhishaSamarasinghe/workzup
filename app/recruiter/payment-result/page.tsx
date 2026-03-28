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
          const message = err instanceof Error ? err.message : "Failed to load payment status";
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

  const backendStatus = payment?.status?.toUpperCase() || "PENDING";
  const displayStatus = error ? "ERROR" : backendStatus;
  
  // Choose styles and icons based on status
  let Icon = null;
  let statusColor = "";
  let bgColor = "";
  let shadowColor = "";
  let headline = "";
  let subheadline = "";

  if (loading) {
     Icon = (
       <div className="w-20 h-20 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
     );
     headline = "Verifying Payment";
     subheadline = "Please wait while we confirm your payment securely...";
     statusColor = "text-blue-500";
  } else if (displayStatus === "COMPLETED" || displayStatus === "SUCCESS") {
    Icon = (
      <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
        <div className="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-green-500/40">
           <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
        </div>
      </div>
    );
    statusColor = "text-green-500";
    bgColor = "bg-green-50";
    shadowColor = "shadow-green-500/20";
    headline = "Payment Successful";
    subheadline = "Thank you! The job has been marked as completed and the worker has been notified.";
  } else if (displayStatus === "FAILED" || displayStatus === "ERROR") {
     Icon = (
      <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-6">
        <div className="w-16 h-16 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-red-500/40">
           <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
        </div>
      </div>
    );
    statusColor = "text-red-500";
    bgColor = "bg-red-50";
    shadowColor = "shadow-red-500/20";
    headline = "Payment Failed";
    subheadline = error || "Unfortunately, your payment could not be processed at this time. Please try again or contact support.";
  } else {
    // PENDING or other
    Icon = (
      <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mb-6">
        <div className="w-16 h-16 bg-yellow-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-yellow-500/40">
           <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
      </div>
    );
    statusColor = "text-yellow-600";
    bgColor = "bg-yellow-50";
    headline = "Payment Pending";
    subheadline = "Your payment is currently processing or awaiting confirmation from PayHere.";
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <section className="w-full max-w-[600px] rounded-[32px] bg-white p-10 md:p-14 shadow-xl border border-gray-100 text-center relative overflow-hidden flex flex-col items-center">
        
        {/* Animated Background Blob */}
        <div className={`absolute top-0 left-0 w-full h-32 ${bgColor} opacity-40 -z-10 blur-xl`}></div>

        {Icon}

        <h1 className="text-3xl font-black text-[#111827] mb-3">{headline}</h1>
        <p className="text-gray-500 mb-8 max-w-[400px] leading-relaxed">
          {subheadline}
        </p>

        <div className="w-full bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-100 text-left">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-200 pb-2">Transaction Details</h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-sm">Amount Paid</span>
              {payment ? (
                <span className="text-xl font-black text-[#111827]">
                  {payment.currency} {Number(payment.amount || 0).toFixed(2)}
                </span>
              ) : (
                <span className="text-gray-400 italic">--</span>
              )}
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-sm">Status</span>
              <span className={`font-bold text-sm px-3 py-1 rounded-full ${bgColor} ${statusColor}`}>
                {displayStatus}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-sm">Transaction ID</span>
              <span className="text-gray-900 font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                {paymentId ? paymentId.split("-")[0] + "..." : "N/A"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full">
          {(displayStatus === "PENDING" || displayStatus === "ERROR") && (
            <button
              onClick={() => router.refresh()}
              className="flex-1 rounded-xl border-2 border-gray-200 bg-white px-6 py-4 text-sm font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all focus:ring-4 focus:ring-gray-100"
            >
              Refresh Status
            </button>
          )}
          <button
            onClick={() => router.push("/employer/create-job/my-postings")}
            className={`flex-1 rounded-xl px-6 py-4 text-sm font-bold text-white shadow-lg hover:-translate-y-0.5 transition-all focus:ring-4 ${
              displayStatus === "COMPLETED" || displayStatus === "SUCCESS"
                ? "bg-green-500 hover:bg-green-600 focus:ring-green-500/30"
                : "bg-blue-600 hover:bg-blue-700 focus:ring-blue-600/30"
            }`}
          >
            Back to My Postings
          </button>
        </div>
      </section>
    </main>
  );
}

function PaymentResultLoadingFallback() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <section className="w-full max-w-[600px] rounded-[32px] bg-white p-10 md:p-14 shadow-xl border border-gray-100 flex flex-col items-center justify-center">
        <div className="w-20 h-20 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mb-8"></div>
        <h1 className="text-2xl font-black text-gray-900 mb-2">Loading Payment...</h1>
        <p className="text-gray-500 text-center">Please wait while we verify your transaction details.</p>
      </section>
    </main>
  );
}

