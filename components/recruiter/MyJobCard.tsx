"use client";

import React from "react";

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
    onViewApplicants
}) => {

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case "active": return "bg-green-100 text-green-700";
            case "pending": return "bg-yellow-100 text-yellow-700";
            case "completed": return "bg-gray-200 text-gray-700";
            default: return "bg-blue-100 text-blue-700";
        }
    };

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${getStatusColor(status)}`}>
                            {status}
                        </span>
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
        </div>
    );
};

export default MyJobCard;
