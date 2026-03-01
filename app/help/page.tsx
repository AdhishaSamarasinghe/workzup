"use client";

import { useState } from "react";

const faqs = [
    {
        title: "For Job Seekers",
        content: "Here you will find answers to common questions about finding jobs, applying, and getting paid on the Workzup platform."
    },
    {
        title: "For Employers",
        content: "Learn how to post jobs, manage applications, and find the right talent for your company."
    },
    {
        title: "Account & Billing",
        content: "Details about your account settings, payment methods, and billing history."
    },
    {
        title: "Platform Rules",
        content: "Guidelines and policies for using the Workzup platform safely and effectively."
    }
];

export default function HelpSupportPage() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);
    const [formData, setFormData] = useState({ name: "", email: "", message: "" });
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [errorMessage, setErrorMessage] = useState("");

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.email || !formData.message) {
            setErrorMessage("Please fill in all fields.");
            setStatus("error");
            return;
        }

        setStatus("loading");
        setErrorMessage("");

        try {
            const response = await fetch("/api/support", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to submit request.");
            }

            setStatus("success");
            setFormData({ name: "", email: "", message: "" }); // Reset form

            // Clear success message after 5 seconds
            setTimeout(() => {
                setStatus("idle");
            }, 5000);

        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
            setErrorMessage(errorMessage);
            setStatus("error");
        }
    };

    return (
        <div className="w-full bg-[#f8f9fc] min-h-[calc(100vh-80px)] py-16 sm:py-24">
            <div className="mx-auto max-w-[1080px] px-4 sm:px-6 lg:px-8">
                {/* Header Section */}
                <div className="text-center mb-16">
                    <h1 className="text-[44px] sm:text-[52px] font-[900] tracking-tight text-[#0B0F19] mb-5">
                        How can we help ?
                    </h1>
                    <p className="text-[18px] leading-relaxed text-[#4b5563] max-w-[640px] mx-auto">
                        Find answers to your questions, explore help articles, or get in touch with our
                        dedicated support team.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-start">
                    {/* Left Column: FAQ */}
                    <div className="bg-white rounded-[24px] p-8 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-gray-100">
                        <h2 className="text-[28px] font-[800] mb-8 text-[#0B0F19] tracking-tight">Frequently Asked Questions</h2>
                        <div className="space-y-4">
                            {faqs.map((faq, index) => {
                                const isOpen = openIndex === index;
                                return (
                                    <div
                                        key={index}
                                        className={`rounded-[16px] border transition-all duration-300 overflow-hidden ${isOpen ? "bg-white border-accent/30 ring-1 ring-accent/10 shadow-[0_4px_20px_rgb(0,0,0,0.03)]" : "bg-[#f8fafc] border-transparent hover:border-gray-200"
                                            }`}
                                    >
                                        <button
                                            onClick={() => setOpenIndex(isOpen ? null : index)}
                                            className="w-full flex items-center justify-between p-5 text-left focus:outline-none transition-colors group"
                                        >
                                            <span className={`text-[16px] font-[700] transition-colors ${isOpen ? 'text-accent' : 'text-[#111827] group-hover:text-accent'}`}>{faq.title}</span>
                                            <span className={`flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 ${isOpen ? 'bg-accent/10 text-accent rotate-180' : 'bg-white shadow-sm text-gray-400 group-hover:text-accent group-hover:shadow-md'}`}>
                                                <svg
                                                    className="h-4 w-4"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                    strokeWidth={2.5}
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M19 9l-7 7-7-7"
                                                    />
                                                </svg>
                                            </span>
                                        </button>
                                        <div
                                            className={`grid transition-all duration-300 ease-in-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                                                }`}
                                        >
                                            <div className="overflow-hidden">
                                                <div className="px-5 pb-5 pt-0 text-[15px] leading-relaxed text-[#6b7280]">
                                                    {faq.content}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right Column: Contact Form */}
                    <div className="bg-white rounded-[24px] p-8 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-gray-100">
                        <h2 className="text-[28px] font-[800] mb-3 text-[#0B0F19] tracking-tight">Still need help?</h2>
                        <p className="text-[17px] leading-relaxed text-[#4b5563] mb-8">
                            Can&apos;t find the answer you&apos;re looking for? Get in touch with our support
                            team.
                        </p>

                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div>
                                <label
                                    htmlFor="name"
                                    className="block text-[15px] font-[700] text-[#111827] mb-2"
                                >
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="w-full rounded-[14px] border border-gray-200 px-4 py-4 text-[15px] text-gray-900 placeholder-[#9ca3af] focus:border-accent focus:ring-4 focus:ring-accent/10 focus:outline-none transition-all bg-[#f8fafc] focus:bg-white focus:shadow-sm disabled:opacity-60"
                                    placeholder="John Doe"
                                    disabled={status === "loading"}
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="email"
                                    className="block text-[15px] font-[700] text-[#111827] mb-2"
                                >
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-full rounded-[14px] border border-gray-200 px-4 py-4 text-[15px] text-gray-900 placeholder-[#9ca3af] focus:border-accent focus:ring-4 focus:ring-accent/10 focus:outline-none transition-all bg-[#f8fafc] focus:bg-white focus:shadow-sm disabled:opacity-60"
                                    placeholder="you@example.com"
                                    disabled={status === "loading"}
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="message"
                                    className="block text-[15px] font-[700] text-[#111827] mb-2"
                                >
                                    Message
                                </label>
                                <textarea
                                    id="message"
                                    rows={4}
                                    value={formData.message}
                                    onChange={handleInputChange}
                                    className="w-full rounded-[14px] border border-gray-200 px-4 py-4 text-[15px] text-gray-900 placeholder-[#9ca3af] focus:border-accent focus:ring-4 focus:ring-accent/10 focus:outline-none transition-all resize-none bg-[#f8fafc] focus:bg-white focus:shadow-sm disabled:opacity-60"
                                    placeholder="Please describe your issue..."
                                    disabled={status === "loading"}
                                />
                            </div>

                            {status === "error" && (
                                <div className="text-red-500 text-[14px] font-[500] bg-red-50 p-3 rounded-[10px] border border-red-100">
                                    {errorMessage}
                                </div>
                            )}

                            {status === "success" && (
                                <div className="text-emerald-600 text-[15px] font-[600] bg-emerald-50 p-4 rounded-[12px] border border-emerald-100 flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Support request submitted successfully!
                                </div>
                            )}

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={status === "loading" || status === "success"}
                                    className="w-full bg-[#6b8bff] hover:bg-[#5a7ae6] text-white font-[700] py-4 px-4 rounded-[14px] transition-all focus:outline-none focus:ring-2 focus:ring-[#6b8bff] focus:ring-offset-2 text-[18px] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {status === "loading" ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Sending...
                                        </>
                                    ) : (
                                        status === "success" ? "Sent!" : "Submit request"
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
