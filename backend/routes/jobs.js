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

    // Strict validation for PUBLISHED jobs
    if (status === "PUBLISHED") {
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
  } catch {
    res.status(500).json({ message: "Failed to create job" });
  }
});

export default router;
