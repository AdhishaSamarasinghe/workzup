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
    const { title, description, pay, payType, category, location, jobDate, status } = req.body;

    if (!title?.trim()) return res.status(400).json({ message: "Job title is required" });
    if (!description?.trim())
      return res.status(400).json({ message: "Job description is required" });
    if (pay === undefined || Number(pay) <= 0)
      return res.status(400).json({ message: "Pay must be a positive number" });
    if (!location?.trim()) return res.status(400).json({ message: "Location is required" });
    if (!jobDate) return res.status(400).json({ message: "Job date is required" });

    const job = await Job.create({
      title,
      description,
      pay: Number(pay),
      payType,
      category,
      location,
      jobDate,
      status: status || "DRAFT",
    });

    res.status(201).json(job);
  } catch {
    res.status(500).json({ message: "Failed to create job" });
  }
});

export default router;
