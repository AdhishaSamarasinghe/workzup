"use client";

import React, { useState, KeyboardEvent, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { updatePreferences } from "@/lib/api";

// --- Components ---

const ProgressBar = ({
  step,
  totalSteps,
}: {
  step: number;
  totalSteps: number;
}) => {
  const progress = (step / totalSteps) * 100;
  return (
    <div className="w-full bg-gray-200 h-1.5 rounded-full mt-2 overflow-hidden">
      <div
        className="bg-green-500 h-1.5 rounded-full transition-all duration-300 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

const TagPill = ({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) => (
  <div className="flex items-center gap-1.5 bg-gray-100 text-gray-800 px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-200">
    {label}
    <button
      onClick={(e) => {
        e.stopPropagation();
        onRemove();
      }}
      className="text-gray-400 hover:text-gray-600 transition-colors"
    >
      <svg
        className="w-3.5 h-3.5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    </button>
  </div>
);

const SuggestionChip = ({
  label,
  onClick,
  active,
}: {
  label: string;
  onClick: () => void;
  active?: boolean;
}) => (
  <button
    onClick={onClick}
    className={`border px-4 py-2 rounded-lg text-sm font-medium transition-all active:scale-95 ${active
        ? "bg-blue-600 border-blue-600 text-white"
        : "bg-white border-gray-200 text-gray-600 hover:border-blue-400 hover:bg-blue-50"
      }`}
  >
    {label}
  </button>
);

// --- Main Page ---

export default function PreferencesPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const totalSteps = 3;

  // Step 1 State: Skills
  const [skills, setSkills] = useState<string[]>([
    "Customer Service",
    "Cash Handling",
  ]);
  const [skillInput, setSkillInput] = useState("");
  const skillSuggestions = ["Data Entry", "Sales", "Stocking"];

  // Step 2 State: Locations
  const [locations, setLocations] = useState<string[]>([]);
  const [locationInput, setLocationInput] = useState("");
  const locationSuggestions = [
    "Colombo",
    "Gampaha",
    "Kalutara",
    "Kandy",
    "Matale",
    "Nuwara Eliya",
    "Galle",
    "Matara",
    "Hambantota",
    "Jaffna",
    "Kilinochchi",
    "Mannar",
    "Vavuniya",
    "Mullaitivu",
    "Batticaloa",
    "Ampara",
    "Trincomalee",
    "Kurunegala",
    "Puttalam",
    "Anuradhapura",
    "Polonnaruwa",
    "Badulla",
    "Moneragala",
    "Ratnapura",
    "Kegalle",
  ];

  // Step 3 State: Job Types
  const [jobTypes, setJobTypes] = useState<string[]>([]);
  const [jobTypeSearch, setJobTypeSearch] = useState("");
  const jobTypeOptions = [
    "Part-time",
    "Full-time",
    "Remote",
    "Onsite",
    "Internship",
    "Freelance",
    "Weekend",
    "Night shift",
  ];

  // UI State
  const [showSavedMsg, setShowSavedMsg] = useState(false);

  // --- Handlers ---

  const addSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills((prev) => [...prev, trimmed]);
    }
    setSkillInput("");
  };

  const removeSkill = (skill: string) => {
    setSkills((prev) => prev.filter((s) => s !== skill));
  };

  const handleSkillKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addSkill(skillInput);
    } else if (e.key === "Backspace" && !skillInput && skills.length > 0) {
      removeSkill(skills[skills.length - 1]);
    }
  };

  const addLocation = (loc: string) => {
    const trimmed = loc.trim();
    if (trimmed && !locations.includes(trimmed) && locations.length < 10) {
      setLocations((prev) => [...prev, trimmed]);
    }
    setLocationInput("");
  };

  const removeLocation = (loc: string) => {
    setLocations((prev) => prev.filter((l) => l !== loc));
  };

  const handleLocationKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addLocation(locationInput);
    } else if (
      e.key === "Backspace" &&
      !locationInput &&
      locations.length > 0
    ) {
      removeLocation(locations[locations.length - 1]);
    }
  };

  const toggleJobType = (type: string) => {
    setJobTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  };

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleFinish = async () => {
    const payload = {
      skills,
      locations,
      jobTypes,
    };

    localStorage.setItem("workzup_preferences", JSON.stringify(payload));

    try {
      await updatePreferences("current-user-123", {
        categories: skills,
        preferredLocations: locations,
        preferredJobTypes: jobTypes,
      });
    } catch (err) {
      console.error("Failed to save preferences to backend:", err);
    }

    setShowSavedMsg(true);

    setTimeout(() => {
      router.push("/");
    }, 1500);
  };

  // --- Validation ---

  const isNextDisabled = () => {
    if (step === 1) return skills.length === 0;
    if (step === 2) return locations.length === 0;
    if (step === 3) return jobTypes.length === 0;
    return false;
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-slate-900">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-100 z-50 px-6 sm:px-10 flex items-center justify-between">
        <div className="flex items-center gap-1.5 h-full relative w-24 sm:w-28">
          <Image
            src="/logo_main.png"
            alt="Workzup"
            fill
            priority
            className="object-contain"
          />
        </div>
        <div className="flex items-center gap-4">
          <button className="bg-blue-600 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-blue-700 transition-colors hidden sm:block">
            Login
          </button>
          <button className="text-gray-500 hover:text-gray-800 transition-colors p-1">
            <svg
              className="w-7 h-7"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center pt-24 pb-12 px-6">
        <div className="text-center mb-10 max-w-2xl px-4">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
            Set Up Your Job Preferences
          </h1>
          <p className="text-gray-500 text-sm sm:text-base font-medium">
            Personalize your profile to get the best job recommendations.
          </p>
        </div>

        {/* Wizard Card */}
        <div className="w-full max-w-[720px] bg-white rounded-2xl shadow-[0_10px_40px_-15px_rgba(0,0,0,0.08)] border border-gray-100 overflow-hidden flex flex-col animate-in fade-in zoom-in duration-500">
          <div className="p-8 sm:p-10 flex flex-col h-full">
            {showSavedMsg ? (
              <div className="flex flex-col items-center justify-center h-full min-h-[460px] animate-in fade-in zoom-in duration-500">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                  <svg
                    className="w-10 h-10 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold mb-2">Saved successfully!</h2>
                <p className="text-gray-500">Redirecting to your profile...</p>
              </div>
            ) : (
              <>
                {/* Step Indicator */}
                <div className="mb-10">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">
                    Step {step} of {totalSteps}
                  </span>
                  <ProgressBar step={step} totalSteps={totalSteps} />
                </div>

                {/* Step Content */}
                <div className="flex-1 min-h-[340px]">
                  {step === 1 && (
                    <div className="animate-in slide-in-from-right-4 duration-300">
                      <h2 className="text-2xl font-bold mb-6">
                        What are your top skills?
                      </h2>

                      <div className="mb-8 p-6 border-2 border-dashed border-slate-100 rounded-2xl">
                        <div
                          className="w-full min-h-[120px] p-3 border-2 border-slate-50 rounded-2xl bg-slate-50 focus-within:bg-white focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-50 transition-all flex flex-wrap content-start gap-2 cursor-text"
                          onClick={() =>
                            document.getElementById("skillInput")?.focus()
                          }
                        >
                          {skills.map((skill) => (
                            <TagPill
                              key={skill}
                              label={skill}
                              onRemove={() => removeSkill(skill)}
                            />
                          ))}
                          <input
                            id="skillInput"
                            type="text"
                            value={skillInput}
                            onChange={(e) => setSkillInput(e.target.value)}
                            onKeyDown={handleSkillKeyDown}
                            placeholder={
                              skills.length === 0 ? "Type a skill..." : ""
                            }
                            className="flex-1 min-w-[120px] bg-transparent outline-none py-1.5 px-1 text-base placeholder-gray-400"
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                          Suggestion:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {skillSuggestions.map((label) => (
                            <SuggestionChip
                              key={label}
                              label={label}
                              onClick={() => addSkill(label)}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="animate-in slide-in-from-right-4 duration-300">
                      <h2 className="text-2xl font-bold mb-6">
                        Where would you like to work?
                      </h2>

                      <div className="mb-8 p-6 border-2 border-dashed border-slate-100 rounded-2xl">
                        <div className="relative mb-6">
                          <input
                            type="text"
                            value={locationInput}
                            onChange={(e) => setLocationInput(e.target.value)}
                            onKeyDown={handleLocationKeyDown}
                            placeholder="Search a city or area..."
                            className="w-full h-14 pl-12 pr-4 bg-slate-50 border-2 border-slate-50 rounded-2xl outline-none focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all text-base"
                          />
                          <svg
                            className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                          </svg>
                        </div>

                        {locations.length > 0 && (
                          <div className="mb-6">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                              Selected ({locations.length}/10)
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {locations.map((loc) => (
                                <TagPill
                                  key={loc}
                                  label={loc}
                                  onRemove={() => removeLocation(loc)}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="space-y-3">
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                          {locationInput
                            ? "Matching Locations:"
                            : "Suggestions:"}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {locationSuggestions
                            .filter(
                              (label) =>
                                label
                                  .toLowerCase()
                                  .includes(locationInput.toLowerCase()) &&
                                !locations.includes(label),
                            )
                            .map((label) => (
                              <SuggestionChip
                                key={label}
                                label={label}
                                onClick={() => addLocation(label)}
                              />
                            ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {step === 3 && (
                    <div className="animate-in slide-in-from-right-4 duration-300">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                        <h2 className="text-2xl font-bold">
                          What job types do you prefer?
                        </h2>
                        <span className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full self-start">
                          Selected: {jobTypes.length}
                        </span>
                      </div>

                      <div className="mb-8 p-6 border-2 border-dashed border-slate-100 rounded-2xl">
                        {/* Search Input for Job Types */}
                        <div className="relative mb-6">
                          <input
                            type="text"
                            value={jobTypeSearch}
                            onChange={(e) => setJobTypeSearch(e.target.value)}
                            placeholder="Filter job types..."
                            className="w-full h-12 pl-10 pr-4 bg-slate-50 border-2 border-slate-50 rounded-xl outline-none focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all text-sm"
                          />
                          <svg
                            className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                          </svg>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {jobTypeOptions
                            .filter((type) =>
                              type
                                .toLowerCase()
                                .includes(jobTypeSearch.toLowerCase()),
                            )
                            .map((type) => (
                              <button
                                key={type}
                                onClick={() => toggleJobType(type)}
                                className={`h-14 flex items-center justify-center px-4 rounded-xl border-2 font-semibold text-sm transition-all active:scale-95 ${jobTypes.includes(type)
                                    ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100"
                                    : "bg-white border-slate-50 text-slate-600 hover:border-blue-200"
                                  }`}
                              >
                                {type}
                              </button>
                            ))}
                        </div>
                        {jobTypeOptions.filter((type) =>
                          type
                            .toLowerCase()
                            .includes(jobTypeSearch.toLowerCase()),
                        ).length === 0 && (
                            <div className="text-center py-8 text-gray-400 text-sm">
                              No matching job types found.
                            </div>
                          )}
                      </div>

                      <p className="text-sm text-gray-400 text-center italic">
                        Select all that apply to get better results.
                      </p>
                    </div>
                  )}
                </div>

                {/* Bottom Navigation */}
                <div className="mt-12 flex items-center justify-between pt-8 border-t border-gray-50">
                  <button
                    onClick={handleBack}
                    disabled={step === 1}
                    className="px-8 py-3 rounded-full text-base font-bold transition-all disabled:opacity-0 disabled:pointer-events-none hover:bg-gray-100 text-gray-400 hover:text-gray-800"
                  >
                    Back
                  </button>
                  <button
                    onClick={step === totalSteps ? handleFinish : handleNext}
                    disabled={isNextDisabled()}
                    className="px-10 py-3 rounded-full text-base font-bold bg-blue-600 text-white shadow-lg shadow-blue-100 hover:bg-blue-700 hover:shadow-blue-200 transition-all active:scale-95 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
                  >
                    {step === totalSteps ? "Finish" : "Continue"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
