const Routine = require('../models/Routine');
const SkinProfile = require('../models/SkinProfile');
const { getUpdatedRoutineStats } = require('../services/routineCompletionService');

const VALID_ROUTINE_TYPES = ['morning', 'night'];
const VALID_STEP_NAMES = ['Cleanser', 'Toner', 'Serum', 'Moisturizer', 'Sunscreen'];

const validateRoutinePayload = (routine_type, steps) => {
  if (!VALID_ROUTINE_TYPES.includes(routine_type)) {
    return 'routine_type must be either "morning" or "night"';
  }
  if (!Array.isArray(steps) || steps.length === 0) {
    return 'steps must be a non-empty array';
  }
  const stepNames = steps.map((step) => step.step_name);
  if (new Set(stepNames).size !== stepNames.length) {
    return 'Duplicate step_name found. Each step must be unique';
  }

  for (const step of steps) {
    if (!step.step_name || !VALID_STEP_NAMES.includes(step.step_name)) {
      return `Invalid step_name: ${step.step_name}. Allowed values: ${VALID_STEP_NAMES.join(', ')}`;
    }
    if (!step.product_id) {
      return `Each step must include product_id for step ${step.step_name}`;
    }
  }
  if (routine_type === 'night') {
    const sunscreenStep = steps.find((s) => s.step_name === 'Sunscreen');
    if (sunscreenStep) {
      return 'Sunscreen should not be included in night routine';
    }
  }
  return null;
};

exports.createRoutine = async (req, res) => {
  try {
    const { routine_type, steps } = req.body;
    const validationError = validateRoutinePayload(routine_type, steps);
    if (validationError) {
      return res.status(400).json({ success: false, message: validationError });
    }

    const routine = await Routine.create({
      user_id: req.user._id,
      routine_type,
      steps,
    });

    res.status(201).json({ success: true, routine });
  } catch (error) {
    console.error('createRoutine error', error);
    res.status(500).json({ success: false, message: 'Server error creating routine' });
  }
};

exports.getRoutines = async (req, res) => {
  try {
    const routines = await Routine.find({ user_id: req.user._id })
      .sort({ createdAt: -1 })
      .populate('steps.product_id', 'name');

    res.status(200).json({ success: true, routines });
  } catch (error) {
    console.error('getRoutines error', error);
    res.status(500).json({ success: false, message: 'Server error fetching routines' });
  }
};

exports.updateRoutine = async (req, res) => {
  try {
    const { routine_type, steps, isActive } = req.body;

    if (routine_type || steps) {
      const validationError = validateRoutinePayload(routine_type || 'morning', steps || []);
      if (validationError) {
        return res.status(400).json({ success: false, message: validationError });
      }
    }

    const routine = await Routine.findOneAndUpdate(
      { _id: req.params.id, user_id: req.user._id },
      { routine_type, steps, isActive },
      { new: true, runValidators: true }
    ).populate('steps.product_id', 'name');

    if (!routine) {
      return res.status(404).json({ success: false, message: 'Routine not found' });
    }
    res.status(200).json({ success: true, routine });
  } catch (error) {
    console.error('updateRoutine error', error);
    res.status(500).json({ success: false, message: 'Server error updating routine' });
  }
};

exports.deleteRoutine = async (req, res) => {
  try {
    const routine = await Routine.findOneAndDelete({ _id: req.params.id, user_id: req.user._id });
    if (!routine) {
      return res.status(404).json({ success: false, message: 'Routine not found' });
    }
    res.status(200).json({ success: true, message: 'Routine deleted successfully' });
  } catch (error) {
    console.error('deleteRoutine error', error);
    res.status(500).json({ success: false, message: 'Server error deleting routine' });
  }
};

exports.completeRoutine = async (req, res) => {
  try {
    const { routineId } = req.body;

    if (!routineId) {
      return res.status(400).json({ success: false, message: 'routineId is required' });
    }

    const routine = await Routine.findOne({ _id: routineId, user_id: req.user._id });
    if (!routine) {
      return res.status(404).json({ success: false, message: 'Routine not found' });
    }

    if (!routine.isActive) {
      return res.status(400).json({ success: false, message: 'Cannot complete a paused routine' });
    }

    const profile = await SkinProfile.findOne({ user: req.user._id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Skin profile not found' });
    }

    const { alreadyCompletedToday, updatedStats } = getUpdatedRoutineStats(profile.routineStats, new Date());

    if (alreadyCompletedToday) {
      return res.status(200).json({
        success: false,
        alreadyCompletedToday: true,
        message: 'Routine already completed today',
        routineStats: updatedStats,
      });
    }

    profile.routineStats = updatedStats;
    await profile.save();

    return res.status(200).json({
      success: true,
      message: 'Routine marked as completed',
      routineStats: profile.routineStats,
    });
  } catch (error) {
    console.error('completeRoutine error', error);
    return res.status(500).json({ success: false, message: 'Server error completing routine' });
  }
};
