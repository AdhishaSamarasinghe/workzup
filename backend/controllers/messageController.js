const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// @route   POST /api/messages/:applicationId
// @desc    Send a message within a specific application context
// @access  Private / Authenticated
const sendMessage = async (req, res) => {
    try {
        const { applicationId } = req.params;
        const { content, receiverId } = req.body;
        const senderId = req.user.id;

        if (!content || !receiverId) {
            return res.status(400).json({ error: "Content and receiverId are required" });
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
        const isJobseeker = application.jobseekerId === senderId;
        const isRecruiter = application.job.company.recruiterId === senderId;

        if (!isJobseeker && !isRecruiter) {
            return res.status(403).json({ error: "You are not authorized to send messages in this application's chat." });
        }

        // Ensure the receiver is part of the application context as well
        // If sender is jobseeker, receiver must be recruiter. If sender is recruiter, receiver must be jobseeker.
        const expectedReceiverId = isJobseeker ? application.job.company.recruiterId : application.jobseekerId;
        if (receiverId !== expectedReceiverId) {
            return res.status(400).json({ error: "Invalid receiver for this application context." });
        }

        const message = await prisma.message.create({
            data: {
                content,
                applicationId,
                senderId,
                receiverId,
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
        const { applicationId } = req.params;
        const userId = req.user.id;

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
        const isJobseeker = application.jobseekerId === userId;
        const isRecruiter = application.job.company.recruiterId === userId;

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
