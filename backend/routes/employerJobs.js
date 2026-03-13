const express = require('express');
const router = express.Router();
const employerJobsController = require('../controllers/employerJobs.controller');
const { authenticateToken } = require('../middleware/auth');

// All routes in this file are protected and require a recruiter/employer role
router.use(authenticateToken);

// GET /api/employer/my-postings
router.get('/', employerJobsController.getMyPostings);

// GET /api/employer/my-postings/:id
router.get('/:id', employerJobsController.getJobById);

// PUT /api/employer/my-postings/:id
router.put('/:id', employerJobsController.updateJob);

// DELETE /api/employer/my-postings/:id
router.delete('/:id', employerJobsController.deleteJob);

module.exports = router;

