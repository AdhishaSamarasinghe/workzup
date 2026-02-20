const express = require("express");
const { registerUser, loginUser, refreshAccessToken, logoutUser, getMe, verifyEmail } = require("../controllers/authController");
const { authenticateToken } = require("../middleware/auth");
const { authLimiter } = require("../middleware/rateLimiter");

const router = express.Router();

// Public routes
router.post("/register", authLimiter, registerUser);
router.post("/login", authLimiter, loginUser);
router.post("/refresh", refreshAccessToken);
router.post("/logout", logoutUser);
router.get("/verify-email", verifyEmail);

// Protected routes
router.get("/me", authenticateToken, getMe);

module.exports = router;
