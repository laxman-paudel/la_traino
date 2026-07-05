const prisma = require("../config/db");

async function linkTrainer(traineeId, trainerCode) {
  if (!trainerCode || typeof trainerCode !== "string" || !trainerCode.trim()) {
    throw Object.assign(new Error("Trainer code is required"), {
      status: 400,
    });
  }

  const normalizedCode = trainerCode.trim().toUpperCase();

  const trainerProfile = await prisma.trainerProfile.findUnique({
    where: { trainerCode: normalizedCode },
    include: {
      user: { select: { id: true, name: true, email: true, isActive: true } },
    },
  });

  if (!trainerProfile) {
    throw Object.assign(new Error("Invalid trainer code"), { status: 404 });
  }

  if (!trainerProfile.user.isActive) {
    throw Object.assign(new Error("Trainer account is disabled"), {
      status: 400,
    });
  }

  const trainee = await prisma.user.findUnique({
    where: { id: traineeId },
    select: { id: true, role: true, isActive: true },
  });

  if (!trainee || !trainee.isActive) {
    throw Object.assign(new Error("Trainee account is disabled"), {
      status: 400,
    });
  }

  const existingLink = await prisma.trainerLink.findUnique({
    where: { traineeId },
  });

  if (existingLink) {
    throw Object.assign(new Error("You are already linked to a trainer"), {
      status: 409,
    });
  }

  const link = await prisma.trainerLink.create({
    data: { trainerId: trainerProfile.userId, traineeId },
    include: {
      trainer: {
        select: {
          id: true,
          name: true,
          trainerProfile: { select: { trainerCode: true } },
        },
      },
    },
  });

  return {
    trainer: {
      id: link.trainer.id,
      name: link.trainer.name,
      trainerCode: link.trainer.trainerProfile.trainerCode,
    },
  };
}

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function getTodayDate() {
  const now = new Date();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  return today;
}

async function getTodayWorkout(traineeId) {
  const today = getTodayDate();
  const dayName = DAYS[today.getDay()];

  const link = await prisma.trainerLink.findUnique({
    where: { traineeId },
    select: { trainerId: true },
  });

  if (link) {
    const assigned = await prisma.assignedWorkout.findFirst({
      where: { traineeId, day: today },
      select: { day: true, name: true, exercises: true },
    });

    if (assigned) {
      return {
        source: "trainer",
        day: dayName,
        exercises: assigned.exercises,
      };
    }
  }

  const traineeProfile = await prisma.traineeProfile.findUnique({
    where: { userId: traineeId },
    select: { selectedPresetId: true },
  });

  if (!traineeProfile?.selectedPresetId) {
    throw Object.assign(new Error("No workout available for today"), {
      status: 404,
    });
  }

  const dayNumber = today.getDay() === 0 ? 7 : today.getDay();

  const presetDay = await prisma.presetWorkoutDay.findFirst({
    where: {
      presetId: traineeProfile.selectedPresetId,
      dayNumber,
    },
    include: {
      exercises: {
        orderBy: { id: "asc" },
        select: { name: true, sets: true, reps: true },
      },
    },
  });

  if (!presetDay) {
    throw Object.assign(new Error("No workout available for today"), {
      status: 404,
    });
  }

  return {
    source: "preset",
    day: dayName,
    exercises: presetDay.exercises,
  };
}

async function completeWorkout(traineeId) {
  const todayWorkout = await getTodayWorkout(traineeId);
  const today = getTodayDate();

  const existing = await prisma.workoutLog.findFirst({
    where: { traineeId, day: today },
    select: { id: true },
  });

  if (existing) {
    await prisma.workoutLog.update({
      where: { id: existing.id },
      data: {
        completed: true,
        completedAt: new Date(),
        exercises: todayWorkout.exercises,
      },
    });
  } else {
    await prisma.workoutLog.create({
      data: {
        traineeId,
        day: today,
        completed: true,
        completedAt: new Date(),
        exercises: todayWorkout.exercises,
      },
    });
  }

  return { message: "Workout marked as completed." };
}

async function getTodayDiet(traineeId) {
  const today = getTodayDate();
  const dayName = DAYS[today.getDay()];

  const link = await prisma.trainerLink.findUnique({
    where: { traineeId },
    select: { trainerId: true },
  });

  if (!link) {
    throw Object.assign(new Error("No diet assigned for today."), {
      status: 404,
    });
  }

  const diet = await prisma.dietPlan.findFirst({
    where: { traineeId, day: today },
    select: { meals: true },
  });

  if (!diet) {
    throw Object.assign(new Error("No diet assigned for today."), {
      status: 404,
    });
  }

  return { day: dayName, meals: diet.meals };
}

async function getFeedback(traineeId) {
  const link = await prisma.trainerLink.findUnique({
    where: { traineeId },
    select: { trainerId: true },
  });

  if (!link) return [];

  const feedback = await prisma.feedback.findMany({
    where: { traineeId },
    orderBy: { weekStart: "desc" },
    select: { weekStart: true, message: true },
  });

  return feedback.map((f) => ({
    weekStart: f.weekStart.toISOString().split("T")[0],
    message: f.message,
  }));
}

module.exports = {
  linkTrainer,
  getTodayWorkout,
  completeWorkout,
  getTodayDiet,
  getFeedback,
};
