const { PrismaClient } = require("@prisma/client");
const catchAsync = require("../utils/catchAsync");
const ApiError = require("../utils/ApiError");
const { getPagination, formatPaginatedResponse } = require("../utils/pagination");

const prisma = new PrismaClient();

// @route   POST /api/applications/:jobId
// @desc    Apply to a specific job
// @access  Private / Jobseeker Only
const applyForJob = catchAsync(async (req, res) => {
    const { jobId } = req.params;
    const { coverLetter } = req.body;
    const jobseekerId = req.user.id; // Extracted from JWT

    // Ensure the job exists
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) {
        throw new ApiError(404, "Job not found");
    }

    // Check if the user has already applied
    const existingApp = await prisma.application.findUnique({
        where: {
            jobId_jobseekerId: { jobId, jobseekerId }
        }
    });

    if (existingApp) {
        throw new ApiError(400, "You have already applied to this job.");
    }

    // Create application
    const application = await prisma.application.create({
        data: {
            jobId,
            jobseekerId,
            coverLetter,
        },
    });

    res.status(201).json({ message: "Applied successfully", application });
});

// @route   GET /api/applications/job/:jobId
// @desc    Get all applications for a specific job
// @access  Private / Recruiter Only
const getApplicationsForJob = catchAsync(async (req, res) => {
    const { jobId } = req.params;
    const recruiterId = req.user.id; // Extracted from JWT
    const { skip, take, page, limit } = getPagination(req.query);

    // Ensure the job exists and belongs to a company owned by this recruiter
    const job = await prisma.job.findUnique({
        where: { id: jobId },
        include: { company: true }
    });

    if (!job) {
        throw new ApiError(404, "Job not found");
    }

    if (job.company.recruiterId !== recruiterId) {
        throw new ApiError(403, "You do not have permission to view applications for this job.");
    }

    // Execute query and count in parallel
    const [applications, totalItems] = await Promise.all([
        prisma.application.findMany({
            where: { jobId },
            include: {
                jobseeker: {
                    select: { id: true, name: true, email: true, profile: true },
                },
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take,
        }),
        prisma.application.count({ where: { jobId } })
    ]);

    const response = formatPaginatedResponse(applications, totalItems, page, limit);
    res.json(response);
});

module.exports = { applyForJob, getApplicationsForJob };
