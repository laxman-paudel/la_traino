const prisma = require("../config/db");

function parseDayName(dayName) {
  const dateMatch = dayName.match(/^\d{4}-\d{2}-\d{2}$/);
  if (dateMatch) {
    const date = new Date(dayName + "T00:00:00");
    if (!isNaN(date.getTime())) {
      return date;
    }
  }

  const days = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  const index = days.indexOf(dayName.toLowerCase());
  if (index === -1) {
    throw Object.assign(new Error("Invalid day"), { status: 400 });
  }
  const now = new Date();
  let diff = index - now.getDay();
  if (diff < 0) diff += 7;
  const target = new Date(now);
  target.setDate(now.getDate() + diff);
  target.setHours(0, 0, 0, 0);
  return target;
}

async function getDashboard(trainerId) {
  const trainerProfile = await prisma.trainerProfile.findUnique({
    where: { userId: trainerId },
    select: { trainerCode: true },
  });

  if (!trainerProfile) {
    throw Object.assign(new Error("Trainer profile not found"), {
      status: 404,
    });
  }

  const links = await prisma.trainerLink.findMany({
    where: { trainerId },
    orderBy: { createdAt: "desc" },
    include: {
      trainee: {
        select: {
          id: true,
          name: true,
          email: true,
          traineeProfile: {
            select: {
              selectedPreset: { select: { id: true, name: true } },
            },
          },
        },
      },
    },
  });

  return {
    trainerCode: trainerProfile.trainerCode,
    totalTrainees: links.length,
    trainees: links.map((link) => ({
      id: link.trainee.id,
      name: link.trainee.name,
      email: link.trainee.email,
      linkedAt: link.createdAt,
      preset: link.trainee.traineeProfile?.selectedPreset ?? null,
    })),
  };
}

async function assignWorkout(trainerId, traineeId, body) {
  const { day, exercises } = body;

  if (!day || !exercises) {
    throw Object.assign(new Error("day and exercises are required"), {
      status: 400,
    });
  }
  if (!Array.isArray(exercises) || exercises.length === 0) {
    throw Object.assign(new Error("exercises must be a non-empty array"), {
      status: 400,
    });
  }

  for (const ex of exercises) {
    if (!ex.name || typeof ex.name !== "string" || !ex.name.trim()) {
      throw Object.assign(new Error("Invalid exercise data."), { status: 400 });
    }
    const sets = Number(ex.sets);
    const reps = Number(ex.reps);
    if (!Number.isInteger(sets) || sets <= 0) {
      throw Object.assign(new Error("Invalid exercise data."), { status: 400 });
    }
    if (!Number.isInteger(reps) || reps <= 0) {
      throw Object.assign(new Error("Invalid exercise data."), { status: 400 });
    }
  }

  const trainee = await prisma.user.findUnique({
    where: { id: traineeId },
    select: { id: true, role: true },
  });

  if (!trainee || trainee.role !== "TRAINEE") {
    throw Object.assign(new Error("Trainee not found"), { status: 404 });
  }

  const link = await prisma.trainerLink.findUnique({
    where: { traineeId },
    select: { trainerId: true },
  });

  if (!link || link.trainerId !== trainerId) {
    throw Object.assign(new Error("Trainee not linked to you"), {
      status: 403,
    });
  }

  const dayDate = parseDayName(day);

  const existing = await prisma.assignedWorkout.findFirst({
    where: { traineeId, day: dayDate },
    select: { id: true },
  });

  if (existing) {
    await prisma.assignedWorkout.update({
      where: { id: existing.id },
      data: { exercises },
    });
  } else {
    await prisma.assignedWorkout.create({
      data: {
        trainerId,
        traineeId,
        day: dayDate,
        name: day,
        exercises,
      },
    });
  }

  return { day, exercises };
}

async function assignDiet(trainerId, traineeId, body) {
  const { day, meals } = body;

  if (!day || !meals) {
    throw Object.assign(new Error("day and meals are required"), {
      status: 400,
    });
  }
  if (!Array.isArray(meals) || meals.length === 0) {
    throw Object.assign(new Error("meals must be a non-empty array"), {
      status: 400,
    });
  }

  for (const meal of meals) {
    if (!meal.time || typeof meal.time !== "string" || !meal.time.trim()) {
      throw Object.assign(new Error("Invalid diet data."), { status: 400 });
    }
    if (!Array.isArray(meal.items) || meal.items.length === 0) {
      throw Object.assign(new Error("Invalid diet data."), { status: 400 });
    }
    const hasValidItem = meal.items.some(
      (item) => typeof item === "string" && item.trim().length > 0,
    );
    if (!hasValidItem) {
      throw Object.assign(new Error("Invalid diet data."), { status: 400 });
    }
  }

  const sanitizedMeals = meals.map((meal) => ({
    time: meal.time.trim(),
    items: meal.items.map((item) => item.trim()).filter(Boolean),
  }));

  const trainee = await prisma.user.findUnique({
    where: { id: traineeId },
    select: { id: true, role: true },
  });

  if (!trainee || trainee.role !== "TRAINEE") {
    throw Object.assign(new Error("Trainee not found"), { status: 404 });
  }

  const link = await prisma.trainerLink.findUnique({
    where: { traineeId },
    select: { trainerId: true },
  });

  if (!link || link.trainerId !== trainerId) {
    throw Object.assign(new Error("Trainee not linked to you"), {
      status: 403,
    });
  }

  const dayDate = parseDayName(day);

  const existing = await prisma.dietPlan.findFirst({
    where: { traineeId, day: dayDate },
    select: { id: true },
  });

  if (existing) {
    await prisma.dietPlan.update({
      where: { id: existing.id },
      data: { meals: sanitizedMeals },
    });
  } else {
    await prisma.dietPlan.create({
      data: {
        trainerId,
        traineeId,
        day: dayDate,
        meals: sanitizedMeals,
      },
    });
  }

  return { day, meals: sanitizedMeals };
}

async function getTraineeLogs(trainerId, traineeId) {
  const trainee = await prisma.user.findUnique({
    where: { id: traineeId },
    select: { id: true, role: true },
  });

  if (!trainee || trainee.role !== "TRAINEE") {
    throw Object.assign(new Error("Trainee not found"), { status: 404 });
  }

  const link = await prisma.trainerLink.findUnique({
    where: { traineeId },
    select: { trainerId: true },
  });

  if (!link || link.trainerId !== trainerId) {
    throw Object.assign(new Error("Trainee not linked to you"), {
      status: 403,
    });
  }

  const logs = await prisma.workoutLog.findMany({
    where: { traineeId },
    orderBy: { day: "desc" },
    select: { day: true, completed: true, completedAt: true, exercises: true },
  });

  return logs.map((log) => ({
    day: log.day.toISOString().split("T")[0],
    completed: log.completed,
    completedAt: log.completedAt?.toISOString() ?? null,
    exerciseCount: Array.isArray(log.exercises) ? log.exercises.length : 0,
  }));
}

async function getFeedback(trainerId, traineeId) {
  const trainee = await prisma.user.findUnique({
    where: { id: traineeId },
    select: { id: true, role: true },
  });

  if (!trainee || trainee.role !== "TRAINEE") {
    throw Object.assign(new Error("Trainee not found"), { status: 404 });
  }

  const link = await prisma.trainerLink.findUnique({
    where: { traineeId },
    select: { trainerId: true },
  });

  if (!link || link.trainerId !== trainerId) {
    throw Object.assign(new Error("Trainee not linked to you"), {
      status: 403,
    });
  }

  const feedback = await prisma.feedback.findMany({
    where: { trainerId, traineeId },
    orderBy: { createdAt: "desc" },
    select: { id: true, weekStart: true, message: true, title: true, priority: true, category: true, read: true, createdAt: true },
  });

  return feedback.map((f) => ({
    id: f.id,
    weekStart: f.weekStart?.toISOString().split("T")[0] ?? null,
    message: f.message,
    title: f.title,
    priority: f.priority,
    category: f.category,
    read: f.read,
    createdAt: f.createdAt.toISOString(),
  }));
}

async function bulkAssignWorkout(trainerId, traineeIds, body) {
  const { day, exercises } = body;

  if (!day || !exercises) {
    throw Object.assign(new Error("day and exercises are required"), {
      status: 400,
    });
  }
  if (!Array.isArray(exercises) || exercises.length === 0) {
    throw Object.assign(new Error("exercises must be a non-empty array"), {
      status: 400,
    });
  }

  for (const ex of exercises) {
    if (!ex.name || typeof ex.name !== "string" || !ex.name.trim()) {
      throw Object.assign(new Error("Invalid exercise data."), { status: 400 });
    }
    const sets = Number(ex.sets);
    const reps = Number(ex.reps);
    if (!Number.isInteger(sets) || sets <= 0) {
      throw Object.assign(new Error("Invalid exercise data."), { status: 400 });
    }
    if (!Number.isInteger(reps) || reps <= 0) {
      throw Object.assign(new Error("Invalid exercise data."), { status: 400 });
    }
  }

  if (!Array.isArray(traineeIds) || traineeIds.length === 0) {
    throw Object.assign(new Error("traineeIds must be a non-empty array"), {
      status: 400,
    });
  }

  const numericIds = traineeIds.map(Number);
  const dayDate = parseDayName(day);

  const [trainees, links, existingAssignments] = await Promise.all([
    prisma.user.findMany({
      where: { id: { in: numericIds }, role: "TRAINEE" },
      select: { id: true },
    }),
    prisma.trainerLink.findMany({
      where: { trainerId, traineeId: { in: numericIds } },
      select: { traineeId: true },
    }),
    prisma.assignedWorkout.findMany({
      where: { traineeId: { in: numericIds }, day: dayDate },
      select: { id: true, traineeId: true },
    }),
  ]);

  const foundIds = new Set(trainees.map((t) => t.id));
  const linkedIds = new Set(links.map((l) => l.traineeId));
  const existingMap = new Map(existingAssignments.map((e) => [e.traineeId, e.id]));

  const results = [];
  for (const traineeId of numericIds) {
    try {
      if (!foundIds.has(traineeId)) throw new Error("Trainee not found");
      if (!linkedIds.has(traineeId)) throw new Error("Trainee not linked to you");

      if (existingMap.has(traineeId)) {
        await prisma.assignedWorkout.update({
          where: { id: existingMap.get(traineeId) },
          data: { exercises },
        });
      } else {
        await prisma.assignedWorkout.create({
          data: { trainerId, traineeId, day: dayDate, name: day, exercises },
        });
      }
      results.push({ traineeId, success: true });
    } catch (err) {
      results.push({ traineeId, success: false, error: err.message || "Unknown error" });
    }
  }

  return {
    total: results.length,
    succeeded: results.filter((r) => r.success).length,
    failed: results.filter((r) => !r.success).length,
    results,
  };
}

async function bulkAssignDiet(trainerId, traineeIds, body) {
  const { day, meals } = body;

  if (!day || !meals) {
    throw Object.assign(new Error("day and meals are required"), {
      status: 400,
    });
  }
  if (!Array.isArray(meals) || meals.length === 0) {
    throw Object.assign(new Error("meals must be a non-empty array"), {
      status: 400,
    });
  }

  for (const meal of meals) {
    if (!meal.time || typeof meal.time !== "string" || !meal.time.trim()) {
      throw Object.assign(new Error("Invalid diet data."), { status: 400 });
    }
    if (!Array.isArray(meal.items) || meal.items.length === 0) {
      throw Object.assign(new Error("Invalid diet data."), { status: 400 });
    }
    const hasValidItem = meal.items.some(
      (item) => typeof item === "string" && item.trim().length > 0,
    );
    if (!hasValidItem) {
      throw Object.assign(new Error("Invalid diet data."), { status: 400 });
    }
  }

  if (!Array.isArray(traineeIds) || traineeIds.length === 0) {
    throw Object.assign(new Error("traineeIds must be a non-empty array"), {
      status: 400,
    });
  }

  const numericIds = traineeIds.map(Number);
  const dayDate = parseDayName(day);

  const [trainees, links, existingPlans] = await Promise.all([
    prisma.user.findMany({
      where: { id: { in: numericIds }, role: "TRAINEE" },
      select: { id: true },
    }),
    prisma.trainerLink.findMany({
      where: { trainerId, traineeId: { in: numericIds } },
      select: { traineeId: true },
    }),
    prisma.dietPlan.findMany({
      where: { traineeId: { in: numericIds }, day: dayDate },
      select: { id: true, traineeId: true },
    }),
  ]);

  const foundIds = new Set(trainees.map((t) => t.id));
  const linkedIds = new Set(links.map((l) => l.traineeId));
  const existingMap = new Map(existingPlans.map((e) => [e.traineeId, e.id]));

  const results = [];
  for (const traineeId of numericIds) {
    try {
      if (!foundIds.has(traineeId)) throw new Error("Trainee not found");
      if (!linkedIds.has(traineeId)) throw new Error("Trainee not linked to you");

      if (existingMap.has(traineeId)) {
        await prisma.dietPlan.update({
          where: { id: existingMap.get(traineeId) },
          data: { meals: sanitizedMeals },
        });
      } else {
        await prisma.dietPlan.create({
          data: { trainerId, traineeId, day: dayDate, meals: sanitizedMeals },
        });
      }
      results.push({ traineeId, success: true });
    } catch (err) {
      results.push({ traineeId, success: false, error: err.message || "Unknown error" });
    }
  }

  return {
    total: results.length,
    succeeded: results.filter((r) => r.success).length,
    failed: results.filter((r) => !r.success).length,
    results,
  };
}

async function giveFeedback(trainerId, traineeId, body) {
  const { weekStart, message } = body;

  if (!message || !message.trim()) {
    throw Object.assign(new Error("Message is required"), { status: 400 });
  }

  const trainee = await prisma.user.findUnique({
    where: { id: traineeId },
    select: { id: true, role: true },
  });

  if (!trainee || trainee.role !== "TRAINEE") {
    throw Object.assign(new Error("Trainee not found"), { status: 404 });
  }

  const link = await prisma.trainerLink.findUnique({
    where: { traineeId },
    select: { trainerId: true },
  });

  if (!link || link.trainerId !== trainerId) {
    throw Object.assign(new Error("Trainee not linked to you"), {
      status: 403,
    });
  }

  const weekStartDate = weekStart && !isNaN(new Date(weekStart).getTime())
    ? new Date(weekStart) : new Date();

  const result = await prisma.feedback.create({
    data: {
      trainerId,
      traineeId,
      weekStart: weekStartDate,
      message: message.trim(),
    },
  });

  return {
    id: result.id,
    weekStart: result.weekStart.toISOString().split("T")[0],
    message: result.message,
    createdAt: result.createdAt.toISOString(),
  };
}

async function getWorkoutHistory(trainerId, filters = {}) {
  const { traineeId, dateFrom, dateTo, sort } = filters;

  const where = { trainerId };

  if (traineeId) where.traineeId = Number(traineeId);
  if (dateFrom || dateTo) {
    where.day = {};
    if (dateFrom) where.day.gte = new Date(dateFrom);
    if (dateTo) where.day.lte = new Date(dateTo);
  }

  const records = await prisma.assignedWorkout.findMany({
    where,
    orderBy: { day: sort === "oldest" ? "asc" : "desc" },
    include: {
      trainee: { select: { id: true, name: true, email: true } },
    },
  });

  return records.map((r) => ({
    id: r.id,
    day: r.day.toISOString().split("T")[0],
    dayName: r.name,
    exercises: r.exercises,
    exerciseCount: Array.isArray(r.exercises) ? r.exercises.length : 0,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
    trainee: r.trainee,
  }));
}

async function getDietHistory(trainerId, filters = {}) {
  const { traineeId, dateFrom, dateTo, sort } = filters;

  const where = { trainerId };

  if (traineeId) where.traineeId = Number(traineeId);
  if (dateFrom || dateTo) {
    where.day = {};
    if (dateFrom) where.day.gte = new Date(dateFrom);
    if (dateTo) where.day.lte = new Date(dateTo);
  }

  const records = await prisma.dietPlan.findMany({
    where,
    orderBy: { day: sort === "oldest" ? "asc" : "desc" },
    include: {
      trainee: { select: { id: true, name: true, email: true } },
    },
  });

  return records.map((r) => ({
    id: r.id,
    day: r.day.toISOString().split("T")[0],
    meals: r.meals,
    mealCount: Array.isArray(r.meals) ? r.meals.length : 0,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
    trainee: r.trainee,
  }));
}

function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

async function getAnalytics(trainerId) {
  const links = await prisma.trainerLink.findMany({
    where: { trainerId },
    select: { traineeId: true },
  });
  const traineeIds = links.map((l) => l.traineeId);
  const totalTrainees = traineeIds.length;

  const now = new Date();
  const weekStart = getWeekStart(now);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const [
    allAssignedWorkouts,
    thisWeekWorkouts,
    thisWeekDiets,
    allLogs,
    feedbackCount,
  ] = await Promise.all([
    prisma.assignedWorkout.findMany({
      where: { trainerId },
      select: { day: true, traineeId: true },
    }),
    prisma.assignedWorkout.count({
      where: { trainerId, day: { gte: weekStart, lt: weekEnd } },
    }),
    prisma.dietPlan.count({
      where: { trainerId, day: { gte: weekStart, lt: weekEnd } },
    }),
    prisma.workoutLog.findMany({
      where: { traineeId: { in: traineeIds }, completed: true },
      select: { day: true, traineeId: true },
    }),
    prisma.feedback.count({ where: { trainerId } }),
  ]);

  const completedCount = allLogs.length;
  const totalAssigned = allAssignedWorkouts.length;
  const completionRate =
    totalAssigned > 0
      ? Math.round((completedCount / totalAssigned) * 100)
      : 0;

  const activeThisWeek = new Set(
    allLogs
      .filter((l) => l.day >= weekStart && l.day < weekEnd)
      .map((l) => l.traineeId),
  ).size;

  const avgCompletionPercentage =
    totalAssigned > 0
      ? Math.round((completedCount / totalAssigned) * 100)
      : 0;

  const last4Weeks = [];
  for (let i = 3; i >= 0; i--) {
    const ws = new Date(weekStart);
    ws.setDate(ws.getDate() - i * 7);
    const we = new Date(ws);
    we.setDate(we.getDate() + 7);

    const assigned = allAssignedWorkouts.filter(
      (a) => a.day >= ws && a.day < we,
    ).length;
    const completed = allLogs.filter(
      (l) => l.day >= ws && l.day < we,
    ).length;

    last4Weeks.push({
      weekStart: ws.toISOString().split("T")[0],
      assigned,
      completed,
    });
  }

  const last6Months = [];
  for (let i = 5; i >= 0; i--) {
    const ms = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const me = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

    const assigned = allAssignedWorkouts.filter(
      (a) => a.day >= ms && a.day < me,
    ).length;
    const completed = allLogs.filter(
      (l) => l.day >= ms && l.day < me,
    ).length;

    last6Months.push({
      month: `${ms.getFullYear()}-${String(ms.getMonth() + 1).padStart(2, "0")}`,
      label: ms.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
      assigned,
      completed,
    });
  }

  const traineeCompletionMap = {};
  for (const tId of traineeIds) {
    traineeCompletionMap[tId] = 0;
  }
  for (const log of allLogs) {
    traineeCompletionMap[log.traineeId] =
      (traineeCompletionMap[log.traineeId] || 0) + 1;
  }

  const trainees = await prisma.user.findMany({
    where: { id: { in: traineeIds } },
    select: { id: true, name: true },
  });

  const traineeNameMap = {};
  for (const t of trainees) {
    traineeNameMap[t.id] = t.name;
  }

  const entries = Object.entries(traineeCompletionMap)
    .map(([id, count]) => ({
      traineeId: Number(id),
      name: traineeNameMap[Number(id)] || "Unknown",
      completed: count,
    }))
    .sort((a, b) => b.completed - a.completed);

  const mostActive = entries.slice(0, 5);
  const leastActive = [...entries].sort((a, b) => a.completed - b.completed).slice(0, 5);

  return {
    stats: {
      activeTrainees: activeThisWeek,
      totalTrainees,
      completionRate,
      workoutsAssignedThisWeek: thisWeekWorkouts,
      dietsAssignedThisWeek: thisWeekDiets,
      feedbackGiven: feedbackCount,
      avgCompletionPercentage,
    },
    weeklyCompletion: last4Weeks,
    monthlyCompletion: last6Months,
    mostActive,
    leastActive,
  };
}

module.exports = {
  getDashboard,
  assignWorkout,
  assignDiet,
  bulkAssignWorkout,
  bulkAssignDiet,
  getWorkoutHistory,
  getDietHistory,
  getAnalytics,
  getTraineeLogs,
  getFeedback,
  giveFeedback,
};
