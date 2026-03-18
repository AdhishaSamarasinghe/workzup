const prisma = require('../prismaClient');
const { getIo } = require('../socket');

// GET /api/messages?conversationId=...
const getMessages = async (req, res) => {
    try {
        const currentUserId = req.user?.userId;
        if (!currentUserId) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        const { conversationId } = req.query;

        if (!conversationId) {
            return res.status(400).json({ success: false, error: 'conversationId is required' });
        }

        const conversation = await prisma.conversation.findUnique({ where: { id: conversationId } });
        if (!conversation) {
            return res.status(404).json({ success: false, error: 'Conversation not found' });
        }
        if (!conversation.participantIds?.includes(currentUserId)) {
            return res.status(403).json({ success: false, error: 'Forbidden' });
        }

        let whereClause = { isDeleted: false };
        if (conversationId) whereClause.conversationId = conversationId;

        const messages = await prisma.message.findMany({
            where: whereClause,
            orderBy: { createdAt: 'asc' }
        });

        // Add 'text' for backward compatibility
        const formatted = messages.map(m => ({ ...m, text: m.content }));
        res.status(200).json({ success: true, data: formatted });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

// POST /api/messages
const sendMessage = async (req, res) => {
    try {
        const currentUserId = req.user?.userId;
        if (!currentUserId) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        const { conversationId, content, replyToId, text, receiverId } = req.body;
        const msgContent = content || text;

        if (!msgContent) {
            return res.status(400).json({ success: false, error: 'Message content is required' });
        }

        const timestampString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const targetConvId = conversationId || 'default';

        // Ensure conversation exists or create it
        let conv = await prisma.conversation.findUnique({ where: { id: targetConvId } });
        if (!conv) {
            if (!receiverId) {
                return res.status(400).json({ success: false, error: 'receiverId is required to start a new conversation' });
            }
            conv = await prisma.conversation.create({
                data: {
                    id: targetConvId,
                    participantIds: [currentUserId, receiverId],
                    lastMessage: msgContent,
                    lastMessageTime: timestampString,
                    unreadCount: 1
                }
            });
        } else {
            if (!conv.participantIds?.includes(currentUserId)) {
                return res.status(403).json({ success: false, error: 'Forbidden' });
            }
            // Update conversation last message
            await prisma.conversation.update({
                where: { id: targetConvId },
                data: {
                    lastMessage: msgContent,
                    lastMessageTime: timestampString,
                    unreadCount: { increment: 1 }
                }
            });
        }

        const newMessage = await prisma.message.create({
            data: {
                conversationId: targetConvId,
                senderId: currentUserId,
                receiverId: receiverId || conv.participantIds?.find((id) => id !== currentUserId) || null,
                content: msgContent,
                replyToId,
                timestamp: timestampString
            }
        });

        try {
            const io = getIo();
            io.to(targetConvId).emit("receive_message", { ...newMessage, text: newMessage.content });
        } catch (_) {
            // Ignore socket emission failures so REST flow still succeeds.
        }

        res.status(201).json({ success: true, data: { ...newMessage, text: newMessage.content } });
    } catch (error) {
        console.error("Error sending message:", error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

// PATCH /api/messages/:id
const updateMessage = async (req, res) => {
    try {
        const currentUserId = req.user?.userId;
        if (!currentUserId) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        const { id } = req.params;
        const { content, action } = req.body;

        const existing = await prisma.message.findUnique({
            where: { id },
            include: { conversation: true }
        });
        if (!existing) {
            return res.status(404).json({ success: false, error: 'Message not found' });
        }
        if (!existing.conversation?.participantIds?.includes(currentUserId)) {
            return res.status(403).json({ success: false, error: 'Forbidden' });
        }

        let updateData = {};
        if (action === 'markRead') updateData.isRead = true;
        else if (content) {
            updateData.content = content;
            updateData.isEdited = true;
        }

        const updated = await prisma.message.update({
            where: { id },
            data: updateData
        });

        res.status(200).json({ success: true, data: { ...updated, text: updated.content } });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

// DELETE /api/messages/:id
const deleteMessage = async (req, res) => {
    try {
        const currentUserId = req.user?.userId;
        if (!currentUserId) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        const { id } = req.params;

        const existing = await prisma.message.findUnique({
            where: { id },
            include: { conversation: true }
        });
        if (!existing) {
            return res.status(404).json({ success: false, error: 'Message not found' });
        }
        if (!existing.conversation?.participantIds?.includes(currentUserId)) {
            return res.status(403).json({ success: false, error: 'Forbidden' });
        }

        await prisma.message.update({
            where: { id },
            data: {
                isDeleted: true,
                content: "This message was deleted"
            }
        });

        res.status(200).json({ success: true, data: null });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

// GET /api/messages/search?q=...
const searchMessages = async (req, res) => {
    try {
        const currentUserId = req.user?.userId;
        if (!currentUserId) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        const { q, conversationId } = req.query;

        if (conversationId) {
            const conversation = await prisma.conversation.findUnique({ where: { id: conversationId } });
            if (!conversation) {
                return res.status(404).json({ success: false, error: 'Conversation not found' });
            }
            if (!conversation.participantIds?.includes(currentUserId)) {
                return res.status(403).json({ success: false, error: 'Forbidden' });
            }
        }

        let whereClause = {
            isDeleted: false,
            content: { contains: q || "", mode: 'insensitive' }
        };

        if (conversationId) whereClause.conversationId = conversationId;

        const results = await prisma.message.findMany({ where: whereClause });
        const formatted = results.map(m => ({ ...m, text: m.content }));

        res.status(200).json({ success: true, data: formatted });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

// POST /api/messages/upload
const uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'No image provided' });
        }
        
        const imageUrl = `/uploads/${req.file.filename}`;
        res.status(200).json({ success: true, url: imageUrl });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

module.exports = {
    getMessages,
    sendMessage,
    updateMessage,
    deleteMessage,
    searchMessages,
    uploadImage
};
