import React from "react";

interface GigCardProps {
    title: string;
    company: string;
    location: string;
    pay: string;
    date: string;
    description: string;
    category: string;
}

const GigCard: React.FC<GigCardProps> = ({
    title,
    company,
    location,
    pay,
    date,
    description,
    category,
}) => {
    // Determine color based on category for the tag
    const getCategoryColor = (cat: string = "") => {
        switch (cat?.toLowerCase() || "") {
            case "event":
                return "bg-emerald-50 text-emerald-700";
            case "hospitality":
                return "bg-emerald-50 text-emerald-700";
            case "logistics":
                return "bg-emerald-50 text-emerald-700";
            default:
                return "bg-blue-50 text-blue-700";
        }
    };

    return (
        <div className="rounded-[28px] border border-slate-200 bg-white px-6 py-6 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
            <div className="mb-3 flex items-start justify-between gap-5">
                <div className="min-w-0">
                    <h3 className="text-2xl font-bold tracking-tight text-gray-900">{title}</h3>
                    <p className="mt-1 text-sm font-medium text-gray-500">{company}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-sm font-semibold ${getCategoryColor(category)}`}>
                    {category}
                </span>
            </div>

            <p className="mb-6 text-sm leading-7 text-gray-500">
                {description}
            </p>

            <div className="flex flex-col gap-5 border-t border-slate-100 pt-5 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-gray-700">
                    <div className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-2">
                        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {location}
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-2">
                        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {pay}
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-2">
                        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {date}
                    </div>
                </div>

                <button className="rounded-xl bg-[#6b8bff] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#5a7ae0]">
                    View Details
                </button>
            </div>
        </div>
    );
};

export default GigCard;
