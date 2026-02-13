"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  keywords: string[];
  value: string;
  onChange: (value: string) => void;
}

export default function KeywordDropdown({
  keywords,
  value,
  onChange,
}: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = keywords.filter((k) =>
    k.toLowerCase().includes(value.toLowerCase())
  );

  return (
    <div ref={ref} className="relative w-full">
      <input
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        placeholder="Search job title"
        className="w-full rounded-xl bg-gray-100 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#6b8bff]"
      />

      {open && value && (
        <div className="absolute z-30 mt-2 w-full rounded-xl bg-white shadow-lg max-h-48 overflow-y-auto">
          {filtered.length > 0 ? (
            filtered.map((k) => (
              <button
                key={k}
                onClick={() => {
                  onChange(k);
                  setOpen(false);
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-[#f1f5ff]"
              >
                {k}
              </button>
            ))
          ) : (
            <div className="px-4 py-2 text-sm text-gray-400">
              No matches
            </div>
          )}
        </div>
      )}
    </div>
  );
}
