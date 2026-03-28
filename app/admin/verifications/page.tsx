"use client";

import React, { useMemo, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import AdminHeader from "@/components/admin/AdminHeader";
import StatusBadge from "@/components/admin/StatusBadge";
import { CheckCircle2, X, Download, ShieldCheck } from "lucide-react";
import { getAdminVerifications, updateVerificationStatus, AdminUser } from "@/lib/admin/api";
import { resolveUploadUrl } from "@/lib/profile";

type QueueStatus = "PENDING" | "APPROVED" | "REJECTED";
type QueuePriority = "High Priority" | "Standard";

type VerificationItem = {
  id: string;
  name: string;
  type: string;
  category: string;
  timeAgo: string;
  status: QueueStatus;
  priority: QueuePriority;
  rawData?: AdminUser;
};

type UserWithVerificationStatus = AdminUser & {
  verificationStatus?: QueueStatus;
};

type StepState = "complete" | "current" | "pending";

function getName(item: AdminUser) {
  const built = `${item.firstName || ""} ${item.lastName || ""}`.trim();
  return item.name || built || item.email;
}

function isImageAsset(path?: string | null) {
  if (!path) return false;
  const value = path.toLowerCase();
  return value.startsWith("data:image/") || /\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?|#|$)/i.test(value);
}

function isPdfAsset(path?: string | null) {
  if (!path) return false;
  return /\.pdf(\?|#|$)/i.test(path);
}

function getVerificationProgress(user?: AdminUser) {
  const hasIdentity = Boolean(user?.idDocument || (user?.idFront && user?.idBack));
  const hasProfessional = Boolean(user?.cv);
  const finalApproved = String(user?.verificationStatus || "").toUpperCase() === "APPROVED";
  const finalRejected = String(user?.verificationStatus || "").toUpperCase() === "REJECTED";
  const hasFinalDecision = finalApproved || finalRejected;

  const completion = [true, hasIdentity, hasProfessional, hasFinalDecision];
  const currentIndex = hasFinalDecision ? -1 : completion.findIndex((value) => !value);

  return [0, 1, 2, 3].map((index): StepState => {
    if (completion[index]) return "complete";
    if (index === currentIndex) return "current";
    return "pending";
  });
}

function getStepCircleClass(state: StepState) {
  if (state === "complete") return "bg-emerald-500 text-white";
  if (state === "current") return "bg-blue-600 text-white";
  return "bg-slate-300 text-slate-600";
}

const tabs: QueueStatus[] = ["PENDING", "APPROVED", "REJECTED"];

export default function AdminVerificationsPage() {
  const [queue, setQueue] = useState<VerificationItem[]>([]);
  const [activeTab, setActiveTab] = useState<QueueStatus>("PENDING");
  const [selectedId, setSelectedId] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedDocumentUrl, setSelectedDocumentUrl] = useState<string>("");

  const loadVerifications = useCallback(async (tab: QueueStatus = "PENDING") => {
    try {
      setLoading(true);
      const res = await getAdminVerifications(tab);
      if (res.success && res.data) {
        setQueue(res.data.map(user => ({
          id: user.id,
          name: getName(user),
          type: "Identity Verification & Background",
          category: "ID Card",
          timeAgo: new Date(user.createdAt).toLocaleDateString(),
          status: (user as UserWithVerificationStatus).verificationStatus || "PENDING",
          priority: "Standard",
          rawData: user
        })));
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadVerifications(activeTab);
  }, [activeTab, loadVerifications]);

  const filteredQueue = useMemo(() => {
    return queue;
  }, [queue]);

  const selectedItem =
    queue.find((item) => item.id === selectedId) || queue[0];

  const selectedUser = selectedItem?.rawData;
  const selectedAvatar = resolveUploadUrl(selectedUser?.avatarUrl || null) || "";
  const idDocuments = useMemo(() => {
    if (!selectedUser) return [] as Array<{ label: string; url: string }>;

    const candidates = [
      { label: "National ID", url: resolveUploadUrl(selectedUser.idDocument || null) || "" },
      { label: "ID Front", url: resolveUploadUrl(selectedUser.idFront || null) || "" },
      { label: "ID Back", url: resolveUploadUrl(selectedUser.idBack || null) || "" },
    ];

    return candidates.filter((item) => Boolean(item.url));
  }, [selectedUser]);

  const cvUrl = resolveUploadUrl(selectedUser?.cv || null) || "";
  const progress = getVerificationProgress(selectedUser);

  useEffect(() => {
    const currentExists = queue.some((item) => item.id === selectedId);
    if (!currentExists && queue.length > 0) {
      setSelectedId(queue[0].id);
    }
    if (queue.length === 0) {
      setSelectedId("");
    }
  }, [queue, selectedId]);

  useEffect(() => {
    setNotes(selectedUser?.verificationNotes || "");
  }, [selectedUser?.id, selectedUser?.verificationNotes]);

  useEffect(() => {
    if (!idDocuments.length) {
      setSelectedDocumentUrl("");
      return;
    }

    const stillExists = idDocuments.some((item) => item.url === selectedDocumentUrl);
    if (!stillExists) {
      setSelectedDocumentUrl(idDocuments[0].url);
    }
  }, [idDocuments, selectedDocumentUrl]);

  const handleApprove = async () => {
    if (!selectedItem) return;
    const res = await updateVerificationStatus(selectedItem.id, "APPROVED");
    if (res.success) {
      loadVerifications(activeTab);
      setSelectedId("");
    }
  };

  const handleReject = async () => {
    if (!selectedItem) return;
    const res = await updateVerificationStatus(selectedItem.id, "REJECTED");
    if (res.success) {
      loadVerifications(activeTab);
      setSelectedId("");
    }
  };

  return (
    <>
      <AdminHeader title="Verification" />

      <div className="bg-slate-100 p-0">
        <div className="grid min-h-[calc(100vh-80px)] grid-cols-1 xl:grid-cols-[320px_1fr]">
          <aside className="border-r border-slate-200 bg-white">
            <div className="border-b border-slate-100 px-6 py-6">
              <div className="grid grid-cols-3 rounded-xl bg-slate-100 p-1">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                      activeTab === tab
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-500"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {loading ? (
                <div className="p-8 text-center text-sm text-slate-500">
                  Loading verifications...
                </div>
              ) : filteredQueue.length === 0 ? (
                <div className="p-8 text-center text-sm text-slate-500">
                  No verifications found in this queue.
                </div>
              ) : filteredQueue.map((item) => {
                const isActive = item.id === selectedItem?.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => setSelectedId(item.id)}
                      className={`relative flex w-full items-start gap-4 px-5 py-5 text-left transition hover:bg-slate-50 ${
                        isActive ? "bg-slate-50" : "bg-white"
                      }`}
                    >
                      {isActive ? (
                        <span className="absolute left-0 top-0 h-full w-1 rounded-r-full bg-blue-600" />
                      ) : null}

                    <div className="mt-0.5 h-11 w-11 shrink-0 rounded-full bg-orange-200 flex items-center justify-center font-bold text-orange-700 text-sm">
                      {item.name.charAt(0)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <p className="font-semibold text-slate-900 truncate">{item.name}</p>
                        <span className="text-xs text-slate-400 shrink-0">{item.timeAgo}</span>
                      </div>

                        <p className="mt-1 text-xs text-slate-500">{item.type}</p>

                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          {item.priority === "High Priority" ? (
                            <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-semibold text-orange-600">
                              High Priority
                            </span>
                          ) : (
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                              Standard
                            </span>
                          )}

                          <span className="text-[10px] font-medium text-slate-400">
                            {item.category}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })
              }
            </div>
          </aside>

          <section className="bg-slate-50">
            {selectedItem ? (
              <>
                <div className="border-b border-slate-200 bg-white px-8 py-6">
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 overflow-hidden rounded-full bg-slate-200">
                        {selectedAvatar ? (
                          <Image
                            src={selectedAvatar}
                            alt={`${selectedItem.name} profile`}
                            width={56}
                            height={56}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-sm font-bold text-slate-600">
                            {selectedItem.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-slate-900">
                          {selectedItem.name}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          Verification request in review
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleReject}
                        className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-white px-5 py-2.5 text-sm font-medium text-rose-500 hover:bg-rose-50"
                      >
                        <X size={16} />
                        Reject
                      </button>

                      <button
                        onClick={handleApprove}
                        className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-100 hover:bg-blue-700"
                      >
                        <CheckCircle2 size={16} />
                        Approve Verification
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-8">
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-2">
                      <ShieldCheck size={16} className="text-blue-600" />
                      <p className="text-sm font-semibold text-slate-900">
                        Verification Progress
                      </p>
                    </div>

                    <div className="mt-6 grid grid-cols-4 gap-4">
                      {[
                        { label: "EMAIL" },
                        { label: "IDENTITY" },
                        { label: "PROFESSIONAL" },
                        { label: "FINAL AUDIT" },
                      ].map((step, index) => (
                        <div key={step.label} className="relative flex flex-col items-center">
                          {index !== 3 ? (
                            <span className="absolute left-1/2 top-4 h-0.5 w-full translate-x-1/2 bg-slate-200" />
                          ) : null}

                          <div
                            className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${getStepCircleClass(progress[index])}`}
                          >
                            {index + 1}
                          </div>
                          <p className={`mt-3 text-[11px] font-semibold tracking-wide ${progress[index] === "pending" ? "text-slate-400" : "text-slate-700"}`}>
                            {step.label}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-slate-900">
                          ID Card / Document
                        </p>
                        {selectedDocumentUrl ? (
                          <a
                            href={selectedDocumentUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 text-xs font-semibold text-blue-600 hover:text-blue-700"
                          >
                            <Download size={14} />
                            Download Original
                          </a>
                        ) : null}
                      </div>

                      {idDocuments.length > 0 ? (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {idDocuments.map((doc) => (
                            <button
                              key={doc.url}
                              onClick={() => setSelectedDocumentUrl(doc.url)}
                              className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${selectedDocumentUrl === doc.url ? "border-blue-200 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}
                            >
                              {doc.label}
                            </button>
                          ))}
                        </div>
                      ) : null}

                      <div className="mt-5 flex h-[260px] items-center justify-center overflow-hidden rounded-2xl bg-slate-100">
                        {selectedDocumentUrl ? (
                          isImageAsset(selectedDocumentUrl) ? (
                            <Image
                              src={selectedDocumentUrl}
                              alt="ID document preview"
                              width={520}
                              height={260}
                              className="h-full w-full object-contain"
                            />
                          ) : isPdfAsset(selectedDocumentUrl) ? (
                            <iframe
                              src={selectedDocumentUrl}
                              title="ID document preview"
                              className="h-full w-full border-0"
                            />
                          ) : (
                            <div className="px-4 text-center text-sm text-slate-500">
                              Preview not available for this file type. Use Download Original.
                            </div>
                          )
                        ) : (
                          <div className="text-sm text-slate-500">No ID document uploaded.</div>
                        )}
                      </div>

                      <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50 p-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-500">Identity Files</span>
                          <span className="font-semibold text-emerald-500">
                            {idDocuments.length > 0 ? `${idDocuments.length} uploaded` : "Missing"}
                          </span>
                        </div>
                        <div className="mt-3 h-2 rounded-full bg-slate-200">
                          <div
                            className={`h-2 rounded-full ${idDocuments.length > 0 ? "bg-emerald-500" : "bg-rose-400"}`}
                            style={{ width: idDocuments.length > 0 ? "100%" : "15%" }}
                          />
                        </div>
                        <p className="mt-3 text-xs text-slate-400">
                          This section reflects uploaded identity records from the user profile.
                        </p>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-slate-900">
                          Profile Photo & CV
                        </p>
                        <StatusBadge
                          status={cvUrl ? "CV AVAILABLE" : "CV MISSING"}
                          type={cvUrl ? "success" : "warning"}
                        />
                      </div>

                      <div className="mt-5 flex h-[260px] items-center justify-center overflow-hidden rounded-2xl bg-slate-100">
                        {selectedAvatar ? (
                          <Image
                            src={selectedAvatar}
                            alt={`${selectedItem.name} profile`}
                            width={520}
                            height={260}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="text-sm text-slate-500">No profile photo uploaded.</div>
                        )}
                      </div>

                      <div className="mt-5 grid grid-cols-2 gap-4">
                        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                            Profile Photo
                          </p>
                          <p className={`mt-2 text-sm font-semibold ${selectedAvatar ? "text-emerald-500" : "text-amber-500"}`}>
                            {selectedAvatar ? "Available" : "Missing"}
                          </p>
                        </div>

                        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                            CV / Resume
                          </p>
                          {cvUrl ? (
                            <a
                              href={cvUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
                            >
                              <Download size={14} />
                              Open CV
                            </a>
                          ) : (
                            <p className="mt-2 text-sm font-semibold text-amber-500">Not uploaded</p>
                          )}
                        </div>
                      </div>

                      {cvUrl ? (
                        <div className="mt-4 h-44 overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
                          {isPdfAsset(cvUrl) ? (
                            <iframe src={cvUrl} title="CV preview" className="h-full w-full border-0" />
                          ) : (
                            <div className="flex h-full items-center justify-center px-4 text-center text-xs text-slate-500">
                              CV preview is supported for PDF files. Click Open CV to view this file.
                            </div>
                          )}
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <p className="text-sm font-semibold text-slate-900">
                      Background Verification Notes
                    </p>

                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add any internal notes about this verification..."
                      className="mt-4 h-32 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:ring-2 focus:ring-blue-100"
                    />

                    <div className="mt-4 flex items-center gap-2">
                      <input id="request-more" type="checkbox" className="h-4 w-4 rounded border-slate-300" />
                      <label htmlFor="request-more" className="text-sm text-slate-500">
                        Request additional documents
                      </label>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-8 text-slate-500">No verification selected.</div>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
