const express = require("express");
const prisma = require("../prismaClient");
const { authenticateToken, requireRole } = require("../middleware/auth");
const router = express.Router();

// GET /api/recruiter/jobs/:jobId/applicants
router.get("/jobs/:jobId/applicants", authenticateToken, requireRole(["EMPLOYER", "RECRUITER"]), async (req, res) => {
    try {
        const { jobId } = req.params;
        let { q, status, sort, page = 1, limit = 8 } = req.query;
        page = parseInt(page);
        limit = parseInt(limit);

        const job = await prisma.job.findUnique({ where: { id: jobId } });
        if (!job) return res.status(404).json({ message: "Job not found" });

        if (job.employerId !== req.user.userId) return res.status(403).json({ message: "Forbidden" });

        let whereClause = { jobId };

        if (status && status !== "ALL") {
            whereClause.status = status;
        }

        // Search in Applicant details
        if (q) {
            const query = q.toLowerCase();
            whereClause.applicant = {
                OR: [
                    { firstName: { contains: query, mode: 'insensitive' } },
                    { lastName: { contains: query, mode: 'insensitive' } },
                    { cv: { contains: query, mode: 'insensitive' } }
                ]
            };
        }

        // Sorting
        let orderByClause = {};
        if (sort === "name_asc") orderByClause = { applicant: { firstName: 'asc' } };
        else if (sort === "newest") orderByClause = { appliedAt: 'desc' };
        else if (sort === "oldest") orderByClause = { appliedAt: 'asc' };
        else orderByClause = { matchScore: 'desc' };

        const skip = (page - 1) * limit;

        const applications = await prisma.application.findMany({
            where: whereClause,
            orderBy: orderByClause,
            skip,
            take: limit,
            include: { applicant: true }
        });

        const totalItems = await prisma.application.count({ where: whereClause });
        const totalPages = Math.ceil(totalItems / limit);

        const items = applications.map(app => ({
            applicationId: app.id,
            applicantId: app.applicantId,
            name: `${app.applicant.firstName || ''} ${app.applicant.lastName || ''}`.trim() || 'Job Seeker',
            title: app.applicant.role || "Job Seeker",
            avatarUrl: `https://i.pravatar.cc/150?u=${app.applicantId}`, // mock avatar
            matchScore: app.matchScore || 50,
            relevantSkillsCount: app.relevantSkillsCount || 0,
            status: app.status,
            appliedAt: app.appliedAt
        }));

        res.status(200).json({ job, items, totalItems, page, limit, totalPages });
    } catch (error) {
        console.error("Error fetching applicants:", error);
        res.status(500).json({ message: "Server Error" });
    }
});

// GET /api/recruiter/applicants/:applicantId
router.get("/applicants/:applicantId", authenticateToken, requireRole(["EMPLOYER", "RECRUITER"]), async (req, res) => {
    try {
        const { applicantId } = req.params;
        const applicant = await prisma.user.findUnique({ where: { id: applicantId } });

        if (!applicant) return res.status(404).json({ message: "Applicant not found" });

        res.json({
            _id: applicant.id,
            name: `${applicant.firstName || ''} ${applicant.lastName || ''}`.trim() || 'Job Seeker',
            title: applicant.role,
            avatarUrl: `https://i.pravatar.cc/150?u=${applicant.id}`,
            rating: 4.5,
            about: "Loaded from database. Experience history mapping coming soon.",
            summary: "Experienced job seeker",
            skills: ["Database Migrated", "Prisma"],
            recentExperience: [{ role: applicant.role || "Worker", company: "Various" }],
            email: applicant.email,
            phone: "012-3456789",
            resumeUrl: applicant.cv || "#",
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
        const app = await prisma.application.findUnique({
            where: { id: applicationId },
            include: { job: true, applicant: true }
        });

        if (!app) return res.status(404).json({ message: "Application not found" });

        if (app.job.employerId !== req.user.userId) return res.status(403).json({ message: "Forbidden" });

        res.json({
            application: {
                _id: app.id,
                jobId: app.jobId,
                applicantId: app.applicantId,
                matchScore: app.matchScore,
                relevantSkillsCount: app.relevantSkillsCount,
                status: app.status,
                appliedAt: app.appliedAt
            },
            job: app.job,
            applicant: {
                _id: app.applicant.id,
                name: `${app.applicant.firstName || ''} ${app.applicant.lastName || ''}`.trim() || 'Job Seeker'
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

        const validStatuses = ["NEW", "CONTACTED", "SHORTLISTED", "HIRED", "REJECTED"];
        if (!validStatuses.includes(status)) return res.status(400).json({ message: "Invalid status value" });

        const updatedApp = await prisma.application.update({
            where: { id: applicationId },
            data: { status }
        });

        res.json(updatedApp);
    } catch (error) {
        console.error("Error app status:", error);
        res.status(500).json({ message: "Server Error" });
    }
});

// GET /api/recruiter/jobs - Recruiter Dashboard endpoint
router.get("/jobs", authenticateToken, requireRole(["EMPLOYER", "RECRUITER"]), async (req, res) => {
    try {
        const jobs = await prisma.job.findMany({
            where: { employerId: req.user.userId },
            include: { applications: true }
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
            page: 1, limit: 10, totalItems: formattedJobs.length, totalPages: 1
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

        if (!workerId) return res.status(400).json({ message: "workerId is required" });

        const job = await prisma.job.findUnique({ where: { id: jobId } });
        const worker = await prisma.user.findUnique({ where: { id: workerId } });

        if (!job || !worker) return res.status(404).json({ message: "Job or Worker not found" });
        if (job.employerId !== req.user.userId) return res.status(403).json({ message: "Forbidden" });

        const hoursWorked = 8;
        let finalPayment = 0;

        if (job.payType === "hour") finalPayment = (job.pay || 0) * hoursWorked;
        else if (job.payType === "day") finalPayment = job.pay || 0;

        res.json({
            jobId,
            workerId,
            jobTitle: job.title,
            workerName: `${worker.firstName || ''} ${worker.lastName || ''}`.trim() || 'Job Seeker',
            completionDate: new Date().toISOString().split('T')[0],
            hoursWorked,
            finalPayment
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

        if (!workerId || !completionDate || hoursWorked <= 0 || finalPayment < 0) {
            return res.status(400).json({ message: "Invalid input data" });
        }

        const job = await prisma.job.findUnique({ where: { id: jobId } });
        if (!job) return res.status(404).json({ message: "Job not found" });
        if (job.employerId !== req.user.userId) return res.status(403).json({ message: "Forbidden" });

        await prisma.job.update({ where: { id: jobId }, data: { status: "COMPLETED" } });

        const completion = await prisma.payment.create({
            data: {
                jobId,
                workerId,
                completionDate: new Date(completionDate),
                hoursWorked: parseFloat(hoursWorked),
                amount: parseFloat(finalPayment),
                currency: "GBP",
                status: "COMPLETED"
            }
        });

        res.json({ message: "Job marked as completed", completion });
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

        if (!workerId || !note) return res.status(400).json({ message: "Worker ID and note are required" });

        await prisma.job.update({ where: { id: jobId }, data: { status: "ISSUE_REPORTED" } });

        res.json({ message: "Issue reported" });
    } catch (error) {
        console.error("Error reports:", error);
        res.status(500).json({ message: "Server Error" });
    }
});

module.exports = router;
