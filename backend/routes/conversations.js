const express = require('express');
const router = express.Router();
const conversationsController = require('../controllers/conversationsController');
const { authenticateToken } = require('../middleware/auth');

// GET /api/conversations - Return all conversations
router.get('/', authenticateToken, conversationsController.getAllConversations);

router.get('/unread-count', authenticateToken, conversationsController.getUnreadCount);
// POST /api/conversations - Create a conversation
router.post('/', authenticateToken, conversationsController.createConversation);

// GET /api/conversations/:id/typing
router.get('/:id/typing', authenticateToken, conversationsController.getTypingUsers);

// POST /api/conversations/:id/typing
router.post('/:id/typing', authenticateToken, conversationsController.updateTypingStatus);

// GET /api/conversations/:id - Return a specific conversation
router.get('/:id', authenticateToken, conversationsController.getConversationById);

// PATCH /api/conversations/:id - Update a conversation
router.patch('/:id', authenticateToken, conversationsController.updateConversation);

module.exports = router;
