"use client";

import * as Popover from "@radix-ui/react-popover";
import { useState } from "react";

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
}

export default function DatePicker({ value, onChange }: DatePickerProps) {
  const today = new Date();

  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const monthNames = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December",
  ];

  const formatDate = (day: number) =>
    `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  const isToday = (day: number) =>
    day === today.getDate() &&
    month === today.getMonth() &&
    year === today.getFullYear();

  const isPastDate = (day: number) => {
    const check = new Date(year, month, day);
    const now = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    return check < now;
  };

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          type="button"
          className="
            h-11 w-full rounded-xl bg-gray-50 px-4 text-left text-sm
            hover:bg-gray-100 transition
            focus:outline-none focus:ring-2 focus:ring-[#6b8bff]
          "
        >
          {value || "Select date"}
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          sideOffset={8}
          className="
            w-[280px] rounded-2xl bg-white p-4 shadow-xl
            animate-in fade-in zoom-in-95
          "
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => {
                if (month === 0) {
                  setMonth(11);
                  setYear((y) => y - 1);
                } else {
                  setMonth((m) => m - 1);
                }
              }}
              className="h-8 w-8 rounded-lg hover:bg-gray-100"
            >
              ‹
            </button>

            <div className="text-sm font-medium">
              {monthNames[month]} {year}
            </div>

            <button
              onClick={() => {
                if (month === 11) {
                  setMonth(0);
                  setYear((y) => y + 1);
                } else {
                  setMonth((m) => m + 1);
                }
              }}
              className="h-8 w-8 rounded-lg hover:bg-gray-100"
            >
              ›
            </button>
          </div>

          {/* Weekdays */}
          <div className="grid grid-cols-7 text-xs text-gray-400 mb-2">
            {["Su","Mo","Tu","We","Th","Fr","Sa"].map((d) => (
              <div key={d} className="text-center">
                {d}
              </div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const selected = value === formatDate(day);
              const past = isPastDate(day);

              return (
                <button
                  key={day}
                  type="button"
                  disabled={past}
                  onClick={() => !past && onChange(formatDate(day))}
                  className={`
                    h-9 w-9 text-sm rounded-lg transition
                    ${selected ? "bg-[#6b8bff] text-white" : ""}
                    ${
                      past
                        ? "text-gray-300 cursor-not-allowed"
                        : "hover:bg-[#e6ecff]"
                    }
                    ${
                      isToday(day) && !selected
                        ? "border border-[#6b8bff] text-[#6b8bff]"
                        : ""
                    }
                  `}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="mt-3 flex justify-between text-xs">
            <button
              type="button"
              onClick={() => onChange("")}
              className="text-gray-400 hover:text-black"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() =>
                onChange(
                  `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`
                )
              }
              className="font-medium text-[#6b8bff]"
            >
              Today
            </button>
          </div>

          <Popover.Arrow className="fill-white" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
