const express = require("express");
const router = express.Router();

// Temporary stub for verifications controller
const verificationsController = {
  listVerifications: (req, res) => res.json({ message: "List of pending verifications" }),
  getVerification: (req, res) => res.json({ message: `Details for verification ${req.params.id}` }),
  approveVerification: (req, res) => res.json({ message: `Approved verification ${req.params.id}` }),
  rejectVerification: (req, res) => res.json({ message: `Rejected verification ${req.params.id}` }),
};

router.get("/", verificationsController.listVerifications);
router.get("/:id", verificationsController.getVerification);
router.post("/:id/approve", verificationsController.approveVerification);
router.post("/:id/reject", verificationsController.rejectVerification);

module.exports = router;
