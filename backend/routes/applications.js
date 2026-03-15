const express = require("express");
const prisma = require("../prismaClient");
const { authenticateToken, requireRole } = require("../middleware/auth");
const router = express.Router();

const normalizeApplicationStatus = (application) => {
    if (!application) return application;
    return {
        ...application,
        status: application.status === "NEW" ? "PENDING" : application.status
    };
};

// POST /api/applications - Apply to a job
router.post("/", authenticateToken, requireRole(["JOB_SEEKER"]), async (req, res) => {
    try {
        const { jobId } = req.body;
        const applicantId = req.user.userId;

        if (!jobId) return res.status(400).json({ message: "jobId is required" });

        const job = await prisma.job.findUnique({ where: { id: jobId } });
        if (!job) return res.status(404).json({ message: "Job not found" });

        // Check for existing application
        const existing = await prisma.application.findUnique({
            where: { jobId_applicantId: { jobId, applicantId } }
        });

        if (existing) {
            return res.status(409).json({ message: "You have already applied to this job" });
        }

        const application = await prisma.application.create({
            data: {
                jobId,
                applicantId,
                status: "PENDING", // PENDING, CONTACTED, SHORTLISTED, HIRED, REJECTED
                matchScore: Math.floor(Math.random() * 40) + 60, // Mock AI Match logic
                relevantSkillsCount: 2
            }
        });

        // Trigger Notification to Employer
        await prisma.notification.create({
            data: {
                userId: job.employerId,
                type: "APPLICATION_UPDATE",
                title: "New Job Applicant",
                message: `Someone just applied to your job: ${job.title}`,
                linkUrl: `/recruiter/jobs/${job.id}`
            }
        });

        res.status(201).json({ message: "Application submitted successfully", application: normalizeApplicationStatus(application) });

    } catch (error) {
        console.error("Apply Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
});

// GET /api/applications/my-applications - View my own applications
router.get("/my-applications", authenticateToken, requireRole(["JOB_SEEKER"]), async (req, res) => {
    try {
        const applications = await prisma.application.findMany({
            where: { applicantId: req.user.userId },
            include: {
                job: {
                    include: {
                        company: true
                    }
                }
            },
            orderBy: { appliedAt: "desc" }
        });

        res.json({ applications: applications.map(normalizeApplicationStatus) });
    } catch (error) {
        console.error("My Applications Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
});

// GET /api/applications/:id - View one of my applications
router.get("/:id", authenticateToken, requireRole(["JOB_SEEKER"]), async (req, res) => {
    try {
        const { id } = req.params;

        const application = await prisma.application.findUnique({
            where: { id },
            include: {
                job: {
                    include: {
                        company: true
                    }
                },
                applicant: {
                    include: {
                        seekerProfile: true
                    }
                }
            }
        });

        if (!application) {
            return res.status(404).json({ message: "Application not found" });
        }

        if (application.applicantId !== req.user.userId) {
            return res.status(403).json({ message: "Forbidden" });
        }

        res.json({ application: normalizeApplicationStatus(application) });
    } catch (error) {
        console.error("Application Details Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
});

// DELETE /api/applications/:id - Withdraw application
router.delete("/:id", authenticateToken, requireRole(["JOB_SEEKER"]), async (req, res) => {
    try {
        const { id } = req.params;
        const application = await prisma.application.findUnique({ where: { id } });

        if (!application) return res.status(404).json({ message: "Application not found" });
        if (application.applicantId !== req.user.userId) return res.status(403).json({ message: "Forbidden" });

        await prisma.application.delete({ where: { id } });

        res.json({ message: "Application withdrawn successfully" });
    } catch (error) {
        console.error("Withdraw Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
});

module.exports = router;
