const prisma = require("../config/db");

function parseDayName(dayName) {
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
  if (diff <= 0) diff += 7;
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
        select: { id: true, name: true, email: true },
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
    orderBy: { weekStart: "desc" },
    select: { weekStart: true, message: true, createdAt: true },
  });

  return feedback.map((f) => ({
    weekStart: f.weekStart.toISOString().split("T")[0],
    message: f.message,
    createdAt: f.createdAt.toISOString(),
  }));
}

async function giveFeedback(trainerId, traineeId, body) {
  const { weekStart, message } = body;

  if (!message || !message.trim()) {
    throw Object.assign(new Error("Message is required"), { status: 400 });
  }

  if (!weekStart || isNaN(new Date(weekStart).getTime())) {
    throw Object.assign(new Error("Valid weekStart date is required."), {
      status: 400,
    });
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

  const weekStartDate = new Date(weekStart);

  const result = await prisma.feedback.upsert({
    where: {
      trainerId_traineeId_weekStart: {
        trainerId,
        traineeId,
        weekStart: weekStartDate,
      },
    },
    update: { message: message.trim() },
    create: {
      trainerId,
      traineeId,
      weekStart: weekStartDate,
      message: message.trim(),
    },
  });

  return {
    weekStart: result.weekStart.toISOString().split("T")[0],
    message: result.message,
    createdAt: result.createdAt.toISOString(),
  };
}

module.exports = {
  getDashboard,
  assignWorkout,
  assignDiet,
  getTraineeLogs,
  getFeedback,
  giveFeedback,
};
