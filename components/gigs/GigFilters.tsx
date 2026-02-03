"use client";

import React, { useState, useRef, useEffect } from "react";
import DatePicker from "@/components/jobs/DatePicker";

interface GigFiltersProps {
    location: string;
    setLocation: (val: string) => void;
    payRange: [number, number];
    setPayRange: (val: [number, number]) => void;
    date: string;
    setDate: (val: string) => void;
    selectedCategory: string; // From sidebar
    setSelectedCategory: (val: string) => void;
    onApply: () => void;
    onClear: () => void;
    minPay?: number; // Optional prop for slider min
    maxPay?: number; // Optional prop for slider max
    categories: string[]; // Dynamic categories from parent
}

// Custom Dropdown Component
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
                            {searchable ? "All Locations" : "All Categories"}
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


const GigFilters: React.FC<GigFiltersProps> = ({
    location,
    setLocation,
    payRange,
    setPayRange,
    date,
    setDate,
    selectedCategory,
    setSelectedCategory,
    onApply,
    onClear,
    minPay = 0,   // Default to 0
    maxPay = 500, // Default to 500
    categories = [] // Default empty
}) => {
    // Categories for the sidebar dropdown/list
    // Hardcoded categories removed. Now using props.

    const districts = [
        "Ampara", "Anuradhapura", "Badulla", "Batticaloa", "Colombo",
        "Galle", "Gampaha", "Hambantota", "Jaffna", "Kalutara",
        "Kandy", "Kegalle", "Kilinochchi", "Kurunegala", "Mannar",
        "Matale", "Matara", "Monaragala", "Mullaitivu", "Nuwara Eliya",
        "Polonnaruwa", "Puttalam", "Ratnapura", "Trincomalee", "Vavuniya"
    ];

    // Helper to calculate percentage safely
    const getPercent = (value: number) => {
        if (maxPay === minPay) return 0;
        return Math.round(((value - minPay) / (maxPay - minPay)) * 100);
    };

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm h-fit w-full max-w-xs">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
                    </svg>
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Filters</h2>
                    <p className="text-xs text-gray-500">Refine your job search</p>
                </div>
            </div>

            {/* Location */}
            <div className="mb-6">
                <label className="block text-sm font-bold text-gray-900 mb-2">Location</label>
                <CustomSelect
                    value={location}
                    onChange={setLocation}
                    options={districts}
                    placeholder="All Locations"
                    searchable={true}
                />
            </div>

            {/* Pay Rate Slider */}
            <div className="mb-6">
                <label className="block text-sm font-bold text-gray-900 mb-2">Pay Rate</label>
                <div className="relative pt-6 pb-2">
                    {/* Custom Dual Slider Impl */}
                    <div className="relative h-2 bg-gray-200 rounded-full">
                        <div
                            className="absolute h-full bg-[#6b8bff] rounded-full opacity-80"
                            style={{
                                left: `${getPercent(payRange[0])}%`,
                                width: `${getPercent(payRange[1]) - getPercent(payRange[0])}%`
                            }}
                        ></div>

                        {/* Min Thumb */}
                        <input
                            type="range"
                            min={minPay}
                            max={maxPay}
                            value={payRange[0]}
                            onChange={(e) => {
                                const val = Math.min(Number(e.target.value), payRange[1] - 1);
                                setPayRange([val, payRange[1]]);
                            }}
                            className="absolute w-full h-full opacity-0 cursor-pointer z-10 top-0"
                        />
                        {/* Max Thumb */}
                        <input
                            type="range"
                            min={minPay}
                            max={maxPay}
                            value={payRange[1]}
                            onChange={(e) => {
                                const val = Math.max(Number(e.target.value), payRange[0] + 1);
                                setPayRange([payRange[0], val]);
                            }}
                            className="absolute w-full h-full opacity-0 cursor-pointer z-20 top-0"
                        />

                        {/* Visible Thumbs (Decoration) */}
                        <div
                            className="absolute w-4 h-4 bg-[#6b8bff] rounded-full shadow border-2 border-white top-1/2 -translate-y-1/2 pointer-events-none"
                            style={{ left: `${getPercent(payRange[0])}%` }}
                        ></div>
                        <div
                            className="absolute w-4 h-4 bg-[#6b8bff] rounded-full shadow border-2 border-white top-1/2 -translate-y-1/2 pointer-events-none"
                            style={{ left: `${getPercent(payRange[1])}%` }}
                        ></div>

                    </div>
                    <div className="flex justify-between items-center mt-3 text-sm font-medium text-gray-700">
                        <span>${payRange[0]}/hr</span>
                        <span>${payRange[1]}/hr</span>
                    </div>
                </div>
            </div>

            {/* Job Category */}
            <div className="mb-6">
                <label className="block text-sm font-bold text-gray-900 mb-2">Job Category</label>
                <CustomSelect
                    value={selectedCategory === "All Jobs" || selectedCategory === "All Categories" ? "" : selectedCategory}
                    onChange={setSelectedCategory}
                    options={categories}
                    placeholder="All Categories"
                    searchable={false}
                />
            </div>

            {/* Date */}
            <div className="mb-8">
                <label className="block text-sm font-bold text-gray-900 mb-2">Date</label>
                <div className="relative">
                    <DatePicker value={date} onChange={setDate} />
                </div>
            </div>

            {/* Buttons */}
            <div className="space-y-3">
                <button
                    onClick={onApply}
                    className="w-full bg-[#6b8bff] hover:bg-[#5a7ae0] text-white font-bold py-3 rounded-xl transition-colors shadow-sm shadow-blue-200"
                >
                    Apply Filters
                </button>
                <button
                    onClick={onClear}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-black font-bold py-3 rounded-xl transition-colors"
                >
                    Clear Filters
                </button>
            </div>
        </div>
    );
};

export default GigFilters;
