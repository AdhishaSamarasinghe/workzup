"use client";

import React from "react";
import CustomSelect from "@/components/ui/CustomSelect";

interface MyJobsHeaderProps {
    searchQuery: string;
    setSearchQuery: (val: string) => void;
    statusFilter: string;
    setStatusFilter: (val: string) => void;
}

const MyJobsHeader: React.FC<MyJobsHeaderProps> = ({
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
}) => {
    return (
        <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-8">My Job Postings</h1>

            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                {/* Search Bar */}
                <div className="relative w-full md:max-w-md">
                    <input
                        type="text"
                        placeholder="Search a job title..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 text-sm"
                    />
                    <svg
                        className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>

                {/* Status Filter */}
                <div className="w-full md:w-48">
                    <CustomSelect
                        value={statusFilter}
                        onChange={setStatusFilter}
                        options={["All Status", "Active", "Pending", "Completed"]}
                        placeholder="All Status"
                        showAllOption={false}
                    />
                </div>
            </div>
        </div>
    );
};

export default MyJobsHeader;
