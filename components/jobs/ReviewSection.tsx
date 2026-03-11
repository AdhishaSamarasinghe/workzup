"use client";

import { useEffect, useState } from "react";
import { API_BASE } from "@/lib/api";

type Review = {
    id: number | string;
    name: string;
    role: string;
    avatar: string;
    rating: number;
    text: string;
};

export default function ReviewSection() {
    const [reviewsData, setReviewsData] = useState<Review[]>([]);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        fetch(`${API_BASE}/reviews`)
            .then((res) => res.json())
            .then((data) => {
                setReviewsData(Array.isArray(data) ? data : []);
                setHasError(false);
            })
            .catch((error) => {
                console.error(error);
                setReviewsData([]);
                setHasError(true);
            });
    }, []);

    return (
        <section className="max-w-6xl mx-auto px-6 py-10">
            <h2 className="text-4xl font-bold text-center mb-12 text-black">Reviews</h2>
            {reviewsData.length === 0 ? (
                <div className="rounded-[28px] border border-dashed border-slate-300 bg-white/80 px-8 py-12 text-center shadow-sm">
                    <h3 className="text-xl font-semibold text-slate-900">
                        {hasError ? "Reviews are unavailable right now" : "No public reviews yet"}
                    </h3>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {reviewsData.map((review) => (
                        <div
                            key={review.id}
                            className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col items-start text-left"
                        >
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-2xl">
                                    {review.avatar}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg leading-tight">
                                        {review.name}
                                    </h3>
                                    <p className="text-gray-500 text-sm">{review.role}</p>
                                </div>
                            </div>

                            <div className="flex gap-1 mb-4">
                                {[...Array(review.rating)].map((_, i) => (
                                    <svg
                                        key={i}
                                        className="w-5 h-5 text-orange-500 fill-current"
                                        viewBox="0 0 24 24"
                                    >
                                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                    </svg>
                                ))}
                            </div>

                            <p className="text-gray-600 leading-relaxed text-sm">
                                {review.text}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}
