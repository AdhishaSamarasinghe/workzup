"use client";

import { useState } from "react";

interface SkillsFormProps {
  onContinue?: (skills: string[]) => void;
  onBack?: () => void;
}

const suggestions = [
  "Data Entry",
  "Sales",
  "Stocking",
  "Communication",
  "Teamwork",
  "Problem Solving",
];

export default function SkillsForm({ onContinue, onBack }: SkillsFormProps) {
  const [skills, setSkills] = useState<string[]>([
    "Customer Service",
    "Cash Handling",
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const addSkill = (skill: string) => {
    const trimmedSkill = skill.trim();
    if (trimmedSkill && !skills.includes(trimmedSkill)) {
      setSkills([...skills, trimmedSkill]);
      setInputValue("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault();
      addSkill(inputValue);
    } else if (e.key === "Backspace" && !inputValue && skills.length > 0) {
      removeSkill(skills[skills.length - 1]);
    }
  };

  const handleContinue = () => {
    if (onContinue) {
      onContinue(skills);
    }
  };

  const availableSuggestions = suggestions.filter(
    (suggestion) => !skills.includes(suggestion),
  );

  return (
    <div className="w-full max-w-[500px] mx-auto px-3 sm:px-0 animate-fadeIn">
      <div className="bg-[var(--card)] rounded-[var(--radius)] px-4 sm:px-6 md:px-8 py-5 sm:py-6 md:py-7 shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
        {/* Step indicator */}
        <div className="mb-4 sm:mb-5 md:mb-6">
          <p className="text-xs sm:text-sm text-[var(--muted)] mb-2">
            Step 1 of 3
          </p>
          <div className="h-1 sm:h-[5px] bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--accent-2)] rounded-full transition-all duration-500"
              style={{ width: "33.33%" }}
            ></div>
          </div>
        </div>

        {/* Question */}
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-5">
          What are your top skills?
        </h2>

        {/* Skills Input Container */}
        <div
          className={`flex flex-wrap items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2 border rounded-lg min-h-[44px] bg-[var(--card)] transition-all duration-200 ${
            isFocused
              ? "border-[var(--accent)] shadow-[0_0_0_3px_rgba(107,139,255,0.1)]"
              : "border-gray-200"
          }`}
        >
          {/* Skill Tags */}
          {skills.map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center gap-1 sm:gap-2 pl-2.5 sm:pl-4 pr-1.5 sm:pr-2 py-1 sm:py-1.5 bg-gray-100 rounded-full text-xs sm:text-sm text-gray-700"
            >
              {skill}
              <button
                type="button"
                onClick={() => removeSkill(skill)}
                className="w-4 h-4 flex items-center justify-center text-gray-500 hover:text-gray-700 active:text-gray-900"
                aria-label={`Remove ${skill}`}
              >
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 10 10"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M1 1L9 9M9 1L1 9"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </span>
          ))}

          {/* Input */}
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Type a skill..."
            className="flex-1 min-w-[80px] sm:min-w-[90px] outline-none text-sm sm:text-base text-gray-500 placeholder:text-gray-400 bg-transparent"
            style={{ fontSize: "16px" }}
          />
        </div>

        {/* Suggestions */}
        {availableSuggestions.length > 0 && (
          <div className="mt-3 sm:mt-4">
            <p className="text-xs text-[var(--muted)] mb-1.5 sm:mb-2">
              Suggestion:
            </p>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {availableSuggestions.slice(0, 3).map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => addSkill(suggestion)}
                  className="px-2.5 sm:px-3 py-1 sm:py-1.5 bg-[var(--card)] hover:bg-gray-50 active:bg-gray-100 rounded-full text-xs sm:text-sm text-[var(--muted)] border border-gray-200 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-gray-100 mt-6 sm:mt-8 mb-4 sm:mb-5"></div>

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2.5 sm:py-2 font-semibold text-sm text-gray-800 hover:bg-gray-50 active:bg-gray-100 rounded-lg sm:rounded transition-all text-center"
          >
            Back
          </button>
          <button
            type="button"
            onClick={handleContinue}
            disabled={skills.length === 0}
            className="px-5 py-2.5 sm:py-2 bg-[var(--accent)] text-[var(--card)] rounded-lg font-medium text-sm hover:opacity-90 active:opacity-80 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
