"use client";

import { useState, useEffect } from "react";
import JobCard from "@/components/jobs/JobCard";
import SearchBar from "@/components/jobs/SearchBar";
import Pagination from "@/components/jobs/Pagination";

/* ------------------ Job Type ------------------ */
type Job = {
  id: number;
  title: string;
  company: string;
  description: string;
  location: string;
  pay: string;
  date: string;
};

/* ------------------ Page ------------------ */
export default function BrowseJobsPage() {
  const [page, setPage] = useState(1);
  const [jobs, setJobs] = useState<Job[]>([]);

  /* ---------- Fetch Jobs from Backend ---------- */
  useEffect(() => {
    fetch("http://localhost:5000/jobs")
      .then((res) => res.json())
      .then((data) => setJobs(data))
      .catch((err) => console.error(err));
  }, []);

  /* ---------- Pagination Logic ---------- */
  const jobsPerPage = 6;
  const [isAnimating, setIsAnimating] = useState(false);


  const start = (page - 1) * jobsPerPage;
  const end = start + jobsPerPage;

  const visibleJobs = jobs.slice(start, end);
  const totalPages = Math.ceil(jobs.length / jobsPerPage);

  /* ------------------ UI ------------------ */
  return (
    <div className="bg-[#f7fafc] min-h-screen px-10 py-12 space-y-12">

      {/* Hero */}
      <section className="text-center space-y-3">
        <h1 className="text-4xl font-bold">
          Find Your Next Job
        </h1>
        <p className="text-gray-500">
          Discover one-day job opportunities tailored for you.
        </p>
      </section>

      {/* Search Filters */}
      <section className="max-w-6xl mx-auto">
        <SearchBar />
      </section>

      {/* Job Cards */}
      <section className="max-w-6xl mx-auto min-h-[900px] flex flex-col justify-between"
>
        <div
          className={`grid grid-cols-3 gap-8 transition-all duration-300 ease-in-out ${
            isAnimating
              ? "opacity-0 translate-y-4"
              : "opacity-100 translate-y-0"
          }`}
        >
          {visibleJobs.map((job, index) => (
            <JobCard
              key={job.id}
              title={job.title}
              company={job.company}
              description={job.description}
              location={job.location}
              pay={job.pay}
              date={job.date}
            />
          ))}
        </div>


        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination
            page={page}
            totalPages={totalPages}
            setPage={(p) => {
              setIsAnimating(true);
              setTimeout(() => {
                setPage(p);
                setIsAnimating(false);
              }, 200);
            }}
          />

        )}
      </section>

    </div>
  );
}
