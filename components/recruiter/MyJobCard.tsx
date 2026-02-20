"use client";

import React, { useState, useRef, useEffect } from "react";

interface MyJobCardProps {
    title: string;
    location: string;
    status: string;
    newApplicants: number;
    totalApplicants: number;
    postedDate: string;
    jobDate: string;
    pay: string;
    onEdit: () => void;
    onViewApplicants: () => void;
    onStatusChange: (status: string) => void;
    isDropdownOpen?: boolean;
    onToggleDropdown?: () => void;
}

const MyJobCard: React.FC<MyJobCardProps> = ({
    title,
    location,
    status,
    newApplicants,
    totalApplicants,
    postedDate,
    jobDate,
    pay,
    onEdit,
    onViewApplicants,
    onStatusChange,
    isDropdownOpen = false,
    onToggleDropdown
}) => {
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (isDropdownOpen && dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                if (onToggleDropdown) onToggleDropdown();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isDropdownOpen, onToggleDropdown]);

    const statuses = ["PUBLIC", "DRAFT", "PRIVATE", "CLOSED"];

    const getStatusColor = (status: string) => {
        switch (status.toUpperCase()) {
            case "PUBLIC": return "bg-green-100 text-green-700 hover:bg-green-200";
            case "DRAFT": return "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"; // Changed to yellow/orange as per request
            case "PRIVATE": return "bg-purple-100 text-purple-700 hover:bg-purple-200";
            case "CLOSED": return "bg-red-100 text-red-700 hover:bg-red-200";
            default: return "bg-gray-100 text-gray-700 hover:bg-gray-200";
        }
    };

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (onToggleDropdown) onToggleDropdown();
                                }}
                                className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-2 transition-colors ${getStatusColor(status)}`}
                            >
                                {status.toUpperCase()}
                                <svg className={`w-3 h-3 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {isDropdownOpen && (
                                <div className="absolute top-full left-0 mt-2 w-32 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-10 animate-fade-in">
                                    {statuses.map((s) => {
                                        const isPublic = s === "PUBLIC";
                                        const isPastDate = new Date(jobDate) < new Date(new Date().setHours(0, 0, 0, 0));
                                        const isDisabled = isPublic && isPastDate;

                                        return (
                                            <button
                                                key={s}
                                                disabled={isDisabled}
                                                onClick={() => {
                                                    if (isDisabled) return;
                                                    onStatusChange(s);
                                                    if (onToggleDropdown) onToggleDropdown();
                                                }}
                                                className={`w-full text-left px-4 py-2 text-xs font-bold flex items-center justify-between 
                                                    ${s === status.toUpperCase() ? 'text-blue-600 bg-blue-50' : 'text-gray-600'}
                                                    ${isDisabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'hover:bg-gray-50'}
                                                `}
                                                title={isDisabled ? "Cannot make past job public" : ""}
                                            >
                                                {s}
                                                {s === status.toUpperCase() && (
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                    <p className="text-sm text-gray-500">{location}</p>
                </div>

                <div className="text-sm mt-2 md:mt-0">
                    <span className="text-blue-600 font-bold">{newApplicants} new</span>
                    <span className="text-gray-400"> / Total {totalApplicants} Applicants</span>
                </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                <div className="flex flex-wrap gap-6 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>Posted : {postedDate}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>Job date : {jobDate}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{pay}</span>
                    </div>
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                    <button
                        onClick={onEdit}
                        className="flex-1 md:flex-none px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                    >
                        Edit job
                    </button>
                    <button
                        onClick={onViewApplicants}
                        className="flex-1 md:flex-none px-4 py-2 bg-[#6b8bff] text-white font-medium rounded-xl hover:bg-[#5a7ae0] transition-colors shadow-sm shadow-blue-200"
                    >
                        View Applicants
                    </button>
                </div>
            </div>
        </div >
    );
};

export default MyJobCard;
