"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

// Types
interface Job {
  id: string;
  title: string;
  status: "Active" | "Pending" | "Completed";
  applicantsCount: number;
  postedAt: string;
}

interface ApiResponse {
  items: Job[];
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export default function MyPostedJobs() {
  const router = useRouter();
  
  // State
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Constants
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

  // Fetch Jobs
  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        q: searchQuery,
        status: statusFilter,
        page: currentPage.toString(),
        limit: "3",
      });

      const response = await fetch(`${API_BASE}/api/recruiter/jobs?${queryParams}`);
      if (!response.ok) {
        throw new Error("Failed to fetch jobs");
      }
      
      const data: ApiResponse = await response.json();
      setJobs(data.items);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, statusFilter, currentPage, API_BASE]);

  // Effects
  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      fetchJobs();
    }, 300);

    return () => clearTimeout(timer);
  }, [fetchJobs]);

  // Format Date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Pagination Logic
  const renderPagination = () => {
    const pages = [];
    
    // Previous Button
    pages.push(
      <button
        key="prev"
        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
        disabled={currentPage === 1}
        className="px-3 py-1 mx-1 text-gray-600 hover:text-blue-500 disabled:text-gray-300 disabled:cursor-not-allowed"
      >
        &lt;
      </button>
    );

    // Page Numbers with Ellipsis
    const renderPageButton = (page: number) => (
        <button
            key={page}
            onClick={() => setCurrentPage(page)}
            className={`px-3 py-1 mx-1 rounded-full text-sm font-medium transition-colors ${
                currentPage === page
                    ? "bg-blue-500 text-white"
                    : "text-gray-600 hover:bg-gray-100"
            }`}
        >
            {page}
        </button>
    );

    if (totalPages <= 7) {
        for (let i = 1; i <= totalPages; i++) {
            pages.push(renderPageButton(i));
        }
    } else {
         // Always show first page
         pages.push(renderPageButton(1));

         if (currentPage > 3) {
             pages.push(<span key="dots1" className="mx-1 text-gray-400">...</span>);
         }

         // Neighbors
         let start = Math.max(2, currentPage - 1);
         let end = Math.min(totalPages - 1, currentPage + 1);
         
         if (currentPage <= 3) {
             end = 4; // Show more at start
         }
         if (currentPage >= totalPages - 2) {
             start = totalPages - 3; // Show more at end
         }

         // Clamp logic just in case
         start = Math.max(2, start);
         end = Math.min(totalPages - 1, end);

         for (let i = start; i <= end; i++) {
            pages.push(renderPageButton(i));
         }

         if (currentPage < totalPages - 2) {
             pages.push(<span key="dots2" className="mx-1 text-gray-400">...</span>);
         }

         // Always show last page
         pages.push(renderPageButton(totalPages));
    }

    // Next Button
    pages.push(
      <button
        key="next"
        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
        disabled={currentPage === totalPages}
        className="px-3 py-1 mx-1 text-gray-600 hover:text-blue-500 disabled:text-gray-300 disabled:cursor-not-allowed"
      >
        &gt;
      </button>
    );

    return <div className="flex items-center justify-center mt-8">{pages}</div>;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Completed":
        return "bg-gray-200 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-[#f7fafc] p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Posted Jobs</h1>

        {/* Controls Panel */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Search */}
          <div className="relative w-full md:w-1/2">
            <input
              type="text"
              placeholder="Search by job title.."
              className="w-full pl-10 pr-4 py-2.5 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 text-gray-700 placeholder-gray-400 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <svg
              className="absolute left-3.5 top-3 h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          {/* Filter */}
          <div className="flex items-center space-x-3 w-full md:w-auto justify-end">
            <span className="text-gray-600 font-medium whitespace-nowrap">Filter by Status:</span>
            <div className="relative">
              <select
                className="appearance-none bg-transparent pl-2 pr-8 py-1 focus:outline-none text-gray-800 font-semibold cursor-pointer"
                value={statusFilter}
                onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1); // Reset to page 1 on filter
                }}
              >
                <option value="All">All</option>
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
              </select>
              <svg
                className="absolute right-0 top-1.5 h-4 w-4 text-gray-500 pointer-events-none"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Jobs List */}
        <div className="space-y-4">
          {loading ? (
             <div className="text-center py-20">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                <p className="mt-2 text-gray-500">Loading jobs...</p>
             </div>
          ) : jobs.length === 0 ? (
             <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
                <p className="text-gray-500 text-lg">No jobs found matching your criteria.</p>
                <button 
                    onClick={() => { setSearchQuery(""); setStatusFilter("All"); }}
                    className="mt-4 text-blue-500 hover:text-blue-600 font-medium"
                >
                    Clear Filters
                </button>
             </div>
          ) : (
            jobs.map((job) => (
              <div
                key={job.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row justify-between items-center hover:shadow-md transition-shadow duration-200"
              >
                {/* Left Side: Info */}
                <div className="flex-1 mb-4 md:mb-0 w-full">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{job.title}</h3>
                  <div className="flex items-center space-x-6 text-gray-400 text-sm font-medium">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 mr-2 text-gray-800" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                      </svg>
                      <span className="text-gray-500">{job.applicantsCount} Applicants</span>
                    </div>
                    <div className="flex items-center">
                      <svg className="w-5 h-5 mr-2 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-gray-500">Posted: {formatDate(job.postedAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Right Side: Status & Actions */}
                <div className="flex items-center space-x-6 w-full md:w-auto justify-between md:justify-end mt-2 md:mt-0">
                  <span
                    className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide ${getStatusColor(
                      job.status
                    )}`}
                  >
                    {job.status}
                  </span>

                  <div className="flex items-center space-x-1">
                    {/* View Button */}
                    <button
                      onClick={() => console.log("view", job.id)}
                      className="p-2 rounded-full hover:bg-gray-100 text-gray-900 transition-colors"
                      title="View Details"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>

                    {/* Edit Button */}
                    <button
                      onClick={() => router.push(`/recruiter/jobs/${job.id}/edit`)}
                      className="p-2 rounded-full hover:bg-gray-100 text-gray-900 transition-colors"
                      title="Edit Job"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>

                    {/* More Button */}
                    <button
                      onClick={() => console.log("more", job.id)}
                      className="p-2 rounded-full hover:bg-gray-100 text-gray-900 transition-colors"
                      title="More Options"
                    >
                       <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                         <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                       </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {!loading && jobs.length > 0 && renderPagination()}
      </div>
    </div>
  );
}
