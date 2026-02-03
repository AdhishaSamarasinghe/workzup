"use client";

import React, { useState, useEffect } from "react";

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
}

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
}) => {
    // Categories for the sidebar dropdown/list
    const categories = ["All Categories", "Hospitality", "Events", "Logistics", "Retail"];

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
                <div className="relative">
                    <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="City or zip code"
                        className="w-full rounded-xl border border-gray-200 pl-4 pr-10 py-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                    <svg
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </div>
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
                <div className="relative">
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full appearance-none rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
                    >
                        {categories.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Date */}
            <div className="mb-8">
                <label className="block text-sm font-bold text-gray-900 mb-2">Date</label>
                <div className="relative">
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-500"
                    />
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
