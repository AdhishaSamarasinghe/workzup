const { PrismaClient } = require("@prisma/client");
const catchAsync = require("../utils/catchAsync");
const ApiError = require("../utils/ApiError");
const { getPagination, formatPaginatedResponse } = require("../utils/pagination");

const prisma = new PrismaClient();

// @route   POST /api/jobs
// @desc    Create a new job posting
// @access  Private / Recruiter Only
const createJob = catchAsync(async (req, res) => {
    const { title, description, companyId } = req.body;

    if (!title || !description || !companyId) {
        throw new ApiError(400, "Title, description, and companyId are required");
    }

    // Ensure the recruiter owns the company they are posting for
    const company = await prisma.company.findUnique({ where: { id: companyId } });
    if (!company || company.recruiterId !== req.user.id) {
        throw new ApiError(403, "You do not have permission to post jobs for this company.");
    }

    const newJob = await prisma.job.create({
        data: {
            title,
            description,
            companyId,
        },
    });

    res.status(201).json({ message: "Job created successfully", job: newJob });
});

// @route   GET /api/jobs
// @desc    Get all jobs (with optional filters)
// @access  Public
const getJobs = catchAsync(async (req, res) => {
    const { keyword, location, category, minSalary, maxSalary } = req.query;
    const { skip, take, page, limit } = getPagination(req.query);

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

    // Execute query and count in parallel for performance
    const [jobs, totalItems] = await Promise.all([
        prisma.job.findMany({
            where: whereClause,
            include: {
                company: {
                    select: { name: true, logoUrl: true, location: true },
                },
            },
            orderBy: { createdAt: "desc" },
            skip,
            take,
        }),
        prisma.job.count({ where: whereClause })
    ]);

    const response = formatPaginatedResponse(jobs, totalItems, page, limit);
    res.json(response);
});

module.exports = { createJob, getJobs };
