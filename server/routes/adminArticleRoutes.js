const express = require('express');
const { verifyToken, adminOnly } = require('../middleware/authMiddleware');
const {
  getAdminArticles,
  createAdminArticle,
  updateAdminArticle,
  deleteAdminArticle,
} = require('../controllers/adminArticleController');

const router = express.Router();

router.use(verifyToken, adminOnly);

router.get('/', getAdminArticles);
router.post('/', createAdminArticle);
router.put('/:id', updateAdminArticle);
router.delete('/:id', deleteAdminArticle);

module.exports = router;