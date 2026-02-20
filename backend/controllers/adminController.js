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

// @route   DELETE /api/admin/users/:userId
// @desc    Delete a user
// @access  Private / Admin Only
const deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;

        // Ensure user exists
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Prevent admin from deleting themselves
        if (user.id === req.user.id) {
            return res.status(400).json({ error: "Cannot delete your own admin account" });
        }

        await prisma.user.delete({ where: { id: userId } });

        res.json({ message: "User deleted successfully" });
    } catch (error) {
        console.error("Delete User Error:", error);
        res.status(500).json({ error: "Server error while deleting user" });
    }
};

// @route   DELETE /api/admin/jobs/:jobId
// @desc    Delete a job
// @access  Private / Admin Only
const deleteJob = async (req, res) => {
    try {
        const { jobId } = req.params;

        // Ensure job exists
        const job = await prisma.job.findUnique({ where: { id: jobId } });
        if (!job) {
            return res.status(404).json({ error: "Job not found" });
        }

        await prisma.job.delete({ where: { id: jobId } });

        res.json({ message: "Job deleted successfully" });
    } catch (error) {
        console.error("Delete Job Error:", error);
        res.status(500).json({ error: "Server error while deleting job" });
    }
};

module.exports = { getSystemStats, deleteUser, deleteJob };
