const express = require("express");
const router = express.Router();

// ONLY use these if this route file really needs them
const authenticateToken = require("../middleware/authenticateToken");
const requireAdmin = require("../middleware/requireAdmin");

// Example safe test route
router.get("/", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Main users route working",
  });
});

// Example admin-protected route if needed
router.get("/admin-test", authenticateToken, requireAdmin, (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Main users admin test route working",
  });
});

module.exports = router;