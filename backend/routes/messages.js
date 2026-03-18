const express = require('express');
const router = express.Router();
const messagesController = require('../controllers/messagesController');
const { authenticateToken } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// POST /api/messages/upload - Must be ABOVE /:id
router.post('/upload', authenticateToken, upload.single('image'), messagesController.uploadImage);

// GET /api/messages/search - Search messages (Must be above /:id)
router.get('/search', authenticateToken, messagesController.searchMessages);

// GET /api/messages - Return array of messages (optionally filter by ?conversationId=)
router.get('/', authenticateToken, messagesController.getMessages);

// POST /api/messages - Send message
router.post('/', authenticateToken, messagesController.sendMessage);

// PATCH /api/messages/:id - Edit or mark message as read
router.patch('/:id', authenticateToken, messagesController.updateMessage);

// DELETE /api/messages/:id - Delete a message
router.delete('/:id', authenticateToken, messagesController.deleteMessage);


module.exports = router;
