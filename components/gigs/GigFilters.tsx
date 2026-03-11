"use client";

import React from "react";
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
    onClear: () => void;
    minPay?: number; // Optional prop for slider min
    maxPay?: number; // Optional prop for slider max
    categories: string[]; // Dynamic categories from parent
}

import CustomSelect from "@/components/ui/CustomSelect";


const GigFilters: React.FC<GigFiltersProps> = ({
    location,
    setLocation,
    payRange,
    setPayRange,
    date,
    setDate,
    selectedCategory,
    setSelectedCategory,
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

    const safeMin = Math.max(minPay, Math.min(payRange[0], maxPay));
    const safeMax = Math.max(safeMin + 1, Math.min(payRange[1], maxPay));

    return (
        <div className="h-fit w-full rounded-[30px] border border-white/70 bg-white/90 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur-sm">
            <div className="mb-8 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
                    </svg>
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Filters</h2>
                    <p className="text-xs uppercase tracking-[0.16em] text-gray-500">Refine your job search</p>
                </div>
            </div>

            {/* Location */}
            <div className="mb-6">
                <label className="mb-2 block text-sm font-bold text-gray-900">Location</label>
                <CustomSelect
                    value={location}
                    onChange={setLocation}
                    options={districts}
                    placeholder="All Locations"
                    searchable={true}
                />
            </div>

            {/* Pay Rate Slider */}
            <div className="mb-6 rounded-2xl bg-slate-50 px-4 py-4">
                <label className="mb-2 block text-sm font-bold text-gray-900">Pay Rate</label>
                <div className="relative px-2 pb-2 pt-6">
                    <div className="relative h-2 rounded-full bg-gray-200">
                        <div
                            className="absolute h-full rounded-full bg-[#6b8bff] opacity-80"
                            style={{
                                left: `${getPercent(safeMin)}%`,
                                width: `${getPercent(safeMax) - getPercent(safeMin)}%`
                            }}
                        ></div>

                        <input
                            type="range"
                            min={minPay}
                            max={maxPay}
                            value={safeMin}
                            onChange={(e) => {
                                const val = Math.min(Number(e.target.value), safeMax - 1);
                                setPayRange([val, safeMax]);
                            }}
                            className="range-slider absolute left-0 top-1/2 z-20 h-4 w-full -translate-y-1/2 appearance-none bg-transparent"
                        />
                        <input
                            type="range"
                            min={minPay}
                            max={maxPay}
                            value={safeMax}
                            onChange={(e) => {
                                const val = Math.max(Number(e.target.value), safeMin + 1);
                                setPayRange([safeMin, val]);
                            }}
                            className="range-slider absolute left-0 top-1/2 z-30 h-4 w-full -translate-y-1/2 appearance-none bg-transparent"
                        />

                    </div>
                    <div className="mt-3 flex items-center justify-between text-sm font-medium text-gray-700">
                        <span>${safeMin}/hr</span>
                        <span>${safeMax}/hr</span>
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
                <label className="mb-2 block text-sm font-bold text-gray-900">Date</label>
                <div className="relative">
                    <DatePicker value={date} onChange={setDate} />
                </div>
            </div>

            {/* Buttons */}
            <div className="space-y-3 border-t border-slate-200 pt-5">
                <button
                    onClick={onClear}
                    className="w-full rounded-xl bg-gray-100 py-3 font-bold text-black transition-colors hover:bg-gray-200"
                >
                    Clear Filters
                </button>
            </div>

            <style jsx>{`
                .range-slider {
                    pointer-events: none;
                }

                .range-slider::-webkit-slider-thumb {
                    appearance: none;
                    height: 18px;
                    width: 18px;
                    border-radius: 9999px;
                    background: #6b8bff;
                    border: 3px solid #ffffff;
                    box-shadow: 0 4px 10px rgba(107, 139, 255, 0.28);
                    cursor: pointer;
                    pointer-events: auto;
                }

                .range-slider::-moz-range-thumb {
                    height: 18px;
                    width: 18px;
                    border-radius: 9999px;
                    background: #6b8bff;
                    border: 3px solid #ffffff;
                    box-shadow: 0 4px 10px rgba(107, 139, 255, 0.28);
                    cursor: pointer;
                    pointer-events: auto;
                }

                .range-slider::-webkit-slider-runnable-track {
                    height: 8px;
                    background: transparent;
                }

                .range-slider::-moz-range-track {
                    height: 8px;
                    background: transparent;
                }
            `}</style>
        </div>
    );
};

export default GigFilters;
