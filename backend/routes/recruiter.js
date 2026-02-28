const express = require("express");
const router = express.Router();

let jobs = [
    { _id: "job1", title: "Event Staff", pay: 20, payType: "hour", status: "Active" },
    { _id: "job2", title: "Frontend Developer", pay: 50, payType: "hour", status: "Active" }
];

let completions = [];
let issues = [];

let applicants = [
    {
        _id: "u1",
        name: "Elara Vance",
        title: "Event Staff",
        avatarUrl: "https://i.pravatar.cc/150?u=jane",
        rating: 4.5,
        about: "Dynamic and reliable professional with 3+ years of experience in fast-paced hospitality and event environments. Proven ability to deliver exceptional customer service and adapt quickly to new challenges.",
        summary: "Creative and detail-oriented UX Designer with 5+ years of experience in crafting user-centric digital experiences for web and mobile applications",
        skills: ["Customer service", "Cash Handling", "Event setup", "Food Service", "Teamwork"],
        recentExperience: [
            { role: "Event Staff", company: "Starlight Events co" },
            { role: "Catering Assistant", company: "The Grand Pizza Hotel" },
            { role: "Retail Associate", company: "Downtown Pop-up Market" }
        ],
        email: "elara.vance@example.com",
        phone: "012-3456789",
        resumeUrl: "#",
        portfolioUrl: "#"
    },
    {
        _id: "u2",
        name: "John Smith",
        title: "UX Researcher",
        avatarUrl: "https://i.pravatar.cc/150?u=john",
        summary: "Experienced UX researcher specializing in user testing and data-driven design decisions.",
        skills: ["User Testing", "Data Analysis", "Figma", "Sketch"],
        email: "john.smith@example.com",
        phone: "012-9876543",
        resumeUrl: "#",
        portfolioUrl: "#"
    },
    {
        _id: "u3",
        name: "Emily Carter",
        title: "UI/UX Designer",
        avatarUrl: "https://i.pravatar.cc/150?u=emily",
        summary: "Passionate about building intuitive user interfaces. Strong background in visual design.",
        skills: ["Visual Design", "Prototyping", "Adobe XD"],
        email: "emily.carter@example.com",
        phone: "012-5551234",
        resumeUrl: "#",
        portfolioUrl: "#"
    },
    {
        _id: "u4",
        name: "Micheal Brown",
        title: "Product Designer",
        avatarUrl: "https://i.pravatar.cc/150?u=micheal",
        summary: "End-to-end product designer focused on solving complex user problems.",
        skills: ["Product Design", "Wireframing", "Figma"],
        email: "micheal.brown@example.com",
        phone: "012-5559876",
        resumeUrl: "#",
        portfolioUrl: "#"
    }
];

// Add more dummy applicants to reach 10+
for (let i = 5; i <= 24; i++) {
    applicants.push({
        _id: `u${i}`,
        name: `Applicant ${i}`,
        title: "UX Designer",
        avatarUrl: `https://i.pravatar.cc/150?u=${i}`,
        rating: 4.2,
        about: `About applicant ${i}, standard mock description.`,
        summary: `Summary for applicant ${i}`,
        skills: ["Design", "Research"],
        recentExperience: [
            { role: "Designer", company: "Tech Corp" }
        ],
        email: `app${i}@example.com`,
        phone: `012-00000${i}`,
        resumeUrl: "#",
        portfolioUrl: "#"
    });
}

let applications = [
    {
        _id: "app1",
        jobId: "job1",
        applicantId: "u1",
        matchScore: 92,
        relevantSkillsCount: 3,
        status: "CONTACTED",
        appliedAt: "2023-10-01T10:00:00Z"
    },
    {
        _id: "app2",
        jobId: "job1",
        applicantId: "u2",
        matchScore: 88,
        relevantSkillsCount: 4,
        status: "NEW",
        appliedAt: "2023-10-02T11:00:00Z"
    },
    {
        _id: "app3",
        jobId: "job1",
        applicantId: "u3",
        matchScore: 85,
        relevantSkillsCount: 2,
        status: "NEW",
        appliedAt: "2023-10-03T09:30:00Z"
    },
    {
        _id: "app4",
        jobId: "job1",
        applicantId: "u4",
        matchScore: 81,
        relevantSkillsCount: 3,
        status: "SHORTLISTED",
        appliedAt: "2023-10-04T14:15:00Z"
    }
];

// Add more dummy applications mapped to job1
for (let i = 5; i <= 24; i++) {
    applications.push({
        _id: `app${i}`,
        jobId: "job1",
        applicantId: `u${i}`,
        matchScore: Math.floor(Math.random() * 40) + 50, // 50-90
        relevantSkillsCount: Math.floor(Math.random() * 4) + 1, // 1-4
        status: "NEW",
        appliedAt: "2023-10-05T10:00:00Z"
    });
}


// GET /api/recruiter/jobs/:jobId/applicants
router.get("/jobs/:jobId/applicants", (req, res) => {
    try {
        const { jobId } = req.params;
        let { q, status, sort, page = 1, limit = 8 } = req.query;

        page = parseInt(page);
        limit = parseInt(limit);

        const job = jobs.find(j => j._id === jobId) || { _id: jobId, title: "Senior UX Designer" };

        let jobApps = applications
            .filter(app => app.jobId === jobId)
            .map(app => {
                const applicant = applicants.find(a => a._id === app.applicantId);
                if (!applicant) return null;
                return {
                    applicationId: app._id,
                    applicantId: applicant._id,
                    name: applicant.name,
                    title: applicant.title,
                    avatarUrl: applicant.avatarUrl,
                    matchScore: app.matchScore,
                    relevantSkillsCount: app.relevantSkillsCount,
                    status: app.status,
                    appliedAt: app.appliedAt,
                    skills: applicant.skills
                };
            })
            .filter(item => item !== null);

        // Filter by Search Query (name or skills)
        if (q) {
            const query = q.toLowerCase();
            jobApps = jobApps.filter(app =>
                app.name.toLowerCase().includes(query) ||
                app.skills.some(skill => skill.toLowerCase().includes(query))
            );
        }

        // Filter by Status
        if (status && status !== "ALL") {
            jobApps = jobApps.filter(app => app.status === status);
        }

        // Sort
        if (sort === "name_asc") {
            jobApps.sort((a, b) => a.name.localeCompare(b.name));
        } else if (sort === "newest") {
            jobApps.sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt));
        } else if (sort === "oldest") {
            jobApps.sort((a, b) => new Date(a.appliedAt) - new Date(b.appliedAt));
        } else {
            // Default: match_desc
            jobApps.sort((a, b) => b.matchScore - a.matchScore);
        }

        // Pagination
        const totalItems = jobApps.length;
        const totalPages = Math.ceil(totalItems / limit);
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedApps = jobApps.slice(startIndex, endIndex);

        // Strip skills from list view to match requirements, though fine to keep
        const items = paginatedApps.map(({ skills, ...rest }) => rest);

        res.status(200).json({
            job,
            items,
            totalItems,
            page,
            limit,
            totalPages
        });

    } catch (error) {
        console.error("Error fetching applicants:", error);
        res.status(500).json({ message: "Server Error" });
    }
});

// GET /api/recruiter/applicants/:applicantId
router.get("/applicants/:applicantId", (req, res) => {
    try {
        const { applicantId } = req.params;
        const applicant = applicants.find(a => a._id === applicantId);

        if (!applicant) {
            return res.status(404).json({ message: "Applicant not found" });
        }

        res.json(applicant);
    } catch (error) {
        console.error("Error fetching applicant profile:", error);
        res.status(500).json({ message: "Server Error" });
    }
});

// GET /api/recruiter/applications/:applicationId
router.get("/applications/:applicationId", (req, res) => {
    try {
        const { applicationId } = req.params;
        const application = applications.find(a => a._id === applicationId);

        if (!application) {
            return res.status(404).json({ message: "Application not found" });
        }

        const job = jobs.find(j => j._id === application.jobId) || { _id: application.jobId, title: "Unknown Job" };
        const applicant = applicants.find(a => a._id === application.applicantId);

        if (!applicant) {
            return res.status(404).json({ message: "Applicant not found" });
        }

        res.json({
            application,
            job,
            applicant
        });
    } catch (error) {
        console.error("Error fetching application details:", error);
        res.status(500).json({ message: "Server Error" });
    }
});

// PUT /api/recruiter/applications/:applicationId/status
router.put("/applications/:applicationId/status", (req, res) => {
    try {
        const { applicationId } = req.params;
        const { status } = req.body;

        const validStatuses = ["NEW", "CONTACTED", "SHORTLISTED", "HIRED", "REJECTED"];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid status value" });
        }

        const appIndex = applications.findIndex(a => a._id === applicationId);
        if (appIndex === -1) {
            return res.status(404).json({ message: "Application not found" });
        }

        applications[appIndex].status = status;
        res.json(applications[appIndex]);

    } catch (error) {
        console.error("Error updating application status:", error);
        res.status(500).json({ message: "Server Error" });
    }
});

// Mock jobs list endpoint to prevent errors in other parts of the app
router.get("/jobs", (req, res) => {
    const formattedJobs = jobs.map(job => {
        const jobApps = applications.filter(a => a.jobId === job._id);
        return {
            id: job._id,
            title: job.title,
            status: "Active",
            applicantsCount: jobApps.length,
            postedAt: "2023-10-01T10:00:00Z"
        };
    });

    res.json({
        items: formattedJobs,
        page: 1, limit: 10, totalItems: formattedJobs.length, totalPages: 1
    });
});

// GET /api/recruiter/jobs/:jobId/completion-summary
router.get("/jobs/:jobId/completion-summary", (req, res) => {
    try {
        const { jobId } = req.params;
        const { workerId } = req.query;

        if (!workerId) {
            return res.status(400).json({ message: "workerId is required" });
        }

        const job = jobs.find(j => j._id === jobId);
        const worker = applicants.find(a => a._id === workerId);

        if (!job || !worker) {
            return res.status(404).json({ message: "Job or Worker not found" });
        }

        const hoursWorked = 8;
        let finalPayment = 0;

        if (job.payType === "hour") {
            finalPayment = (job.pay || 0) * hoursWorked;
        } else if (job.payType === "day") {
            finalPayment = job.pay || 0;
        }

        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

        res.json({
            jobId,
            workerId,
            jobTitle: job.title,
            workerName: worker.name,
            completionDate: today,
            hoursWorked,
            finalPayment
        });

    } catch (error) {
        console.error("Error fetching completion summary:", error);
        res.status(500).json({ message: "Server Error" });
    }
});

// POST /api/recruiter/jobs/:jobId/complete
router.post("/jobs/:jobId/complete", (req, res) => {
    try {
        const { jobId } = req.params;
        const { workerId, completionDate, hoursWorked, finalPayment } = req.body;

        if (!workerId || !completionDate || hoursWorked <= 0 || finalPayment < 0) {
            return res.status(400).json({ message: "Invalid input data" });
        }

        const jobIndex = jobs.findIndex(j => j._id === jobId);
        if (jobIndex === -1) {
            return res.status(404).json({ message: "Job not found" });
        }

        // Update job status
        jobs[jobIndex].status = "COMPLETED";

        // Store completion record
        const completion = {
            _id: `comp_${Date.now()}`,
            jobId,
            workerId,
            completionDate,
            hoursWorked,
            finalPayment,
            createdAt: new Date().toISOString()
        };
        completions.push(completion);

        res.json({ message: "Job marked as completed", completion });

    } catch (error) {
        console.error("Error completing job:", error);
        res.status(500).json({ message: "Server Error" });
    }
});

// POST /api/recruiter/jobs/:jobId/report-issue
router.post("/jobs/:jobId/report-issue", (req, res) => {
    try {
        const { jobId } = req.params;
        const { workerId, note } = req.body;

        if (!workerId || !note) {
            return res.status(400).json({ message: "Worker ID and note are required" });
        }

        const issue = {
            _id: `issue_${Date.now()}`,
            jobId,
            workerId,
            note,
            createdAt: new Date().toISOString()
        };
        issues.push(issue);

        // Optionally set job status
        const jobIndex = jobs.findIndex(j => j._id === jobId);
        if (jobIndex !== -1) {
            jobs[jobIndex].status = "ISSUE_REPORTED";
        }

        res.json({ message: "Issue reported" });

    } catch (error) {
        console.error("Error reporting issue:", error);
        res.status(500).json({ message: "Server Error" });
    }
});

module.exports = router;
