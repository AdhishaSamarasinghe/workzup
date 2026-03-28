const express = require("express");
const prisma = require("../../prismaClient");
const { authenticateToken, requireRole } = require("../../middleware/auth");
const router = express.Router();

const buildPublicFileUrl = (req, storedPath) => {
    const normalizedPath = String(storedPath || "").trim().replace(/\\/g, "/").replace(/^\/+/, "");
    if (!normalizedPath) return "";

    if (
        normalizedPath.startsWith("http://") ||
        normalizedPath.startsWith("https://") ||
        normalizedPath.startsWith("data:")
    ) {
        return normalizedPath;
    }

    const withApiPrefix = normalizedPath.startsWith("uploads/")
        ? `api/${normalizedPath}`
        : normalizedPath;

    return `${req.protocol}://${req.get("host")}/${withApiPrefix}`;
};

const getAvatarFromSocialLinks = (socialLinks, userId) => {
    let rawAvatar = "";

    if (socialLinks && typeof socialLinks === "object" && socialLinks.avatarUrl) {
        rawAvatar = String(socialLinks.avatarUrl);
    } else if (typeof socialLinks === "string") {
        try {
            const parsed = JSON.parse(socialLinks);
            if (parsed?.avatarUrl) {
                rawAvatar = String(parsed.avatarUrl);
            }
        } catch (_error) {}
    }

    if (rawAvatar) {
        return rawAvatar;
    }

    return `https://i.pravatar.cc/150?u=${userId}`;
};

// GET /api/admin/users - List all users
router.get("/users", authenticateToken, requireRole(["ADMIN"]), async (req, res) => {
    try {
        const { search } = req.query;
        let whereclause = {};
        if (search) {
            whereclause.OR = [
                { email: { contains: search, mode: "insensitive" } },
                { firstName: { contains: search, mode: "insensitive" } },
                { lastName: { contains: search, mode: "insensitive" } }
            ];
        }

        const users = await prisma.user.findMany({
            where: whereclause,
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                isBanned: true,
                isVerified: true,
                createdAt: true
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json({ success: true, data: users });
    } catch (error) {
        console.error("Admin Users Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
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
        
        // Fetch recent users & jobs for the activity feed
        const recentUsers = await prisma.user.findMany({ take: 5, orderBy: { createdAt: 'desc' } });
        const recentJobs = await prisma.job.findMany({ take: 5, orderBy: { createdAt: 'desc' } });
        
        const recentActivity = [...recentUsers.map(u => ({ type: "USER_JOINED", id: u.id, name: u.email, date: u.createdAt })),
                                ...recentJobs.map(j => ({ type: "JOB_CREATED", id: j.id, name: j.title, date: j.createdAt }))]
                                .sort((a,b) => b.date - a.date).slice(0, 5);

        const normalizedActivity = recentActivity.map((item) => ({
            initials: String(item.name || "S").slice(0, 2).toUpperCase(),
            name: item.name,
            action: item.type === "JOB_CREATED"
                ? `Created new job \"${item.name}\"`
                : "Registered new account",
            status: "Success",
            date: new Date(item.date).toISOString(),
        }));

        const metricsPayload = {
            users: totalUsers,
            jobs: totalJobs,
            active_jobs: activeJobs,
            applications: totalApps,
            payouts_completed: totalRevenue._sum.amount || 0,
            recent_activity: normalizedActivity,
            // Backward compatibility for older clients.
            recentActivity,
        };

        res.json({
            success: true,
            data: {
                metrics: metricsPayload,
            },
            // Backward compatibility for older clients.
            metrics: metricsPayload,
        });

    } catch (error) {
        console.error("Admin Metrics Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

// GET /api/admin/jobs - View all job postings
router.get("/jobs", authenticateToken, requireRole(["ADMIN"]), async (req, res) => {
    try {
        const { search, status } = req.query;
        console.log("ADMIN /jobs FETCHED! Params:", search, status);
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
            if (status === "APPROVED") {
                whereclause.isVerified = true;
            } else if (status === "PENDING") {
                whereclause.isVerified = false;
                whereclause.verificationStatus = "PENDING";
            } else if (status === "REJECTED") {
                whereclause.verificationStatus = "REJECTED";
            }
        }

        const users = await prisma.user.findMany({
            where: whereclause,
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true,
                isVerified: true,
                isBanned: true,
                createdAt: true,
                updatedAt: true,
                verificationStatus: true,
                verificationNotes: true,
                cv: true,
                idDocument: true,
                idFront: true,
                idBack: true,
                seekerProfile: {
                    select: {
                        socialLinks: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' }
        });

        const mappedUsers = users.map((user) => {
            const avatarPath = getAvatarFromSocialLinks(user.seekerProfile?.socialLinks, user.id);
            return {
                ...user,
                cv: user.cv ? buildPublicFileUrl(req, user.cv) : "",
                idDocument: user.idDocument ? buildPublicFileUrl(req, user.idDocument) : "",
                idFront: user.idFront ? buildPublicFileUrl(req, user.idFront) : "",
                idBack: user.idBack ? buildPublicFileUrl(req, user.idBack) : "",
                avatarUrl: buildPublicFileUrl(req, avatarPath),
                seekerProfile: undefined,
            };
        });

        res.json({ success: true, data: mappedUsers });
    } catch (error) {
        console.error("Admin Verifications Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

// PATCH /api/admin/verifications/:id/status
router.patch("/verifications/:id/status", authenticateToken, requireRole(["ADMIN"]), async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        const isVerified = status === "APPROVED" ? true : false;
        
        const updated = await prisma.user.update({
            where: { id },
            data: { verificationStatus: status, isVerified }
        });
        res.json({ success: true, data: updated });
    } catch (error) {
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