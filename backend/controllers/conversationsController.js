const { conversations } = require('../data/memoryStore');
const crypto = require('crypto');

// GET /api/conversations
const getAllConversations = (req, res) => {
    res.status(200).json({ success: true, data: conversations });
};

// GET /api/conversations/:id
const getConversationById = (req, res) => {
    const conversation = conversations.find(c => c.id === req.params.id);
    if (!conversation) {
        return res.status(404).json({ success: false, error: 'Conversation not found' });
    }
    res.status(200).json({ success: true, data: conversation });
};

// POST /api/conversations
const createConversation = (req, res) => {
    const { participantIds, type, jobId, initialMessage } = req.body;

    const newConversation = {
        id: crypto.randomUUID ? crypto.randomUUID() : (Date.now().toString() + Math.random().toString(36).substring(7)),
        type: type || 'direct',
        participants: participantIds || [],
        jobId,
        unreadCount: 0,
        isArchived: false,
        isPinned: false,
        createdAt: new Date().toISOString()
    };

    conversations.push(newConversation);
    res.status(201).json({ success: true, data: newConversation });
};

// PATCH /api/conversations/:id
const updateConversation = (req, res) => {
    const { id } = req.params;
    const conversationIndex = conversations.findIndex(c => c.id === id);

    if (conversationIndex === -1) {
        return res.status(404).json({ success: false, error: 'Conversation not found' });
    }

    const { action, isPinned } = req.body;

    if (action === 'archive') {
        conversations[conversationIndex].isArchived = true;
    } else if (action === 'pin') {
        conversations[conversationIndex].isPinned = isPinned;
    } else if (action === 'markRead') {
        conversations[conversationIndex].unreadCount = 0;
    }

    res.status(200).json({ success: true, data: conversations[conversationIndex] });
};

// GET /api/conversations/:id/typing
const getTypingUsers = (req, res) => {
    // Always mock as no one typing for now
    res.status(200).json({ success: true, data: [] });
};

// POST /api/conversations/:id/typing
const updateTypingStatus = (req, res) => {
    res.status(200).json({ success: true, data: [] });
};

module.exports = {
    getAllConversations,
    getConversationById,
    createConversation,
    updateConversation,
    getTypingUsers,
    updateTypingStatus
};
