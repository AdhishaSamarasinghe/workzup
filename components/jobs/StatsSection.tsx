/* eslint-disable */
"use client";

import { useEffect, useRef, useState } from "react";


type StatsProps = {
    stats?: {
        totalJobs: number;
        totalSeekers: number;
        totalApplications: number;
        totalCompanies: number;
    };
};

export default function StatsSection({ stats }: StatsProps) {
    const data = stats || { totalJobs: 0, totalSeekers: 0, totalApplications: 0, totalCompanies: 0 };

    const displayStats = [
        {
            label: "Jobs posted",
            value: data.totalJobs.toLocaleString(),
            percentage: data.totalJobs > 0 ? 100 : 0,
            color: "from-blue-500 to-purple-500",
        },
        {
            label: "Active seekers",
            value: data.totalSeekers.toLocaleString(),
            percentage: data.totalSeekers > 0 ? 100 : 0,
            color: "from-blue-400 to-purple-400",
        },
        {
            label: "Applications",
            value: data.totalApplications.toLocaleString(),
            percentage: data.totalApplications > 0 ? 100 : 0,
            color: "from-blue-600 to-purple-600",
        },
        {
            label: "Companies",
            value: data.totalCompanies.toLocaleString(),
            percentage: data.totalCompanies > 0 ? 100 : 0,
            color: "from-blue-500 to-indigo-500",
        },
    ];
    const [isVisible, setIsVisible] = useState(false);
    const sectionRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsVisible(entry.isIntersecting);
            },
            { threshold: 0.2 }
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => {
            if (sectionRef.current) {
                observer.unobserve(sectionRef.current);
            }
        };
    }, []);

    return (
        <section ref={sectionRef} className="max-w-7xl mx-auto px-6 py-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {displayStats.map((stat, index) => (
                    <div
                        key={index}
                        className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow duration-300"
                    >
                        <div className="text-center mb-6">
                            <h3 className="text-4xl font-bold text-gray-900 mb-2">
                                {stat.value}
                            </h3>
                            <p className="text-gray-500 font-medium">{stat.label}</p>
                        </div>

                        {/* Progress Bar Container */}
                        <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden relative">
                            {/* Animated Bar */}
                            <div
                                className={`h-full rounded-full bg-gradient-to-r ${stat.color}`}
                                style={{
                                    width: isVisible ? `${stat.percentage}%` : "0%",
                                    transition: "width 1.5s cubic-bezier(0.16, 1, 0.3, 1)",
                                }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
