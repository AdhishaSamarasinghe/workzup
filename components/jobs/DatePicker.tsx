"use client";

import * as Popover from "@radix-ui/react-popover";
import { useState } from "react";

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
}

export default function DatePicker({ value, onChange }: DatePickerProps) {
  const today = new Date();

  // Parse initial date or default to today
  const getInitialState = () => {
    if (value) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) return { m: d.getMonth(), y: d.getFullYear() };
    }
    return { m: today.getMonth(), y: today.getFullYear() };
  };

  const [viewDate, setViewDate] = useState(getInitialState());
  const [isOpen, setIsOpen] = useState(false);

  const month = viewDate.m;
  const year = viewDate.y;

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const formatDate = (d: number, m: number, y: number) =>
    `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

  const isToday = (day: number) =>
    day === today.getDate() &&
    month === today.getMonth() &&
    year === today.getFullYear();

  const isPastDate = (day: number) => {
    const check = new Date(year, month, day);
    const now = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return check < now;
  };

  const isSelected = (day: number) => value === formatDate(day, month, year);

  const handlePrevMonth = () => {
    setViewDate(prev => prev.m === 0 ? { m: 11, y: prev.y - 1 } : { ...prev, m: prev.m - 1 });
  };

  const handleNextMonth = () => {
    setViewDate(prev => prev.m === 11 ? { m: 0, y: prev.y + 1 } : { ...prev, m: prev.m + 1 });
  };

  return (
    <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          className="
            h-[46px] w-full rounded-xl border border-gray-200 bg-white px-4 text-left text-sm text-gray-900
            hover:border-blue-400 transition-colors
            flex items-center justify-between
            focus:outline-none focus:ring-1 focus:ring-blue-500
          "
        >
          <span className={value ? "text-gray-900" : "text-gray-500"}>
            {value || "mm/dd/yyyy"}
          </span>
          <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          side="bottom"
          align="start"
          sideOffset={8}
          avoidCollisions={false}
          className="
            w-[300px] rounded-2xl bg-white p-5 shadow-2xl border border-gray-100
            animate-in fade-in zoom-in-95 data-[side=bottom]:slide-in-from-top-2
            z-50
          "
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handlePrevMonth}
              // Prevent going back to past months if desired, but user only asked for days.
              // For now keeping navigation open but disabling days is standard.
              className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-600 transition"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="text-base font-bold text-gray-800">
              {monthNames[month]} {year}
            </div>

            <button
              onClick={handleNextMonth}
              className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-600 transition"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Weekdays */}
          <div className="grid grid-cols-7 text-xs font-medium text-gray-400 mb-2">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
              <div key={d} className="text-center py-1">
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
              const selected = isSelected(day);
              const todayIs = isToday(day);
              const past = isPastDate(day);

              return (
                <button
                  key={day}
                  type="button"
                  disabled={past}
                  onClick={() => {
                    if (!past) {
                      onChange(formatDate(day, month, year));
                      setIsOpen(false);
                    }
                  }}
                  className={`
                    h-9 w-9 text-sm rounded-full flex items-center justify-center transition-all
                    ${past
                      ? "text-gray-300 cursor-not-allowed"
                      : "text-gray-700 hover:bg-gray-100"
                    }
                    ${selected && !past
                      ? "bg-[#6b8bff] text-white shadow-md shadow-blue-200 font-medium hover:bg-[#6b8bff]"
                      : ""
                    }
                    ${todayIs && !selected && !past
                      ? "border-2 border-[#6b8bff] text-[#6b8bff] font-semibold"
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
          <div className="mt-4 flex justify-between items-center text-sm pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={() => { onChange(""); setIsOpen(false); }}
              className="text-gray-400 hover:text-gray-600 font-medium px-2 py-1 rounded hover:bg-gray-50 transition"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => {
                const t = new Date();
                onChange(formatDate(t.getDate(), t.getMonth(), t.getFullYear()));
                setViewDate({ m: t.getMonth(), y: t.getFullYear() });
                setIsOpen(false);
              }}
              className="text-[#6b8bff] hover:text-[#5a7ae0] font-bold px-2 py-1 rounded hover:bg-blue-50 transition"
            >
              Today
            </button>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
