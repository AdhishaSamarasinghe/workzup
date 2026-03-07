const express = require('express');
const router = express.Router();
const conversationsController = require('../controllers/conversationsController');

// GET /api/conversations - Return all conversations
router.get('/', conversationsController.getAllConversations);

// POST /api/conversations - Create a conversation
router.post('/', conversationsController.createConversation);

// GET /api/conversations/:id/typing
router.get('/:id/typing', conversationsController.getTypingUsers);

// POST /api/conversations/:id/typing
router.post('/:id/typing', conversationsController.updateTypingStatus);

// GET /api/conversations/:id - Return a specific conversation
router.get('/:id', conversationsController.getConversationById);

// PATCH /api/conversations/:id - Update a conversation
router.patch('/:id', conversationsController.updateConversation);

module.exports = router;
