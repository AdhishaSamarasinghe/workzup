const express = require("express");
const prisma = require("../prismaClient");
const { authenticateToken, requireRole } = require("../middleware/auth");
const router = express.Router();

// GET /api/recruiter/jobs/:jobId/applicants
router.get("/jobs/:jobId/applicants", authenticateToken, requireRole(["EMPLOYER", "RECRUITER"]), async (req, res) => {
    try {
        const { jobId } = req.params;
        // Mocking database check for job
        const job = { id: jobId, title: "Senior UX Designer", employerId: req.user.userId };

        // Return mock applicants matching the UI design
        const items = [
            {
                applicationId: "app_1",
                applicantId: "user_1",
                name: "Jane Doe",
                title: "Senior UX designer",
                avatarUrl: "https://i.pravatar.cc/150?u=user_1",
                matchScore: 92,
                relevantSkillsCount: 3,
                status: "CONTACTED",
                appliedAt: new Date().toISOString()
            },
            {
                applicationId: "app_2",
                applicantId: "user_2",
                name: "John Smith",
                title: "Product Designer",
                avatarUrl: "https://i.pravatar.cc/150?u=user_2",
                matchScore: 88,
                relevantSkillsCount: 4,
                status: "NEW",
                appliedAt: new Date().toISOString()
            },
            {
                applicationId: "app_3",
                applicantId: "user_3",
                name: "Emily Carter",
                title: "UI Designer",
                avatarUrl: "https://i.pravatar.cc/150?u=user_3",
                matchScore: 85,
                relevantSkillsCount: 2,
                status: "NEW",
                appliedAt: new Date().toISOString()
            },
            {
                applicationId: "app_4",
                applicantId: "user_4",
                name: "Michael Brown",
                title: "UX Researcher",
                avatarUrl: "https://i.pravatar.cc/150?u=user_4",
                matchScore: 81,
                relevantSkillsCount: 3,
                status: "SHORTLISTED",
                appliedAt: new Date().toISOString()
            }
        ];

        res.status(200).json({ job, items, totalItems: 24, page: 1, limit: 8, totalPages: 3 });
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
        
        // Mock application data
        res.json({
            application: {
                _id: applicationId,
                jobId: "job_123",
                applicantId: "user_1",
                matchScore: 92,
                relevantSkillsCount: 3,
                status: "CONTACTED",
                appliedAt: new Date().toISOString()
            },
            job: {
                _id: "job_123",
                title: "Senior UX Designer"
            },
            applicant: {
                _id: "user_1",
                name: "Elara Vance",
                title: "Senior UX Designer",
                avatarUrl: "https://i.pravatar.cc/150?u=user_1",
                rating: 4.5,
                about: "Dynamic and reliable professional with 3+ years of experience in fast-paced hospitality and event environments. Proven ability to deliver exceptional customer service and adapt quickly to new challenges.",
                summary: "Creative and detail-oriented UX Designer with 5+ years of experience in crafting user-centric digital experiences for web and mobile applications.",
                skills: ["User research", "Wireframing", "Prototyping", "Figma", "Customer service", "Cash Handling", "Event setup", "Food Service", "Teamwork"],
                recentExperience: [
                    { role: "Event Staff", company: "Starlight Events co" },
                    { role: "Catering Assistant", company: "The Grand Pizza Hotel" },
                    { role: "Retail Associate", company: "Downtown Pop-up Market" }
                ],
                email: "jane.doe@example.com",
                phone: "012-3456789",
                resumeUrl: "#",
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

        const validStatuses = ["NEW", "CONTACTED", "SHORTLISTED", "HIRED", "REJECTED"];
        if (!validStatuses.includes(status)) return res.status(400).json({ message: "Invalid status value" });

        // Mock success response
        res.json({ id: applicationId, status });
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

        // Return mock summary matching UI design
        res.json({
            jobId,
            workerId,
            jobTitle: "Event Staff",
            workerName: "Alexandra Chan",
            completionDate: "2023-10-26",
            hoursWorked: 8,
            finalPayment: 160.00
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

        // Mock success response
        res.json({ message: "Job marked as completed" });
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

        // Mock success response
        res.json({ message: "Issue reported" });
    } catch (error) {
        console.error("Error reports:", error);
        res.status(500).json({ message: "Server Error" });
    }
});

module.exports = router;
