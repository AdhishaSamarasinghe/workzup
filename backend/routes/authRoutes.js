const express = require("express");
const { registerUser, loginUser, getMe } = require("../controllers/authController");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected routes
router.get("/me", authenticateToken, getMe);

module.exports = router;
