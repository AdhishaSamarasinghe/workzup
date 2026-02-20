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

module.exports = { applyForJob };
