const express = require("express");
const { registerUser, loginUser, refreshAccessToken, logoutUser, getMe } = require("../controllers/authController");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/refresh", refreshAccessToken);
router.post("/logout", logoutUser);

// Protected routes
router.get("/me", authenticateToken, getMe);

module.exports = router;
