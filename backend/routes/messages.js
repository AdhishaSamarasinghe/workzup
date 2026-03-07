const express = require('express');
const router = express.Router();
const messagesController = require('../controllers/messagesController');

// GET /api/messages/search - Search messages (Must be above /:id)
router.get('/search', messagesController.searchMessages);

// GET /api/messages - Return array of messages (optionally filter by ?conversationId=)
router.get('/', messagesController.getMessages);

// POST /api/messages - Send message
router.post('/', messagesController.sendMessage);

// PATCH /api/messages/:id - Edit or mark message as read
router.patch('/:id', messagesController.updateMessage);

// DELETE /api/messages/:id - Delete a message
router.delete('/:id', messagesController.deleteMessage);


module.exports = router;
