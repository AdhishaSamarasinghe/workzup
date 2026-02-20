const express = require("express");
const { applyForJob, getApplicationsForJob } = require("../controllers/applicationController");
const { authenticateToken, authorizeRoles } = require("../middleware/auth");
const { applyJobLimiter } = require("../middleware/rateLimiter");

const router = express.Router();

// @route   POST /api/applications/:jobId
// @desc    Apply to a specific job
// @access  Private / Jobseeker Only
router.post("/:jobId", authenticateToken, authorizeRoles("JOBSEEKER"), applyJobLimiter, applyForJob);

// @route   GET /api/applications/job/:jobId
// @desc    Get all applications for a specific job
// @access  Private / Recruiter Only
router.get("/job/:jobId", authenticateToken, authorizeRoles("RECRUITER"), getApplicationsForJob);

module.exports = router;
