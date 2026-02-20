const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// @route   GET /api/admin/stats
// @desc    Get system-wide statistics
// @access  Private / Admin Only
const getSystemStats = async (req, res) => {
    try {
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
    } catch (error) {
        console.error("Admin Stats Error:", error);
        res.status(500).json({ error: "Server error while fetching stats" });
    }
};

module.exports = { getSystemStats };
