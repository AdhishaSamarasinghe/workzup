"use client";

import Header from "@/components/Header";
import { useMemo, useState } from "react";

type Status = "DRAFT" | "PUBLISHED";

type JobForm = {
  title: string;
  description: string;
  pay: string;
  payType: "hour" | "day";
  category: string;
  location: string;
  jobDate: string;
};

export default function CreateJobPage() {
  const API_BASE = useMemo(
    () => process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000",
    []
  );

  const [form, setForm] = useState<JobForm>({
    title: "",
    description: "",
    pay: "",
    payType: "hour",
    category: "Hospitality",
    location: "",
    jobDate: "",
  });

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error" | ""; text: string }>({
    type: "",
    text: "",
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  }

  function validate(): string {
    if (!form.title.trim()) return "Job title is required.";
    if (!form.description.trim()) return "Job description is required.";
    if (!form.pay || Number(form.pay) <= 0) return "Pay must be a positive number.";
    if (!form.location.trim()) return "Location is required.";
    if (!form.jobDate) return "Job date is required.";
    return "";
  }

  async function submit(status: Status) {
    setMsg({ type: "", text: "" });

    const err = validate();
    if (err) return setMsg({ type: "error", text: err });

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/jobs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, status }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setMsg({ type: "error", text: data?.message || "Something went wrong." });
        return;
      }

      setMsg({
        type: "success",
        text: status === "DRAFT" ? "Saved as draft ✅" : "Job posted ✅",
      });

      if (status === "PUBLISHED") {
        setForm({
          title: "",
          description: "",
          pay: "",
          payType: "hour",
          category: "Hospitality",
          location: "",
          jobDate: "",
        });
      }
    } catch {
      setMsg({ type: "error", text: "Backend not reachable. Is it running on :5000?" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
    

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="text-xs text-slate-500 mb-3">My postings / Create new job</div>

        <h1 className="text-3xl font-extrabold text-slate-900">Create a New Job Posting</h1>
        <p className="text-slate-600 mt-1">
          Fill out the details below to find the right person for your one-day job
        </p>

        <section className="bg-white border border-slate-200 rounded-2xl shadow-sm mt-6 p-6">
          <label className="block text-sm font-semibold text-slate-800 mb-2">Job title</label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="e.g. Event Staff for Charity Gala"
            className="w-full h-11 px-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-200"
          />

          <label className="block text-sm font-semibold text-slate-800 mt-5 mb-2">
            Job description
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Describe responsibilities, requirements, and important details..."
            className="w-full min-h-[120px] px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-200 resize-y"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">Pay</label>
              <div className="flex gap-2">
                <input
                  name="pay"
                  value={form.pay}
                  onChange={handleChange}
                  placeholder="Rs.25.00"
                  inputMode="numeric"
                  className="w-full h-11 px-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-200"
                />
                <select
                  name="payType"
                  value={form.payType}
                  onChange={handleChange}
                  className="h-11 px-3 border border-slate-300 rounded-xl bg-slate-50"
                >
                  <option value="hour">/ hour</option>
                  <option value="day">/ day</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">
                Job Category
              </label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full h-11 px-3 border border-slate-300 rounded-xl bg-white"
              >
                <option>Hospitality</option>
                <option>Retail</option>
                <option>Event Staff</option>
                <option>Delivery</option>
                <option>Cleaning</option>
                <option>Admin</option>
                <option>Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">Location</label>
              <input
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="e.g. San Francisco, CA"
                className="w-full h-11 px-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">Job Date</label>
              <input
                type="date"
                name="jobDate"
                value={form.jobDate}
                onChange={handleChange}
                className="w-full h-11 px-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
          </div>

          {msg.text ? (
            <div
              className={`mt-5 px-4 py-3 rounded-xl border text-sm ${
                msg.type === "error"
                  ? "bg-red-50 border-red-200 text-red-700"
                  : "bg-green-50 border-green-200 text-green-700"
              }`}
            >
              {msg.text}
            </div>
          ) : null}

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => submit("DRAFT")}
              disabled={loading}
              className="h-10 px-4 rounded-xl border border-slate-300 bg-white font-semibold text-slate-800 disabled:opacity-60"
            >
              {loading ? "Saving..." : "Save as Draft"}
            </button>

            <button
              onClick={() => submit("PUBLISHED")}
              disabled={loading}
              className="h-10 px-4 rounded-xl bg-blue-600 text-white font-semibold disabled:opacity-60"
            >
              {loading ? "Posting..." : "Post a job"}
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
