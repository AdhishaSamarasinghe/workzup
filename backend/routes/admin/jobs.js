const express = require("express");
const router = express.Router();

// Temporary stub for jobs controller
const jobsController = {
  listJobs: (req, res) => res.json({ message: "List of jobs for admin" }),
  getJob: (req, res) => res.json({ message: `Details for job ${req.params.id}` }),
  updateJob: (req, res) => res.json({ message: `Updated job ${req.params.id}` }),
  deleteJob: (req, res) => res.json({ message: `Deleted job ${req.params.id}` }),
};

router.get("/", jobsController.listJobs);
router.get("/:id", jobsController.getJob);
router.put("/:id", jobsController.updateJob);
router.delete("/:id", jobsController.deleteJob);

module.exports = router;
