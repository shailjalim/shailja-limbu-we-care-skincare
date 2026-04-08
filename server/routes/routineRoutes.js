const express = require('express');
const router = express.Router();
const { protect, userOnly } = require('../middleware/authMiddleware');
const {
  createRoutine,
  getRoutines,
  completeRoutine,
  updateRoutine,
  deleteRoutine,
} = require('../controllers/routineController');

router.use(protect, userOnly);
router.get('/', getRoutines);
router.post('/', createRoutine);
router.post('/complete', completeRoutine);
router.put('/:id', updateRoutine);
router.delete('/:id', deleteRoutine);

module.exports = router;
