const express = require("express");
const router = express.Router();

// Temporary stub for applications controller
const applicationsController = {
  listApplications: (req, res) => res.json({ message: "List of applications for oversight" }),
  getApplication: (req, res) => res.json({ message: `Details for application ${req.params.id}` }),
};

router.get("/", applicationsController.listApplications);
router.get("/:id", applicationsController.getApplication);

module.exports = router;
