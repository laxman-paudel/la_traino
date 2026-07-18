const prisma = require("../config/db");

async function getTrainerCalendar(trainerId, dateFrom, dateTo) {
  const startDate = new Date(dateFrom);
  startDate.setHours(0, 0, 0, 0);
  const endDate = new Date(dateTo);
  endDate.setHours(23, 59, 59, 999);

  const [assignedWorkouts, workoutLogs] = await Promise.all([
    prisma.assignedWorkout.findMany({
      where: { trainerId, day: { gte: startDate, lte: endDate } },
      include: { trainee: { select: { id: true, name: true } } },
      orderBy: { day: "asc" },
    }),
    prisma.workoutLog.findMany({
      where: {
        traineeId: {
          in: await prisma.assignedWorkout
            .findMany({
              where: { trainerId, day: { gte: startDate, lte: endDate } },
              select: { traineeId: true },
              distinct: ["traineeId"],
            })
            .then((r) => r.map((x) => x.traineeId)),
        },
        day: { gte: startDate, lte: endDate },
      },
      select: { traineeId: true, day: true, completed: true },
    }),
  ]);

  const logMap = {};
  for (const log of workoutLogs) {
    const key = `${log.traineeId}_${log.day.toISOString().split("T")[0]}`;
    logMap[key] = log.completed;
  }

  const dates = {};
  for (const aw of assignedWorkouts) {
    const dateKey = aw.day.toISOString().split("T")[0];
    if (!dates[dateKey]) {
      dates[dateKey] = { workoutCount: 0, traineeIds: new Set(), trainees: [] };
    }
    dates[dateKey].workoutCount++;
    dates[dateKey].traineeIds.add(aw.traineeId);
    const logKey = `${aw.traineeId}_${dateKey}`;
    dates[dateKey].trainees.push({
      id: aw.trainee.id,
      name: aw.trainee.name,
      workoutName: aw.name,
      exerciseCount: Array.isArray(aw.exercises) ? aw.exercises.length : 0,
      completed: logMap[logKey] || false,
    });
  }

  const result = {};
  for (const [key, val] of Object.entries(dates)) {
    result[key] = {
      workoutCount: val.workoutCount,
      traineeCount: val.traineeIds.size,
      trainees: val.trainees,
    };
  }

  return { dates: result };
}

async function getTraineeCalendar(traineeId, dateFrom, dateTo) {
  const startDate = new Date(dateFrom);
  startDate.setHours(0, 0, 0, 0);
  const endDate = new Date(dateTo);
  endDate.setHours(23, 59, 59, 999);

  const [assignedWorkouts, workoutLogs] = await Promise.all([
    prisma.assignedWorkout.findMany({
      where: { traineeId, day: { gte: startDate, lte: endDate } },
      orderBy: { day: "asc" },
    }),
    prisma.workoutLog.findMany({
      where: { traineeId, day: { gte: startDate, lte: endDate } },
      select: { day: true, completed: true, id: true },
    }),
  ]);

  const logMap = {};
  for (const log of workoutLogs) {
    const key = log.day.toISOString().split("T")[0];
    logMap[key] = { completed: log.completed, logId: log.id };
  }

  const dates = {};
  for (const aw of assignedWorkouts) {
    const dateKey = aw.day.toISOString().split("T")[0];
    const logInfo = logMap[dateKey] || { completed: false, logId: null };
    dates[dateKey] = {
      hasWorkout: true,
      workoutName: aw.name,
      exerciseCount: Array.isArray(aw.exercises) ? aw.exercises.length : 0,
      completed: logInfo.completed,
      logId: logInfo.logId,
      assignedWorkoutId: aw.id,
    };
  }

  return { dates };
}

async function getTraineeUpcoming(traineeId) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endDate = new Date(today);
  endDate.setDate(endDate.getDate() + 9);
  endDate.setHours(23, 59, 59, 999);

  const days = [];
  for (let i = 0; i < 10; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    days.push({
      date: d,
      dateKey: d.toISOString().split("T")[0],
      dayName: d.toLocaleDateString("en-US", { weekday: "short" }),
      monthDay: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    });
  }

  const dateKeys = days.map((d) => d.dateKey);

  const [assignedWorkouts, workoutLogs] = await Promise.all([
    prisma.assignedWorkout.findMany({
      where: { traineeId, day: { gte: today, lte: endDate } },
      orderBy: { day: "asc" },
    }),
    prisma.workoutLog.findMany({
      where: { traineeId, day: { gte: today, lte: endDate } },
      select: { day: true, completed: true, id: true },
    }),
  ]);

  const awMap = {};
  for (const aw of assignedWorkouts) {
    const key = aw.day.toISOString().split("T")[0];
    awMap[key] = aw;
  }

  const logMap = {};
  for (const log of workoutLogs) {
    const key = log.day.toISOString().split("T")[0];
    logMap[key] = log;
  }

  const now = new Date();
  const todayKey = now.toISOString().split("T")[0];
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowKey = tomorrow.toISOString().split("T")[0];

  const schedule = days.map((d) => {
    const aw = awMap[d.dateKey];
    const log = logMap[d.dateKey];
    let status;
    if (log?.completed) status = "completed";
    else if (d.dateKey === todayKey && aw) status = "today";
    else if (d.dateKey === tomorrowKey && aw) status = "tomorrow";
    else if (aw) status = "assigned";
    else status = "rest_day";

    return {
      date: d.dateKey,
      dayName: d.dayName,
      monthDay: d.monthDay,
      workoutName: aw?.name || null,
      exerciseCount: aw && Array.isArray(aw.exercises) ? aw.exercises.length : 0,
      assignedWorkoutId: aw?.id || null,
      status,
    };
  });

  return { schedule };
}

module.exports = { getTrainerCalendar, getTraineeCalendar, getTraineeUpcoming };
