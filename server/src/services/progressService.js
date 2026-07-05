const prisma = require("../config/db");

function getWeekRange() {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() + diffToMonday);
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);
  return { weekStart, weekEnd };
}

async function getWeeklyProgress(traineeId) {
  const { weekStart, weekEnd } = getWeekRange();

  const logs = await prisma.workoutLog.findMany({
    where: {
      traineeId,
      day: { gte: weekStart, lte: weekEnd },
    },
    orderBy: { day: "asc" },
    select: { day: true, completed: true },
  });

  const daysCompleted = logs.filter((log) => log.completed).length;
  const totalDays = 7;
  const completionRate = Math.round((daysCompleted / totalDays) * 100);

  return {
    weekStart: weekStart.toISOString().split("T")[0],
    weekEnd: weekEnd.toISOString().split("T")[0],
    daysCompleted,
    totalDays,
    completionRate,
    logs: logs.map((log) => ({
      day: log.day.toISOString().split("T")[0],
      completed: log.completed,
    })),
  };
}

module.exports = { getWeeklyProgress };
