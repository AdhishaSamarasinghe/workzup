const express = require("express");
const { getSystemStats } = require("../controllers/adminController");
const { authenticateToken, authorizeRoles } = require("../middleware/auth");

const router = express.Router();

// @route   GET /api/admin/stats
// @desc    Get system-wide statistics
// @access  Private / Admin Only
router.get("/stats", authenticateToken, authorizeRoles("ADMIN"), getSystemStats);

module.exports = router;
