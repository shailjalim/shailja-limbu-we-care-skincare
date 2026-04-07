const MS_PER_DAY = 24 * 60 * 60 * 1000;

const toStartOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

const isSameDay = (a, b) => {
  if (!a || !b) return false;
  const dayA = toStartOfDay(a).getTime();
  const dayB = toStartOfDay(b).getTime();
  return dayA === dayB;
};

const daysBetween = (olderDate, newerDate) => {
  if (!olderDate || !newerDate) return null;
  const diff = toStartOfDay(newerDate).getTime() - toStartOfDay(olderDate).getTime();
  return Math.max(0, Math.floor(diff / MS_PER_DAY));
};

const normalizeRoutineStats = (routineStats = {}) => ({
  totalCompleted: Number(routineStats.totalCompleted || 0),
  weeklyCompleted: Number(routineStats.weeklyCompleted || 0),
  lastCompletedDate: routineStats.lastCompletedDate || null,
});

const getUpdatedRoutineStats = (routineStats, now = new Date()) => {
  const currentStats = normalizeRoutineStats(routineStats);
  const lastCompletedDate = currentStats.lastCompletedDate ? new Date(currentStats.lastCompletedDate) : null;

  if (lastCompletedDate && isSameDay(lastCompletedDate, now)) {
    return {
      alreadyCompletedToday: true,
      updatedStats: currentStats,
    };
  }

  const dayGap = lastCompletedDate ? daysBetween(lastCompletedDate, now) : null;
  const shouldResetWeekly = dayGap === null || dayGap > 7;

  return {
    alreadyCompletedToday: false,
    updatedStats: {
      totalCompleted: currentStats.totalCompleted + 1,
      weeklyCompleted: shouldResetWeekly ? 1 : currentStats.weeklyCompleted + 1,
      lastCompletedDate: now,
    },
  };
};

module.exports = {
  getUpdatedRoutineStats,
};
