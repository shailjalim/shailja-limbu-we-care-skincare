const express = require('express');
const { verifyToken, adminOnly } = require('../middleware/authMiddleware');
const {
  getAllUsers,
  updateUserRole,
  deleteUser,
} = require('../controllers/adminController');

const router = express.Router();

router.use(verifyToken, adminOnly);

router.get('/', getAllUsers);
router.put('/:id/role', updateUserRole);
router.delete('/:id', deleteUser);

module.exports = router;