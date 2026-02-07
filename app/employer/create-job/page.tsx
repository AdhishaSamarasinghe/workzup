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
  locations: string[];
  jobDates: string[];
  startTime: string;
  endTime: string;
  requirements: string[];
};

export default function CreateJobPage() {
  const API_BASE = useMemo(
    () => process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000",
    []
  );

  const SL_CITIES = [
    "Colombo", "Dehiwala-Mount Lavinia", "Moratuwa", "Sri Jayawardenepura Kotte", "Negombo", "Kandy", "Kalmunai", "Vavuniya", "Galle", "Trincomalee", "Batticaloa", "Jaffna", "Katunayake", "Dambulla", "Kolonnawa", "Anuradhapura", "Ratnapura", "Badulla", "Matara", "Puttalam", "Chavakachcheri", "Battaramulla", "Panadura", "Kalutara", "Matale", "Mannar", "Point Pedro", "Kurunegala", "Gampaha", "Nuwara Eliya", "Valvettithurai", "Hikkaduwa", "Weligama", "Ambalangoda", "Kegalle", "Ampara", "Hatton", "Hambantota", "Tangalle", "Monaragala", "Gampola", "Horana", "Wattala", "Minuwangoda", "Bandarawela", "Kuliyapitiya", "Haputale", "Talawakelle", "Harispattuwa", "Kadugannawa", "Embilipitiya", "Sigiriya", "Polonnaruwa", "Kilinochchi", "Mullaitivu"
  ].sort();

  const [form, setForm] = useState<JobForm>({
    title: "",
    description: "",
    pay: "",
    payType: "hour",
    category: "Hospitality",
    locations: [],
    jobDates: [],
    startTime: "",
    endTime: "",
    requirements: [],
  });

  const [reqInput, setReqInput] = useState("");
  const [locInput, setLocInput] = useState("");
  const [dateInput, setDateInput] = useState("");

  const addRequirement = () => {
    if (!reqInput.trim()) return;
    setForm((p) => ({ ...p, requirements: [...p.requirements, reqInput.trim()] }));
    setReqInput("");
  };

  const removeRequirement = (index: number) => {
    setForm((p) => ({ ...p, requirements: p.requirements.filter((_, i) => i !== index) }));
  };

  const addLocation = () => {
    if (!locInput.trim()) return;
    setForm((p) => ({ ...p, locations: [...p.locations, locInput.trim()] }));
    setLocInput("");
  };

  const removeLocation = (index: number) => {
    setForm((p) => ({ ...p, locations: p.locations.filter((_, i) => i !== index) }));
  };

  const addDate = () => {
    if (!dateInput) return;
    // Avoid duplicates
    if (form.jobDates.includes(dateInput)) return setDateInput("");
    setForm((p) => ({ ...p, jobDates: [...p.jobDates, dateInput] }));
    setDateInput("");
  };

  const removeDate = (index: number) => {
    setForm((p) => ({ ...p, jobDates: p.jobDates.filter((_, i) => i !== index) }));
  };

  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
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

  function validate(status: Status): string {
    // Loose validation for Drafts
    if (status === "DRAFT") {
      if (!form.title.trim()) return "Job title is required for draft.";
      return "";
    }

    // Strict validation for Published
    if (!form.title.trim()) return "Job title is required.";
    if (!form.description.trim()) return "Job description is required.";
    if (!form.pay || Number(form.pay) <= 0) return "Pay must be a positive number.";
    if (form.locations.length === 0) return "At least one location is required.";
    if (form.jobDates.length === 0) return "At least one job date is required.";
    if (!form.startTime) return "Start time is required.";
    if (!form.endTime) return "End time is required.";
    return "";
  }

  async function submit(status: Status) {
    setMsg({ type: "", text: "" });

    const err = validate(status);
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
        setShowSuccess(true);
        setForm({
          title: "",
          description: "",
          pay: "",
          payType: "hour",
          category: "Hospitality",
          locations: [],
          jobDates: [],
          startTime: "",
          endTime: "",
          requirements: [],
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

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-8">
          {showSuccess ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Job Posted Successfully!
              </h2>
              <p className="text-slate-600 mb-8">
                Your job listing is now live and visible to potential candidates.
              </p>
              <button
                onClick={() => {
                  setShowSuccess(false);
                  setMsg({ type: "", text: "" });
                }}
                className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
              >
                Post Another Job
              </button>
            </div>
          ) : (
            <>
              {/* Section 1: Job Details */}
              <section>
                <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="w-1 h-6 bg-blue-600 rounded-full inline-block"></span>
                  Job Details
                </h2>

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
                        placeholder="2500"
                        inputMode="numeric"
                        className="w-full h-11 px-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-200"
                      />
                      <select
                        name="payType"
                        value={form.payType}
                        onChange={handleChange}
                        className="h-11 px-3 border border-slate-300 rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-blue-200"
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
                      className="w-full h-11 px-3 border border-slate-300 rounded-xl bg-white outline-none focus:ring-2 focus:ring-blue-200"
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
              </section>

              <hr className="border-slate-100" />

              {/* Section 2: Location & Schedule */}
              <section>
                <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="w-1 h-6 bg-purple-600 rounded-full inline-block"></span>
                  Location & Schedule
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Job Dates */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-800 mb-2">Job Dates</label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="date"
                        value={dateInput}
                        onChange={(e) => setDateInput(e.target.value)}
                        className="flex-1 h-11 px-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-200"
                      />
                      <button
                        onClick={addDate}
                        type="button"
                        className="px-4 h-11 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-colors"
                      >
                        Add Date
                      </button>
                    </div>
                    {form.jobDates.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {form.jobDates.map((date, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-lg border border-blue-100"
                          >
                            {date}
                            <button
                              onClick={() => removeDate(idx)}
                              className="text-blue-400 hover:text-blue-600 focus:outline-none"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Locations */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-800 mb-2">Locations</label>
                    <div className="flex gap-2 mb-2">
                      <input
                        value={locInput}
                        onChange={(e) => setLocInput(e.target.value)}
                        placeholder="e.g. Colombo"
                        list="city-list"
                        className="flex-1 h-11 px-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-200"
                        onKeyDown={(e) => e.key === "Enter" && addLocation()}
                      />
                      <datalist id="city-list">
                        {SL_CITIES.map((city) => (
                          <option key={city} value={city} />
                        ))}
                      </datalist>
                      <button
                        onClick={addLocation}
                        type="button"
                        className="px-4 h-11 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-colors"
                      >
                        Add
                      </button>
                    </div>
                    {form.locations.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {form.locations.map((loc, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-2 px-3 py-1 bg-purple-50 text-purple-700 text-sm font-medium rounded-lg border border-purple-100"
                          >
                            {loc}
                            <button
                              onClick={() => removeLocation(idx)}
                              className="text-purple-400 hover:text-purple-600 focus:outline-none"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-2">
                      Start Time
                    </label>
                    <input
                      type="time"
                      name="startTime"
                      value={form.startTime}
                      onChange={handleChange}
                      className="w-full h-11 px-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-2">End Time</label>
                    <input
                      type="time"
                      name="endTime"
                      value={form.endTime}
                      onChange={handleChange}
                      className="w-full h-11 px-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                </div>
              </section>

              <hr className="border-slate-100" />

              {/* Section 3: Requirements */}
              <section>
                <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="w-1 h-6 bg-green-600 rounded-full inline-block"></span>
                  Requirements
                </h2>
                <div className="flex gap-2 mb-4">
                  <input
                    value={reqInput}
                    onChange={(e) => setReqInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addRequirement()}
                    placeholder="Add a requirement (e.g. Must have own vehicle)"
                    className="flex-1 h-11 px-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-200"
                  />
                  <button
                    onClick={addRequirement}
                    type="button"
                    className="px-4 h-11 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-colors"
                  >
                    Add
                  </button>
                </div>

                {form.requirements.length === 0 && (
                  <p className="text-slate-400 text-sm italic">No requirements added yet.</p>
                )}

                <ul className="space-y-2">
                  {form.requirements.map((req, idx) => (
                    <li
                      key={idx}
                      className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded-lg border border-slate-200"
                    >
                      <span className="text-slate-700">{req}</span>
                      <button
                        onClick={() => removeRequirement(idx)}
                        className="text-red-500 hover:text-red-700 text-sm font-medium"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              </section>

              <hr className="border-slate-100" />

              {msg.text ? (
                <div
                  className={`px-4 py-3 rounded-xl border text-sm ${msg.type === "error"
                    ? "bg-red-50 border-red-200 text-red-700"
                    : "bg-green-50 border-green-200 text-green-700"
                    }`}
                >
                  {msg.text}
                </div>
              ) : null}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => submit("DRAFT")}
                  disabled={loading}
                  className="h-11 px-6 rounded-xl border border-slate-300 bg-white font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-60 transition-colors"
                >
                  {loading ? "Saving..." : "Save as Draft"}
                </button>

                <button
                  onClick={() => submit("PUBLISHED")}
                  disabled={loading}
                  className="h-11 px-6 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-60 transition-colors shadow-sm"
                >
                  {loading ? "Posting..." : "Post a job"}
                </button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
