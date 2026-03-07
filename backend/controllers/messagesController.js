const { messages, conversations } = require('../data/memoryStore');
const crypto = require('crypto');

// GET /api/messages?conversationId=...
const getMessages = (req, res) => {
    const { conversationId } = req.query;

    if (conversationId) {
        const filtered = messages.filter(m => m.conversationId === conversationId && !m.isDeleted);
        return res.status(200).json({ success: true, data: filtered });
    }

    res.status(200).json({ success: true, data: messages.filter(m => !m.isDeleted) });
};

// POST /api/messages
const sendMessage = (req, res) => {
    const { senderId, conversationId, content, replyToId, text, receiverId } = req.body;

    // Accept both the original parameters (senderId, receiverId, text)
    // and the new parameters (senderId, conversationId, content) mapped by Next.js
    const msgContent = content || text;

    if (!msgContent) {
        return res.status(400).json({ success: false, error: 'Message content is required' });
    }

    const timestampString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newMessage = {
        id: crypto.randomUUID ? crypto.randomUUID() : (Date.now().toString() + Math.random().toString(36).substring(7)),
        conversationId: conversationId || 'default',
        senderId: senderId || 'user-1',
        receiverId,
        content: msgContent,
        text: msgContent, // Add both for compatibility
        replyToId,
        isRead: false,
        isEdited: false,
        isDeleted: false,
        timestamp: timestampString,
        createdAt: new Date().toISOString()
    };

    messages.push(newMessage);

    // Sync with the conversation object
    let conversation = conversations.find(c => c.id === newMessage.conversationId);
    if (conversation) {
        conversation.lastMessage = msgContent;
        conversation.lastMessageTime = timestampString;
        // Increment unread count if it's not from us (assuming sender is the user for this mock)
        conversation.unreadCount = (conversation.unreadCount || 0) + 1;
    } else {
        // Auto-create a stub conversation if it doesn't exist so it shows up in the UI
        conversation = {
            id: newMessage.conversationId,
            participant: {
                id: receiverId || "unknown",
                name: "New Chat",
                avatar: "/logo_main.png"
            },
            lastMessage: msgContent,
            lastMessageTime: timestampString,
            unreadCount: 0
        };
        conversations.push(conversation);
    }

    res.status(201).json({ success: true, data: newMessage });
};

// PATCH /api/messages/:id
const updateMessage = (req, res) => {
    const { id } = req.params;
    const msgIndex = messages.findIndex(m => m.id === id);

    if (msgIndex === -1) {
        return res.status(404).json({ success: false, error: 'Message not found' });
    }

    const { content, action } = req.body;

    if (action === 'markRead') {
        messages[msgIndex].isRead = true;
    } else if (content) {
        messages[msgIndex].content = content;
        messages[msgIndex].text = content;
        messages[msgIndex].isEdited = true;
        messages[msgIndex].updatedAt = new Date().toISOString();
    }

    res.status(200).json({ success: true, data: messages[msgIndex] });
};

// DELETE /api/messages/:id
const deleteMessage = (req, res) => {
    const { id } = req.params;
    const msgIndex = messages.findIndex(m => m.id === id);

    if (msgIndex === -1) {
        return res.status(404).json({ success: false, error: 'Message not found' });
    }

    messages[msgIndex].isDeleted = true;
    messages[msgIndex].content = "This message was deleted";
    messages[msgIndex].text = "This message was deleted";

    res.status(200).json({ success: true, data: null });
};

// GET /api/messages/search?q=...
const searchMessages = (req, res) => {
    const { q, conversationId } = req.query;

    let results = messages.filter(m => !m.isDeleted && (m.content || m.text || "").toLowerCase().includes((q || "").toLowerCase()));

    if (conversationId) {
        results = results.filter(m => m.conversationId === conversationId);
    }

    res.status(200).json({ success: true, data: results });
};

module.exports = {
    getMessages,
    sendMessage,
    updateMessage,
    deleteMessage,
    searchMessages
};
