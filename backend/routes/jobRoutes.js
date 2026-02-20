const express = require("express");
const { createJob } = require("../controllers/jobController");
const { authenticateToken, authorizeRoles } = require("../middleware/auth");

const router = express.Router();

// @route   POST /api/jobs
// @desc    Create a new job posting
// @access  Private / Recruiter Only
router.post("/", authenticateToken, authorizeRoles("RECRUITER"), createJob);

module.exports = router;
