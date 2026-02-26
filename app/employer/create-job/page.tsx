"use client";

import Header from "@/components/Header";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { SRI_LANKA_LOCATIONS } from "@/app/data/locations";
import TimePicker from "@/components/TimePicker";


type Status = "DRAFT" | "PUBLIC" | "PRIVATE";

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
  const router = useRouter();

  //  Base URL for all fetch.
  const API_BASE = useMemo(
    () => process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000",
    []
  );

  // Flatten the district→cities map into a sorted "City, District" list

  const ALL_CITIES = useMemo(() => {
    const list: string[] = [];
    Object.entries(SRI_LANKA_LOCATIONS).forEach(([dist, cities]) => {
      cities.forEach(city => list.push(`${city}, ${dist}`));
    });
    return list.sort();
  }, []);


  // [STATE] Main form state — all fields default to empty/safe values
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

  // user types here then clicks Add
  const [reqInput, setReqInput] = useState("");
  const [locInput, setLocInput] = useState("");
  const [dateInput, setDateInput] = useState("");

  const [loading, setLoading] = useState(false);
  // showSuccess controls the post-submit success screen (replaces the form)
  const [showSuccess, setShowSuccess] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error" | ""; text: string }>({
    type: "",
    text: "",
  });


  //  Requirements — free-text list.
  const addRequirement = () => {
    if (!reqInput.trim()) return;
    setForm((p) => ({ ...p, requirements: [...p.requirements, reqInput.trim()] }));
    setReqInput("");
  };

  const removeRequirement = (index: number) => {
    setForm((p) => ({ ...p, requirements: p.requirements.filter((_, i) => i !== index) }));
  };

  //  Locations — deduplicated.
  const addLocation = () => {
    if (!locInput.trim()) return;
    if (form.locations.includes(locInput.trim())) return;
    setForm((p) => ({ ...p, locations: [...p.locations, locInput.trim()] }));
    setLocInput("");
  };

  const removeLocation = (index: number) => {
    setForm((p) => ({ ...p, locations: p.locations.filter((_, i) => i !== index) }));
  };

  //  Job dates — stored as YYYY-MM-DD strings from the date input;
  // duplicates are silently dropped and the staging input is cleared.
  const addDate = () => {
    if (!dateInput) return;
    if (form.jobDates.includes(dateInput)) return setDateInput("");
    setForm((p) => ({ ...p, jobDates: [...p.jobDates, dateInput] }));
    setDateInput("");
  };

  const removeDate = (index: number) => {
    setForm((p) => ({ ...p, jobDates: p.jobDates.filter((_, i) => i !== index) }));
  };


  // Generic change handler for all simple text/select inputs
  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  }

  // [VALIDATION] Client-side validation mirrors backend rules exactly.
  // DRAFT → only title required.
  // PUBLIC / PRIVATE → full details required so candidates see complete listings.

  function validate(status: Status): string {
    if (!form.title.trim()) return "Job title is required.";

    if (status === "PUBLIC" || status === "PRIVATE") {
      if (!form.description.trim()) return "Job description is required.";
      if (!form.pay || Number(form.pay) <= 0) return "Pay must be a positive number.";
      if (form.locations.length === 0) return "At least one location is required.";
      if (form.jobDates.length === 0) return "At least one job date is required.";
      if (!form.startTime) return "Start time is required.";
      if (!form.endTime) return "End time is required.";
    }

    return ""; // empty string = valid
  }

  // [API] POST /api/jobs — submits the form with the chosen status.
  // On PUBLIC/PRIVATE success: shows the success screen and resets the form.
  // On DRAFT success: shows a toast but keeps the form open for further editing.

  async function submit(status: Status) {
    setMsg({ type: "", text: "" });

    const err = validate(status);
    if (err) return setMsg({ type: "error", text: err });

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/jobs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Status is injected here so the same form can create DRAFT or PUBLIC jobs
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

      // After a successful PUBLIC/PRIVATE post, replace the form with

      if (status === "PUBLIC" || status === "PRIVATE") {
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
      // Network-level failure — backend is likely not running
      setMsg({ type: "error", text: "Backend not reachable. Is it running on :5000?" });
    } finally {
      setLoading(false);
    }
  }


  return (
    <div className="min-h-screen bg-slate-50">

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="text-xs text-slate-500 mb-3 uppercase tracking-wider font-bold">My postings / Post a new job</div>

        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Post a new job</h1>
        <p className="text-slate-600 mt-1 text-lg">
          Fill out the details below to find the right person for your one-day job
        </p>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-8">
          {/*Success screen replaces the form after a successful PUBLIC/PRIVATE post */}
          {showSuccess ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-20 h-20 bg-emerald-300 rounded-full flex items-center justify-center mb-6 shadow-sm">
                <svg
                  className="w-10 h-10 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Job Posted!</h2>
              <p className="text-slate-600 mb-8 max-w-md mx-auto">
                Your job listing is now live. Candidates can now view and apply to your job.
                We will update you on any applications soon.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md justify-center mt-6">
                {/* Navigate to the job list after posting */}
                <button
                  onClick={() => router.push('/employer/create-job/my-postings')}
                  className="btn-secondary flex-1"
                >
                  View My Job Posts
                </button>
                <button
                  onClick={() => {/* Placeholder for profile */ }}
                  className="btn-primary flex-1"
                >
                  View My Profile
                </button>
              </div>

              {/*  Lets the employer post another job without navigating away */}
              <button
                onClick={() => {
                  setShowSuccess(false);
                  setMsg({ type: "", text: "" });
                }}
                className="btn-tertiary mt-6"
              >
                Post Another Job
              </button>
            </div>
          ) : (
            <>
              {/*Job Details */}
              <section>
                <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="w-1 h-6 bg-accent rounded-full inline-block"></span>
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
                        placeholder="$250.00"
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

              {/*Location & Schedule */}
              <section>
                <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="w-1 h-6 bg-purple-600 rounded-full inline-block"></span>
                  Location & Schedule
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/*Job Dates - stored as YYYY-MM-DD strings */}
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
                        Add
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
                              *
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/*Locations — autocomplete from SRI_LANKA_LOCATIONS datalist */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-800 mb-2">Locations</label>
                    <div className="flex gap-2 mb-2">
                      <input
                        value={locInput}
                        onChange={(e) => setLocInput(e.target.value)}
                        placeholder="e.g. Colombo, Baththaramulla"
                        list="city-list"
                        className="flex-1 h-11 px-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-200"
                        onKeyDown={(e) => e.key === "Enter" && addLocation()}
                      />
                      <datalist id="city-list">
                        {ALL_CITIES.map((loc) => (
                          <option key={loc} value={loc} />
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

                  {/*TimePicker produces "HH:mm AM/PM" strings stored in form state */}
                  <div>
                    <TimePicker
                      label="Start Time"
                      value={form.startTime}
                      onChange={(val) => setForm(p => ({ ...p, startTime: val }))}
                    />
                  </div>

                  <div>
                    <TimePicker
                      label="End Time"
                      value={form.endTime}
                      onChange={(val) => setForm(p => ({ ...p, endTime: val }))}
                    />
                  </div>
                </div>
              </section>

              <hr className="border-slate-100" />

              {/* Requirements */}
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

              {/*Inline error/success feedback banner */}
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

              {/*Action buttons — each calls submit() with a different status */}
              <div className="flex items-center gap-6 pt-8 mt-8 border-t border-slate-100">
                {/*POST /api/jobs with status=PUBLIC */}
                <button
                  onClick={() => submit("PUBLIC")}
                  disabled={loading}
                  className="btn-primary min-w-[156px] px-6 h-[44px] whitespace-nowrap"
                >
                  {loading ? "Creating..." : "Post a new job"}
                </button>

                {/*POST /api/jobs with status=DRAFT */}
                <button
                  onClick={() => submit("DRAFT")}
                  disabled={loading}
                  className="btn-secondary"
                >
                  {loading ? "Saving..." : "Save as Draft"}
                </button>

                {/*Cancel navigates back to the job list without saving */}
                <button
                  onClick={() => router.push("/employer/create-job/my-postings")}
                  className="btn-tertiary"
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
