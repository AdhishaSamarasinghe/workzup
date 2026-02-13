import express from "express";
import { Job } from "../models/Job.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    res.json(jobs);
  } catch {
    res.status(500).json({ message: "Failed to fetch jobs" });
  }
});

router.post("/", async (req, res) => {
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

    // Strict validation for PUBLIC jobs
    if (status === "PUBLIC") {
      if (!title?.trim()) return res.status(400).json({ message: "Job title is required" });
      if (!description?.trim()) return res.status(400).json({ message: "Job description is required" });
      if (pay === undefined || Number(pay) <= 0) return res.status(400).json({ message: "Pay must be a positive number" });
      if (!locations || locations.length === 0) return res.status(400).json({ message: "At least one location is required" });
      if (!jobDates || jobDates.length === 0) return res.status(400).json({ message: "At least one job date is required" });
      // Optional: Add validation for start/end time if critical for published jobs
    }

    const job = await Job.create({
      title,
      description,
      pay: Number(pay),
      payType,
      category,
      locations: Array.isArray(locations) ? locations : [],
      jobDates: Array.isArray(jobDates) ? jobDates : [],
      startTime,
      endTime,
      requirements: Array.isArray(requirements) ? requirements : [],
      status: status || "DRAFT",
    });

    res.status(201).json(job);
  } catch (err) {
    console.error("Error creating job:", err);
    res.status(500).json({ message: `Failed to create job: ${err.message}` });
  }
});

// GET single job by ID
router.get("/:id", async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });
    res.json(job);
  } catch (err) {
    console.error("Error fetching job:", err);
    res.status(500).json({ message: `Failed to fetch job: ${err.message}` });
  }
});

// PUT update job
router.put("/:id", async (req, res) => {
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

    // Strict validation for PUBLIC jobs
    if (status === "PUBLIC") {
      if (!title?.trim()) return res.status(400).json({ message: "Job title is required" });
      if (!description?.trim()) return res.status(400).json({ message: "Job description is required" });
      if (pay === undefined || Number(pay) <= 0) return res.status(400).json({ message: "Pay must be a positive number" });
      if (!locations || locations.length === 0) return res.status(400).json({ message: "At least one location is required" });
      if (!jobDates || jobDates.length === 0) return res.status(400).json({ message: "At least one job date is required" });
    }

    const updatedJob = await Job.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        pay: Number(pay),
        payType,
        category,
        locations: Array.isArray(locations) ? locations : [],
        jobDates: Array.isArray(jobDates) ? jobDates : [],
        startTime,
        endTime,
        requirements: Array.isArray(requirements) ? requirements : [],
        status: status || "DRAFT",
      },
      { new: true }
    );

    if (!updatedJob) return res.status(404).json({ message: "Job not found" });
    res.json(updatedJob);
  } catch {
    res.status(500).json({ message: "Failed to update job" });
  }
});

// DELETE job
router.delete("/:id", async (req, res) => {
  try {
    const deletedJob = await Job.findByIdAndDelete(req.params.id);
    if (!deletedJob) return res.status(404).json({ message: "Job not found" });
    res.json({ message: "Job deleted successfully" });
  } catch {
    res.status(500).json({ message: "Failed to delete job" });
  }
});

export default router;
