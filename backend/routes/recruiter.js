const express = require("express");
const prisma = require("../prismaClient");
const { authenticateToken, requireRole } = require("../middleware/auth");
const {
    buildCheckoutHash,
    formatAmount,
    getPayHereConfig,
} = require("../utils/payhere");
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

    return `${req.protocol}://${req.get("host")}/${normalizedPath}`;
};

const resolvePortfolioUrl = (socialLinks) => {
    if (!socialLinks) return "";

    if (typeof socialLinks === "string") {
        return socialLinks.trim();
    }

    if (typeof socialLinks === "object") {
        const candidates = [
            socialLinks.portfolio,
            socialLinks.website,
            socialLinks.linkedin,
            socialLinks.github,
        ];

        for (const url of candidates) {
            if (typeof url === "string" && url.trim()) {
                return url.trim();
            }
        }
    }

    return "";
};

const getAvatarUrl = (req, seekerProfile, userId) => {
    let rawAvatar = null;
    const links = seekerProfile?.socialLinks;
    if (links) {
        if (typeof links === "object" && links.avatarUrl) {
            rawAvatar = links.avatarUrl;
        } else if (typeof links === "string") {
            try {
                const parsed = JSON.parse(links);
                rawAvatar = parsed.avatarUrl;
            } catch (e) {}
        }
    }
    if (rawAvatar) {
        return buildPublicFileUrl(req, rawAvatar);
    }
    return `https://i.pravatar.cc/150?u=${userId}`;
};

const formatMonthYear = (value) => {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
};

const mapJobStatus = (status) => {
    const normalized = String(status || "").toUpperCase();
    if (normalized === "COMPLETED") return "Completed";
    if (normalized === "CANCELLED" || normalized === "PRIVATE") return "Expired";
    return "Active";
};

const mapJobIcon = (category) => {
    const key = String(category || "").toLowerCase();
    if (key.includes("home") || key.includes("house")) return "home";
    if (key.includes("delivery") || key.includes("transport") || key.includes("driver")) return "truck";
    return "tool";
};

const parseTimeToMinutes = (timeValue) => {
    if (!timeValue || typeof timeValue !== "string") return null;
    const trimmed = timeValue.trim();
    const match = /^(\d{1,2}):(\d{2})$/.exec(trimmed);
    if (!match) return null;

    const hours = Number(match[1]);
    const minutes = Number(match[2]);
    if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;

    return hours * 60 + minutes;
};

const getHoursWorkedFromJob = (job) => {
    const startMinutes = parseTimeToMinutes(job?.startTime);
    const endMinutes = parseTimeToMinutes(job?.endTime);

    if (startMinutes == null || endMinutes == null) {
        return 8;
    }

    let diff = endMinutes - startMinutes;
    if (diff <= 0) {
        diff += 24 * 60;
    }

    const hours = diff / 60;
    return hours > 0 ? Number(hours.toFixed(2)) : 8;
};

const getCompletionDateFromJob = (job) => {
    const dates = Array.isArray(job?.jobDates) ? job.jobDates : [];

    for (const rawDate of dates) {
        const parsed = new Date(rawDate);
        if (!Number.isNaN(parsed.getTime())) {
            return parsed.toISOString().split("T")[0];
        }
    }

    const fallbackDate = job?.updatedAt || job?.createdAt || new Date();
    const parsedFallback = new Date(fallbackDate);
    if (!Number.isNaN(parsedFallback.getTime())) {
        return parsedFallback.toISOString().split("T")[0];
    }

    return new Date().toISOString().split("T")[0];
};

const getFinalPayment = (job, hoursWorked) => {
    const pay = Number(job?.pay || 0);
    if (!Number.isFinite(pay)) return 0;

    const payType = String(job?.payType || "").toLowerCase();
    if (payType.includes("hour")) {
        return Number((pay * hoursWorked).toFixed(2));
    }

    return Number(pay.toFixed(2));
};

// GET /api/recruiter/profile
router.get("/profile", authenticateToken, requireRole(["EMPLOYER", "RECRUITER"]), async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.userId },
            include: {
                companies: {
                    orderBy: { createdAt: "desc" },
                    take: 1,
                },
                jobsPosted: {
                    include: {
                        applications: true,
                    },
                    orderBy: { createdAt: "desc" },
                },
                receivedReviews: {
                    include: {
                        reviewer: true,
                    },
                    orderBy: { createdAt: "desc" },
                    take: 20,
                },
            },
        });

        if (!user) {
            return res.status(404).json({ message: "Recruiter not found" });
        }

        const company = user.companies[0] || null;
        const defaultCompanyName = [user.firstName, user.lastName].filter(Boolean).join(" ").trim() || "Recruiter";
        const profile = {
            id: user.id,
            companyName: company?.name || defaultCompanyName,
            logoUrl: buildPublicFileUrl(req, company?.logoUrl || ""),
            companyAddress: company?.address || "",
            city: company?.city || "",
            zipCode: company?.zipCode || "",
            verified: Boolean(company?.isVerified || user.isVerified),
            location: company?.city || user.homeTown || "Sri Lanka",
            tagline: company?.tagline || "",
            about: company?.about || "",
            industry: company?.industry || "",
            companySize: company?.companySize || "",
            memberSince: formatMonthYear(user.createdAt),
            website: company?.website || "",
            contactPersonName: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
            contactEmail: user.email || "",
            contactPhoneNumber: user.phone || "",
        };

        const jobs = user.jobsPosted.map((job) => ({
            id: job.id,
            title: job.title,
            postedOn: formatMonthYear(job.createdAt),
            status: mapJobStatus(job.status),
            applicants: job.applications.length,
            icon: mapJobIcon(job.category),
        }));

        const reviews = user.receivedReviews.map((review) => ({
            id: review.id,
            reviewerName: `${review.reviewer?.firstName || ""} ${review.reviewer?.lastName || ""}`.trim() || "Anonymous",
            rating: Number(review.rating || 0),
            date: formatMonthYear(review.createdAt),
            comment: review.comment || "",
        }));

        return res.status(200).json({ profile, jobs, reviews });
    } catch (error) {
        console.error("Error fetching recruiter profile:", error);
        return res.status(500).json({ message: "Server Error" });
    }
});

// PUT /api/recruiter/profile
router.put("/profile", authenticateToken, requireRole(["EMPLOYER", "RECRUITER"]), async (req, res) => {
    try {
        const {
            companyName,
            website,
            companyAddress,
            city,
            zipCode,
            about,
            contactPersonName,
            contactEmail,
            contactPhoneNumber,
            logoBase64,
        } = req.body || {};

        const userId = req.user.userId;

        const existingUser = await prisma.user.findUnique({ where: { id: userId } });
        if (!existingUser) {
            return res.status(404).json({ message: "Recruiter not found" });
        }

        const nameParts = String(contactPersonName || "").trim().split(/\s+/).filter(Boolean);
        const nextFirstName = nameParts.length > 0 ? nameParts[0] : existingUser.firstName || null;
        const nextLastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : existingUser.lastName || null;

        await prisma.user.update({
            where: { id: userId },
            data: {
                firstName: nextFirstName,
                lastName: nextLastName,
                email: contactEmail !== undefined ? String(contactEmail || "").trim() || existingUser.email : existingUser.email,
                phone: contactPhoneNumber !== undefined ? String(contactPhoneNumber || "").trim() || null : existingUser.phone,
                homeTown: city !== undefined ? String(city || "").trim() || existingUser.homeTown : existingUser.homeTown,
            },
        });

        const existingCompany = await prisma.company.findFirst({
            where: { recruiterId: userId },
            orderBy: { createdAt: "desc" },
        });

        const companyData = {
            name: String(companyName || "").trim() || existingCompany?.name || "Recruiter",
            website: website !== undefined ? String(website || "").trim() || null : existingCompany?.website || null,
            address: companyAddress !== undefined ? String(companyAddress || "").trim() || null : existingCompany?.address || null,
            city: city !== undefined ? String(city || "").trim() || null : existingCompany?.city || null,
            zipCode: zipCode !== undefined ? String(zipCode || "").trim() || null : existingCompany?.zipCode || null,
            about: about !== undefined ? String(about || "").trim() || null : existingCompany?.about || null,
            logoUrl: logoBase64 !== undefined ? String(logoBase64 || "").trim() || null : existingCompany?.logoUrl || null,
        };

        if (existingCompany) {
            await prisma.company.update({
                where: { id: existingCompany.id },
                data: companyData,
            });
        } else {
            await prisma.company.create({
                data: {
                    recruiterId: userId,
                    ...companyData,
                },
            });
        }

        return res.status(200).json({ message: "Recruiter profile updated" });
    } catch (error) {
        console.error("Error updating recruiter profile:", error);
        return res.status(500).json({ message: "Server Error" });
    }
});

// GET /api/recruiter/jobs/:jobId/applicants
router.get("/jobs/:jobId/applicants", authenticateToken, requireRole(["EMPLOYER", "RECRUITER"]), async (req, res) => {
    try {
        const { jobId } = req.params;
        const userId = req.user.userId;

        // Verify job ownership
        const job = await prisma.job.findUnique({
            where: { id: jobId }
        });

        if (!job) return res.status(404).json({ message: "Job not found" });
        if (job.employerId !== userId) return res.status(403).json({ message: "Unauthorized to view applicants for this job" });

        const { q, status, sort, page = 1, limit = 8 } = req.query;

        // Filtering
        let where = { jobId };
        if (status && status !== "ALL") where.status = status;

        // Fetch applications with applicant details
        const applications = await prisma.application.findMany({
            where,
            include: {
                applicant: {
                    include: { seekerProfile: true }
                }
            },
            orderBy: sort === "match_desc" ? { matchScore: "desc" } : { appliedAt: "desc" },
            skip: (Number(page) - 1) * Number(limit),
            take: Number(limit)
        });

        const totalItems = await prisma.application.count({ where });

        const formattedItems = applications.map(app => ({
            applicationId: app.id,
            applicantId: app.applicant.id,
            name: `${app.applicant.firstName || ""} ${app.applicant.lastName || ""}`.trim() || "Anonymous",
            title: app.applicant.seekerProfile?.title || "Candidate", // We don't have a 'jobTitle' in User model yet, can use seekerProfile title if exists
            avatarUrl: getAvatarUrl(req, app.applicant.seekerProfile, app.applicant.id),
            matchScore: app.matchScore || 0,
            relevantSkillsCount: app.relevantSkillsCount || 0,
            status: app.status,
            appliedAt: app.appliedAt
        }));

        res.status(200).json({
            job: { id: job.id, title: job.title },
            items: formattedItems,
            totalItems,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(totalItems / Number(limit))
        });
    } catch (error) {
        console.error("Error fetching applicants:", error);
        res.status(500).json({ message: "Server Error" });
    }
});

// GET /api/recruiter/applicants/:applicantId
router.get("/applicants/:applicantId", authenticateToken, requireRole(["EMPLOYER", "RECRUITER"]), async (req, res) => {
    try {
        const { applicantId } = req.params;

        const user = await prisma.user.findUnique({
            where: { id: applicantId },
            include: { seekerProfile: true }
        });

        if (!user) return res.status(404).json({ message: "Applicant not found" });

        res.json({
            _id: user.id,
            name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Anonymous",
            title: user.seekerProfile?.title || "Job Seeker",
            avatarUrl: getAvatarUrl(req, user.seekerProfile, user.id),
            summary: user.seekerProfile?.bio || "No bio provided.",
            skills: user.seekerProfile?.skills || [],
            email: user.email,
            phone: user.phone || "",
            resumeUrl: buildPublicFileUrl(req, user.cv),
            portfolioUrl: resolvePortfolioUrl(user.seekerProfile?.socialLinks)
        });
    } catch (error) {
        console.error("Error fetching profile", error);
        res.status(500).json({ message: "Server Error" });
    }
});

// GET /api/recruiter/applications/:applicationId
router.get("/applications/:applicationId", authenticateToken, requireRole(["EMPLOYER", "RECRUITER"]), async (req, res) => {
    try {
        const { applicationId } = req.params;
        const userId = req.user.userId;

        const application = await prisma.application.findUnique({
            where: { id: applicationId },
            include: {
                job: true,
                applicant: {
                    include: { seekerProfile: true }
                }
            }
        });

        if (!application) return res.status(404).json({ message: "Application not found" });
        if (application.job.employerId !== userId) return res.status(403).json({ message: "Unauthorized to view this application" });

        res.json({
            application: {
                _id: application.id,
                jobId: application.jobId,
                applicantId: application.applicantId,
                matchScore: application.matchScore || 0,
                relevantSkillsCount: application.relevantSkillsCount || 0,
                status: application.status,
                appliedAt: application.appliedAt
            },
            job: {
                _id: application.job.id,
                title: application.job.title
            },
            applicant: {
                _id: application.applicant.id,
                name: `${application.applicant.firstName || ""} ${application.applicant.lastName || ""}`.trim() || "Anonymous",
                title: application.applicant.seekerProfile?.title || "Candidate",
                avatarUrl: getAvatarUrl(req, application.applicant.seekerProfile, application.applicant.id),
                rating: 5,
                about: application.applicant.seekerProfile?.bio || "No summary provided.",
                summary: application.applicant.seekerProfile?.bio || "No summary provided.",
                skills: application.applicant.seekerProfile?.skills || [],
                recentExperience: [], // Schema doesn't support structured experience yet
                email: application.applicant.email,
                phone: application.applicant.phone || "",
                resumeUrl: buildPublicFileUrl(req, application.applicant.cv),
                portfolioUrl: resolvePortfolioUrl(application.applicant.seekerProfile?.socialLinks)
            }
        });
    } catch (error) {
        console.error("Error application details:", error);
        res.status(500).json({ message: "Server Error" });
    }
});

// PUT /api/recruiter/applications/:applicationId/status
router.put("/applications/:applicationId/status", authenticateToken, requireRole(["EMPLOYER", "RECRUITER"]), async (req, res) => {
    try {
        const { applicationId } = req.params;
        const { status } = req.body;
        const userId = req.user.userId;

        const validStatuses = ["NEW", "CONTACTED", "SHORTLISTED", "HIRED", "REJECTED"];
        if (!validStatuses.includes(status)) return res.status(400).json({ message: "Invalid status value" });

        const application = await prisma.application.findUnique({
            where: { id: applicationId },
            include: { job: true }
        });

        if (!application) return res.status(404).json({ message: "Application not found" });
        if (application.job.employerId !== userId) return res.status(403).json({ message: "Unauthorized" });

        const updated = await prisma.application.update({
            where: { id: applicationId },
            data: { status }
        });

        res.json({ id: updated.id, status: updated.status });
    } catch (error) {
        console.error("Error updating application status:", error);
        res.status(500).json({ message: "Server Error" });
    }
});

// GET /api/recruiter/jobs
router.get("/jobs", authenticateToken, requireRole(["EMPLOYER", "RECRUITER"]), async (req, res) => {
    try {
        const jobs = await prisma.job.findMany({
            where: { employerId: req.user.userId },
            include: { applications: true },
            orderBy: { createdAt: "desc" }
        });

        const formattedJobs = jobs.map(job => ({
            id: job.id,
            title: job.title,
            status: job.status,
            applicantsCount: job.applications.length,
            postedAt: job.createdAt
        }));

        res.json({
            items: formattedJobs,
            page: 1, limit: 100, totalItems: formattedJobs.length, totalPages: 1
        });
    } catch (error) {
        console.error("Error recruiter jobs:", error);
        res.status(500).json({ message: "Server Error" });
    }
});

// GET /api/recruiter/jobs/:jobId/completion-summary
router.get("/jobs/:jobId/completion-summary", authenticateToken, requireRole(["EMPLOYER", "RECRUITER"]), async (req, res) => {
    try {
        const { jobId } = req.params;
        const { workerId } = req.query;
        const userId = req.user.userId;

        if (!workerId) return res.status(400).json({ message: "workerId is required" });

        const job = await prisma.job.findUnique({
            where: { id: jobId }
        });

        if (!job) return res.status(404).json({ message: "Job not found" });
        if (job.employerId !== userId) return res.status(403).json({ message: "Unauthorized" });

        const application = await prisma.application.findFirst({
            where: {
                jobId,
                applicantId: workerId,
            },
        });

        if (!application) {
            return res.status(404).json({ message: "Application not found for this worker and job" });
        }

        if (application.status !== "HIRED") {
            return res.status(400).json({ message: "Worker must be hired before job completion" });
        }

        const worker = await prisma.user.findUnique({ where: { id: workerId } });
        if (!worker) return res.status(404).json({ message: "Worker not found" });

        const hoursWorked = getHoursWorkedFromJob(job);
        const completionDate = getCompletionDateFromJob(job);
        const finalPayment = getFinalPayment(job, hoursWorked);

        res.json({
            jobId,
            workerId,
            jobTitle: job.title,
            workerName: `${worker.firstName || ""} ${worker.lastName || ""}`.trim() || worker.email,
            completionDate,
            hoursWorked,
            finalPayment
        });
    } catch (error) {
        console.error("Error completion summary:", error);
        res.status(500).json({ message: "Server Error" });
    }
});

// POST /api/recruiter/jobs/:jobId/complete
router.post("/jobs/:jobId/complete", authenticateToken, requireRole(["EMPLOYER", "RECRUITER"]), async (req, res) => {
    try {
        const { jobId } = req.params;
        const { workerId, completionDate, hoursWorked, finalPayment } = req.body;
        const userId = req.user.userId;

        const job = await prisma.job.findUnique({ where: { id: jobId } });
        if (!job) return res.status(404).json({ message: "Job not found" });
        if (job.employerId !== userId) return res.status(403).json({ message: "Unauthorized" });

        const application = await prisma.application.findFirst({
            where: {
                jobId,
                applicantId: workerId,
            },
        });

        if (!application) {
            return res.status(404).json({ message: "Application not found for this worker and job" });
        }

        if (application.status !== "HIRED") {
            return res.status(400).json({ message: "Worker must be hired before job completion" });
        }

        const payer = await prisma.user.findUnique({ where: { id: userId } });
        const worker = await prisma.user.findUnique({ where: { id: workerId } });

        if (!worker) return res.status(404).json({ message: "Worker not found" });

        const { merchantId, merchantSecret, isSandbox, checkoutUrl } = getPayHereConfig();
        if (!merchantId || !merchantSecret) {
            const missing = [];
            if (!merchantId) missing.push("PAYHERE_MERCHANT_ID");
            if (!merchantSecret) missing.push("PAYHERE_MERCHANT_SECRET");
            return res.status(500).json({
                message: `PayHere is not configured on the server. Missing: ${missing.join(", ")}`,
            });
        }

        if (!isSandbox) {
            return res.status(400).json({
                message: "Sandbox checkout requires PAYHERE_SANDBOX=true.",
            });
        }

        const formattedAmount = formatAmount(finalPayment);
        const amount = Number(formattedAmount);
        if (!Number.isFinite(amount) || amount <= 0) {
            return res.status(400).json({ message: "Invalid finalPayment amount" });
        }

        const currency = "LKR";
        const safeCompletionDate = completionDate ? new Date(completionDate) : new Date();

        const payment = await prisma.payment.create({
            data: {
                jobId,
                workerId,
                amount,
                currency,
                status: "PENDING",
                completionDate: Number.isNaN(safeCompletionDate.getTime()) ? new Date() : safeCompletionDate,
                hoursWorked: Number(hoursWorked),
            }
        });

        const orderId = payment.id;
        const hash = buildCheckoutHash({
            merchantId,
            orderId,
            amount: formattedAmount,
            currency,
            merchantSecret,
        });

        const apiBaseUrl = process.env.API_BASE_URL || `${req.protocol}://${req.get("host")}`;
        const clientBaseUrl = process.env.FRONTEND_URL || process.env.CLIENT_URL || "http://localhost:3000";

        const payherePayload = {
            action: checkoutUrl,
            merchant_id: merchantId,
            return_url: `${apiBaseUrl}/api/payhere/return`,
            cancel_url: `${apiBaseUrl}/api/payhere/cancel`,
            notify_url: `${apiBaseUrl}/api/payhere/notify`,
            order_id: orderId,
            items: job.title || "Workzup Job Payment",
            currency,
            amount: formattedAmount,
            first_name: payer?.firstName || "Recruiter",
            last_name: payer?.lastName || "",
            email: payer?.email || "noreply@workzup.local",
            phone: payer?.phone || "0770000000",
            address: "Workzup",
            city: "Colombo",
            country: "Sri Lanka",
            hash,
        };

        console.log("[PAYHERE][CHECKOUT] amount used in hash:", formattedAmount);
        console.log("[PAYHERE][CHECKOUT] amount sent in payload:", payherePayload.amount);
        console.log("[PAYHERE][CHECKOUT] generated hash:", hash);
        console.log("[PAYHERE][CHECKOUT] full payload:", payherePayload);

        res.json({
            message: "Payment initiated. Complete checkout in PayHere.",
            paymentId: payment.id,
            payhereMode: isSandbox ? "SANDBOX" : "LIVE",
            payhere: payherePayload,
            clientReturnUrl: `${clientBaseUrl}/recruiter/payment-result?paymentId=${payment.id}`,
        });
    } catch (error) {
        console.error("Error completing job:", error);
        res.status(500).json({ message: "Server Error" });
    }
});

// POST /api/recruiter/jobs/:jobId/report-issue
router.post("/jobs/:jobId/report-issue", authenticateToken, requireRole(["EMPLOYER", "RECRUITER"]), async (req, res) => {
    try {
        const { jobId } = req.params;
        const { workerId, note } = req.body;
        const userId = req.user.userId;

        const job = await prisma.job.findUnique({ where: { id: jobId } });
        if (!job) return res.status(404).json({ message: "Job not found" });
        if (job.employerId !== userId) return res.status(403).json({ message: "Unauthorized" });

        // We don't have an Issue model yet, so we just log it for now
        console.warn(`ISSUE REPORTED: Recruiter ${userId} reported worker ${workerId} for job ${jobId}. Note: ${note}`);

        res.json({ message: "Issue reported to administration" });
    } catch (error) {
        console.error("Error reporting issue:", error);
        res.status(500).json({ message: "Server Error" });
    }
});

module.exports = router;
