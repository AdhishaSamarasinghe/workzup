const PUBLIC_JOB_STATUSES = ["PUBLIC", "ACTIVE"];

const CATEGORY_SYNONYMS = {
  hospitality: "Hospitality",
  hotel: "Hospitality",
  restaurant: "Hospitality",
  catering: "Hospitality",
  kitchen: "Hospitality",
  waiter: "Hospitality",
  waitress: "Hospitality",
  barista: "Hospitality",
  chef: "Hospitality",
  retail: "Retail",
  cashier: "Retail",
  store: "Retail",
  merchandiser: "Retail",
  sales: "Sales",
  marketing: "Marketing",
  promoter: "Marketing",
  promoterstaff: "Marketing",
  events: "Events",
  event: "Events",
  logistics: "Logistics",
  warehouse: "Logistics",
  delivery: "Logistics",
  driver: "Logistics",
  transport: "Logistics",
  admin: "Administration",
  administration: "Administration",
  assistant: "Administration",
  clerical: "Administration",
  office: "Administration",
  customerservice: "Customer Service",
  support: "Customer Service",
  callcentre: "Customer Service",
  callcenter: "Customer Service",
  cleaning: "Cleaning",
  cleaner: "Cleaning",
  housekeeping: "Cleaning",
  security: "Security",
  guard: "Security",
  construction: "Construction",
  labor: "Construction",
  labour: "Construction",
  technician: "Skilled Trades",
  electrician: "Skilled Trades",
  plumber: "Skilled Trades",
  mechanic: "Skilled Trades",
  engineering: "Engineering",
  engineer: "Engineering",
  developer: "Engineering",
  software: "Engineering",
  design: "Design",
  designer: "Design",
  ux: "Design",
  ui: "Design",
  healthcare: "Healthcare",
  health: "Healthcare",
  nurse: "Healthcare",
  caregiver: "Healthcare",
  education: "Education",
  teacher: "Education",
  tutor: "Education",
};

const INFERENCE_RULES = [
  { label: "Hospitality", keywords: ["hotel", "restaurant", "catering", "kitchen", "waiter", "waitress", "barista", "chef", "server"] },
  { label: "Retail", keywords: ["retail", "cashier", "store", "shop", "merchandiser", "shelf", "inventory"] },
  { label: "Events", keywords: ["event", "events", "booth", "usher", "ticketing", "exhibition", "stage crew"] },
  { label: "Logistics", keywords: ["warehouse", "delivery", "driver", "logistics", "dispatch", "loading", "transport"] },
  { label: "Administration", keywords: ["admin", "administration", "office", "assistant", "clerical", "data entry", "coordinator"] },
  { label: "Customer Service", keywords: ["customer service", "support", "call centre", "call center", "front desk", "reception"] },
  { label: "Cleaning", keywords: ["cleaner", "cleaning", "housekeeping", "janitor", "sanitation"] },
  { label: "Security", keywords: ["security", "guard", "surveillance", "patrol"] },
  { label: "Construction", keywords: ["construction", "site worker", "site assistant", "mason", "labourer", "laborer"] },
  { label: "Skilled Trades", keywords: ["electrician", "plumber", "mechanic", "technician", "welder"] },
  { label: "Engineering", keywords: ["developer", "software", "engineer", "frontend", "backend", "fullstack", "qa engineer"] },
  { label: "Design", keywords: ["designer", "ux", "ui", "graphic design", "creative"] },
  { label: "Healthcare", keywords: ["nurse", "caregiver", "healthcare", "clinic", "medical"] },
  { label: "Education", keywords: ["teacher", "tutor", "education", "trainer", "instructor"] },
  { label: "Marketing", keywords: ["marketing", "promoter", "brand ambassador", "social media", "campaign"] },
  { label: "Sales", keywords: ["sales", "business development", "lead generation", "account executive"] },
];

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function titleCase(value) {
  return String(value || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function normalizeCategory(rawCategory) {
  const compact = String(rawCategory || "")
    .toLowerCase()
    .replace(/[^a-z]/g, "");

  if (!compact) return null;
  return CATEGORY_SYNONYMS[compact] || titleCase(String(rawCategory));
}

function inferCategory(job) {
  const source = `${job.title || ""} ${job.description || ""}`.toLowerCase();
  for (const rule of INFERENCE_RULES) {
    if (rule.keywords.some((keyword) => source.includes(keyword))) {
      return rule.label;
    }
  }
  return "Other";
}

function getDerivedCategory(job) {
  return normalizeCategory(job.category) || inferCategory(job);
}

function getPrimaryLocation(job) {
  if (Array.isArray(job.locations) && job.locations.length > 0) {
    return job.locations[0];
  }

  const city = job.company?.city?.trim();
  const address = job.company?.address?.trim();
  return city || address || "Location flexible";
}

function getPrimaryDate(job) {
  if (Array.isArray(job.jobDates) && job.jobDates.length > 0) {
    return job.jobDates[0];
  }
  return "";
}

function getCompanyDisplayName(job) {
  return job.company?.name?.trim() || job.companyName?.trim() || "Independent Employer";
}

function buildBrowseJob(job) {
  const derivedCategory = getDerivedCategory(job);
  const companyName = getCompanyDisplayName(job);
  return {
    id: job.id,
    title: job.title,
    description: job.description || "",
    pay: Number(job.pay || 0),
    payType: job.payType || "hour",
    category: job.category || "",
    derivedCategory,
    locations: Array.isArray(job.locations) ? job.locations : [],
    location: getPrimaryLocation(job),
    jobDates: Array.isArray(job.jobDates) ? job.jobDates : [],
    date: getPrimaryDate(job),
    startTime: job.startTime || "",
    endTime: job.endTime || "",
    createdAt: job.createdAt,
    companyId: job.companyId || null,
    companyName,
    companyLogoUrl: job.company?.logoUrl || null,
    companyIndustry: job.company?.industry || null,
    companyLocation: job.company?.city || job.company?.address || null,
    status: job.status,
  };
}

function buildCategorySummary(jobs) {
  const counts = new Map();
  jobs.forEach((job) => {
    const current = counts.get(job.derivedCategory) || 0;
    counts.set(job.derivedCategory, current + 1);
  });

  return Array.from(counts.entries())
    .map(([label, count]) => ({
      slug: slugify(label),
      label,
      count,
    }))
    .sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return a.label.localeCompare(b.label);
    });
}

function buildTopCompanies(jobs) {
  const companyMap = new Map();

  jobs.forEach((job) => {
    if (!job.companyName || job.companyName === "Independent Employer") return;

    const key = slugify(job.companyName);
    const existing = companyMap.get(key) || {
      companyId: job.companyId,
      slug: key,
      companyName: job.companyName,
      logoUrl: job.companyLogoUrl,
      industry: job.companyIndustry,
      location: job.companyLocation,
      jobCount: 0,
      categoryLabels: new Set(),
      latestCreatedAt: job.createdAt,
    };

    existing.jobCount += 1;
    existing.categoryLabels.add(job.derivedCategory);
    if (!existing.latestCreatedAt || new Date(job.createdAt) > new Date(existing.latestCreatedAt)) {
      existing.latestCreatedAt = job.createdAt;
    }
    if (!existing.logoUrl && job.companyLogoUrl) existing.logoUrl = job.companyLogoUrl;
    if (!existing.industry && job.companyIndustry) existing.industry = job.companyIndustry;
    if (!existing.location && job.companyLocation) existing.location = job.companyLocation;

    companyMap.set(key, existing);
  });

  return Array.from(companyMap.values())
    .map((company) => ({
      companyId: company.companyId || null,
      slug: company.slug,
      companyName: company.companyName,
      logoUrl: company.logoUrl || null,
      industry: company.industry || null,
      location: company.location || null,
      jobCount: company.jobCount,
      categoryCount: company.categoryLabels.size,
      latestCreatedAt: company.latestCreatedAt,
    }))
    .sort((a, b) => {
      if (b.jobCount !== a.jobCount) return b.jobCount - a.jobCount;
      return new Date(b.latestCreatedAt) - new Date(a.latestCreatedAt);
    });
}

async function getBrowseHomeData(prisma) {
  let jobs = [];
  try {
    jobs = await prisma.job.findMany({
      where: { status: { in: PUBLIC_JOB_STATUSES } },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
            industry: true,
            city: true,
            address: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.warn("[browse/home] Falling back to jobs query without company relation:", error?.message || error);
    jobs = await prisma.job.findMany({
      where: { status: { in: PUBLIC_JOB_STATUSES } },
      orderBy: { createdAt: "desc" },
    });
  }

  const browseJobs = jobs.map(buildBrowseJob);
  const categories = buildCategorySummary(browseJobs);
  const topCompanies = buildTopCompanies(browseJobs);

  const safeCount = async (delegateName, args) => {
    try {
      const delegate = prisma?.[delegateName];
      if (!delegate || typeof delegate.count !== "function") {
        return 0;
      }

      const value = await delegate.count(args || {});
      return Number(value || 0);
    } catch {
      return 0;
    }
  };

  const [totalSeekersResult, totalApplicationsResult, totalCompaniesResult] =
    await Promise.allSettled([
      safeCount("user", { where: { role: "JOB_SEEKER" } }),
      safeCount("application"),
      safeCount("company"),
    ]);

  const totalSeekers =
    totalSeekersResult.status === "fulfilled" ? totalSeekersResult.value : 0;
  const totalApplications =
    totalApplicationsResult.status === "fulfilled"
      ? totalApplicationsResult.value
      : 0;
  const totalCompanies =
    totalCompaniesResult.status === "fulfilled"
      ? totalCompaniesResult.value
      : topCompanies.length;

  return {
    jobs: browseJobs,
    categories,
    topCompanies,
    stats: {
      totalJobs: browseJobs.length,
      totalCategories: categories.length,
      totalCompanies: totalCompanies,
      totalSeekers: totalSeekers,
      totalApplications: totalApplications,
    },
  };
}

module.exports = {
  buildCategorySummary,
  buildBrowseJob,
  getBrowseHomeData,
};
