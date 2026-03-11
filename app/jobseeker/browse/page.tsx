"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import SearchBar from "@/components/jobs/SearchBar";
import StatsSection from "@/components/jobs/StatsSection";
import ReviewSection from "@/components/jobs/ReviewSection";
import {
  FeaturedJobsSection,
  JobCategoriesSection,
  TopHiringCompaniesSection,
} from "@/components/jobs/BrowseHomepageSections";
import { apiFetch } from "@/lib/api";
import {
  BrowseFilters,
  BrowseHomeData,
  BrowseJob,
  DEFAULT_BROWSE_FILTERS,
  matchesPayRange,
  normalizeText,
  slugify,
} from "@/lib/browse";

const JOBS_PER_PAGE = 4;
const CATEGORIES_PER_PAGE = 10;

function pickTextFilters(searchParams: URLSearchParams | ReturnType<typeof useSearchParams>): BrowseFilters {
  return {
    keyword: searchParams.get("keyword") || "",
    district: searchParams.get("district") || "",
    pay: searchParams.get("pay") || "",
    date: searchParams.get("date") || "",
    category: searchParams.get("category") || "",
    company: searchParams.get("company") || "",
  };
}

function filterJobs(
  jobs: BrowseJob[],
  filters: BrowseFilters,
  options: { ignoreCategory?: boolean; ignoreCompany?: boolean } = {},
) {
  const keyword = normalizeText(filters.keyword);
  const district = normalizeText(filters.district);

  return jobs.filter((job) => {
    const matchesKeyword =
      !keyword ||
      normalizeText(job.title).includes(keyword) ||
      normalizeText(job.companyName).includes(keyword) ||
      normalizeText(job.derivedCategory).includes(keyword);

    const matchesDistrict =
      !district ||
      normalizeText(job.location).includes(district) ||
      job.locations.some((location) => normalizeText(location).includes(district));

    const matchesDate = !filters.date || job.jobDates.includes(filters.date) || job.date === filters.date;
    const matchesPay = matchesPayRange(job.pay, filters.pay);
    const matchesCategory =
      options.ignoreCategory || !filters.category || slugify(job.derivedCategory) === filters.category;
    const matchesCompany =
      options.ignoreCompany || !filters.company || slugify(job.companyName) === filters.company;

    return matchesKeyword && matchesDistrict && matchesDate && matchesPay && matchesCategory && matchesCompany;
  });
}

function applyFilterToUrl(filters: BrowseFilters, pathname: string, router: ReturnType<typeof useRouter>) {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });

  const query = params.toString();
  router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
}

export default function BrowseJobsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { status } = useSession();

  const [browseData, setBrowseData] = useState<BrowseHomeData>({
    jobs: [],
    categories: [],
    topCompanies: [],
    stats: { totalJobs: 0, totalCategories: 0, totalCompanies: 0, totalSeekers: 0, totalApplications: 0 },
  });
  const [filters, setFilters] = useState<BrowseFilters>(DEFAULT_BROWSE_FILTERS);
  const [draftFilters, setDraftFilters] = useState<BrowseFilters>(DEFAULT_BROWSE_FILTERS);
  const [page, setPage] = useState(1);
  const [categoryPage, setCategoryPage] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    const nextFilters = pickTextFilters(searchParams);
    setFilters(nextFilters);
    setDraftFilters(nextFilters);
  }, [searchParams]);

  useEffect(() => {
    let isMounted = true;

    const fetchBrowseData = async () => {
      try {
        setIsLoading(true);
        const data = await apiFetch("/api/jobs/browse/home");
        if (!isMounted) return;
        setBrowseData({
          jobs: Array.isArray(data.jobs) ? data.jobs : [],
          categories: Array.isArray(data.categories) ? data.categories : [],
          topCompanies: Array.isArray(data.topCompanies) ? data.topCompanies : [],
          stats: data.stats || { totalJobs: 0, totalCategories: 0, totalCompanies: 0, totalSeekers: 0, totalApplications: 0 },
        });
        setLoadError("");
      } catch (error) {
        console.error(error);
        if (!isMounted) return;
        setLoadError(error instanceof Error ? error.message : "Failed to load browse homepage data");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchBrowseData();

    return () => {
      isMounted = false;
    };
  }, []);

  const featuredJobs = filterJobs(browseData.jobs, filters);
  const categoryScopedJobs = filterJobs(browseData.jobs, filters, { ignoreCategory: true });
  const companyScopedJobs = filterJobs(browseData.jobs, filters, { ignoreCompany: true });

  const dynamicCategories = browseData.categories
    .map((category) => ({
      ...category,
      count: categoryScopedJobs.filter((job) => slugify(job.derivedCategory) === category.slug).length,
    }))
    .filter((category) => category.count > 0);

  const dynamicCompanies = browseData.topCompanies
    .map((company) => ({
      ...company,
      jobCount: companyScopedJobs.filter((job) => slugify(job.companyName) === company.slug).length,
    }))
    .filter((company) => company.jobCount > 0);

  const totalPages = Math.max(1, Math.ceil(featuredJobs.length / JOBS_PER_PAGE));
  const totalCategoryPages = Math.max(1, Math.ceil(dynamicCategories.length / CATEGORIES_PER_PAGE));
  const hasActiveFilters = Object.values(filters).some(Boolean);
  const keywords = Array.from(new Set(browseData.jobs.map((job) => job.title))).sort();

  useEffect(() => {
    setPage(1);
    setCategoryPage(1);
  }, [filters]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  useEffect(() => {
    if (categoryPage > totalCategoryPages) setCategoryPage(totalCategoryPages);
  }, [categoryPage, totalCategoryPages]);

  useEffect(() => {
    if (totalPages <= 1 || isPaused) return;

    const interval = setInterval(() => {
      setPage((prev) => (prev >= totalPages ? 1 : prev + 1));
    }, 3000);

    return () => clearInterval(interval);
  }, [isPaused, totalPages]);

  const updateDraftField = (field: keyof BrowseFilters, value: string) => {
    setDraftFilters((current) => ({ ...current, [field]: value }));
  };

  const submitSearch = () => {
    const nextFilters = { ...filters, ...draftFilters };
    setFilters(nextFilters);
    applyFilterToUrl(nextFilters, pathname, router);
  };

  const clearAllFilters = () => {
    setFilters(DEFAULT_BROWSE_FILTERS);
    setDraftFilters(DEFAULT_BROWSE_FILTERS);
    applyFilterToUrl(DEFAULT_BROWSE_FILTERS, pathname, router);
  };

  const checkAuth = () => {
    const hasToken = typeof window !== "undefined" && !!localStorage.getItem("token");
    return status === "authenticated" || hasToken;
  };

  const handleJobClick = (jobId: string) => {
    if (!checkAuth()) {
      router.push(`/auth/login?redirectTo=/jobseeker/jobs/${jobId}`);
      return;
    }
    window.open(`/jobseeker/jobs/${jobId}`, "_blank");
  };

  const openCategoryJobs = (categoryLabel: string) => {
    router.push(`/jobseeker/gigs?category=${encodeURIComponent(categoryLabel)}`);
  };

  const toggleCompany = (company: string) => {
    if (!checkAuth()) {
      router.push(`/auth/login?redirectTo=/jobseeker/browse`);
      return;
    }
    const nextFilters = {
      ...filters,
      company: filters.company === company ? "" : company,
    };
    setFilters(nextFilters);
    setDraftFilters(nextFilters);
    applyFilterToUrl(nextFilters, pathname, router);
  };

  return (
    <div className="min-h-screen bg-[#f7fafc]">
      <section className="relative h-[560px] w-full overflow-visible">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source src="/hero-video.mp4" type="video/mp4" />
        </video>

        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,15,25,0.35),rgba(10,15,25,0.72))]" />
        <div className="absolute inset-x-0 bottom-0 h-36 bg-[linear-gradient(180deg,rgba(247,250,252,0),rgba(247,250,252,1))]" />

        <div className="relative z-10 mx-auto flex h-full max-w-6xl flex-col justify-center px-6 text-center">
          <h1 className="mx-auto max-w-3xl text-4xl font-bold text-white md:text-6xl">
            Find your next Gig
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-200 md:text-lg">
            Discover one day job opportunities tailored for you
          </p>

          <div className="relative z-30 mt-10 w-full overflow-visible">
            <SearchBar
              keywords={keywords}
              keyword={draftFilters.keyword}
              setKeyword={(value) => updateDraftField("keyword", value)}
              district={draftFilters.district}
              setDistrict={(value) => updateDraftField("district", value)}
              pay={draftFilters.pay}
              setPay={(value) => updateDraftField("pay", value)}
              date={draftFilters.date}
              setDate={(value) => updateDraftField("date", value)}
              onSearch={submitSearch}
              onClear={clearAllFilters}
            />
          </div>
        </div>
      </section>

      <section className="mx-auto -mt-6 max-w-6xl px-6">
        {hasActiveFilters && (
          <div className="rounded-[24px] border border-slate-200 bg-white px-5 py-4 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-wrap gap-2">
                {Object.entries(filters).map(([key, value]) =>
                  value ? (
                    <span
                      key={key}
                      className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700"
                    >
                      {key}: {value}
                    </span>
                  ) : null,
                )}
              </div>
              <button
                onClick={clearAllFilters}
                className="self-start rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                Reset all filters
              </button>
            </div>
          </div>
        )}
      </section>

      {loadError ? (
        <section className="max-w-6xl mx-auto px-6 py-16">
          <div className="rounded-[28px] border border-red-100 bg-white px-8 py-14 text-center shadow-sm">
            <h2 className="text-2xl font-semibold text-slate-900">Browse homepage data could not be loaded</h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-500">{loadError}</p>
          </div>
        </section>
      ) : isLoading ? (
        <section className="max-w-6xl mx-auto px-6 py-16">
          <div className="rounded-[28px] bg-white px-8 py-14 text-center shadow-sm text-slate-500">
            Loading browse homepage...
          </div>
        </section>
      ) : (
        <>
          <FeaturedJobsSection
            jobs={featuredJobs}
            jobsPerPage={JOBS_PER_PAGE}
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            onPauseChange={setIsPaused}
            hasActiveFilters={hasActiveFilters}
            onClearFilters={clearAllFilters}
            onJobClick={handleJobClick}
          />

          <JobCategoriesSection
            categories={dynamicCategories}
            activeCategory={filters.category}
            page={categoryPage}
            totalPages={totalCategoryPages}
            categoriesPerPage={CATEGORIES_PER_PAGE}
            onPageChange={setCategoryPage}
            onCategoryClick={openCategoryJobs}
          />

          <TopHiringCompaniesSection
            companies={dynamicCompanies}
            activeCompany={filters.company}
            onCompanyClick={toggleCompany}
          />
        </>
      )}

      <StatsSection stats={browseData.stats} />
      <ReviewSection />
    </div>
  );
}
