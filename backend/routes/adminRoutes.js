const express = require("express");
const { getSystemStats, deleteUser, deleteJob, getUsers, banUser, suspendRecruiter } = require("../controllers/adminController");
const { authenticateToken, authorizeRoles } = require("../middleware/auth");

const router = express.Router();

// @route   GET /api/admin/stats
// @desc    Get system-wide statistics
// @access  Private / Admin Only
router.get("/stats", authenticateToken, authorizeRoles("ADMIN"), getSystemStats);

// @route   GET /api/admin/users
// @desc    Get all users with pagination
// @access  Private / Admin Only
router.get("/users", authenticateToken, authorizeRoles("ADMIN"), getUsers);

// @route   DELETE /api/admin/users/:userId
// @desc    Delete a user
// @access  Private / Admin Only
router.delete("/users/:userId", authenticateToken, authorizeRoles("ADMIN"), deleteUser);

// @route   PUT /api/admin/users/:userId/ban
// @desc    Ban or Unban a user (Soft Delete)
// @access  Private / Admin Only
router.put("/users/:userId/ban", authenticateToken, authorizeRoles("ADMIN"), banUser);

// @route   PUT /api/admin/recruiters/:userId/suspend
// @desc    Suspend or Unsuspend a recruiter
// @access  Private / Admin Only
router.put("/recruiters/:userId/suspend", authenticateToken, authorizeRoles("ADMIN"), suspendRecruiter);

// @route   DELETE /api/admin/jobs/:jobId
// @desc    Delete a job
// @access  Private / Admin Only
router.delete("/jobs/:jobId", authenticateToken, authorizeRoles("ADMIN"), deleteJob);

module.exports = router;
