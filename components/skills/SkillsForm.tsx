"use client";

import { useState, type KeyboardEvent } from "react";

const initialSuggestedSkills = ["Data Entry", "Sales", "Stocking"];

export default function SkillsForm() {
  // Step 3 (skills)
  const [skills, setSkills] = useState<string[]>([
    "Customer Service",
    "Cash Handling",
  ]);
  const [inputValue, setInputValue] = useState("");

  // Step 1 & 2
  const [primaryRole, setPrimaryRole] = useState<string>("");
  const [experience, setExperience] = useState<string>("");

  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const totalSteps = 3;

  // Suggestions (manual skills become suggestions too)
  const [suggested, setSuggested] = useState<string[]>(initialSuggestedSkills);

  // -------------------------
  // Helpers
  // -------------------------
  const addSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (!trimmed) return;

    setSkills((prev) => (prev.includes(trimmed) ? prev : [...prev, trimmed]));
    setSuggested((prev) => (prev.includes(trimmed) ? prev : [...prev, trimmed]));
    setInputValue("");
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills((prev) => prev.filter((s) => s !== skillToRemove));
    // Keep removed skill in suggestions so it can show again later
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // Prevent Enter from submitting if this component is ever inside a <form>
    if (e.key === "Enter") {
      e.preventDefault();
      if (inputValue.trim()) addSkill(inputValue);
    }
  };

  const handleSuggestionClick = (skill: string) => addSkill(skill);

  // -------------------------
  // API
  // -------------------------
  async function savePreferences(payload: {
    skills: string[];
    primaryRole: string;
    experience: string;
  }) {
    const res = await fetch("/api/preferences/skills", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || "Save failed");
    return data;
  }

  // -------------------------
  // Navigation
  // -------------------------
  const handleNext = () => {
    if (currentStep === 1 && !primaryRole.trim()) {
      alert("Please enter your primary role.");
      return;
    }
    if (currentStep === 2 && !experience.trim()) {
      alert("Please enter your experience.");
      return;
    }
    if (currentStep < totalSteps) setCurrentStep((s) => s + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep((s) => s - 1);
  };

  const canContinue =
    !isSaving &&
    primaryRole.trim().length > 0 &&
    experience.trim().length > 0 &&
    skills.length > 0;

  const handleContinue = async () => {
    if (!canContinue) return;

    try {
      setIsSaving(true);

      await savePreferences({
        skills,
        primaryRole: primaryRole.trim(),
        experience: experience.trim(),
      });

      alert("Preferences saved successfully!");
      // ✅ If you want, navigate next:
      // router.push("/next-page");
    } catch (e: any) {
      alert(e?.message || "Something went wrong");
    } finally {
      setIsSaving(false);
    }
  };

  // -------------------------
  // UI
  // -------------------------
  return (
    <div className="w-full max-w-2xl rounded-[var(--radius)] bg-card p-8 shadow-lg">
      {/* Progress */}
      <div className="mb-6">
        <p className="mb-2 text-sm text-muted">
          Step {currentStep} of {totalSteps}
        </p>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-accent-2 transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* STEP 1 */}
      {currentStep === 1 && (
        <>
          <h2 className="mb-6 text-xl font-semibold text-[#111827]">
            Tell us about your role
          </h2>

          <label className="mb-2 block text-sm font-medium text-[#111827]">
            What's your primary role?
          </label>
          <input
            type="text"
            value={primaryRole}
            onChange={(e) => setPrimaryRole(e.target.value)}
            placeholder="e.g. Retail Associate"
            className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm outline-none"
          />
        </>
      )}

      {/* STEP 2 */}
      {currentStep === 2 && (
        <>
          <h2 className="mb-6 text-xl font-semibold text-[#111827]">
            Tell us about your experience
          </h2>

          <label className="mb-2 block text-sm font-medium text-[#111827]">
            How many years of experience do you have?
          </label>
          <input
            type="text"
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
            placeholder="e.g. 3 years"
            className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm outline-none"
          />
        </>
      )}

      {/* STEP 3 */}
      {currentStep === 3 && (
        <>
          <h2 className="mb-6 text-xl font-semibold text-[#111827]">
            What are your top skills?
          </h2>

          {/* Skills input */}
          <div className="mb-4 flex flex-wrap items-center gap-2 rounded-lg border border-gray-200 bg-white p-3">
            {skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1.5 rounded-full border border-gray-300 bg-white px-4 py-1.5 text-sm text-[#111827]"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => removeSkill(skill)}
                  className="ml-1 text-gray-500 hover:text-gray-700"
                  aria-label={`Remove ${skill}`}
                >
                  ✕
                </button>
              </span>
            ))}

            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a skill..."
              className="min-w-[120px] flex-1 border-none bg-transparent px-2 py-1 text-sm text-[#111827] placeholder-gray-400 outline-none"
            />
          </div>

          {/* Suggestions */}
          <div className="mb-8">
            <p className="mb-2 text-sm text-muted">Suggestion:</p>
            <div className="flex flex-wrap gap-2">
              {suggested
                .filter((skill) => !skills.includes(skill))
                .map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => handleSuggestionClick(skill)}
                    className="rounded-full border border-gray-300 bg-white px-4 py-1.5 text-sm text-[#111827] transition-colors hover:border-accent hover:bg-gray-50"
                  >
                    {skill}
                  </button>
                ))}
            </div>
          </div>
        </>
      )}

      {/* Buttons */}
      <div className="mt-6 flex justify-end gap-3">
        {currentStep > 1 && (
          <button
            type="button"
            onClick={handleBack}
            className="rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-sm font-semibold text-[#111827] transition-colors hover:bg-gray-50"
          >
            Back
          </button>
        )}

        {currentStep < 3 && (
          <button
            type="button"
            onClick={handleNext}
            className="rounded-lg bg-accent px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent/90"
          >
            Next
          </button>
        )}

        {currentStep === 3 && (
          <button
            type="button"
            onClick={handleContinue}
            disabled={!canContinue}
            className="rounded-lg bg-accent px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent/90 disabled:opacity-60"
          >
            {isSaving ? "Saving..." : "Continue"}
          </button>
        )}
      </div>
    </div>
  );
}
