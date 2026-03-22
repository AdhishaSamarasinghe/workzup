const express = require("express");
const prisma = require("../prismaClient");
const { authenticateToken } = require("../middleware/auth");
const {
    getOrCreateDirectConversation,
    resolveSupabaseAuthUserIdForAppUser,
} = require("../lib/supabaseAdmin");
const router = express.Router();

const normalizeApplicationStatus = (application) => {
    if (!application) return application;
    return {
        ...application,
        status: application.status === "NEW" ? "PENDING" : application.status
    };
};

// POST /api/applications - Apply to a job
router.post("/", authenticateToken, async (req, res) => {
    try {
        const {
            jobId,
            submittedCv,
            submittedIdFront,
            submittedIdBack,
        } = req.body;
        const applicantId = req.user.userId;

        if (!jobId) return res.status(400).json({ message: "jobId is required" });

        const job = await prisma.job.findUnique({ where: { id: jobId } });
        if (!job) return res.status(404).json({ message: "Job not found" });

        if (job.employerId === applicantId) {
            return res.status(400).json({ message: "You cannot apply to your own job" });
        }

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

        const userUpdate = {};
        if (typeof submittedCv === "string" && submittedCv.trim()) {
            userUpdate.cv = submittedCv;
        }
        if (typeof submittedIdFront === "string" && submittedIdFront.trim()) {
            userUpdate.idFront = submittedIdFront;
        }
        if (typeof submittedIdBack === "string" && submittedIdBack.trim()) {
            userUpdate.idBack = submittedIdBack;
        }

        if (Object.keys(userUpdate).length > 0) {
            await prisma.user.update({
                where: { id: applicantId },
                data: userUpdate,
            });
        }

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

        res.status(201).json({
            message: "Application submitted successfully",
            application: normalizeApplicationStatus(application),
            conversationId: null
        });

    } catch (error) {
        console.error("Apply Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
});

// GET /api/applications/my-applications - View my own applications
router.get("/my-applications", authenticateToken, async (req, res) => {
    try {
        const applications = await prisma.application.findMany({
            where: { applicantId: req.user.userId },
            include: {
                job: {
                    select: {
                        id: true,
                        employerId: true,
                        title: true,
                        category: true,
                        locations: true,
                        company: {
                            select: {
                                id: true,
                                name: true,
                                recruiterId: true,
                            }
                        }
                    },
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
router.get("/:id", authenticateToken, async (req, res) => {
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

// POST /api/applications/:id/conversation - Create/retrieve chat conversation for an application
router.post("/:id/conversation", authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const currentUserId = req.user.userId;

        const application = await prisma.application.findUnique({
            where: { id },
            include: {
                job: {
                    select: {
                        id: true,
                        employerId: true,
                        company: {
                            select: {
                                recruiterId: true,
                                name: true,
                            }
                        }
                    }
                },
                applicant: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                    }
                },
            }
        });

        if (!application) {
            return res.status(404).json({ message: "Application not found" });
        }

        const canAccess =
            application.applicantId === currentUserId ||
            application.job?.employerId === currentUserId;

        if (!canAccess) {
            return res.status(403).json({ message: "Forbidden" });
        }

        const recruiterPrismaUserId = application.job?.company?.recruiterId || application.job?.employerId;

        if (application.applicantId === recruiterPrismaUserId) {
            return res.status(400).json({ message: "Invalid application participants" });
        }

        if (!recruiterPrismaUserId) {
            return res.status(409).json({
                message: "Recruiter messaging is not available for this application yet.",
            });
        }

        const recruiterUser = await prisma.user.findUnique({
            where: { id: recruiterPrismaUserId },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
            },
        });

        if (!recruiterUser) {
            return res.status(404).json({ message: "Recruiter account not found" });
        }

        const requesterIsApplicant = application.applicantId === currentUserId;
        const requesterIsRecruiter = recruiterPrismaUserId === currentUserId || application.job?.employerId === currentUserId;

        let otherParticipantId = null;

        if (requesterIsApplicant) {
            otherParticipantId =
                (await resolveSupabaseAuthUserIdForAppUser(recruiterUser)) ||
                recruiterPrismaUserId;
        } else if (requesterIsRecruiter) {
            otherParticipantId =
                (await resolveSupabaseAuthUserIdForAppUser(application.applicant)) ||
                application.applicantId;
        }

        if (!otherParticipantId || otherParticipantId === currentUserId) {
            return res.status(409).json({
                message: "This recruiter conversation is not ready yet. Ask both users to sign in again.",
            });
        }

        const conversation = await getOrCreateDirectConversation(
            currentUserId,
            otherParticipantId,
        );

        const otherParticipantName = requesterIsApplicant
            ? application.job?.company?.name ||
              [recruiterUser.firstName, recruiterUser.lastName].filter(Boolean).join(" ").trim() ||
              recruiterUser.email ||
              "Recruiter"
            : [application.applicant?.firstName, application.applicant?.lastName]
                .filter(Boolean)
                .join(" ")
                .trim() ||
              application.applicant?.email ||
              "Job Seeker";

        return res.status(200).json({
            success: true,
            conversationId: conversation.id,
            otherParticipantId,
            otherParticipantName,
        });
    } catch (error) {
        console.error("Create application conversation error:", error);
        return res.status(500).json({
            message: error?.message || "Server Error",
        });
    }
});

// DELETE /api/applications/:id - Withdraw application
router.delete("/:id", authenticateToken, async (req, res) => {
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
