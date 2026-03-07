const { jobs } = require('../data/memoryStore');
const crypto = require('crypto');

// POST /api/jobs
// Create a job
const createJob = (req, res) => {
    const { title, description, ...otherData } = req.body;

    const newJob = {
        id: crypto.randomUUID ? crypto.randomUUID() : (Date.now().toString() + Math.random().toString(36).substring(7)),
        title,
        description,
        ...otherData,
        createdAt: new Date().toISOString()
    };

    jobs.push(newJob);
    res.status(201).json({ success: true, data: newJob });
};

// GET /api/jobs
// Return all jobs
const getAllJobs = (req, res) => {
    res.status(200).json({ success: true, data: jobs });
};

// GET /api/jobs/:id
// Return a specific job
const getJobById = (req, res) => {
    const job = jobs.find(j => j.id === req.params.id);

    if (!job) {
        return res.status(404).json({ success: false, error: 'Job not found' });
    }

    res.status(200).json({ success: true, data: job });
};

module.exports = {
    createJob,
    getAllJobs,
    getJobById
};
