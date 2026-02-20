const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// @route   POST /api/jobs
// @desc    Create a new job posting
// @access  Private / Recruiter Only
const createJob = async (req, res) => {
    try {
        const { title, description, companyId } = req.body;

        if (!title || !description || !companyId) {
            return res.status(400).json({ error: "Title, description, and companyId are required" });
        }

        // Ensure the recruiter owns the company they are posting for
        const company = await prisma.company.findUnique({ where: { id: companyId } });
        if (!company || company.recruiterId !== req.user.id) {
            return res.status(403).json({ error: "You do not have permission to post jobs for this company." });
        }

        const newJob = await prisma.job.create({
            data: {
                title,
                description,
                companyId,
            },
        });

        res.status(201).json({ message: "Job created successfully", job: newJob });
    } catch (error) {
        console.error("Create Job Error:", error);
        res.status(500).json({ error: "Server error while creating job" });
    }
};

module.exports = { createJob };
