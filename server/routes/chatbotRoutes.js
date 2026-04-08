const express = require('express');
const { protect, userOnly } = require('../middleware/authMiddleware');
const { chatWithAssistant, getChatHistory, clearChatHistory } = require('../controllers/chatbotController');

const router = express.Router();

// POST send message (saves both user msg and assistant response)
router.post('/', protect, userOnly, chatWithAssistant);

// GET retrieve chat history
router.get('/', protect, userOnly, getChatHistory);

// DELETE clear chat history
router.delete('/', protect, userOnly, clearChatHistory);

module.exports = router;
