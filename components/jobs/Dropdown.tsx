"use client";

import { useEffect, useRef, useState } from "react";

interface DropdownProps {
  label: string;
  options: string[];
  value?: string;
  onChange?: (value: string) => void;
  loading?: boolean;
}

export default function Dropdown({
  label,
  options,
  value = "",
  onChange,
  loading = false,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filteredOptions = options.filter((opt) =>
    opt.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div ref={dropdownRef} className="relative w-full">
      {/* Button */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full rounded-xl bg-gray-100 px-4 py-3 text-left text-sm text-gray-700 outline-none focus:ring-2 focus:ring-[#6b8bff]"
      >
        {value || label}
      </button>

      {/* Dropdown menu */}
      {open && (
        <div className="absolute z-30 mt-2 w-full rounded-xl bg-white shadow-lg">
          {/* Search */}
          <div className="p-3 border-b">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full rounded-lg bg-gray-100 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#6b8bff]"
            />
          </div>

          {/* Options */}
          <div className="max-h-56 overflow-y-auto p-2 space-y-1">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-8 rounded-md bg-gray-200 animate-pulse"
                />
              ))
            ) : filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-400">
                No results
              </div>
            ) : (
              filteredOptions.map((opt) => (
                <button
                  key={opt}
                  onClick={() => {
                    onChange?.(opt);
                    setOpen(false);
                    setSearch("");
                  }}
                  className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-[#f1f5ff]"
                >
                  {opt}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
