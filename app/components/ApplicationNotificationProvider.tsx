"use client";

import React, { useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { getCurrentMessagingUser } from "@/lib/messaging/api";

type ApplicationRow = {
  id: string;
  applicantId: string;
  status: string;
  [key: string]: any;
};

export function ApplicationNotificationProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const activeToastIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    let mounted = true;

    const initRealtime = async () => {
      const user = await getCurrentMessagingUser();
      if (!user || !mounted) return;

      // Ask for browser notification permission
      if (typeof window !== "undefined" && "Notification" in window) {
        if (Notification.permission === "default") {
          Notification.requestPermission();
        }
      }

      const supabase = getSupabaseBrowserClient();
      if (!supabase || !mounted) return;

      const handleIncoming = (newRecord: ApplicationRow, oldRecord?: ApplicationRow) => {
        // Guard check to ensure message is for this user
        if (newRecord.applicantId !== user.id) return;

        // Only notify if status changed specifically to CASH_PENDING
        if (newRecord.status === "CASH_PENDING" && oldRecord?.status !== "CASH_PENDING") {
          // Avoid duplicate toasts for the same application
          if (activeToastIds.current.has(newRecord.id)) return;
          activeToastIds.current.add(newRecord.id);

          // Play sound
          try {
            const audio = new Audio("/notification.mp3");
            audio.play().catch(() => {});
          } catch (err) {
            // Ignore audio errors
          }

          // Show Professional React Hot Toast
          toast.custom((t) => (
            <div
              className={`${
                t.visible ? "animate-enter" : "animate-leave"
              } max-w-md w-full bg-white shadow-lg rounded-xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 cursor-pointer transform transition-all hover:scale-[1.02]`}
              onClick={() => {
                toast.dismiss(t.id);
                activeToastIds.current.delete(newRecord.id);
                // Force a hard refresh if they are on /applications, or navigate if not
                if (window.location.pathname === "/applications") {
                  window.location.reload();
                } else {
                  router.push("/applications");
                }
              }}
            >
              <div className="flex-1 w-0 p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 pt-0.5">
                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-semibold text-gray-900">
                      Payment Confirmation Required
                    </p>
                    <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                      A recruiter has recorded a cash payment. Please confirm receipt.
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex border-l border-gray-200">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toast.dismiss(t.id);
                    activeToastIds.current.delete(newRecord.id);
                  }}
                  className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-gray-600 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          ), { duration: 10000, position: "bottom-right" });

          // Show Browser Notification if hidden
          if (
            typeof document !== "undefined" &&
            document.hidden &&
            "Notification" in window &&
            Notification.permission === "granted"
          ) {
            const browserNotification = new Notification("Payment Confirmation Required", {
              body: "A recruiter has recorded a cash payment. Please confirm receipt.",
              icon: "/logo_icon.png" // Fallback icon
            });
            
            browserNotification.onclick = () => {
              window.focus();
              if (window.location.pathname === "/applications") {
                window.location.reload();
              } else {
                router.push("/applications");
              }
              browserNotification.close();
            };
          }
        }
      };

      const channel = supabase
        .channel("global-application-notifications")
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "Application",
            filter: `applicantId=eq.${user.id}`,
          },
          (payload) => {
            const newRecord = payload.new as ApplicationRow;
            const oldRecord = payload.old as ApplicationRow;
            handleIncoming(newRecord, oldRecord);
          }
        )
        .on("broadcast", { event: "new_application_update" }, ({ payload }) => {
            console.log("Global Application Notification Broadcast Received:", payload);
            const newRecord = payload.new as ApplicationRow;
            const oldRecord = payload.old as ApplicationRow;
            handleIncoming(newRecord, oldRecord);
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    const cleanupPromise = initRealtime();

    return () => {
      mounted = false;
      cleanupPromise.then((cleanup) => {
        if (cleanup) cleanup();
      });
    };
  }, [router]);

  return <>{children}</>;
}
