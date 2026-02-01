"use client";

import { useEffect, useState } from "react";
import SearchBar from "@/components/jobs/SearchBar";
import JobCard from "@/components/jobs/JobCard";
import Pagination from "@/components/jobs/Pagination";

type Job = {
  id: number;
  title: string;
  company: string;
  description: string;
  location: string;
  pay: string;
  date: string;
};

export default function BrowseJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetch("http://localhost:5000/jobs")
      .then((res) => res.json())
      .then((data) => setJobs(data))
      .catch(console.error);
  }, []);

  /* 🔑 AUTO-GENERATED KEYWORDS */
  const keywords = Array.from(new Set(jobs.map((job) => job.title)));

  /* 🔍 FILTER */
  const filteredJobs = jobs.filter((job) =>
    job.title.toLowerCase().includes(keyword.toLowerCase())
  );

  /* 📄 PAGINATION */
  const jobsPerPage = 6;
  const start = (page - 1) * jobsPerPage;
  const visibleJobs = filteredJobs.slice(start, start + jobsPerPage);
  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);

  return (
    <div className="bg-[#f7fafc] min-h-screen">

      {/* 🔹 HERO SECTION (RESTORED) */}
      {/* 🔹 HERO SECTION (VIDEO) */}
      <section className="relative h-[500px] w-full overflow-visible">

        {/* Background video */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/hero-video.mp4" type="video/mp4" />
        </video>

        {/* Translucent dark overlay */}
        <div className="absolute inset-0 bg-black/40" />

        {/* Hero content */}
        <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-6">
          <h1 className="text-4xl font-bold mb-2 text-white">
            Find Your Next Job
          </h1>
          <p className="text-gray-200 mb-10">
            Discover one-day job opportunities tailored for you.
          </p>

          {/* Centered search bar (UNCHANGED) */}
          <div className="relative z-30 w-full max-w-4xl overflow-visible">
            <SearchBar
              keywords={keywords}
              keyword={keyword}
              setKeyword={setKeyword}
            />
          </div>

        </div>
      </section>


      {/* 🔹 JOBS */}
      <section className="max-w-6xl mx-auto px-6 py-14 min-h-[900px] flex flex-col justify-between">
        <div className="grid grid-cols-3 gap-8 transition-all duration-300">
          {visibleJobs.map((job) => (
            <JobCard key={job.id} {...job} />
          ))}
        </div>

        {totalPages > 1 && (
          <Pagination
            page={page}
            totalPages={totalPages}
            setPage={setPage}
          />
        )}
      </section>
    </div>
  );
}
