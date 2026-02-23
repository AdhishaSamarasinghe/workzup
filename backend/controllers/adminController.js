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

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new ApiError(404, "User not found");
    if (user.id === req.user.id) throw new ApiError(400, "Cannot delete your own admin account");

    // Soft delete by banning or actually deleting based on your preference
    // A full delete also cascades and wipes their profile, jobs, etc.
    // Given the new "soft delete" requirement, let's actually delete here but provide a separate BAN endpoint.
    await prisma.user.delete({ where: { id: userId } });

    // Log the action
    await prisma.auditLog.create({
        data: {
            adminId: req.user.id,
            action: "HARD_DELETE_USER",
            targetId: userId,
            details: `Deleted user ${user.email}`,
        }
    });

    res.json({ message: "User deleted successfully" });
});

// @route   DELETE /api/admin/jobs/:jobId
// @desc    Delete a job
// @access  Private / Admin Only
const deleteJob = catchAsync(async (req, res) => {
    const { jobId } = req.params;

    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) throw new ApiError(404, "Job not found");

    // Implement Soft Delete
    await prisma.job.update({
        where: { id: jobId },
        data: { isDeleted: true, isActive: false }
    });

    // Log the action
    await prisma.auditLog.create({
        data: {
            adminId: req.user.id,
            action: "SOFT_DELETE_JOB",
            targetId: jobId,
            details: `Soft deleted job: ${job.title}`,
        }
    });

    res.json({ message: "Job removed successfully (Soft Deleted)" });
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

// @route   PUT /api/admin/users/:userId/ban
// @desc    Ban or Unban a user (Soft Delete)
// @access  Private / Admin Only
const banUser = catchAsync(async (req, res) => {
    const { userId } = req.params;
    const { isBanned } = req.body; // Expect boolean

    if (typeof isBanned !== "boolean") {
        throw new ApiError(400, "isBanned field is required and must be a boolean");
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new ApiError(404, "User not found");
    if (user.id === req.user.id) throw new ApiError(400, "You cannot ban yourself");
    if (user.role === "ADMIN") throw new ApiError(403, "Cannot ban another administrator");

    await prisma.user.update({
        where: { id: userId },
        data: { isBanned }
    });

    // Revoke all tokens if they are being banned
    if (isBanned) {
        await prisma.refreshToken.updateMany({
            where: { userId },
            data: { revoked: true }
        });
    }

    // Log the action
    await prisma.auditLog.create({
        data: {
            adminId: req.user.id,
            action: isBanned ? "BAN_USER" : "UNBAN_USER",
            targetId: userId,
            details: `User ${user.email} ${isBanned ? 'banned' : 'unbanned'}`,
        }
    });

    res.json({ message: `User successfully ${isBanned ? 'banned' : 'unbanned'}` });
});

// @route   PUT /api/admin/recruiters/:userId/suspend
// @desc    Suspend or Unsuspend a recruiter
// @access  Private / Admin Only
const suspendRecruiter = catchAsync(async (req, res) => {
    const { userId } = req.params;
    const { isSuspended } = req.body;

    if (typeof isSuspended !== "boolean") {
        throw new ApiError(400, "isSuspended field is required and must be a boolean");
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new ApiError(404, "User not found");
    if (user.role !== "RECRUITER") throw new ApiError(400, "This user is not a recruiter");

    await prisma.user.update({
        where: { id: userId },
        data: { isSuspended }
    });

    // If suspended, soft-delete (or deactivate) all their active jobs
    if (isSuspended) {
        const theirCompanies = await prisma.company.findMany({ where: { recruiterId: userId } });
        const companyIds = theirCompanies.map(c => c.id);

        await prisma.job.updateMany({
            where: { companyId: { in: companyIds } },
            data: { isActive: false } // Deactivate to hide them without deleting
        });
    }

    await prisma.auditLog.create({
        data: {
            adminId: req.user.id,
            action: isSuspended ? "SUSPEND_RECRUITER" : "UNSUSPEND_RECRUITER",
            targetId: userId,
            details: `Recruiter ${user.email} ${isSuspended ? 'suspended' : 'unsuspended'}`,
        }
    });

    res.json({ message: `Recruiter successfully ${isSuspended ? 'suspended' : 'unsuspended'}` });
});

module.exports = { getSystemStats, deleteUser, deleteJob, getUsers, banUser, suspendRecruiter };
