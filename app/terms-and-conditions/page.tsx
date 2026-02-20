"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";

const SECTIONS = [
    {
        id: "introduction",
        title: "1. Introduction",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
            </svg>
        ),
        content: (
            <p>
                Welcome to Workzup. This agreement outlines the terms and conditions governing your use of
                our platform. By accessing or using the Workzup service, you agree to be bound by these terms.
                Please read them carefully. Workzup provides a platform to connect job seekers with employers
                for short-term and urgent work opportunities.
            </p>
        )
    },
    {
        id: "account",
        title: "2. Account Registration & Use",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
        ),
        content: (
            <p>
                You must create an account to use most features of Workzup. You agree to provide accurate,
                current, and complete information during the registration process and to update such
                information to keep it accurate. You are responsible for safeguarding your password and for all
                activities that occur under your account.
            </p>
        )
    },
    {
        id: "employer",
        title: "3. Employer Responsibilities",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.027-.392.05-.59.072m--15.02 0c-.198-.022-.396-.045-.59-.072m15.02 0c-.198-.022-.396-.045-.59-.072m-15.02 0a2.18 2.18 0 01-.75-1.661V8.706c0-1.081.768-2.015 1.837-2.175a48.114 48.114 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
            </svg>
        ),
        content: (
            <p>
                Employers agree to accurately describe job postings, including scope, payment, and any
                required qualifications. You are solely responsible for your interactions with job seekers and must
                comply with all applicable employment laws, including those related to wages, working
                conditions, and non-discrimination.
            </p>
        )
    },
    {
        id: "job-seeker",
        title: "4. Job Seeker Responsibilities",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
        ),
        content: (
            <p>
                Job seekers agree to represent their skills, experience, and qualifications accurately. You
                commit to performing agreed-upon work professionally and to the best of your ability. Any
                misrepresentation may result in the termination of your account.
            </p>
        )
    },
    {
        id: "payments",
        title: "5. Payments and Fees",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
            </svg>
        ),
        content: (
            <p>
                Workzup facilitates payments between employers and job seekers through a third-party
                payment processor. We may charge a service fee, which will be disclosed to you prior to a
                transaction. All payments are subject to the terms of our payment processor.
            </p>
        )
    },
    {
        id: "intellectual-property",
        title: "6. Intellectual Property",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75l-2.489-2.489m0 0a3.375 3.375 0 10-4.773-4.773 3.375 3.375 0 004.774 4.774zM19.5 9h-3.64l-1.085-1.085A2.25 2.25 0 0013.185 7h-2.37A2.25 2.25 0 009.225 7.785L8.14 8.87H4.5A2.25 2.25 0 002.25 11.12v8.25A2.25 2.25 0 004.5 21.62h15a2.25 2.25 0 002.25-2.25v-8.25A2.25 2.25 0 0019.5 9.37v-.37z" />
            </svg>
        ),
        content: (
            <p>
                The Workzup platform, including its logo, design, text, and graphics, is the exclusive property of
                Workzup and its licensors. You may not use any of our intellectual property without our prior
                written consent.
            </p>
        )
    },
    {
        id: "disclaimers",
        title: "7. Disclaimers and Limitation of Liability",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        sidebarTitle: "7. Disclaimers",
        content: (
            <p>
                Workzup is a platform provider and is not a party to any agreement between employers and job
                seekers. We do not guarantee the quality, safety, or legality of the jobs posted or the
                qualifications of the users. Your use of the service is at your own risk.
            </p>
        )
    },
    {
        id: "governing-law",
        title: "8. Governing Law",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
            </svg>
        ),
        content: (
            <p>
                These terms shall be governed by and construed in accordance with the laws of the jurisdiction
                in which Workzup is headquartered, without regard to its conflict of law principles.
            </p>
        )
    },
    {
        id: "contact",
        title: "9. Contact Information",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
        ),
        content: (
            <p>
                If you have any questions about these Terms, please contact us at support@workzup.com.
            </p>
        )
    }
];

export default function TermsAndConditions() {
    const [activeSection, setActiveSection] = useState("introduction");

    const scrollToSection = (id: string) => {
        setActiveSection(id);
        const element = document.getElementById(id);
        if (element) {
            const yOffset = -100; // offset for sticky header if needed
            const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    };

    // Optional: Update active section on scroll
    useEffect(() => {
        const handleScroll = () => {
            let currentSection = activeSection;
            for (const section of SECTIONS) {
                const element = document.getElementById(section.id);
                if (element) {
                    const rect = element.getBoundingClientRect();
                    if (rect.top >= -50 && rect.top <= window.innerHeight / 2) {
                        currentSection = section.id;
                    }
                }
            }
            if (currentSection !== activeSection) {
                setActiveSection(currentSection);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [activeSection]);

    return (
        <div className="min-h-screen bg-[#F9FAFB] flex flex-col font-sans">
            {/* Top Navigation */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b">
                <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-6 lg:px-8">
                    <div className="flex items-center gap-2">
                        <Logo textSize="text-2xl" />
                    </div>
                    <nav className="hidden items-center gap-8 text-sm font-semibold text-gray-700 md:flex md:ml-auto">
                        <Link href="/" className="hover:text-blue-600 transition">
                            Home
                        </Link>
                        <Link href="#" className="hover:text-blue-600 transition">
                            About
                        </Link>
                        <Link href="#" className="hover:text-blue-600 transition">
                            Contact
                        </Link>
                    </nav>
                    <div className="ml-8 hidden md:block">
                        <Link
                            href="/"
                            className="rounded-md bg-[#6B8BFF] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-90"
                        >
                            Back to Main site
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col py-10 px-6 sm:px-8 lg:flex-row lg:gap-12 lg:px-12">
                {/* Sidebar */}
                <aside className="mb-10 lg:w-72 lg:shrink-0">
                    <div className="sticky top-28">
                        <h2 className="text-xl font-bold text-gray-900 mb-1">
                            Table of the Conetent
                        </h2>
                        <p className="text-sm text-gray-500 mb-6">Terms and conditions</p>

                        <nav className="flex flex-col gap-1.5">
                            {SECTIONS.map((section) => {
                                const isActive = activeSection === section.id;
                                return (
                                    <button
                                        key={section.id}
                                        onClick={() => scrollToSection(section.id)}
                                        className={`flex items-center gap-3 rounded-md px-4 py-2.5 text-sm font-medium transition-all duration-200 w-full text-left ${isActive
                                                ? "bg-[#6B8BFF] text-white shadow-sm"
                                                : "text-gray-600 hover:bg-white hover:shadow-sm"
                                            }`}
                                    >
                                        <span
                                            className={`${isActive ? "text-white" : "text-gray-500"
                                                }`}
                                        >
                                            {section.icon}
                                        </span>
                                        {section.sidebarTitle || section.title}
                                    </button>
                                );
                            })}
                        </nav>
                    </div>
                </aside>

                {/* Content Box */}
                <section className="flex-1 bg-white p-8 sm:p-12 shadow-sm rounded border border-gray-100">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Terms and Conditions
                        </h1>
                        <p className="text-sm text-gray-400">Last Updated: October 26, 2023</p>
                    </div>

                    <div className="flex flex-col gap-10">
                        {SECTIONS.map((section) => (
                            <div key={section.id} id={section.id} className="scroll-mt-32">
                                <h3 className="text-xl font-bold text-gray-900 mb-3">
                                    {section.title}
                                </h3>
                                <div className="text-gray-700 leading-relaxed text-[15px]">
                                    {section.content}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="mt-auto border-t bg-[#F9FAFB] py-8">
                <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-6 px-6 sm:flex-row lg:px-8 text-sm text-gray-500">
                    <div className="flex items-center">
                        <Logo textSize="text-xl text-gray-400" />
                    </div>
                    <div className="flex items-center gap-6">
                        <Link href="#" className="hover:text-gray-900 transition">
                            Contact
                        </Link>
                        <Link href="/terms-and-conditions" className="hover:text-gray-900 transition">
                            Terms of Service
                        </Link>
                        <Link href="#" className="hover:text-gray-900 transition">
                            Privacy policy
                        </Link>
                    </div>
                    <p>©2024 Workzup. All Rights reserved</p>
                </div>
            </footer>
        </div>
    );
}
