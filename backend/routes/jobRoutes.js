const express = require("express");
const { createJob, getJobs } = require("../controllers/jobController");
const { authenticateToken, authorizeRoles } = require("../middleware/auth");

const router = express.Router();

// @route   GET /api/jobs
// @desc    Get all jobs
// @access  Public
router.get("/", getJobs);

// @route   POST /api/jobs
// @desc    Create a new job posting
// @access  Private / Recruiter Only
router.post("/", authenticateToken, authorizeRoles("RECRUITER"), createJob);

module.exports = router;
