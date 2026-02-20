const express = require("express");
const { sendMessage, getMessages } = require("../controllers/messageController");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

// @route   POST /api/messages/:applicationId
// @desc    Send a message within an application
// @access  Private / Authenticated
router.post("/:applicationId", authenticateToken, sendMessage);

// @route   GET /api/messages/:applicationId
// @desc    Get all messages within an application
// @access  Private / Authenticated
router.get("/:applicationId", authenticateToken, getMessages);

module.exports = router;
