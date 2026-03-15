const express = require("express");
const prisma = require("../prismaClient");
const { authenticateToken, requireRole } = require("../middleware/auth");
const router = express.Router();

// GET /api/admin/users - List all users
router.get("/users", authenticateToken, requireRole(["ADMIN"]), async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                role: true,
                isBanned: true,
                isVerified: true,
                createdAt: true
            }
        });

        res.json({ users });
    } catch (error) {
        console.error("Admin Users Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
});

// PATCH /api/admin/users/:id/ban - Toggle Ban Status
router.patch("/users/:id/ban", authenticateToken, requireRole(["ADMIN"]), async (req, res) => {
    try {
        const { id } = req.params;
        const { isBanned } = req.body;

        const updated = await prisma.user.update({
            where: { id },
            data: { isBanned }
        });

        res.json({ message: "User ban status updated", user: updated });
    } catch (error) {
        console.error("Admin Ban Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
});

// GET /api/admin/metrics - Global Platform Metrics
router.get("/metrics", authenticateToken, requireRole(["ADMIN"]), async (req, res) => {
    try {
        const totalUsers = await prisma.user.count();
        const totalJobs = await prisma.job.count();
        const activeJobs = await prisma.job.count({ where: { status: "PUBLIC" } });
        const totalApps = await prisma.application.count();
        const totalRevenue = await prisma.payment.aggregate({
            _sum: { amount: true },
            where: { status: "COMPLETED" }
        });

        res.json({
            metrics: {
                users: totalUsers,
                jobs: totalJobs,
                active_jobs: activeJobs,
                applications: totalApps,
                payouts_completed: totalRevenue._sum.amount || 0
            }
        });

    } catch (error) {
        console.error("Admin Metrics Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
});

// GET /api/admin/conversations - View all conversations
router.get("/conversations", authenticateToken, requireRole(["ADMIN"]), async (req, res) => {
    try {
        const conversations = await prisma.conversation.findMany({
            orderBy: { updatedAt: 'desc' },
            include: {
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                }
            }
        });
        res.json({ success: true, data: conversations });
    } catch (error) {
        console.error("Admin Conversations Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

// GET /api/admin/conversations/:id/messages - View all messages in a conversation
router.get("/conversations/:id/messages", authenticateToken, requireRole(["ADMIN"]), async (req, res) => {
    try {
        const { id } = req.params;
        const messages = await prisma.message.findMany({
            where: { conversationId: id },
            orderBy: { createdAt: 'asc' }
        });
        res.json({ success: true, data: messages });
    } catch (error) {
        console.error("Admin Messages Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

module.exports = router;
