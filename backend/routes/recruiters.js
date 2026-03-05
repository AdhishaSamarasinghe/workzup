const express = require("express");
const router = express.Router();
const {
    getRecruiterProfile,
    updateRecruiterProfile,
    getRecruiterJobs,
    getRecruiterReviews,
    contactRecruiter,
} = require("../controllers/recruitersController");

router.get("/:id", getRecruiterProfile);
router.put("/:id", updateRecruiterProfile);
router.get("/:id/jobs", getRecruiterJobs);
router.get("/:id/reviews", getRecruiterReviews);
router.post("/:id/contact", contactRecruiter);

module.exports = router;
