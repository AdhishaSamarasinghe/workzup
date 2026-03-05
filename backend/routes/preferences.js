const express = require("express");
const router = express.Router();
const { getPreferences, updatePreferences } = require("../controllers/preferencesController");

router.get("/:userId", getPreferences);
router.put("/:userId", updatePreferences);

module.exports = router;
