const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// @route   POST /api/jobs
// @desc    Create a new job posting
// @access  Private / Recruiter Only
const createJob = async (req, res) => {
    try {
        const { title, description, companyId } = req.body;

        if (!title || !description || !companyId) {
            return res.status(400).json({ error: "Title, description, and companyId are required" });
        }

        // Ensure the recruiter owns the company they are posting for
        const company = await prisma.company.findUnique({ where: { id: companyId } });
        if (!company || company.recruiterId !== req.user.id) {
            return res.status(403).json({ error: "You do not have permission to post jobs for this company." });
        }

        const newJob = await prisma.job.create({
            data: {
                title,
                description,
                companyId,
            },
        });

        res.status(201).json({ message: "Job created successfully", job: newJob });
    } catch (error) {
        console.error("Create Job Error:", error);
        res.status(500).json({ error: "Server error while creating job" });
    }
};

// @route   GET /api/jobs
// @desc    Get all jobs (with optional filters)
// @access  Public
const getJobs = async (req, res) => {
    try {
        const { keyword, location, category, minSalary, maxSalary } = req.query;

        // Build dynamic where clause based on query params
        const whereClause = {
            isActive: true, // Only show active jobs to public
        };

        if (keyword) {
            whereClause.OR = [
                { title: { contains: keyword, mode: "insensitive" } },
                { description: { contains: keyword, mode: "insensitive" } },
            ];
        }

        if (location) {
            whereClause.location = { contains: location, mode: "insensitive" };
        }

        if (category) {
            whereClause.category = { equals: category, mode: "insensitive" };
        }

        if (minSalary || maxSalary) {
            whereClause.salary = {};
            if (minSalary) whereClause.salary.gte = parseInt(minSalary);
            if (maxSalary) whereClause.salary.lte = parseInt(maxSalary);
        }

        const jobs = await prisma.job.findMany({
            where: whereClause,
            include: {
                company: {
                    select: { name: true, logoUrl: true, location: true },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        res.json({ message: "Jobs retrieved successfully", count: jobs.length, jobs });
    } catch (error) {
        console.error("Get Jobs Error:", error);
        res.status(500).json({ error: "Server error while fetching jobs" });
    }
};

module.exports = { createJob, getJobs };
