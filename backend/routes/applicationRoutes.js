const express = require("express");
const { applyForJob } = require("../controllers/applicationController");
const { authenticateToken, authorizeRoles } = require("../middleware/auth");

const router = express.Router();

// @route   POST /api/applications/:jobId
// @desc    Apply to a specific job
// @access  Private / Jobseeker Only
router.post("/:jobId", authenticateToken, authorizeRoles("JOBSEEKER"), applyForJob);

module.exports = router;
