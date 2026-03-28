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

        res.json({ success: true, data: users });
    } catch (error) {
        console.error("Admin Users Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
});

// PUT /api/admin/users/:id - Toggle Ban Status
router.put("/users/:id", authenticateToken, requireRole(["ADMIN"]), async (req, res) => {
    try {
        const { id } = req.params;
        const { isBanned } = req.body;

        const updated = await prisma.user.update({
            where: { id },
            data: { isBanned }
        });

        res.json({ success: true, message: "User ban status updated", data: updated });
    } catch (error) {
        console.error("Admin Ban Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
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

        // Generate Recent Activity from DB
        const recentJobs = await prisma.job.findMany({
            take: 4,
            orderBy: { createdAt: "desc" },
            include: { employer: true }
        });
        const recentUsers = await prisma.user.findMany({
            take: 4,
            orderBy: { createdAt: "desc" }
        });

        const activity = [];
        recentJobs.forEach(job => {
            const name = `${job.employer?.firstName || ""} ${job.employer?.lastName || ""}`.trim() || 'System';
            activity.push({
                initials: name.substring(0, 2).toUpperCase() || "J",
                name: name,
                action: `Created new job "${job.title}"`,
                status: job.status === 'PUBLIC' ? 'Success' : 'Pending',
                date: job.createdAt
            });
        });

        recentUsers.forEach(user => {
            const name = `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email || 'User';
            activity.push({
                initials: name.substring(0, 2).toUpperCase() || "U",
                name: name,
                action: `Registered as ${(user.role || 'USER').replace("_", " ")}`,
                status: user.isVerified ? 'Success' : 'Pending',
                date: user.createdAt
            });
        });

        // Sort by newest first
        activity.sort((a, b) => b.date.getTime() - a.date.getTime());
        const recent_activity = activity.slice(0, 5).map(item => ({
            ...item,
            date: item.date.toISOString() // Frontend will format this
        }));

        res.json({
            success: true,
            data: {
                metrics: {
                    users: totalUsers,
                    jobs: totalJobs,
                    active_jobs: activeJobs,
                    applications: totalApps,
                    payouts_completed: totalRevenue._sum.amount || 0,
                    recent_activity
                }
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

// GET /api/admin/jobs - View all job postings
router.get("/jobs", authenticateToken, requireRole(["ADMIN"]), async (req, res) => {
    try {
        const { search, status } = req.query;
        const whereclause = {};
        if (search) {
            whereclause.OR = [
                { title: { contains: search, mode: "insensitive" } },
                { company: { name: { contains: search, mode: "insensitive" } } }
            ];
        }
        if (status && status !== "All Jobs") {
            whereclause.status = status;
        }

        const jobs = await prisma.job.findMany({
            where: whereclause,
            include: { company: true, _count: { select: { applications: true } } },
            orderBy: { createdAt: 'desc' }
        });

        res.json({ success: true, data: jobs });
    } catch (error) {
        console.error("Admin Jobs Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

// PATCH /api/admin/jobs/:id/status
router.patch("/jobs/:id/status", authenticateToken, requireRole(["ADMIN"]), async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const updated = await prisma.job.update({ where: { id }, data: { status } });
        res.json({ success: true, data: updated });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

// GET /api/admin/verifications - Verification queue
router.get("/verifications", authenticateToken, requireRole(["ADMIN"]), async (req, res) => {
    try {
        const { status } = req.query;
        const whereclause = {};
        if (status) {
            whereclause.verificationStatus = status;
        } else {
            // Because our UI has tabs: Pending, Approved, Rejected. We should fetch them based on verificationStatus.
            // If they are missing verificationStatus entirely, they might be "PENDING"
            // Let's just fetch all or filter by the requested status
        }

        const users = await prisma.user.findMany({
            where: whereclause,
            orderBy: { createdAt: 'desc' }
        });
        res.json({ success: true, data: users });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

// PATCH /api/admin/verifications/:id/status
router.patch("/verifications/:id/status", authenticateToken, requireRole(["ADMIN"]), async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        // Also update the boolean isVerified if they are approved
        const isVerified = status === "APPROVED" ? true : false;
        
        const updated = await prisma.user.update({
            where: { id },
            data: { verificationStatus: status, isVerified }
        });
        res.json({ success: true, data: updated });
    } catch (error) {
        console.error("Verifications Update Error", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

// GET /api/admin/applications 
router.get("/applications", authenticateToken, requireRole(["ADMIN"]), async (req, res) => {
    try {
        const { search } = req.query;
        const whereclause = {};
        if (search) {
            whereclause.OR = [
                { applicant: { firstName: { contains: search, mode: "insensitive" } } },
                { applicant: { lastName: { contains: search, mode: "insensitive" } } },
                { job: { title: { contains: search, mode: "insensitive" } } }
            ];
        }

        const applications = await prisma.application.findMany({
            where: whereclause,
            include: { 
                applicant: true,
                job: { include: { company: true } }
            },
            orderBy: { appliedAt: 'desc' }
        });
        res.json({ success: true, data: applications });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

// PATCH /api/admin/applications/:id/status
router.patch("/applications/:id/status", authenticateToken, requireRole(["ADMIN"]), async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const updated = await prisma.application.update({ where: { id }, data: { status } });
        res.json({ success: true, data: updated });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

// GET /api/admin/reports 
router.get("/reports", authenticateToken, requireRole(["ADMIN"]), async (req, res) => {
    try {
        const { search } = req.query;
        const whereclause = {};
        if (search) {
            whereclause.OR = [
                { reportedName: { contains: search, mode: "insensitive" } },
                { reason: { contains: search, mode: "insensitive" } }
            ];
        }

        const reports = await prisma.report.findMany({
            where: whereclause,
            include: { reporter: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json({ success: true, data: reports });
    } catch (error) {
        console.error("Admin Reports Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

// PATCH /api/admin/reports/:id/status
router.patch("/reports/:id/status", authenticateToken, requireRole(["ADMIN"]), async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const updated = await prisma.report.update({ where: { id }, data: { status } });
        res.json({ success: true, data: updated });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

module.exports = router;
