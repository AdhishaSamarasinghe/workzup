import React from "react";
import CustomSelect from "@/components/ui/CustomSelect";

interface GigHeaderProps {
    resultCount: number;
    activeTab: string;
    setActiveTab: (tab: string) => void;
    sortBy: string;
    setSortBy: (sort: string) => void;
}

const GigHeader: React.FC<GigHeaderProps> = ({
    resultCount,
    activeTab,
    setActiveTab,
    sortBy,
    setSortBy,
}) => {
    const tabs = ["All Jobs", "Hospitality", "Events", "Logistics", "Retail", "Cleaning", "Admin"];

    return (
        <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
                Find Your Next Gig
            </h1>

            {/* Tabs */}
            <div className="flex flex-wrap gap-3 mb-8">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${activeTab === tab
                            ? "bg-gray-200 text-gray-900 shadow-sm"
                            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div className="flex justify-between items-center">
                <p className="text-gray-500">
                    Showing <span className="font-bold text-gray-900">{resultCount}</span> result
                </p>

                <div className="flex items-center gap-3">
                    <span className="text-gray-500 text-sm">Sort by:</span>
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
