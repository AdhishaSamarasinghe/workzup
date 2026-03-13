"use client";

import Link from "next/link";
import Image from "next/image";
import { BriefcaseBusiness, Building2, ChevronRight, Layers3, MapPin } from "lucide-react";
import JobCard from "@/components/jobs/JobCard";
import type { BrowseCategory, BrowseCompany, BrowseJob } from "@/lib/browse";
import { formatDateLabel, formatPay } from "@/lib/browse";

type FeaturedJobsSectionProps = {
  jobs: BrowseJob[];
  jobsPerPage: number;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPauseChange: (paused: boolean) => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  onJobClick?: (jobId: string) => void;
};

type JobCategoriesSectionProps = {
  categories: BrowseCategory[];
  activeCategory: string;
  page: number;
  totalPages: number;
  categoriesPerPage: number;
  onPageChange: (page: number) => void;
  onCategoryClick: (category: string) => void;
};

type TopHiringCompaniesSectionProps = {
  companies: BrowseCompany[];
  activeCompany: string;
  onCompanyClick: (company: string) => void;
};

function SectionHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl text-center md:text-left">
        {eyebrow && <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#6b8bff]">{eyebrow}</p>}
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{title}</h2>
        {description && <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">{description}</p>}
      </div>
      {action ? <div className="flex justify-center md:justify-end">{action}</div> : null}
    </div>
  );
}

export function FeaturedJobsSection({
  jobs,
  jobsPerPage,
  page,
  totalPages,
  onPageChange,
  onPauseChange,
  hasActiveFilters,
  onClearFilters,
  onJobClick,
}: FeaturedJobsSectionProps) {
  const pages = Array.from({ length: totalPages }, (_, pageIndex) =>
    jobs.slice(pageIndex * jobsPerPage, pageIndex * jobsPerPage + jobsPerPage),
  );

  if (jobs.length === 0) {
    return (
      <section className="mx-auto w-full max-w-[1600px] px-3 py-16 sm:px-4 lg:px-6">
        <SectionHeader
          eyebrow=""
          title="Featured Jobs"
          description=""
        />
        <div className="rounded-[28px] border border-dashed border-slate-300 bg-white/80 px-8 py-14 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
            <BriefcaseBusiness className="h-8 w-8" />
          </div>
          <h3 className="mt-5 text-xl font-semibold text-slate-900">
            {hasActiveFilters ? "No featured jobs match the current filters" : "No featured jobs available yet"}
          </h3>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500">
            {hasActiveFilters
              ? "Try clearing one of the homepage filters to see more public jobs."
              : ""}
          </p>
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="mt-6 inline-flex items-center rounded-full bg-[#6b8bff] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Clear filters
            </button>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-[1600px] px-3 py-16 sm:px-4 lg:px-6">
      <SectionHeader
        eyebrow=""
        title="Featured Jobs"
        description=""
        action={
          <Link
            href="/jobseeker/gigs"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[#6b8bff] hover:bg-[#f5f8ff] hover:text-[#6b8bff] hover:shadow-md"
          >
            Explore All Jobs
            <ChevronRight className="h-4 w-4" />
          </Link>
        }
      />

      <div
        onMouseEnter={() => onPauseChange(true)}
        onMouseLeave={() => onPauseChange(false)}
        className="overflow-hidden"
      >
        <div
          className="flex transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{ transform: `translateX(-${(page - 1) * 100}%)` }}
        >
          {pages.map((pageJobs, pageIndex) => (
            <div key={pageIndex} className="min-w-full">
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                {pageJobs.map((job, index) => (
                  <div
                    key={job.id}
                    className="animate-pop-in h-full"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <JobCard
                      title={job.title}
                      company={job.companyName}
                      description={job.description}
                      location={job.location}
                      pay={formatPay(job.pay, job.payType)}
                      date={formatDateLabel(job.date)}
                      onViewDetails={() => onJobClick?.(job.id)}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {totalPages > 1 && (
        <div className="mt-10">
          <div className="flex items-center justify-center gap-3">
            {pages.map((_, dotIndex) => {
              const isActive = page === dotIndex + 1;
              return (
                <button
                  key={dotIndex}
                  type="button"
                  aria-label={`Go to featured jobs slide ${dotIndex + 1}`}
                  onClick={() => onPageChange(dotIndex + 1)}
                  className={`h-3 rounded-full transition-all duration-300 ${isActive
                    ? "w-10 bg-[#6b8bff]"
                    : "w-3 bg-slate-300 hover:bg-slate-400"
                    }`}
                />
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}

export function JobCategoriesSection({
  categories,
  activeCategory,
  page,
  totalPages,
  categoriesPerPage,
  onPageChange,
  onCategoryClick,
}: JobCategoriesSectionProps) {
  const pages = Array.from({ length: totalPages }, (_, pageIndex) =>
    categories.slice(pageIndex * categoriesPerPage, pageIndex * categoriesPerPage + categoriesPerPage),
  );

  return (
    <section className="mx-auto w-full max-w-[1600px] px-3 py-8 sm:px-4 lg:px-6">
      <SectionHeader
        eyebrow=""
        title="Job Categories"
        description=""
      />

      {categories.length === 0 ? (
        <div className="rounded-[28px] border border-dashed border-slate-300 bg-white/80 px-8 py-12 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
            <Layers3 className="h-8 w-8" />
          </div>
          <h3 className="mt-5 text-xl font-semibold text-slate-900">Categories will appear when public jobs are available</h3>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500">

          </p>
        </div>
      ) : (
        <>
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{ transform: `translateX(-${(page - 1) * 100}%)` }}
            >
              {pages.map((pageCategories, pageIndex) => (
                <div key={pageIndex} className="min-w-full">
                  <div className="grid gap-5 px-1 py-2 md:grid-cols-2 xl:grid-cols-5">
                    {pageCategories.map((category) => {
                      const isActive = activeCategory === category.slug;
                      return (
                        <button
                          key={category.slug}
                          onClick={() => onCategoryClick(category.label)}
                          className={`group rounded-[28px] border p-6 text-left transition duration-300 ${isActive
                            ? "border-[#6b8bff] bg-[#edf2ff] shadow-md"
                            : "border-slate-200 bg-white hover:-translate-y-1 hover:border-[#6b8bff] hover:shadow-lg"
                            }`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${isActive ? "bg-[#6b8bff] text-white" : "bg-slate-100 text-slate-600"}`}>
                              <Layers3 className="h-6 w-6" />
                            </div>
                            <ChevronRight className={`h-5 w-5 transition ${isActive ? "text-[#6b8bff]" : "text-slate-300 group-hover:text-slate-500"}`} />
                          </div>
                          <h3 className="mt-8 text-xl font-semibold text-slate-900">{category.label}</h3>
                          <p className="mt-2 text-sm text-slate-500">
                            {category.count} {category.count === 1 ? "open role" : "open roles"}
                          </p>
                          <p className="mt-6 text-sm font-medium text-slate-700">
                            {isActive ? "Active filter" : "Click to explore this category"}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {totalPages > 1 && (
            <div className="mt-10">
              <div className="flex items-center justify-center gap-3">
                {pages.map((_, dotIndex) => {
                  const isActive = page === dotIndex + 1;
                  return (
                    <button
                      key={dotIndex}
                      type="button"
                      aria-label={`Go to job categories slide ${dotIndex + 1}`}
                      onClick={() => onPageChange(dotIndex + 1)}
                      className={`h-3 rounded-full transition-all duration-300 ${isActive
                        ? "w-10 bg-[#6b8bff]"
                        : "w-3 bg-slate-300 hover:bg-slate-400"
                        }`}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}

export function TopHiringCompaniesSection({
  companies,
  activeCompany,
  onCompanyClick,
}: TopHiringCompaniesSectionProps) {
  return (
    <section className="mx-auto w-full max-w-[1600px] px-3 py-16 sm:px-4 lg:px-6">
      <SectionHeader
        eyebrow=""
        title="Top Hiring Companies"
        description=""
      />

      {companies.length === 0 ? (
        <div className="rounded-[28px] border border-dashed border-slate-300 bg-white/80 px-8 py-12 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
            <Building2 className="h-8 w-8" />
          </div>
          <h3 className="mt-5 text-xl font-semibold text-slate-900">No hiring companies to rank yet</h3>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500">
          </p>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-3">
          {companies.map((company) => {
            const isActive = activeCompany === company.slug;
            return (
              <button
                key={company.slug}
                onClick={() => onCompanyClick(company.slug)}
                className={`group rounded-[30px] border p-6 text-left transition duration-300 ${isActive
                  ? "border-[#6b8bff] bg-[#f5f7ff] shadow-md"
                  : "border-slate-200 bg-white hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg"
                  }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-slate-100 text-slate-500">
                      {company.logoUrl ? (
                        <Image
                          src={company.logoUrl}
                          alt={company.companyName}
                          width={64}
                          height={64}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Building2 className="h-7 w-7" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-slate-900">{company.companyName}</h3>
                      <p className="mt-1 text-sm text-slate-500">{company.industry || "Hiring across multiple roles"}</p>
                    </div>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${isActive ? "bg-[#6b8bff] text-white" : "bg-slate-100 text-slate-600"}`}>
                    {company.jobCount} jobs
                  </span>
                </div>

                <div className="mt-8 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-slate-50 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Categories</p>
                    <p className="mt-2 text-lg font-semibold text-slate-900">{company.categoryCount}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Last posting</p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">{formatDateLabel(company.latestCreatedAt)}</p>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between text-sm text-slate-500">
                  <span className="inline-flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {company.location || "Location flexible"}
                  </span>
                  <span className="font-medium text-slate-700">{isActive ? "Active filter" : "Filter jobs"}</span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
