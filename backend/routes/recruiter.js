const express = require("express");
const router = express.Router();

let jobs = [
    { _id: "job1", title: "Senior UX Designer" },
    { _id: "job2", title: "Frontend Developer" }
];

let applicants = [
    {
        _id: "u1",
        name: "Jane Doe",
        title: "Senior UX designer",
        avatarUrl: "https://i.pravatar.cc/150?u=jane",
        summary: "Creative and detail-oriented UX Designer with 5+ years of experience in crafting user-centric digital experiences for web and mobile applications",
        skills: ["User research", "Wireframing", "Prototyping", "Figma"],
        email: "jane.doe@example.com",
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
        summary: `Summary for applicant ${i}`,
        skills: ["Design", "Research"],
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

module.exports = router;
