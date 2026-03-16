import React from "react";
import CustomSelect from "@/components/ui/CustomSelect";

interface GigHeaderProps {
    resultCount: number;
    activeTab: string;
    tabs: string[];
    setActiveTab: (tab: string) => void;
    sortBy: string;
    setSortBy: (sort: string) => void;
}

const GigHeader: React.FC<GigHeaderProps> = ({
    resultCount,
    activeTab,
    tabs,
    setActiveTab,
    sortBy,
    setSortBy,
}) => {
    return (
        <div>
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-2xl">
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#6b8bff]">
                        Gig Search
                    </p>
                    <h1 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                        Find Your Next Gig
                    </h1>
                    <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">
                        Browse short-term opportunities, refine results with filters, and sort the list the way you prefer.
                    </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-[0_12px_28px_rgba(15,23,42,0.1)]">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Available Results</p>
                    <p className="mt-2 text-3xl font-bold text-slate-900">{resultCount}</p>
                </div>
            </div>

            <div className="mt-8 flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex flex-wrap gap-3">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`rounded-full px-5 py-2.5 text-sm font-medium transition-all ${activeTab === tab
                            ? "bg-slate-900 text-white shadow-sm"
                            : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100"
                            }`}
                    >
                        {tab}
                    </button>
                ))}
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <p className="text-sm text-gray-500">
                        Showing <span className="font-bold text-gray-900">{resultCount}</span> result
                    </p>
                    <div className="w-48">
                        <CustomSelect
                            value={sortBy}
                            onChange={setSortBy}
                            options={["Newest", "Oldest", "Pay: High to Low", "Pay: Low to High"]}
                            placeholder="Sort By"
                            searchable={false}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GigHeader;
