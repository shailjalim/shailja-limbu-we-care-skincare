const express = require('express');
const { verifyToken, adminOnly } = require('../middleware/authMiddleware');
const {
  getAdminProducts,
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,
} = require('../controllers/adminProductController');

const router = express.Router();

router.use(verifyToken, adminOnly);

router.get('/', getAdminProducts);
router.post('/', createAdminProduct);
router.put('/:id', updateAdminProduct);
router.delete('/:id', deleteAdminProduct);

module.exports = router;