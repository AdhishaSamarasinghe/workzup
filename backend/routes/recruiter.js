const express = require("express");
const router = express.Router();

// Mock Data
const jobs = [
    {
        id: "job-1",
        title: "Urgent Event Staff for Saturday",
        status: "Active",
        applicantsCount: 15,
        postedAt: "2025-10-26T10:00:00Z",
    },
    {
        id: "job-2",
        title: "Warehouse Pack - Immediate Start",
        status: "Pending",
        applicantsCount: 0,
        postedAt: "2025-10-22T09:30:00Z",
    },
    {
        id: "job-3",
        title: "Data Entry Clerk (One Day)",
        status: "Completed",
        applicantsCount: 22,
        postedAt: "2025-10-25T14:15:00Z",
    },
    {
        id: "job-4",
        title: "Senior React Developer",
        status: "Active",
        applicantsCount: 5,
        postedAt: "2025-10-28T11:00:00Z",
    },
    {
        id: "job-5",
        title: "Marketing Intern",
        status: "Pending",
        applicantsCount: 12,
        postedAt: "2025-10-20T16:45:00Z",
    },
    {
        id: "job-6",
        title: "Customer Support Representative",
        status: "Active",
        applicantsCount: 8,
        postedAt: "2025-10-27T08:00:00Z",
    },
    {
        id: "job-7",
        title: "Junior Graphic Designer",
        status: "Completed",
        applicantsCount: 30,
        postedAt: "2025-10-15T13:20:00Z",
    },
    {
        id: "job-8",
        title: "Content Writer",
        status: "Active",
        applicantsCount: 3,
        postedAt: "2025-10-29T09:00:00Z",
    },
    {
        id: "job-9",
        title: "Sales Executive",
        status: "Pending",
        applicantsCount: 0,
        postedAt: "2025-10-21T10:30:00Z",
    },
    {
        id: "job-10",
        title: "Project Manager",
        status: "Completed",
        applicantsCount: 50,
        postedAt: "2025-10-10T15:00:00Z",
    },
    {
        id: "job-11",
        title: "Administrative Assistant",
        status: "Active",
        applicantsCount: 10,
        postedAt: "2025-10-24T11:30:00Z",
    },
    {
        id: "job-12",
        title: "Delivery Driver",
        status: "Pending",
        applicantsCount: 2,
        postedAt: "2025-10-23T14:00:00Z",
    },
    {
        id: "job-13",
        title: "Software Engineer Intern",
        status: "Active",
        applicantsCount: 100,
        postedAt: "2025-10-30T10:00:00Z",
    },
    {
        id: "job-14",
        title: "HR Coordinator",
        status: "Completed",
        applicantsCount: 18,
        postedAt: "2025-10-18T09:15:00Z",
    },
    {
        id: "job-15",
        title: "Social Media Manager",
        status: "Active",
        applicantsCount: 25,
        postedAt: "2025-10-25T12:00:00Z",
    },
    {
        id: "job-16",
        title: "Accountant",
        status: "Pending",
        applicantsCount: 1,
        postedAt: "2025-10-19T15:45:00Z",
    },
    {
        id: "job-17",
        title: "Receptionist",
        status: "Active",
        applicantsCount: 7,
        postedAt: "2025-10-26T08:30:00Z",
    },
    {
        id: "job-18",
        title: "Web Designer",
        status: "Completed",
        applicantsCount: 40,
        postedAt: "2025-10-12T11:15:00Z",
    },
    {
        id: "job-19",
        title: "Chef",
        status: "Active",
        applicantsCount: 4,
        postedAt: "2025-10-28T16:00:00Z",
    },
    {
        id: "job-20",
        title: "Waiter/Waitress",
        status: "Pending",
        applicantsCount: 6,
        postedAt: "2025-10-27T10:00:00Z",
    },
    {
        id: "job-21",
        title: "Barista",
        status: "Active",
        applicantsCount: 9,
        postedAt: "2025-10-29T07:00:00Z",
    }
];

// GET /api/recruiter/jobs
router.get("/jobs", (req, res) => {
    try {
        let { q, status, page = 1, limit = 3 } = req.query;

        // Convert page and limit to numbers
        page = parseInt(page);
        limit = parseInt(limit);

        let filteredJobs = jobs;

        // Filter by Search Query (Case Insensitive)
        if (q) {
            filteredJobs = filteredJobs.filter(job =>
                job.title.toLowerCase().includes(q.toLowerCase())
            );
        }

        // Filter by Status
        if (status && status !== "All") {
            filteredJobs = filteredJobs.filter(job =>
                job.status.toLowerCase() === status.toLowerCase()
            );
        }

        // Sort by Posted Date (Newest First)
        filteredJobs.sort((a, b) => new Date(b.postedAt) - new Date(a.postedAt));

        // Pagination
        const totalItems = filteredJobs.length;
        const totalPages = Math.ceil(totalItems / limit);
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedJobs = filteredJobs.slice(startIndex, endIndex);

        res.status(200).json({
            items: paginatedJobs,
            page,
            limit,
            totalItems,
            totalPages
        });

    } catch (error) {
        console.error("Error fetching jobs:", error);
        res.status(500).json({ message: "Server Error" });
    }
});

// GET /api/recruiter/jobs/:id
router.get("/jobs/:id", (req, res) => {
    const job = jobs.find(j => j.id === req.params.id);
    if (!job) {
        return res.status(404).json({ message: "Job not found" });
    }
    res.json(job);
});


// Mock Applicants Data
const applicants = [
    {
        _id: "applicant-1",
        name: "Elara Vance",
        avatarUrl: "https://i.pravatar.cc/150?u=elara", // Using a placeholder for now
        rating: 4.5,
        about: "Dynamic and reliable professional with 3+ years of experience in fast-paced hospitality and event environments. Proven ability to deliver exceptional customer service and adapt quickly to new challenges.",
        skills: ["Customer service", "Cash Handling", "Event setup", "Food Service", "Teamwork"],
        recentExperience: [
            { title: "Event Staff", company: "Starlight Events co" },
            { title: "Catering Assistant", company: "The Grand Pizza Hotel" },
            { title: "Retail Associate", company: "Downtown Pop-up Market" }
        ]
    },
    {
        _id: "applicant-2",
        name: "John Doe",
        rating: 3.8,
        about: "Hardworking individual looking for opportunities in logistics and transport.",
        skills: ["Manual Labor", "Driving", "Inventory Management"],
        recentExperience: [
            { title: "Driver", company: "Fast Delivery" },
            { title: "Warehouse Helper", company: "Big Box Store" }
        ]
    },
    {
        _id: "applicant-3",
        name: "Sarah Smith",
        rating: 4.8,
        about: "Experienced developer passionate about building scalable web applications.",
        skills: ["React", "Node.js", "TypeScript", "SQL"],
        recentExperience: [
            { title: "Frontend Dev", company: "Tech Corp" },
            { title: "Junior Developer", company: "Startup Inc" }
        ]
    },
    {
        _id: "applicant-4",
        name: "Michael Chen",
        rating: 4.2,
        about: "Detail-oriented administrative assistant with strong organizational skills.",
        skills: ["Data Entry", "Microsoft Office", "Scheduling"],
        recentExperience: [
            { title: "Admin Assistant", company: "Law Firm LLP" }
        ]
    },
    {
        _id: "applicant-5",
        name: "Emily Davis",
        rating: 4.9,
        about: "Creative graphic designer with a portfolio of branding projects.",
        skills: ["Photoshop", "Illustrator", "Figma"],
        recentExperience: [
            { title: "Graphic Designer", company: "Creative Studio" }
        ]
    }
];

// Mock Applications Data (Job ID -> Applicant ID mappings)
const applications = [
    // Job 1 has some applicants
    { applicationId: "app-1", jobId: "job-1", applicantId: "applicant-1", status: "Pending", appliedAt: "2025-10-26T12:00:00Z" },
    { applicationId: "app-2", jobId: "job-1", applicantId: "applicant-2", status: "Reviewed", appliedAt: "2025-10-26T14:30:00Z" },
    // Job 2 has one applicant
    { applicationId: "app-3", jobId: "job-2", applicantId: "applicant-3", status: "Pending", appliedAt: "2025-10-22T10:00:00Z" },
    // Job 4 has applicants
    { applicationId: "app-4", jobId: "job-4", applicantId: "applicant-3", status: "Interviewing", appliedAt: "2025-10-28T11:30:00Z" },
    { applicationId: "app-5", jobId: "job-4", applicantId: "applicant-5", status: "Pending", appliedAt: "2025-10-28T13:00:00Z" },
    // Job 13 (Software Engineer) has applicants
    { applicationId: "app-6", jobId: "job-13", applicantId: "applicant-3", status: "Applied", appliedAt: "2025-10-30T10:15:00Z" }
];

// GET /api/recruiter/jobs/:jobId/applicants
router.get("/jobs/:jobId/applicants", (req, res) => {
    try {
        const { jobId } = req.params;

        // Find applications for this job
        const jobApps = applications.filter(app => app.jobId === jobId);

        // Map to result format with applicant details
        const result = jobApps.map(app => {
            const applicant = applicants.find(a => a._id === app.applicantId);
            if (!applicant) return null;

            return {
                applicationId: app.applicationId,
                applicantId: applicant._id,
                name: applicant.name,
                rating: applicant.rating,
                skills: applicant.skills.slice(0, 2), // First 2 skills only
                status: app.status,
                appliedAt: app.appliedAt
            };
        }).filter(item => item !== null);

        res.json(result);
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

module.exports = router;
