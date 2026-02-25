/**
 *   GET    /api/jobs          → list all jobs (newest first)
 *   POST   /api/jobs          → create a new job
 *   GET    /api/jobs/:id      → fetch a single job by _id
 *   PUT    /api/jobs/:id      → update a job by _id
 *   DELETE /api/jobs/:id      → delete a job by _id
 */


import express from "express";
import crypto from "crypto";

const router = express.Router();



// Resets on server restart — acceptable for the current development phase.
let jobs = [];


// Ensures a value is always an array.
// Guards against the frontend accidentally sending a single string instead of an array.

const toArray = (val) => (Array.isArray(val) ? val : []);


//  GET /api/jobs — returns all jobs sorted newest-first
// Spreads into a new array before sorting to avoid mutating the store in place.

router.get("/", (req, res) => {
  try {
    const sortedJobs = [...jobs].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(sortedJobs);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch jobs" });
  }
});


//POST /api/jobs — creates a new job

router.post("/", (req, res) => {
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

    // Default to DRAFT if no status is provided
    const currentStatus = status || "DRAFT";

    // VALIDATION PUBLIC/PRIVATE jobs require full details so they can be shown to candidates.
   
    if (currentStatus === "PUBLIC" || currentStatus === "PRIVATE") {
      if (!title?.trim()) return res.status(400).json({ message: "Job title is required" });
      if (!description?.trim()) return res.status(400).json({ message: "Job description is required" });
      if (pay === undefined || Number(pay) <= 0) return res.status(400).json({ message: "Pay must be a positive number" });

      //  locations and jobDates must be non-empty arrays
      if (!locations || !Array.isArray(locations) || locations.length === 0) return res.status(400).json({ message: "At least one location is required" });
      if (!jobDates || !Array.isArray(jobDates) || jobDates.length === 0) return res.status(400).json({ message: "At least one job date is required" });

      if (!startTime) return res.status(400).json({ message: "Start time is required" });
      if (!endTime) return res.status(400).json({ message: "End time is required" });
    } else {
      //  only title is required
      if (!title?.trim()) return res.status(400).json({ message: "Job title is required" });
    }

    //Build the new job object.
   
    const newJob = {
      _id: crypto.randomBytes(12).toString("hex"),
      title: title?.trim(),
      description: description?.trim(),
      pay: Number(pay),
      payType: payType || "hour",
      category: category || "Hospitality",
      //  Normalize to arrays — frontend sends arrays, but guard just in case
      locations: toArray(locations),
      jobDates: toArray(jobDates),
      startTime,
      endTime,
      requirements: toArray(requirements),
      status: currentStatus,
      // Timestamps stored as ISO strings to match the shape Mongoose used to produce
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    jobs.push(newJob);

    // returns the full job object so the frontend can use _id immediately
    res.status(201).json(newJob);
  } catch (err) {
    console.error("Error creating job:", err);
    res.status(500).json({ message: `Failed to create job: ${err.message}` });
  }
});


//GET /api/jobs/:id — fetch a single job by its _id string
router.get("/:id", (req, res) => {
  try {
    const job = jobs.find((j) => j._id === req.params.id);
    // ERROR 404 if no job matches — edit-job page relies on this to show an error state
    if (!job) return res.status(404).json({ message: "Job not found" });
    res.json(job);
  } catch (err) {
    console.error("Error fetching job:", err);
    res.status(500).json({ message: `Failed to fetch job: ${err.message}` });
  }
});


// PUT /api/jobs/:id — full update of a job (replaces all mutable fields)

router.put("/:id", (req, res) => {
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

    const jobIndex = jobs.findIndex((j) => j._id === req.params.id);
    // ERROR 404 before any validation — no point validating a non-existent job
    if (jobIndex === -1) return res.status(404).json({ message: "Job not found" });

    // Fall back to the job's existing status if none is sent in the body
    const currentStatus = status || jobs[jobIndex].status;

    //  Same rules as POST — PUBLIC/PRIVATE require full details
    if (currentStatus === "PUBLIC" || currentStatus === "PRIVATE") {
      if (!title?.trim()) return res.status(400).json({ message: "Job title is required" });
      if (!description?.trim()) return res.status(400).json({ message: "Job description is required" });
      if (pay === undefined || Number(pay) <= 0) return res.status(400).json({ message: "Pay must be a positive number" });

      // VALIDATION Arrays must be non-empty for published jobs
      if (!locations || !Array.isArray(locations) || locations.length === 0) return res.status(400).json({ message: "At least one location is required" });
      if (!jobDates || !Array.isArray(jobDates) || jobDates.length === 0) return res.status(400).json({ message: "At least one job date is required" });

      if (!startTime) return res.status(400).json({ message: "Start time is required" });
      if (!endTime) return res.status(400).json({ message: "End time is required" });
    } else {

      //  only title is required
      if (!title?.trim()) return res.status(400).json({ message: "Job title is required" });
    }

    // Spread existing job first so _id and createdAt are preserved,
    // then overwrite all user-editable fields.

    const updatedJob = {
      ...jobs[jobIndex],
      title: title?.trim(),
      description: description?.trim(),
      pay: Number(pay),
      // Fall back to existing values if not provided in the request
      payType: payType || jobs[jobIndex].payType,
      category: category || jobs[jobIndex].category,
      locations: toArray(locations),
      jobDates: toArray(jobDates),
      startTime,
      endTime,
      requirements: toArray(requirements),
      status: currentStatus,
      updatedAt: new Date().toISOString(),
    };

    jobs[jobIndex] = updatedJob;
    res.json(updatedJob);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update job" });
  }
});


//  DELETE /api/jobs/:id — removes a job from the in-memory store
router.delete("/:id", (req, res) => {
  try {
    const jobIndex = jobs.findIndex((j) => j._id === req.params.id);
    if (jobIndex === -1) return res.status(404).json({ message: "Job not found" });

    // splice mutates the array in place — safe here since we own the store
    jobs.splice(jobIndex, 1);
    res.json({ message: "Job deleted successfully" });
  } catch {
    res.status(500).json({ message: "Failed to delete job" });
  }
});

export default router;
