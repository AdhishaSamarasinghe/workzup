const prisma = require('../prismaClient');

const getMyPostings = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { search, status } = req.query;

        // Build filtering
        let where = {
            employerId: userId
        };

        if (status && status !== 'ALL') {
            where.status = status;
        }

        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
                { locations: { hasSome: [search] } }
            ];
        }

        const jobs = await prisma.job.findMany({
            where,
            include: {
                _count: {
                    select: { applications: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Map to the shape expected by the frontend
        const mappedJobs = jobs.map(job => ({
            id: job.id,
            title: job.title,
            location: job.locations[0] || 'Remote',
            postedDate: job.createdAt,
            jobDate: job.jobDates[0] || job.createdAt,
            hourlyRate: job.pay,
            status: job.status,
            newApplicants: 0, // In a real app, we'd filter applications by 'NEW' status
            totalApplicants: job._count.applications
        }));

        res.status(200).json(mappedJobs);
    } catch (error) {
        console.error("Error in getMyPostings:", error);
        res.status(500).json({ message: "Failed to fetch employer jobs" });
    }
};

const getJobById = async (req, res) => {
    try {
        const job = await prisma.job.findUnique({
            where: { id: req.params.id }
        });

        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }

        // Return the raw Prisma job, the Edit page expects this shape and handles mapping
        res.status(200).json(job);
    } catch (error) {
        console.error("Error in getJobById:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const updateJob = async (req, res) => {
    try {
        const userId = req.user.userId;
        const jobId = req.params.id;

        // Verify ownership
        const existingJob = await prisma.job.findUnique({
            where: { id: jobId }
        });

        if (!existingJob) {
            return res.status(404).json({ message: "Job not found" });
        }

        if (existingJob.employerId !== userId) {
            return res.status(403).json({ message: "Unauthorized to update this job" });
        }

        const { title, description, pay, payType, category, locations, jobDates, startTime, endTime, requirements, status } = req.body;

        const updatedJob = await prisma.job.update({
            where: { id: jobId },
            data: {
                title,
                description,
                pay,
                payType,
                category,
                locations,
                jobDates,
                startTime,
                endTime,
                requirements,
                status
            }
        });

        res.status(200).json({ message: "Job updated successfully", job: updatedJob });
    } catch (error) {
        console.error("Error in updateJob:", error);
        res.status(500).json({ message: "Failed to update job" });
    }
};

const deleteJob = async (req, res) => {
    try {
        const userId = req.user.userId;
        const jobId = req.params.id;

        // Verify ownership
        const existingJob = await prisma.job.findUnique({
            where: { id: jobId }
        });

        if (!existingJob) {
            return res.status(404).json({ message: "Job not found" });
        }

        if (existingJob.employerId !== userId) {
            return res.status(403).json({ message: "Unauthorized to delete this job" });
        }

        await prisma.job.delete({
            where: { id: jobId }
        });

        res.status(200).json({ message: "Job deleted successfully" });
    } catch (error) {
        console.error("Error in deleteJob:", error);
        res.status(500).json({ message: "Failed to delete job" });
    }
};

module.exports = {
    getMyPostings,
    getJobById,
    updateJob,
    deleteJob
};
