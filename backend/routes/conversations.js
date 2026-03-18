const express = require('express');
const router = express.Router();
const conversationsController = require('../controllers/conversationsController');
const { authenticateToken } = require('../middleware/auth');

// GET /api/conversations - Return all conversations
router.get('/', authenticateToken, conversationsController.getAllConversations);

router.get('/unread-count', authenticateToken, conversationsController.getUnreadCount);
// GET /api/conversations/:id/typing
router.get('/:id/typing', authenticateToken, conversationsController.getTypingUsers);

// POST /api/conversations/:id/typing
router.post('/:id/typing', authenticateToken, conversationsController.updateTypingStatus);

// GET /api/conversations/:id/messages
router.get('/:id/messages', authenticateToken, conversationsController.getConversationMessages);

// POST /api/conversations/:id/messages
router.post('/:id/messages', authenticateToken, conversationsController.sendConversationMessage);

// PATCH /api/conversations/:id/read
router.patch('/:id/read', authenticateToken, conversationsController.markConversationRead);

// GET /api/conversations/:id - Return a specific conversation
router.get('/:id', authenticateToken, conversationsController.getConversationById);

module.exports = router;
