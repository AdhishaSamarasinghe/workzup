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
                return "text-green-600";
            case "hospitality":
                return "text-green-600"; // Using green for all as per image examples typically, or customize
            case "logistics":
                return "text-green-600";
            default:
                return "text-blue-600";
        }
    };

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2">
                <div>
                    <h3 className="text-xl font-bold text-gray-900">{title}</h3>
                    <p className="text-gray-600 font-medium">{company}</p>
                </div>
                <span className={`font-medium ${getCategoryColor(category)} bg-opacity-10 px-3 py-1 rounded-full text-sm`}>
                    {category}
                </span>
            </div>

            <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                {description}
            </p>

            <div className="flex flex-wrap items-center justify-between gap-4 mt-auto">
                <div className="flex items-center gap-6 text-gray-700 text-sm font-medium">
                    <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {location}
                    </div>
                    <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {pay}
                    </div>
                    <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {date}
                    </div>
                </div>

                <button className="bg-[#6b8bff] hover:bg-[#5a7ae0] text-white px-6 py-2 rounded-xl text-sm font-semibold transition-colors">
                    Veiw details
                </button>
            </div>
        </div>
    );
};

export default GigCard;
