const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// @route   POST /api/applications/:jobId
// @desc    Apply to a specific job
// @access  Private / Jobseeker Only
const applyForJob = async (req, res) => {
    try {
        const { jobId } = req.params;
        const { coverLetter } = req.body;
        const jobseekerId = req.user.id; // Extracted from JWT

        // Ensure the job exists
        const job = await prisma.job.findUnique({ where: { id: jobId } });
        if (!job) {
            return res.status(404).json({ error: "Job not found" });
        }

        // Check if the user has already applied
        const existingApp = await prisma.application.findUnique({
            where: {
                jobId_jobseekerId: { jobId, jobseekerId }
            }
        });

        if (existingApp) {
            return res.status(400).json({ error: "You have already applied to this job." });
        }

        // Create application
        const application = await prisma.application.create({
            data: {
                jobId,
                jobseekerId,
                coverLetter,
            },
        });

        res.status(201).json({ message: "Applied successfully", application });
    } catch (error) {
        console.error("Apply For Job Error:", error);
        res.status(500).json({ error: "Server error while applying for job" });
    }
};

// @route   GET /api/applications/job/:jobId
// @desc    Get all applications for a specific job
// @access  Private / Recruiter Only
const getApplicationsForJob = async (req, res) => {
    try {
        const { jobId } = req.params;
        const recruiterId = req.user.id; // Extracted from JWT

        // Ensure the job exists and belongs to a company owned by this recruiter
        const job = await prisma.job.findUnique({
            where: { id: jobId },
            include: { company: true }
        });

        if (!job) {
            return res.status(404).json({ error: "Job not found" });
        }

        if (job.company.recruiterId !== recruiterId) {
            return res.status(403).json({ error: "You do not have permission to view applications for this job." });
        }

        // Fetch applications with jobseeker details
        const applications = await prisma.application.findMany({
            where: { jobId },
            include: {
                jobseeker: {
                    select: { id: true, name: true, email: true, profile: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        res.json({ message: "Applications retrieved successfully", count: applications.length, applications });
    } catch (error) {
        console.error("Get Applications Error:", error);
        res.status(500).json({ error: "Server error while fetching applications" });
    }
};

module.exports = { applyForJob, getApplicationsForJob };
