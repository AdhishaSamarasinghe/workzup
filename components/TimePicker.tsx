"use client";

import { useState, useRef, useEffect } from "react";

interface WheelProps {
    items: string[];
    value: string;
    onChange: (val: string) => void;
}

const Wheel = ({ items, value, onChange }: WheelProps) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const itemHeight = 40; // px
    const [isScrolling, setIsScrolling] = useState(false);

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

    const handleScroll = (e: any) => {
        const scrollTop = e.currentTarget.scrollTop;
        const index = Math.round(scrollTop / itemHeight);
        if (items[index] !== undefined && items[index] !== value) {
            onChange(items[index]);
        }
    };

    return (
        <div
            className="h-[120px] overflow-y-scroll scrollbar-hide snap-y snap-mandatory relative scroll-smooth focus:outline-none"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            ref={scrollRef}
            onScroll={handleScroll}
            onMouseDown={() => setIsScrolling(true)}
            onMouseUp={() => setIsScrolling(false)}
            onTouchStart={() => setIsScrolling(true)}
            onTouchEnd={() => setIsScrolling(false)}
        >
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

interface TimePickerProps {
    value: string; // "HH:mm AM/PM"
    onChange: (val: string) => void;
    label?: string;
}

export default function TimePicker({ value, onChange, label }: TimePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Initial state from value prop
    // Expected format: "06:30 PM" or "06:30" (if using 24h fallback)
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

    const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
    const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));
    const periods = ["AM", "PM"];

    const updateTime = (newTime: any) => {
        onChange(`${newTime.h}:${newTime.m} ${newTime.p}`);
    };

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

            <div
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between h-11 px-3 border border-slate-300 rounded-xl bg-white cursor-pointer hover:border-slate-400 transition-all focus-within:ring-2 focus-within:ring-blue-200"
            >
                <span className="text-slate-900 font-medium">{value || "07:00 AM"}</span>
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>

            {isOpen && (
                <div className="absolute z-[100] top-full left-0 mt-2 w-full bg-white border border-slate-200 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden animate-in fade-in zoom-in duration-200">
                    <div className="relative p-4 flex items-center bg-white">
                        {/* The highlight band */}
                        <div className="absolute left-3 right-3 top-1/2 -translate-y-1/2 h-10 bg-slate-50 border-y border-slate-100 rounded-lg pointer-events-none"></div>

                        <div className="flex-1 relative z-10">
                            <Wheel
                                items={hours}
                                value={time.h}
                                onChange={(h) => updateTime({ ...time, h })}
                            />
                        </div>
                        <div className="text-slate-900 font-bold relative z-10 -mt-1">:</div>
                        <div className="flex-1 relative z-10">
                            <Wheel
                                items={minutes}
                                value={time.m}
                                onChange={(m) => updateTime({ ...time, m })}
                            />
                        </div>
                        <div className="flex-1 relative z-10 pl-2">
                            <Wheel
                                items={periods}
                                value={time.p}
                                onChange={(p) => updateTime({ ...time, p })}
                            />
                        </div>
                    </div>

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
