/**
 *   GET    /api/jobs          → list all jobs (newest first)
 *   POST   /api/jobs          → create a new job
 *   GET    /api/jobs/:id      → fetch a single job by id
 *   PUT    /api/jobs/:id      → update a job by id
 *   DELETE /api/jobs/:id      → delete a job by id
 */

const express = require("express");
const prisma = require("../prismaClient");
const db = require("../models/db");
const { authenticateToken, requireRole } = require("../middleware/auth");
const { buildBrowseJob, buildCategorySummary, getBrowseHomeData } = require("../utils/publicBrowseData");

const router = express.Router();

// Ensures a value is always an array.
const toArray = (val) => (Array.isArray(val) ? val : []);

function normalizeRawJob(job) {
  return {
    id: job.id,
    employerId: job.employerId || null,
    companyId: job.companyId || null,
    title: job.title || "",
    description: job.description || "",
    pay: Number(job.pay || 0),
    payType: job.payType || "hour",
    category: job.category || "",
    locations: toArray(job.locations),
    jobDates: toArray(job.jobDates),
    startTime: job.startTime || null,
    endTime: job.endTime || null,
    requirements: toArray(job.requirements),
    status: job.status || "DRAFT",
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
  };
}

async function fetchJobsFromSqlFallback(statuses = null) {
  const hasStatuses = Array.isArray(statuses) && statuses.length > 0;
  const sql = hasStatuses
    ? `
      select
        id,
        "employerId",
        "companyId",
        title,
        description,
        pay,
        "payType",
        category,
        locations,
        "jobDates",
        "startTime",
        "endTime",
        requirements,
        status,
        "createdAt",
        "updatedAt"
      from "Job"
      where status = any($1)
      order by "createdAt" desc
    `
    : `
      select
        id,
        "employerId",
        "companyId",
        title,
        description,
        pay,
        "payType",
        category,
        locations,
        "jobDates",
        "startTime",
        "endTime",
        requirements,
        status,
        "createdAt",
        "updatedAt"
      from "Job"
      order by "createdAt" desc
    `;

  const result = hasStatuses ? await db.query(sql, [statuses]) : await db.query(sql);
  return result.rows.map(normalizeRawJob);
}

// GET /api/jobs — returns all jobs sorted newest-first
router.get("/", async (req, res) => {
  try {
    const jobs = await prisma.job.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(jobs);
  } catch (err) {
    console.error("Error fetching jobs with Prisma:", err);
    try {
      const fallbackJobs = await fetchJobsFromSqlFallback();
      return res.json(fallbackJobs);
    } catch (fallbackErr) {
      console.error("Error fetching jobs with SQL fallback:", fallbackErr);
      res.status(500).json({ message: "Failed to fetch jobs" });
    }
  }
});

router.get("/browse/home", async (req, res) => {
  try {
    const data = await getBrowseHomeData(prisma);
    res.json(data);
  } catch (err) {
    console.error("Error fetching browse home data with Prisma:", err);
    try {
      const fallbackJobs = await fetchJobsFromSqlFallback(["PUBLIC", "ACTIVE"]);
      const browseJobs = fallbackJobs.map(buildBrowseJob);
      const categories = buildCategorySummary(browseJobs);

      return res.json({
        jobs: browseJobs,
        categories,
        topCompanies: [],
        stats: {
          totalJobs: browseJobs.length,
          totalCategories: categories.length,
          totalCompanies: 0,
          totalSeekers: 0,
          totalApplications: 0,
        },
        degraded: true,
        message: "Loaded with SQL fallback due to Prisma query failure",
      });
    } catch (fallbackErr) {
      console.error("Error fetching browse home data with SQL fallback:", fallbackErr);
    }

    res.json({
      jobs: [],
      categories: [],
      topCompanies: [],
      stats: {
        totalJobs: 0,
        totalCategories: 0,
        totalCompanies: 0,
        totalSeekers: 0,
        totalApplications: 0,
      },
      degraded: true,
      message: "Failed to fetch browse home data",
    });
  }
});

router.get("/public-search", async (req, res) => {
  try {
    const {
      district = "",
      date = "",
      category = "",
      minPay = "",
      maxPay = "",
    } = req.query;

    const [jobs, maxPayAggregate] = await Promise.all([
      prisma.job.findMany({
        where: {
          status: { in: ["PUBLIC", "ACTIVE"] },
        },
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
      }),
      prisma.job.aggregate({
        where: { status: { in: ["PUBLIC", "ACTIVE"] } },
        _max: { pay: true },
      }),
    ]);

    const browseJobs = jobs.map(buildBrowseJob);
    const categoryOptions = buildCategorySummary(browseJobs).map((item) => item.label);

    const filteredJobs = browseJobs.filter((job) => {
      const matchesDistrict = !district || job.locations.includes(String(district)) || job.location === String(district);
      const matchesDate = !date || job.jobDates.includes(String(date)) || job.date === String(date);
      const matchesCategory =
        !category ||
        category === "All Jobs" ||
        category === "All Categories" ||
        job.derivedCategory === String(category);
      const matchesMinPay = minPay === "" || job.pay >= Number(minPay);
      const matchesMaxPay = maxPay === "" || job.pay <= Number(maxPay);

      return matchesDistrict && matchesDate && matchesCategory && matchesMinPay && matchesMaxPay;
    });

    res.json({
      jobs: filteredJobs,
      categories: categoryOptions,
      maxPay: Number(maxPayAggregate._max.pay || 5000),
    });
  } catch (err) {
    console.error("Error fetching public search jobs with Prisma:", err);

    try {
      const {
        district = "",
        date = "",
        category = "",
        minPay = "",
        maxPay = "",
      } = req.query;

      const fallbackJobs = await fetchJobsFromSqlFallback(["PUBLIC", "ACTIVE"]);
      const browseJobs = fallbackJobs.map(buildBrowseJob);
      const categoryOptions = buildCategorySummary(browseJobs).map((item) => item.label);

      const filteredJobs = browseJobs.filter((job) => {
        const matchesDistrict = !district || job.locations.includes(String(district)) || job.location === String(district);
        const matchesDate = !date || job.jobDates.includes(String(date)) || job.date === String(date);
        const matchesCategory =
          !category ||
          category === "All Jobs" ||
          category === "All Categories" ||
          job.derivedCategory === String(category);
        const matchesMinPay = minPay === "" || job.pay >= Number(minPay);
        const matchesMaxPay = maxPay === "" || job.pay <= Number(maxPay);

        return matchesDistrict && matchesDate && matchesCategory && matchesMinPay && matchesMaxPay;
      });

      const fallbackMaxPay = filteredJobs.reduce(
        (maxValue, job) => (job.pay > maxValue ? job.pay : maxValue),
        0,
      );

      return res.json({
        jobs: filteredJobs,
        categories: categoryOptions,
        maxPay: Number(fallbackMaxPay || 5000),
        degraded: true,
      });
    } catch (fallbackErr) {
      console.error("Error fetching public search jobs with SQL fallback:", fallbackErr);
      res.status(500).json({ message: "Failed to fetch public search jobs" });
    }
  }
});

// POST /api/jobs — creates a new job
// We use authenticateToken so req.user is available
router.post("/", authenticateToken, requireRole(["EMPLOYER", "RECRUITER"]), async (req, res) => {
  try {
    const {
      title,
      description,
      pay,
      payType,
      category,
      locations,
      jobDates,
      startTime,
      endTime,
      requirements,
      status
    } = req.body;

    const currentStatus = status || "DRAFT";

    if (currentStatus === "PUBLIC" || currentStatus === "PRIVATE") {
      if (!title?.trim()) return res.status(400).json({ message: "Job title is required" });
      if (!description?.trim()) return res.status(400).json({ message: "Job description is required" });
      if (pay === undefined || Number(pay) <= 0) return res.status(400).json({ message: "Pay must be a positive number" });
      if (!locations || !Array.isArray(locations) || locations.length === 0) return res.status(400).json({ message: "At least one location is required" });
      if (!jobDates || !Array.isArray(jobDates) || jobDates.length === 0) return res.status(400).json({ message: "At least one job date is required" });
      if (!startTime) return res.status(400).json({ message: "Start time is required" });
      if (!endTime) return res.status(400).json({ message: "End time is required" });
    } else {
      if (!title?.trim()) return res.status(400).json({ message: "Job title is required" });
    }

    const employerId = req.user.userId;

    const employer = await prisma.user.findUnique({
      where: { id: employerId },
      select: { isVerified: true, verificationStatus: true },
    });

    if (!employer) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!employer.isVerified || String(employer.verificationStatus || "").toUpperCase() !== "APPROVED") {
      return res.status(403).json({
        message:
          "Your account is pending admin verification. You can post jobs after your account is approved.",
      });
    }

    const newJob = await prisma.job.create({
      data: {
        employerId,
        title: title?.trim(),
        description: description?.trim() || "",
        pay: Number(pay) || 0,
        payType: payType || "hour",
        category: category || "Hospitality",
        locations: toArray(locations),
        jobDates: toArray(jobDates),
        startTime,
        endTime,
        requirements: toArray(requirements),
        status: currentStatus,
      }
    });

    res.status(201).json(newJob);
  } catch (err) {
    console.error("Error creating job:", err);
    res.status(500).json({ message: `Failed to create job: ${err.message}` });
  }
});

// GET /api/jobs/recommendations/ai — fetch AI job recommendations
router.get("/recommendations/ai", authenticateToken, requireRole(["JOB_SEEKER"]), async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { seekerProfile: true }
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get all public jobs
    const jobs = await prisma.job.findMany({
      where: { status: { in: ["PUBLIC", "ACTIVE"] } },
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
    });

    if (!jobs || jobs.length === 0) {
      return res.json([]);
    }

    // Prepare profile payload
    const profile = user.seekerProfile || {};
    
    // Resolve absolute path for CV if it exists
    let cvPath = null;
    if (user.cv) {
      const path = require('path');
      cvPath = path.resolve(__dirname, "..", user.cv);
    }

    // Build payload for AI service
    const payload = {
      profile: {
        title: profile.title,
        bio: profile.bio,
        skills: profile.skills || [],
        education: profile.education || [],
        experience: profile.experience || [],
        languages: profile.languages || []
      },
      cvPath: cvPath,
      jobs: jobs.map(j => ({
        id: j.id,
        title: j.title,
        description: j.description,
        requirements: j.requirements || [],
        category: j.category
      }))
    };

    // Call Python AI Service
    const aiServiceUrl = process.env.AI_SERVICE_URL || "http://127.0.0.1:5002/recommend";
    
    // Use global fetch (available in Node 18+)
    const response = await fetch(aiServiceUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`AI Service responded with status: ${response.status}`);
    }

    const aiResult = await response.json();
    
    if (!aiResult.success) {
      throw new Error(aiResult.error || "AI Service failed");
    }

    const recommendations = aiResult.recommendations || [];
    const jobMap = new Map(jobs.map(j => [j.id, j]));
    
    const hydratedJobs = recommendations
      .filter(r => jobMap.has(r.jobId) /* && r.score > 0 */)
      .map(r => {
        const fullJob = jobMap.get(r.jobId);
        const formatted = buildBrowseJob(fullJob);
        formatted.matchScore = r.score;
        return formatted;
      })
      .slice(0, 10); // Return top 10 matches

    res.json(hydratedJobs);

  } catch (err) {
    console.error("Error fetching AI recommendations:", err);
    res.status(500).json({ message: "Failed to fetch recommendations: " + err.message });
  }
});

// GET /api/jobs/:id — fetch a single job by ID
router.get("/:id", async (req, res) => {
  try {
    const job = await prisma.job.findUnique({
      where: { id: req.params.id },
    });
    if (!job) return res.status(404).json({ message: "Job not found" });
    res.json(job);
  } catch (err) {
    console.error("Error fetching job:", err);
    res.status(500).json({ message: `Failed to fetch job: ${err.message}` });
  }
});

// PUT /api/jobs/:id — full update of a job
router.put("/:id", authenticateToken, requireRole(["EMPLOYER", "RECRUITER"]), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      pay,
      payType,
      category,
      locations,
      jobDates,
      startTime,
      endTime,
      requirements,
      status
    } = req.body;

    const existingJob = await prisma.job.findUnique({ where: { id } });
    if (!existingJob) return res.status(404).json({ message: "Job not found" });

    // Ensure the user trying to update the job is the one who created it
    if (existingJob.employerId !== req.user.userId) {
      return res.status(403).json({ message: "Forbidden: You are not the owner of this job" });
    }

    const currentStatus = status || existingJob.status;

    if (currentStatus === "PUBLIC" || currentStatus === "PRIVATE") {
      if (!title?.trim()) return res.status(400).json({ message: "Job title is required" });
      if (!description?.trim()) return res.status(400).json({ message: "Job description is required" });
      if (pay === undefined || Number(pay) <= 0) return res.status(400).json({ message: "Pay must be a positive number" });
      if (!locations || !Array.isArray(locations) || locations.length === 0) return res.status(400).json({ message: "At least one location is required" });
      if (!jobDates || !Array.isArray(jobDates) || jobDates.length === 0) return res.status(400).json({ message: "At least one job date is required" });
      if (!startTime) return res.status(400).json({ message: "Start time is required" });
      if (!endTime) return res.status(400).json({ message: "End time is required" });
    } else {
      if (!title?.trim()) return res.status(400).json({ message: "Job title is required" });
    }

    const updatedJob = await prisma.job.update({
      where: { id },
      data: {
        title: title?.trim(),
        description: description?.trim(),
        pay: Number(pay),
        payType: payType || existingJob.payType,
        category: category || existingJob.category,
        locations: toArray(locations),
        jobDates: toArray(jobDates),
        startTime,
        endTime,
        requirements: toArray(requirements),
        status: currentStatus,
      }
    });

    res.json(updatedJob);
  } catch (err) {
    console.error("Error updating job:", err);
    res.status(500).json({ message: "Failed to update job" });
  }
});

// DELETE /api/jobs/:id — removes a job
router.delete("/:id", authenticateToken, requireRole(["EMPLOYER", "RECRUITER"]), async (req, res) => {
  try {
    const { id } = req.params;
    const existingJob = await prisma.job.findUnique({ where: { id } });

    if (!existingJob) return res.status(404).json({ message: "Job not found" });

    if (existingJob.employerId !== req.user.userId) {
      return res.status(403).json({ message: "Forbidden: You are not the owner of this job" });
    }

    await prisma.job.delete({ where: { id } });
    res.json({ message: "Job deleted successfully" });
  } catch (err) {
    console.error("Error deleting job:", err);
    res.status(500).json({ message: "Failed to delete job" });
  }
});

module.exports = router;
