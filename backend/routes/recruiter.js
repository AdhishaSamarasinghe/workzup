const express = require("express");
const prisma = require("../prismaClient");
const { authenticateToken, requireRole } = require("../middleware/auth");
const router = express.Router();

// GET /api/recruiter/jobs/:jobId/applicants
router.get("/jobs/:jobId/applicants", authenticateToken, requireRole(["EMPLOYER", "RECRUITER"]), async (req, res) => {
    try {
        const { jobId } = req.params;
        const userId = req.user.userId;

        // Verify job ownership
        const job = await prisma.job.findUnique({
            where: { id: jobId }
        });

        if (!job) return res.status(404).json({ message: "Job not found" });
        if (job.employerId !== userId) return res.status(403).json({ message: "Unauthorized to view applicants for this job" });

        const { q, status, sort, page = 1, limit = 8 } = req.query;

        // Filtering
        let where = { jobId };
        if (status && status !== "ALL") where.status = status;

        // Fetch applications with applicant details
        const applications = await prisma.application.findMany({
            where,
            include: {
                applicant: true
            },
            orderBy: sort === "match_desc" ? { matchScore: "desc" } : { appliedAt: "desc" },
            skip: (Number(page) - 1) * Number(limit),
            take: Number(limit)
        });

        const totalItems = await prisma.application.count({ where });

        const formattedItems = applications.map(app => ({
            applicationId: app.id,
            applicantId: app.applicant.id,
            name: `${app.applicant.firstName || ""} ${app.applicant.lastName || ""}`.trim() || "Anonymous",
            title: "Candidate", // We don't have a 'jobTitle' in User model yet, can use seekerProfile title if exists
            avatarUrl: `https://i.pravatar.cc/150?u=${app.applicant.id}`,
            matchScore: app.matchScore || 0,
            relevantSkillsCount: app.relevantSkillsCount || 0,
            status: app.status,
            appliedAt: app.appliedAt
        }));

        res.status(200).json({
            job: { id: job.id, title: job.title },
            items: formattedItems,
            totalItems,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(totalItems / Number(limit))
        });
    } catch (error) {
        console.error("Error fetching applicants:", error);
        res.status(500).json({ message: "Server Error" });
    }
});

// GET /api/recruiter/applicants/:applicantId
router.get("/applicants/:applicantId", authenticateToken, requireRole(["EMPLOYER", "RECRUITER"]), async (req, res) => {
    try {
        const { applicantId } = req.params;

        const user = await prisma.user.findUnique({
            where: { id: applicantId },
            include: { seekerProfile: true }
        });

        if (!user) return res.status(404).json({ message: "Applicant not found" });

        res.json({
            _id: user.id,
            name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Anonymous",
            title: "Job Seeker",
            avatarUrl: `https://i.pravatar.cc/150?u=${user.id}`,
            summary: user.seekerProfile?.bio || "No bio provided.",
            skills: user.seekerProfile?.skills || [],
            email: user.email,
            phone: "+94 77 000 0000", // placeholder as phone not in schema
            resumeUrl: user.cv || "#",
            portfolioUrl: "#"
        });
    } catch (error) {
        console.error("Error fetching profile", error);
        res.status(500).json({ message: "Server Error" });
    }
});

// GET /api/recruiter/applications/:applicationId
router.get("/applications/:applicationId", authenticateToken, requireRole(["EMPLOYER", "RECRUITER"]), async (req, res) => {
    try {
        const { applicationId } = req.params;
        const userId = req.user.userId;

        const application = await prisma.application.findUnique({
            where: { id: applicationId },
            include: {
                job: true,
                applicant: {
                    include: { seekerProfile: true }
                }
            }
        });

        if (!application) return res.status(404).json({ message: "Application not found" });
        if (application.job.employerId !== userId) return res.status(403).json({ message: "Unauthorized to view this application" });

        res.json({
            application: {
                _id: application.id,
                jobId: application.jobId,
                applicantId: application.applicantId,
                matchScore: application.matchScore || 0,
                relevantSkillsCount: application.relevantSkillsCount || 0,
                status: application.status,
                appliedAt: application.appliedAt
            },
            job: {
                _id: application.job.id,
                title: application.job.title
            },
            applicant: {
                _id: application.applicant.id,
                name: `${application.applicant.firstName || ""} ${application.applicant.lastName || ""}`.trim() || "Anonymous",
                title: "Candidate",
                avatarUrl: `https://i.pravatar.cc/150?u=${application.applicant.id}`,
                rating: 5,
                about: application.applicant.seekerProfile?.bio || "No summary provided.",
                summary: application.applicant.seekerProfile?.bio || "No summary provided.",
                skills: application.applicant.seekerProfile?.skills || [],
                recentExperience: [], // Schema doesn't support structured experience yet
                email: application.applicant.email,
                phone: "+94 77 000 0000",
                resumeUrl: application.applicant.cv || "#",
                portfolioUrl: "#"
            }
        });
    } catch (error) {
        console.error("Error application details:", error);
        res.status(500).json({ message: "Server Error" });
    }
});

// PUT /api/recruiter/applications/:applicationId/status
router.put("/applications/:applicationId/status", authenticateToken, requireRole(["EMPLOYER", "RECRUITER"]), async (req, res) => {
    try {
        const { applicationId } = req.params;
        const { status } = req.body;
        const userId = req.user.userId;

        const validStatuses = ["NEW", "CONTACTED", "SHORTLISTED", "HIRED", "REJECTED"];
        if (!validStatuses.includes(status)) return res.status(400).json({ message: "Invalid status value" });

        const application = await prisma.application.findUnique({
            where: { id: applicationId },
            include: { job: true }
        });

        if (!application) return res.status(404).json({ message: "Application not found" });
        if (application.job.employerId !== userId) return res.status(403).json({ message: "Unauthorized" });

        const updated = await prisma.application.update({
            where: { id: applicationId },
            data: { status }
        });

        res.json({ id: updated.id, status: updated.status });
    } catch (error) {
        console.error("Error updating application status:", error);
        res.status(500).json({ message: "Server Error" });
    }
});

// GET /api/recruiter/jobs
router.get("/jobs", authenticateToken, requireRole(["EMPLOYER", "RECRUITER"]), async (req, res) => {
    try {
        const jobs = await prisma.job.findMany({
            where: { employerId: req.user.userId },
            include: { applications: true },
            orderBy: { createdAt: "desc" }
        });

        const formattedJobs = jobs.map(job => ({
            id: job.id,
            title: job.title,
            status: job.status,
            applicantsCount: job.applications.length,
            postedAt: job.createdAt
        }));

        res.json({
            items: formattedJobs,
            page: 1, limit: 100, totalItems: formattedJobs.length, totalPages: 1
        });
    } catch (error) {
        console.error("Error recruiter jobs:", error);
        res.status(500).json({ message: "Server Error" });
    }
});

// GET /api/recruiter/jobs/:jobId/completion-summary
router.get("/jobs/:jobId/completion-summary", authenticateToken, requireRole(["EMPLOYER", "RECRUITER"]), async (req, res) => {
    try {
        const { jobId } = req.params;
        const { workerId } = req.query;
        const userId = req.user.userId;

        if (!workerId) return res.status(400).json({ message: "workerId is required" });

        const job = await prisma.job.findUnique({
            where: { id: jobId }
        });

        if (!job) return res.status(404).json({ message: "Job not found" });
        if (job.employerId !== userId) return res.status(403).json({ message: "Unauthorized" });

        const worker = await prisma.user.findUnique({ where: { id: workerId } });
        if (!worker) return res.status(404).json({ message: "Worker not found" });

        res.json({
            jobId,
            workerId,
            jobTitle: job.title,
            workerName: `${worker.firstName || ""} ${worker.lastName || ""}`.trim() || worker.email,
            completionDate: new Date().toISOString().split('T')[0],
            hoursWorked: 8, // fallback
            finalPayment: job.pay
        });
    } catch (error) {
        console.error("Error completion summary:", error);
        res.status(500).json({ message: "Server Error" });
    }
});

// POST /api/recruiter/jobs/:jobId/complete
router.post("/jobs/:jobId/complete", authenticateToken, requireRole(["EMPLOYER", "RECRUITER"]), async (req, res) => {
    try {
        const { jobId } = req.params;
        const { workerId, completionDate, hoursWorked, finalPayment } = req.body;
        const userId = req.user.userId;

        const job = await prisma.job.findUnique({ where: { id: jobId } });
        if (!job) return res.status(404).json({ message: "Job not found" });
        if (job.employerId !== userId) return res.status(403).json({ message: "Unauthorized" });

        // Update job status
        await prisma.job.update({
            where: { id: jobId },
            data: { status: "COMPLETED" }
        });

        // Create payment record
        await prisma.payment.create({
            data: {
                jobId,
                workerId,
                amount: Number(finalPayment),
                status: "COMPLETED",
                completionDate: new Date(completionDate),
                hoursWorked: Number(hoursWorked)
            }
        });

        res.json({ message: "Job marked as completed and payment recorded" });
    } catch (error) {
        console.error("Error completing job:", error);
        res.status(500).json({ message: "Server Error" });
    }
});

// POST /api/recruiter/jobs/:jobId/report-issue
router.post("/jobs/:jobId/report-issue", authenticateToken, requireRole(["EMPLOYER", "RECRUITER"]), async (req, res) => {
    try {
        const { jobId } = req.params;
        const { workerId, note } = req.body;
        const userId = req.user.userId;

        const job = await prisma.job.findUnique({ where: { id: jobId } });
        if (!job) return res.status(404).json({ message: "Job not found" });
        if (job.employerId !== userId) return res.status(403).json({ message: "Unauthorized" });

        // We don't have an Issue model yet, so we just log it for now
        console.warn(`ISSUE REPORTED: Recruiter ${userId} reported worker ${workerId} for job ${jobId}. Note: ${note}`);

        res.json({ message: "Issue reported to administration" });
    } catch (error) {
        console.error("Error reporting issue:", error);
        res.status(500).json({ message: "Server Error" });
    }
});

module.exports = router;
