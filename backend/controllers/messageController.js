const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// @route   POST /api/messages/:applicationId
// @desc    Send a message within a specific application context
// @access  Private / Authenticated
const sendMessage = async (req, res) => {
    try {
        const applicationId = parseInt(req.params.applicationId, 10);
        const { content } = req.body;
        const senderId = req.user.id;

        if (!content || isNaN(applicationId)) {
            return res.status(400).json({ error: "Content and valid applicationId are required" });
        }

        // Verify the application exists
        const application = await prisma.application.findUnique({
            where: { id: applicationId },
            include: {
                job: { include: { company: true } },
            },
        });

        if (!application) {
            return res.status(404).json({ error: "Application not found" });
        }

        // Authorization check: User must be either the jobseeker or the recruiter who owns the job
        const isJobseeker = application.userId === senderId;
        const isRecruiter = application.job.company.ownerId === senderId;

        if (!isJobseeker && !isRecruiter) {
            return res.status(403).json({ error: "You are not authorized to send messages in this application's chat." });
        }

        const message = await prisma.message.create({
            data: {
                content,
                applicationId,
                senderId
            }
        });

        res.status(201).json({ message: "Message sent", data: message });
    } catch (error) {
        console.error("Send Message Error:", error);
        res.status(500).json({ error: "Server error while sending message" });
    }
};

// @route   GET /api/messages/:applicationId
// @desc    Get all messages for a specific application 
// @access  Private / Authenticated
const getMessages = async (req, res) => {
    try {
        const applicationId = parseInt(req.params.applicationId, 10);
        const userId = req.user.id;

        if (isNaN(applicationId)) {
            return res.status(400).json({ error: "Invalid applicationId" });
        }

        // Verify the application exists
        const application = await prisma.application.findUnique({
            where: { id: applicationId },
            include: {
                job: { include: { company: true } },
            },
        });

        if (!application) {
            return res.status(404).json({ error: "Application not found" });
        }

        // Authorization check
        const isJobseeker = application.userId === userId;
        const isRecruiter = application.job.company.ownerId === userId;

        if (!isJobseeker && !isRecruiter) {
            return res.status(403).json({ error: "You are not authorized to view messages in this application's chat." });
        }

        const messages = await prisma.message.findMany({
            where: { applicationId },
            orderBy: { createdAt: 'asc' }, // Oldest to newest
            include: {
                sender: { select: { id: true, name: true, role: true } },
            }
        });

        res.json({ message: "Messages retrieved", count: messages.length, messages });
    } catch (error) {
        console.error("Get Messages Error:", error);
        res.status(500).json({ error: "Server error while fetching messages" });
    }
}

module.exports = { sendMessage, getMessages };
