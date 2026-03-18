const prisma = require('../prismaClient');

// GET /api/conversations
const getAllConversations = async (req, res) => {
    try {
        const currentUserId = req.user?.userId;
        if (!currentUserId) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        const conversations = await prisma.conversation.findMany({
            where: {
                participantIds: {
                    has: currentUserId
                }
            },
            orderBy: { updatedAt: 'desc' }
        });

        // Match the expected mock format:
        const formatted = conversations.map(c => ({
            id: c.id,
            participants: c.participantIds,
            jobId: "unknown",
            unreadCount: c.unreadCount,
            lastMessage: c.lastMessage || "",
            lastMessageTime: c.lastMessageTime || "",
            isArchived: false,
            isPinned: false,
            createdAt: c.createdAt
        }));

        res.status(200).json({ success: true, data: formatted });
    } catch (error) {
        console.error("Error fetching conversations:", error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

// GET /api/conversations/:id
const getConversationById = async (req, res) => {
    try {
        const { id } = req.params;
        const currentUserId = req.user?.userId;

        if (!currentUserId) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        const conversation = await prisma.conversation.findUnique({
            where: { id }
        });

        if (!conversation) {
            return res.status(404).json({ success: false, error: 'Conversation not found' });
        }

        if (!conversation.participantIds?.includes(currentUserId)) {
            return res.status(403).json({ success: false, error: 'Forbidden' });
        }

        res.status(200).json({ success: true, data: { ...conversation, participants: conversation.participantIds } });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

// POST /api/conversations
const createConversation = async (req, res) => {
    try {
        const { participantIds, type, jobId, initialMessage } = req.body;
        const currentUserId = req.user?.userId;

        if (!currentUserId) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        const rawParticipants = Array.isArray(participantIds) ? participantIds : [];
        const normalizedParticipants = [...new Set([currentUserId, ...rawParticipants].filter(Boolean))];

        if (normalizedParticipants.length < 2) {
            return res.status(400).json({ success: false, error: 'At least two participants are required', message: 'At least two participants are required' });
        }

        const existingConversation = await prisma.conversation.findFirst({
            where: {
                participantIds: {
                    hasEvery: normalizedParticipants
                }
            },
            orderBy: { updatedAt: 'desc' }
        });

        if (existingConversation) {
            return res.status(200).json({
                success: true,
                data: { ...existingConversation, participants: existingConversation.participantIds }
            });
        }

        const newConversation = await prisma.conversation.create({
            data: {
                participantIds: normalizedParticipants,
                lastMessage: initialMessage || "",
                lastMessageTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                unreadCount: 0
            }
        });

        res.status(201).json({ success: true, data: { ...newConversation, participants: newConversation.participantIds } });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

// PATCH /api/conversations/:id
const updateConversation = async (req, res) => {
    try {
        const { id } = req.params;
        const { action, isPinned } = req.body;
        const currentUserId = req.user?.userId;

        if (!currentUserId) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        const existingConversation = await prisma.conversation.findUnique({ where: { id } });
        if (!existingConversation) {
            return res.status(404).json({ success: false, error: 'Conversation not found' });
        }
        if (!existingConversation.participantIds?.includes(currentUserId)) {
            return res.status(403).json({ success: false, error: 'Forbidden' });
        }

        let updateData = {};
        if (action === 'markRead') {
            updateData.unreadCount = 0;
        }

        const updated = await prisma.conversation.update({
            where: { id },
            data: updateData
        });

        res.status(200).json({ success: true, data: updated });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

// GET /api/conversations/:id/typing
const getTypingUsers = (req, res) => {
    // Always mock as no one typing for now
    res.status(200).json({ success: true, data: [] });
};

const updateTypingStatus = (req, res) => {
    res.status(200).json({ success: true, data: [] });
};

// GET /api/conversations/unread-count
const getUnreadCount = async (req, res) => {
    try {
        const currentUserId = req.user?.userId;
        if (!currentUserId) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        const conversations = await prisma.conversation.findMany({
            where: {
                unreadCount: { gt: 0 },
                participantIds: {
                    has: currentUserId
                }
            }
        });
        
        let totalUnread = 0;
        conversations.forEach(c => totalUnread += c.unreadCount);

        res.status(200).json({ success: true, count: totalUnread });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

module.exports = {
    getAllConversations,
    getConversationById,
    createConversation,
    updateConversation,
    getTypingUsers,
    updateTypingStatus,
    getUnreadCount
};
