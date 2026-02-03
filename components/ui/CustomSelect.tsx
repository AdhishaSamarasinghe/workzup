"use client";

import React, { useState, useRef, useEffect } from "react";

interface CustomSelectProps {
    value: string;
    onChange: (val: string) => void;
    options: string[];
    placeholder?: string;
    searchable?: boolean;
}

const CustomSelect: React.FC<CustomSelectProps> = ({ value, onChange, options, placeholder = "Select...", searchable = false }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);

    const filteredOptions = options.filter(opt =>
        opt.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        // Close dropdown on click outside
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Trigger Button */}
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm bg-white flex items-center justify-between cursor-pointer focus:border-blue-500 hover:border-blue-400 transition-colors"
            >
                <span className={!value ? "text-gray-500" : "text-gray-900"}>
                    {value || placeholder}
                </span>
                <svg className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </div>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute z-50 mt-2 w-full bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden text-sm animate-fade-in-down">
                    {searchable && (
                        <div className="p-2 border-b border-gray-50 bg-gray-50/50">
                            <input
                                type="text"
                                placeholder="Search..."
                                className="w-full rounded-lg bg-gray-100 border-none py-2 px-3 text-xs outline-none focus:ring-1 focus:ring-blue-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                autoFocus
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                    )}

                    <div className="max-h-60 overflow-y-auto custom-scrollbar">
                        {/* "All" Option */}
                        <div
                            className={`px-4 py-3 cursor-pointer hover:bg-blue-50 transition-colors ${value === "" ? "bg-blue-50 text-blue-600 font-medium" : "text-gray-700"}`}
                            onClick={() => {
                                onChange("");
                                setIsOpen(false);
                                setSearchTerm("");
                            }}
                        >
                            {searchable ? "All Locations" : "All Options"}
                        </div>

                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((opt) => (
                                <div
                                    key={opt}
                                    className={`px-4 py-3 cursor-pointer hover:bg-blue-50 transition-colors ${value === opt ? "bg-blue-50 text-blue-600 font-medium" : "text-gray-700"}`}
                                    onClick={() => {
                                        onChange(opt);
                                        setIsOpen(false);
                                        setSearchTerm("");
                                    }}
                                >
                                    {opt}
                                </div>
                            ))
                        ) : (
                            <div className="px-4 py-3 text-gray-400 text-center italic">No results found</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomSelect;
