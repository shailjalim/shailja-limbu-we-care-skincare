const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { chatWithAssistant, getChatHistory, clearChatHistory } = require('../controllers/chatbotController');

const router = express.Router();

// POST send message (saves both user msg and assistant response)
router.post('/', protect, chatWithAssistant);

// GET retrieve chat history
router.get('/', protect, getChatHistory);

// DELETE clear chat history
router.delete('/', protect, clearChatHistory);

module.exports = router;
