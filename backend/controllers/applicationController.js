const { PrismaClient } = require("@prisma/client");
const catchAsync = require("../utils/catchAsync");
const ApiError = require("../utils/ApiError");
const { getPagination, formatPaginatedResponse } = require("../utils/pagination");

const prisma = new PrismaClient();

// @route   POST /api/applications/:jobId
// @desc    Apply to a specific job
// @access  Private / Jobseeker Only
const applyForJob = catchAsync(async (req, res) => {
    const jobId = parseInt(req.params.jobId, 10);
    const { coverLetter } = req.body; // coverLetter is not in the schema anymore? Wait, schema has appliedAt, updatedAt. Let's just drop coverLetter.
    const userId = req.user.id; // Extracted from JWT

    if (isNaN(jobId)) {
        throw new ApiError(400, "Invalid jobId");
    }

    // Ensure the job exists
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) {
        throw new ApiError(404, "Job not found");
    }

    // Check if the user has already applied
    const existingApp = await prisma.application.findFirst({
        where: { jobId, userId }
    });

    if (existingApp) {
        throw new ApiError(400, "You have already applied to this job.");
    }

    // Create application
    const application = await prisma.application.create({
        data: {
            jobId,
            userId,
        },
    });

    res.status(201).json({ message: "Applied successfully", application });
});

// @route   GET /api/applications/job/:jobId
// @desc    Get all applications for a specific job
// @access  Private / Recruiter Only
const getApplicationsForJob = catchAsync(async (req, res) => {
    const jobId = parseInt(req.params.jobId, 10);
    const recruiterId = req.user.id; // Extracted from JWT
    const { skip, take, page, limit } = getPagination(req.query);

    if (isNaN(jobId)) {
        throw new ApiError(400, "Invalid jobId");
    }

    // Ensure the job exists and belongs to a company owned by this recruiter
    const job = await prisma.job.findUnique({
        where: { id: jobId },
        include: { company: true }
    });

    if (!job) {
        throw new ApiError(404, "Job not found");
    }

    if (job.company.ownerId !== recruiterId) {
        throw new ApiError(403, "You do not have permission to view applications for this job.");
    }

    // Execute query and count in parallel
    const [applications, totalItems] = await Promise.all([
        prisma.application.findMany({
            where: { jobId },
            include: {
                user: {
                    select: { id: true, name: true, email: true, profile: true },
                },
            },
            orderBy: { appliedAt: 'desc' },
            skip,
            take,
        }),
        prisma.application.count({ where: { jobId } })
    ]);

    const response = formatPaginatedResponse(applications, totalItems, page, limit);
    res.json(response);
});

module.exports = { applyForJob, getApplicationsForJob };
