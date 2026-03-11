const express = require("express");
const prisma = require("../prismaClient");
const { authenticateToken, requireRole } = require("../middleware/auth");
const { buildBrowseJob } = require("../utils/publicBrowseData");

const router = express.Router();

router.get("/", authenticateToken, requireRole(["JOB_SEEKER"]), async (req, res) => {
    try {
        const savedJobs = await prisma.savedJob.findMany({
            where: { userId: req.user.userId },
            include: {
                job: {
                    include: {
                        company: {
                            select: {
                                id: true,
                                name: true,
                                logoUrl: true,
                                industry: true,
                                city: true,
                                address: true,
                            },
                        },
                    },
                },
            },
            orderBy: { savedAt: "desc" },
        });

        res.json({
            savedJobs: savedJobs.map((entry) => ({
                id: entry.id,
                savedAt: entry.savedAt,
                job: buildBrowseJob(entry.job),
            })),
        });
    } catch (error) {
        console.error("Saved Jobs Fetch Error:", error);
        res.status(500).json({ message: "Failed to fetch saved jobs" });
    }
});

router.get("/:jobId/status", authenticateToken, requireRole(["JOB_SEEKER"]), async (req, res) => {
    try {
        const savedJob = await prisma.savedJob.findUnique({
            where: {
                userId_jobId: {
                    userId: req.user.userId,
                    jobId: req.params.jobId,
                },
            },
        });

        res.json({
            saved: Boolean(savedJob),
            savedAt: savedJob?.savedAt || null,
        });
    } catch (error) {
        console.error("Saved Job Status Error:", error);
        res.status(500).json({ message: "Failed to fetch saved job status" });
    }
});

router.post("/", authenticateToken, requireRole(["JOB_SEEKER"]), async (req, res) => {
    try {
        const { jobId } = req.body;

        if (!jobId) {
            return res.status(400).json({ message: "jobId is required" });
        }

        const job = await prisma.job.findUnique({ where: { id: jobId } });
        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }

        const savedJob = await prisma.savedJob.upsert({
            where: {
                userId_jobId: {
                    userId: req.user.userId,
                    jobId,
                },
            },
            update: {},
            create: {
                userId: req.user.userId,
                jobId,
            },
        });

        res.status(201).json({ message: "Job saved successfully", savedJob });
    } catch (error) {
        console.error("Save Job Error:", error);
        res.status(500).json({ message: "Failed to save job" });
    }
});

router.delete("/:jobId", authenticateToken, requireRole(["JOB_SEEKER"]), async (req, res) => {
    try {
        const savedJob = await prisma.savedJob.findUnique({
            where: {
                userId_jobId: {
                    userId: req.user.userId,
                    jobId: req.params.jobId,
                },
            },
        });

        if (!savedJob) {
            return res.status(404).json({ message: "Saved job not found" });
        }

        await prisma.savedJob.delete({ where: { id: savedJob.id } });
        res.json({ message: "Saved job removed successfully" });
    } catch (error) {
        console.error("Remove Saved Job Error:", error);
        res.status(500).json({ message: "Failed to remove saved job" });
    }
});

module.exports = router;
