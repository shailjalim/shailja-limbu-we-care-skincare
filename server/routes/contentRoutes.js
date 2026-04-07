const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  getContent,
  getContentById,
  createContent,
  updateContent,
  deleteContent,
} = require('../controllers/contentController');

const router = express.Router();

router.get('/', getContent);
router.get('/:id', getContentById);
router.post('/', protect, authorize('admin'), createContent);
router.put('/:id', protect, authorize('admin'), updateContent);
router.delete('/:id', protect, authorize('admin'), deleteContent);

module.exports = router;