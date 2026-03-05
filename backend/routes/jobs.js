const express = require('express');
const router = express.Router();
const jobsController = require('../controllers/jobsController');

// POST /api/jobs - Create a job
router.post('/', jobsController.createJob);

// GET /api/jobs - Return all jobs
router.get('/', jobsController.getAllJobs);

// GET /api/jobs/:id - Return a specific job
router.get('/:id', jobsController.getJobById);

module.exports = router;
