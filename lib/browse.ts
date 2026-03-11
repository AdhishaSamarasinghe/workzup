export type BrowseJob = {
  id: string;
  title: string;
  description: string;
  pay: number;
  payType: string;
  category: string;
  derivedCategory: string;
  locations: string[];
  location: string;
  jobDates: string[];
  date: string;
  startTime: string;
  endTime: string;
  createdAt: string;
  companyId: string | null;
  companyName: string;
  companyLogoUrl: string | null;
  companyIndustry: string | null;
  companyLocation: string | null;
  status: string;
};

export type BrowseCategory = {
  slug: string;
  label: string;
  count: number;
};

export type BrowseCompany = {
  companyId: string | null;
  slug: string;
  companyName: string;
  logoUrl: string | null;
  industry: string | null;
  location: string | null;
  jobCount: number;
  categoryCount: number;
  latestCreatedAt: string;
};

export type BrowseHomeData = {
  jobs: BrowseJob[];
  categories: BrowseCategory[];
  topCompanies: BrowseCompany[];
  stats: {
    totalJobs: number;
    totalCategories: number;
    totalCompanies: number;
    totalSeekers: number;
    totalApplications: number;
  };
};

export type BrowseFilters = {
  keyword: string;
  district: string;
  pay: string;
  date: string;
  category: string;
  company: string;
};

export function slugify(value: string) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const DEFAULT_BROWSE_FILTERS: BrowseFilters = {
  keyword: "",
  district: "",
  pay: "",
  date: "",
  category: "",
  company: "",
};

export function formatPay(pay: number, payType: string) {
  if (!Number.isFinite(pay)) return "Pay on request";
  const suffix = payType ? `/${payType}` : "";
  return `$${pay.toFixed(pay % 1 === 0 ? 0 : 2)}${suffix}`;
}

export function formatDateLabel(date: string) {
  if (!date) return "Flexible date";

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;

  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function matchesPayRange(pay: number, range: string) {
  if (!range) return true;
  if (range === "$40+") return pay >= 40;

  const match = range.match(/\$(\d+)-\$(\d+)/);
  if (!match) return true;

  const min = Number(match[1]);
  const max = Number(match[2]);
  return pay >= min && pay <= max;
}

export function normalizeText(value: string) {
  return value.trim().toLowerCase();
}
