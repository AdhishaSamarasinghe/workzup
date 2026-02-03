import React from "react";

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
    const tabs = ["All Jobs", "Hospitality", "Events", "Logistics", "Retail"];

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
                    <div className="relative">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="appearance-none bg-white border border-gray-200 rounded-full px-4 py-2 pr-8 text-sm outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer"
                        >
                            <option value="Newest">Newest</option>
                            <option value="Oldest">Oldest</option>
                            <option value="Pay: High to Low">Pay: High to Low</option>
                            <option value="Pay: Low to High">Pay: Low to High</option>
                        </select>
                        {/* Simple chevron */}
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GigHeader;
