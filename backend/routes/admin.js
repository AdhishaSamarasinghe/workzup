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

// GET /api/admin/companies - List all companies
router.get("/companies", authenticateToken, requireRole(["ADMIN"]), async (req, res) => {
    try {
        const companies = await prisma.company.findMany({
            include: {
                recruiter: {
                    select: { firstName: true, lastName: true, email: true }
                }
            }
        });

        res.json({ companies });
    } catch (error) {
        console.error("Admin Companies Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
});

// PATCH /api/admin/companies/:id/verify - Toggle Verification Status
router.patch("/companies/:id/verify", authenticateToken, requireRole(["ADMIN"]), async (req, res) => {
    try {
        const { id } = req.params;
        const { isVerified } = req.body;

        const updated = await prisma.company.update({
            where: { id },
            data: { isVerified }
        });

        res.json({ message: "Company verification status updated", company: updated });
    } catch (error) {
        console.error("Admin Verify Error:", error);
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

module.exports = router;
