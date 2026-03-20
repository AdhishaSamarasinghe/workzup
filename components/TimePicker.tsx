/* eslint-disable */
"use client";

/**
 * TimePicker.tsx — Click-based time picker (12-hour format with AM/PM)
 */

import { useEffect, useMemo, useRef, useState } from "react";

interface TimePickerProps {
    value: string; // Expected: "HH:mm AM/PM" e.g. "09:30 AM"
    onChange: (val: string) => void;
    label?: string;
}

type TimeParts = {
    h: string;
    m: string;
    p: "AM" | "PM";
};

const parseTime = (val: string): TimeParts => {
    if (!val) return { h: "07", m: "00", p: "AM" };

    const match = val.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!match) return { h: "07", m: "00", p: "AM" };

    const hour = Math.min(12, Math.max(1, Number(match[1]))).toString().padStart(2, "0");
    const minute = Math.min(59, Math.max(0, Number(match[2]))).toString().padStart(2, "0");
    const period = match[3].toUpperCase() === "PM" ? "PM" : "AM";

    return { h: hour, m: minute, p: period };
};

const formatTime = (time: TimeParts) => `${time.h}:${time.m} ${time.p}`;

const stepWithin = (items: string[], current: string, delta: number) => {
    const currentIndex = Math.max(0, items.indexOf(current));
    const nextIndex = (currentIndex + delta + items.length) % items.length;
    return items[nextIndex];
};

export default function TimePicker({ value, onChange, label }: TimePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isPicking, setIsPicking] = useState(false);
    const [draftTime, setDraftTime] = useState<TimeParts>(parseTime(value));
    const containerRef = useRef<HTMLDivElement>(null);
    const pickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const hours = useMemo(
        () => Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, "0")),
        []
    );
    const minutes = useMemo(
        () => Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, "0")),
        []
    );

    const pulse = () => {
        setIsPicking(true);
        if (pickTimerRef.current) clearTimeout(pickTimerRef.current);
        pickTimerRef.current = setTimeout(() => {
            setIsPicking(false);
            pickTimerRef.current = null;
        }, 180);
    };

    const commitTime = (next: TimeParts) => {
        setDraftTime(next);
        onChange(formatTime(next));
        pulse();
    };

    const updateHour = (delta: number) => {
        commitTime({ ...draftTime, h: stepWithin(hours, draftTime.h, delta) });
    };

    const updateMinute = (delta: number) => {
        commitTime({ ...draftTime, m: stepWithin(minutes, draftTime.m, delta) });
    };

    const setPeriod = (period: "AM" | "PM") => {
        if (draftTime.p === period) return;
        commitTime({ ...draftTime, p: period });
    };

    useEffect(() => {
        if (!isOpen) {
            setDraftTime(parseTime(value));
        }
    }, [value, isOpen]);

    // Close on outside click.
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        return () => {
            if (pickTimerRef.current) clearTimeout(pickTimerRef.current);
        };
    }, []);

    return (
        <div className="relative w-full" ref={containerRef}>
            {label && <label className="block text-sm font-semibold text-slate-800 mb-2">{label}</label>}

            <div
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between h-11 px-3 border border-slate-300 rounded-xl bg-white cursor-pointer hover:border-slate-400 transition-all duration-200 focus-within:ring-2 focus-within:ring-blue-200"
            >
                <span className={`text-slate-900 font-medium transition-transform duration-200 ${isPicking ? "scale-105" : "scale-100"}`}>
                    {value || "06:00 AM"}
                </span>
                <svg className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-12" : "rotate-0"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>

            <div
                className={`absolute z-[100] top-full left-0 mt-2 w-full bg-white border border-slate-200 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden origin-top transition-all duration-200 ${isOpen ? "opacity-100 translate-y-0 scale-100 pointer-events-auto" : "opacity-0 -translate-y-1 scale-95 pointer-events-none"}`}
                aria-hidden={!isOpen}
            >
                <div className="p-4 grid grid-cols-3 gap-3 bg-white">
                    <div className="rounded-xl border border-slate-200 p-2">
                        <div className="text-[11px] font-bold tracking-wider text-slate-500 text-center mb-2">HOUR</div>
                        <button type="button" onClick={() => updateHour(1)} className="w-full h-8 rounded-lg hover:bg-slate-100 text-slate-700 transition">+</button>
                        <div className="h-12 flex items-center justify-center text-xl font-black text-slate-900">{draftTime.h}</div>
                        <button type="button" onClick={() => updateHour(-1)} className="w-full h-8 rounded-lg hover:bg-slate-100 text-slate-700 transition">-</button>
                    </div>

                    <div className="rounded-xl border border-slate-200 p-2">
                        <div className="text-[11px] font-bold tracking-wider text-slate-500 text-center mb-2">MIN</div>
                        <button type="button" onClick={() => updateMinute(1)} className="w-full h-8 rounded-lg hover:bg-slate-100 text-slate-700 transition">+</button>
                        <div className="h-12 flex items-center justify-center text-xl font-black text-slate-900">{draftTime.m}</div>
                        <button type="button" onClick={() => updateMinute(-1)} className="w-full h-8 rounded-lg hover:bg-slate-100 text-slate-700 transition">-</button>
                    </div>

                    <div className="rounded-xl border border-slate-200 p-2">
                        <div className="text-[11px] font-bold tracking-wider text-slate-500 text-center mb-2">PERIOD</div>
                        <div className="h-[88px] grid grid-rows-2 gap-2">
                            <button
                                type="button"
                                onClick={() => setPeriod("AM")}
                                className={`w-full rounded-lg font-bold text-sm transition ${draftTime.p === "AM" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
                            >
                                AM
                            </button>
                            <button
                                type="button"
                                onClick={() => setPeriod("PM")}
                                className={`w-full rounded-lg font-bold text-sm transition ${draftTime.p === "PM" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
                            >
                                PM
                            </button>
                        </div>
                    </div>
                </div>

                <div className="px-4 pb-3 flex items-center gap-2">
                    {["00", "15", "30", "45"].map((minute) => (
                        <button
                            key={minute}
                            type="button"
                            onClick={() => commitTime({ ...draftTime, m: minute })}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold border transition ${draftTime.m === minute ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"}`}
                        >
                            :{minute}
                        </button>
                    ))}
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
        </div>
    );
}
