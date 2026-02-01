"use client";

import { useState, useRef, useEffect } from "react";

type Props = {
  label: string;
  options: string[];
};

export default function Dropdown({ label, options }: Props) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(label);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div
      ref={dropdownRef}
      className="relative min-w-36
"
    >
      {/* Button */}
      <button
        onClick={() => setOpen(!open)}
        className="bg-gray-50 rounded-xl px-4 py-2 w-full text-left hover:scale-[1.02] transition flex justify-between items-center"
      >
        {selected}
        <span>▾</span>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute mt-2 w-full bg-white rounded-xl shadow-md border z-50 overflow-hidden">
          {options.map((option, i) => (
            <div
              key={i}
              onClick={() => {
                setSelected(option);
                setOpen(false);
              }}
              className="px-4 py-2 hover:bg-[#6b8bff] hover:text-white cursor-pointer transition"
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
