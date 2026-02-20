const { PrismaClient } = require("@prisma/client");
const catchAsync = require("../utils/catchAsync");
const ApiError = require("../utils/ApiError");
const { getPagination, formatPaginatedResponse } = require("../utils/pagination");

const prisma = new PrismaClient();

// @route   GET /api/admin/stats
// @desc    Get system-wide statistics
// @access  Private / Admin Only
const getSystemStats = catchAsync(async (req, res) => {
    const totalUsers = await prisma.user.count();
    const totalJobs = await prisma.job.count();
    const totalApplications = await prisma.application.count();

    res.json({
        message: "System statistics retrieved successfully",
        stats: {
            users: totalUsers,
            jobs: totalJobs,
            applications: totalApplications,
        },
    });
});

// @route   DELETE /api/admin/users/:userId
// @desc    Delete a user
// @access  Private / Admin Only
const deleteUser = catchAsync(async (req, res) => {
    const { userId } = req.params;

    // Ensure user exists
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Prevent admin from deleting themselves
    if (user.id === req.user.id) {
        throw new ApiError(400, "Cannot delete your own admin account");
    }

    await prisma.user.delete({ where: { id: userId } });

    res.json({ message: "User deleted successfully" });
});

// @route   DELETE /api/admin/jobs/:jobId
// @desc    Delete a job
// @access  Private / Admin Only
const deleteJob = catchAsync(async (req, res) => {
    const { jobId } = req.params;

    // Ensure job exists
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) {
        throw new ApiError(404, "Job not found");
    }

    await prisma.job.delete({ where: { id: jobId } });

    res.json({ message: "Job deleted successfully" });
});

// @route   GET /api/admin/users
// @desc    Get all users with pagination
// @access  Private / Admin Only
const getUsers = catchAsync(async (req, res) => {
    const { keyword, role } = req.query;
    const { skip, take, page, limit } = getPagination(req.query);

    const whereClause = {};

    if (keyword) {
        whereClause.OR = [
            { name: { contains: keyword, mode: "insensitive" } },
            { email: { contains: keyword, mode: "insensitive" } }
        ];
    }

    if (role) {
        whereClause.role = role.toUpperCase();
    }

    const [users, totalItems] = await Promise.all([
        prisma.user.findMany({
            where: whereClause,
            select: { id: true, name: true, email: true, role: true, isEmailVerified: true, createdAt: true },
            orderBy: { createdAt: "desc" },
            skip,
            take,
        }),
        prisma.user.count({ where: whereClause })
    ]);

    const response = formatPaginatedResponse(users, totalItems, page, limit);
    res.json(response);
});

module.exports = { getSystemStats, deleteUser, deleteJob, getUsers };
