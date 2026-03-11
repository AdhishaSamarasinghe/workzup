/**
 *   GET    /api/jobs          → list all jobs (newest first)
 *   POST   /api/jobs          → create a new job
 *   GET    /api/jobs/:id      → fetch a single job by id
 *   PUT    /api/jobs/:id      → update a job by id
 *   DELETE /api/jobs/:id      → delete a job by id
 */

const express = require("express");
const prisma = require("../prismaClient");
const { authenticateToken, requireRole } = require("../middleware/auth");
const { getBrowseHomeData } = require("../utils/publicBrowseData");

const router = express.Router();

// Ensures a value is always an array.
const toArray = (val) => (Array.isArray(val) ? val : []);

// GET /api/jobs — returns all jobs sorted newest-first
router.get("/", async (req, res) => {
  try {
    const jobs = await prisma.job.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(jobs);
  } catch (err) {
    console.error("Error fetching jobs:", err);
    res.status(500).json({ message: "Failed to fetch jobs" });
  }
});

router.get("/browse/home", async (req, res) => {
  try {
    const data = await getBrowseHomeData(prisma);
    res.json(data);
  } catch (err) {
    console.error("Error fetching browse home data:", err);
    res.status(500).json({ message: "Failed to fetch browse home data" });
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
