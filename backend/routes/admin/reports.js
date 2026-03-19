const express = require("express");
const router = express.Router();

// Temporary stub for reports controller
const reportsController = {
  listReports: (req, res) => res.json({ message: "List of active reports" }),
  getReport: (req, res) => res.json({ message: `Details for report ${req.params.id}` }),
  resolveReport: (req, res) => res.json({ message: `Resolved report ${req.params.id}` }),
};

router.get("/", reportsController.listReports);
router.get("/:id", reportsController.getReport);
router.post("/:id/resolve", reportsController.resolveReport);

module.exports = router;
