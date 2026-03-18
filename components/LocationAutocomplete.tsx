"use client";

import { useState, useEffect, useRef } from "react";

interface LocationResult {
  lat: string;
  lon: string;
  display_name: string;
}

interface LocationAutocompleteProps {
  value: string;
  onChange: (address: string) => void;
  onSelect: (lat: number, lng: number, address: string) => void;
}

export default function LocationAutocomplete({ value, onChange, onSelect }: LocationAutocompleteProps) {
  const [results, setResults] = useState<LocationResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchLocations = async () => {
      if (!value || value.length < 3) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}&limit=5`);
        const data = await res.json();
        setResults(data);
        setIsOpen(true);
      } catch (err) {
        console.error("Geocoding error:", err);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchLocations, 500);
    return () => clearTimeout(debounceTimer);
  }, [value]);

  return (
    <div ref={wrapperRef} className="relative w-full">
      <input
        type="text"
        name="companyAddress"
        required
        placeholder="Company Location *"
        className="block w-full rounded-md border-0 bg-[#E0E0E0] py-3.5 pl-4 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#6B8BFF] sm:text-[15px] sm:leading-6 transition-all shadow-sm"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setIsOpen(true);
        }}
        autoComplete="off"
      />
      {loading && (
        <div className="absolute right-3 top-4">
          <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
          </svg>
        </div>
      )}
      {isOpen && results.length > 0 && (
        <ul className="absolute z-10 w-full mt-1 bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
          {results.map((r, idx) => (
            <li
              key={idx}
              className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-gray-100 text-gray-900"
              onClick={() => {
                onSelect(parseFloat(r.lat), parseFloat(r.lon), r.display_name);
                setIsOpen(false);
              }}
            >
              <div className="flex items-center">
                <span className="font-normal block truncate">{r.display_name}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
