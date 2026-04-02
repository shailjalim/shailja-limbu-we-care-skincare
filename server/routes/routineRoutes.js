const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createRoutine,
  getRoutines,
  updateRoutine,
  deleteRoutine,
} = require('../controllers/routineController');

router.use(protect);
router.get('/', getRoutines);
router.post('/', createRoutine);
router.put('/:id', updateRoutine);
router.delete('/:id', deleteRoutine);

module.exports = router;
