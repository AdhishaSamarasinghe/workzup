"use client";

/**
 * TimePicker.tsx — Scroll-wheel time picker (12-hour format with AM/PM)
 *
 */


import { useState, useRef, useEffect } from "react";


interface WheelProps {
    items: string[];
    value: string;
    onChange: (val: string) => void;
}

/**
 * Wheel — a single scrollable drum column.

 */
const Wheel = ({ items, value, onChange }: WheelProps) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const itemHeight = 40; // px — must match the h-[40px] class on each item
    const [isScrolling, setIsScrolling] = useState(false);

    // Sync scroll position to the controlled `value` prop.
    // Skipped while the user is actively dragging to avoid jank.
    useEffect(() => {
        if (isScrolling) return;
        const index = items.indexOf(value);
        if (index !== -1 && scrollRef.current) {
            scrollRef.current.scrollTo({
                top: index * itemHeight,
                behavior: 'smooth'
            });
        }
    }, [items, value, isScrolling]);

    // Derive the selected item from scroll position and fire onChange.
    // Math.round snaps to the nearest item rather than the topmost visible one.
    const handleScroll = (e: any) => {
        const scrollTop = e.currentTarget.scrollTop;
        const index = Math.round(scrollTop / itemHeight);
        if (items[index] !== undefined && items[index] !== value) {
            onChange(items[index]);
        }
    };

    return (
        // scrollbar-hide + snap-y gives the iOS-style drum-roll feel
        <div
            className="h-[120px] overflow-y-scroll scrollbar-hide snap-y snap-mandatory relative scroll-smooth focus:outline-none"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            ref={scrollRef}
            onScroll={handleScroll}
            // Track drag state so the useEffect sync doesn't interrupt the user
            onMouseDown={() => setIsScrolling(true)}
            onMouseUp={() => setIsScrolling(false)}
            onTouchStart={() => setIsScrolling(true)}
            onTouchEnd={() => setIsScrolling(false)}
        >
            {/* py-[40px] padding creates blank space above/below so the first/last
                items can be centered in the visible window */}
            <div className="py-[40px]">
                {items.map((item) => {
                    const isActive = item === value;
                    return (
                        <div
                            key={item}
                            className={`h-[40px] flex items-center justify-center snap-center transition-all duration-300 ${isActive
                                ? "text-[#1e293b] font-bold text-lg scale-110"
                                : "text-slate-400 opacity-30 text-base scale-95"
                                }`}
                        >
                            {item}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// TimePicker 
interface TimePickerProps {
    value: string; // Expected: "HH:mm AM/PM" e.g. "09:30 AM"
    onChange: (val: string) => void;
    label?: string;
}

export default function TimePicker({ value, onChange, label }: TimePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Parse the controlled value string into { h, m, p } parts.
    
    const parseTime = (val: string) => {
        if (!val) return { h: "07", m: "00", p: "AM" };
        const parts = val.split(/[: ]/);
        return {
            h: parts[0]?.padStart(2, '0') || "07",
            m: parts[1]?.padStart(2, '0') || "00",
            p: parts[2] || "AM"
        };
    };

    const time = parseTime(value);

    
    //  12-hour clock: hours 01–12, minutes 00–59, period AM/PM
    const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
    const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));
    const periods = ["AM", "PM"];

    // Reconstruct the time string and propagate to parent form state
    const updateTime = (newTime: any) => {
        onChange(`${newTime.h}:${newTime.m} ${newTime.p}`);
    };

    //  Close the picker when the user clicks outside the container
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative w-full" ref={containerRef}>
            {label && <label className="block text-sm font-semibold text-slate-800 mb-2">{label}</label>}

            {/* Trigger button — shows current value or placeholder */}
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between h-11 px-3 border border-slate-300 rounded-xl bg-white cursor-pointer hover:border-slate-400 transition-all focus-within:ring-2 focus-within:ring-blue-200"
            >
                <span className="text-slate-900 font-medium">{value || "06:00 AM"}</span>
                {/* Clock icon */}
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>

            {/*  Dropdown panel — three Wheel columns for H / M / AM-PM */}
            {isOpen && (
                <div className="absolute z-[100] top-full left-0 mt-2 w-full bg-white border border-slate-200 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden animate-in fade-in zoom-in duration-200">
                    <div className="relative p-4 flex items-center bg-white">
                        {/* Visual highlight band behind the selected row */}
                        <div className="absolute left-3 right-3 top-1/2 -translate-y-1/2 h-10 bg-slate-50 border-y border-slate-100 rounded-lg pointer-events-none"></div>

                        {/* Hours wheel */}
                        <div className="flex-1 relative z-10">
                            <Wheel
                                items={hours}
                                value={time.h}
                                onChange={(h) => updateTime({ ...time, h })}
                            />
                        </div>
                        <div className="text-slate-900 font-bold relative z-10 -mt-1">:</div>
                        {/* Minutes wheel */}
                        <div className="flex-1 relative z-10">
                            <Wheel
                                items={minutes}
                                value={time.m}
                                onChange={(m) => updateTime({ ...time, m })}
                            />
                        </div>
                        {/* AM/PM wheel */}
                        <div className="flex-1 relative z-10 pl-2">
                            <Wheel
                                items={periods}
                                value={time.p}
                                onChange={(p) => updateTime({ ...time, p })}
                            />
                        </div>
                    </div>

                    {/* Done button closes the picker */}
                    <div className="p-3 border-t border-slate-100 bg-white flex justify-end">
                        <button
                            onClick={() => setIsOpen(false)}
                            className="bg-[#2952FF] text-white font-bold text-xs uppercase tracking-wider px-6 py-2 rounded-full hover:bg-blue-700 transition-colors shadow-sm"
                        >
                            Done
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
