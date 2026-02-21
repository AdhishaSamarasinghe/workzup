
import React from 'react';

const AboutPage = () => {
    return (
        <div className="flex flex-col gap-20 py-10 px-4 md:px-0 max-w-275 mx-auto w-full">

            {/* Hero Section */}
            <section className="flex flex-col md:flex-row items-center justify-between gap-10">
                <div className="flex-1 space-y-6">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[#111827]">
                        Connecting Talent <br />
                        and opportunity, <br />
                        Instantly.
                    </h1>
                    <p className="text-gray-600 max-w-md leading-relaxed">
                        Workzup is the one-day job hiring platform that connects job seekers with employers who need short-term or urgent workers.
                    </p>
                    <div className="flex gap-4 pt-4">
                        <button className="bg-(--accent) text-white px-6 py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity">
                            Find a job
                        </button>
                        <button className="bg-white border border-gray-200 text-[#111827] px-6 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                            Post a job
                        </button>
                    </div>
                </div>
                <div className="flex-1 w-full">
                    {/* Placeholder for Hero Image */}
                    <div className="w-full h-75 md:h-100 bg-linear-to-br from-[#A7D7C5] to-[#74B49B] rounded-2xl shadow-sm relative overflow-hidden">
                        <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px]"></div>
                    </div>
                </div>
            </section>

            {/* Mission & Vision */}
            <section className="flex flex-col items-center text-center space-y-8">
                <h2 className="text-3xl font-bold text-[#111827]">Our Mission & Vision</h2>
                <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm max-w-4xl border border-gray-100">
                    <p className="text-gray-600 leading-relaxed text-lg">
                        Workzup was founded to bridge the gap in the short-term hiring market. We aim to create a seamless and reliable ecosystem where businesses can instantly find skilled workers for immediate needs, and job seekers can access flexible opportunities to earn on their terms. Our vision is to be the leading platform for on-demand work, empowering both businesses and individuals to thrive in a dynamic economy.
                    </p>
                </div>
            </section>

            {/* Core Values */}
            <section className="space-y-12">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-[#111827]">Our Core Values</h2>
                    <p className="text-gray-500 mt-4 max-w-2xl mx-auto">
                        Our values guide every decision we make and every connection we foster on our platform
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Efficiency */}
                    <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 bg-[#D1FAE5] rounded-full flex items-center justify-center mb-6 text-[#059669]">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold mb-3 text-[#111827]">Efficiency</h3>
                        <p className="text-gray-500 leading-relaxed text-sm">
                            We streamline the hiring process, making it fast and simple for employers to post jobs and for workers to get hired.
                        </p>
                    </div>

                    {/* Reliability */}
                    <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 bg-[#FEE2E2] rounded-full flex items-center justify-center mb-6 text-[#DC2626]">
                            <div className="w-6 h-6 bg-[#7F1D1D] rounded-full"></div>
                        </div>
                        <h3 className="text-xl font-bold mb-3 text-[#111827]">Reliability</h3>
                        <p className="text-gray-500 leading-relaxed text-sm">
                            We are committed to building a trustworthy community with verified workers and transparent processes for all users.
                        </p>
                    </div>

                    {/* Opportunity */}
                    <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 bg-[#E0F2FE] rounded-full flex items-center justify-center mb-6 text-[#0284C7]">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.111 48.111 0 01-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold mb-3 text-[#111827]">Opportunity</h3>
                        <p className="text-gray-500 leading-relaxed text-sm">
                            We empower individuals by providing flexible work options and open doors to new possibilities and connections.
                        </p>
                    </div>
                </div>
            </section>

            {/* Our Journey */}
            <section className="space-y-12">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-[#111827]">Our Journey</h2>
                    <p className="text-gray-500 mt-4">
                        A breif look at our story so far
                    </p>
                </div>

                <div className="relative border-l-2 border-dashed border-blue-200 ml-6 md:ml-10 my-10 space-y-12">

                    {/* Item 1 */}
                    <div className="relative pl-12">
                        <div className="absolute -left-4.25 top-0 w-9 h-9 bg-blue-400 rounded-full border-4 border-white shadow-sm"></div>
                        <div>
                            <span className="text-blue-500 font-medium block mb-1">2024 - The Idea</span>
                            <h4 className="text-lg font-bold text-[#111827]">Workzup is Born</h4>
                            <p className="text-gray-500 text-sm mt-1 max-w-2xl">
                                Founded to address the growing demand for flexible, short-term employment solutions in a rapidly changing work landscape.
                            </p>
                        </div>
                    </div>

                    {/* Item 2 */}
                    <div className="relative pl-12">
                        <div className="absolute -left-4.25 top-0 w-9 h-9 bg-blue-400 rounded-full border-4 border-white shadow-sm"></div>
                        <div>
                            <span className="text-blue-500 font-medium block mb-1">2025 - Platform Launch</span>
                            <h4 className="text-lg font-bold text-[#111827]">Connecting Our First Users</h4>
                            <p className="text-gray-500 text-sm mt-1 max-w-2xl">
                                Our platform officially launched, successfully connecting our first 1,000 job seekers with immediate work opportunities.
                            </p>
                        </div>
                    </div>

                    {/* Item 3 */}
                    <div className="relative pl-12">
                        <div className="absolute -left-4.25 top-0 w-9 h-9 bg-blue-400 rounded-full border-4 border-white shadow-sm opacity-50"></div>
                        <div>
                            <span className="text-blue-500 font-medium block mb-1">Future - Expansion</span>
                            <h4 className="text-lg font-bold text-[#111827]">Growing Our Community</h4>
                            <p className="text-gray-500 text-sm mt-1 max-w-2xl">
                                We aim to expand our services to new cities and introduce new features to better serve our growing community of users.
                            </p>
                        </div>
                    </div>

                </div>
            </section>

            {/* CTA Section */}
            <section className="w-full">
                <div className="bg-(--accent) rounded-3xl p-10 md:p-16 text-center text-white shadow-lg overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-full h-full bg-white/5 pointer-events-none"></div>
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">
                        Ready to Find Your Next Opportunity Or <br className="hidden md:block" /> Hire?
                    </h2>
                    <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
                        Join the Workzup community today and experience the future of on-demand hiring.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button className="bg-transparent border border-white text-white px-8 py-3 rounded-xl hover:bg-white/10 transition-colors w-full sm:w-auto">
                            Find a job
                        </button>
                        <button className="bg-white text-(--accent) px-8 py-3 rounded-xl font-bold hover:opacity-90 transition-opacity w-full sm:w-auto shadow-sm">
                            Post a job
                        </button>
                    </div>
                </div>
            </section>

        </div>
    );
};

export default AboutPage;
