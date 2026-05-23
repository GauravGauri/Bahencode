const express = require('express');
const router = express.Router();
const { sendMessage, getMessages, deleteMessage } = require('../controllers/messageController');
const { protect, authorize } = require('../middleware/auth');

// Public contact submission
router.post('/', sendMessage);

// Protected inbox admin routes
router.get('/', protect, authorize('admin'), getMessages);
router.delete('/:id', protect, authorize('admin'), deleteMessage);

module.exports = router;
