const express = require('express');
const { verifyToken, adminOnly } = require('../middleware/authMiddleware');
const { uploadAdminReplyImages } = require('../middleware/uploadMiddleware');
const {
  getAdminConsultations,
  updateAdminConsultation,
  deleteAdminConsultation,
} = require('../controllers/adminConsultationController');

const router = express.Router();

router.use(verifyToken, adminOnly);

router.get('/', getAdminConsultations);
router.put('/:id', uploadAdminReplyImages, updateAdminConsultation);
router.delete('/:id', deleteAdminConsultation);

module.exports = router;