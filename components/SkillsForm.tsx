"use client";

import { useState } from "react";

const suggestedSkills = ["Data Entry", "Sales", "Stocking"];

export default function SkillsForm() {
  const [skills, setSkills] = useState<string[]>([
    "Customer Service",
    "Cash Handling",
  ]);
  const [inputValue, setInputValue] = useState("");
  const currentStep = 1;
  const totalSteps = 3;

  const addSkill = (skill: string) => {
    const trimmedSkill = skill.trim();
    if (trimmedSkill && !skills.includes(trimmedSkill)) {
      setSkills([...skills, trimmedSkill]);
    }
    setInputValue("");
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault();
      addSkill(inputValue);
    }
  };

  const handleSuggestionClick = (skill: string) => {
    addSkill(skill);
  };

  return (
    <div className="w-full max-w-2xl rounded-[var(--radius)] bg-card p-8 shadow-lg">
      {/* Step indicator */}
      <div className="mb-6">
        <p className="mb-2 text-sm text-muted">
          Step {currentStep} of {totalSteps}
        </p>
        {/* Progress bar */}
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-accent-2 transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <h2 className="mb-6 text-xl font-semibold text-[#111827]">
        What are your top skills?
      </h2>

      {/* Skills input area */}
      <div className="mb-4 flex flex-wrap items-center gap-2 rounded-lg border border-gray-200 bg-white p-3">
        {skills.map((skill) => (
          <span
            key={skill}
            className="inline-flex items-center gap-1.5 rounded-full border border-gray-300 bg-white px-4 py-1.5 text-sm text-[#111827]"
          >
            {skill}
            <button
              onClick={() => removeSkill(skill)}
              className="flex h-4 w-4 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="h-3 w-3"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
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
          {suggestedSkills
            .filter((skill) => !skills.includes(skill))
            .map((skill) => (
              <button
                key={skill}
                onClick={() => handleSuggestionClick(skill)}
                className="rounded-full border border-gray-300 bg-white px-4 py-1.5 text-sm text-[#111827] transition-colors hover:border-accent hover:bg-gray-50"
              >
                {skill}
              </button>
            ))}
        </div>
      </div>

      {/* Divider */}
      <div className="mb-6 border-t border-gray-200" />

      {/* Action buttons */}
      <div className="flex items-center justify-end gap-3">
        <button className="rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-sm font-semibold text-[#111827] transition-colors hover:bg-gray-50">
          Back
        </button>
        <button className="rounded-lg bg-accent px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent/90">
          Continue
        </button>
      </div>
    </div>
  );
}
