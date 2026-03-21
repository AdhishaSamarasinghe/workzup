const express = require("express");
const router = express.Router();

const usersRoutes = require("./users");
const jobsRoutes = require("./jobs");
const verificationsRoutes = require("./verifications");
const applicationsRoutes = require("./applications");
const reportsRoutes = require("./reports");

router.use("/users", usersRoutes);
router.use("/jobs", jobsRoutes);
router.use("/verifications", verificationsRoutes);
router.use("/applications", applicationsRoutes);
router.use("/reports", reportsRoutes);

module.exports = router;