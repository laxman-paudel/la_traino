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

function buildProgressArray(exercises, existingProgress) {
  return exercises.map((ex, i) => {
    const saved = Array.isArray(existingProgress) ? existingProgress[i] : null;
    const totalSets = ex.sets ?? 0;
    return {
      exerciseIndex: i,
      setsCompleted: saved?.setsCompleted ?? 0,
      totalSets,
      completed: saved?.completed ?? false,
      weight: saved?.weight ?? ex.weight ?? "",
      duration: saved?.duration ?? "",
      distance: saved?.distance ?? "",
      sets: saved?.sets ?? Array.from({ length: totalSets }, () => ({ weight: "", reps: "" })),
      notes: saved?.notes ?? "",
    };
  });
}

async function getTodayWorkout(traineeId) {
  const today = getTodayDate();
  const dayName = DAYS[today.getDay()];

  const link = await prisma.trainerLink.findUnique({
    where: { traineeId },
    select: { trainerId: true },
  });

  let exercises = null;
  let source = null;

  if (link) {
    const assigned = await prisma.assignedWorkout.findFirst({
      where: { traineeId, day: today },
      select: { day: true, name: true, exercises: true },
    });

    if (assigned) {
      exercises = assigned.exercises;
      source = "trainer";
    }
  }

  if (!exercises) {
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

    exercises = presetDay.exercises;
    source = "preset";
  }

  // Normalize exercise shape
  const normalized = exercises.map((ex) => ({
    name: ex.name,
    sets: ex.sets ?? 0,
    reps: ex.reps ?? 0,
    weight: ex.weight ?? "",
    restTime: ex.restTime ?? "",
    tempo: ex.tempo ?? "",
    notes: ex.notes ?? "",
  }));

  // Get existing progress
  const existingLog = await prisma.workoutLog.findFirst({
    where: { traineeId, day: today },
    select: { id: true, progress: true, completed: true, completedAt: true },
  });

  const progress = existingLog
    ? buildProgressArray(normalized, existingLog.progress)
    : buildProgressArray(normalized, null);

  return {
    source,
    day: dayName,
    exercises: normalized,
    progress,
    logId: existingLog?.id ?? null,
    completed: existingLog?.completed ?? false,
    completedAt: existingLog?.completedAt ?? null,
  };
}

async function updateExerciseProgress(traineeId, exerciseIndex, data) {
  const today = getTodayDate();
  const workout = await getTodayWorkout(traineeId);

  if (workout.completed) {
    throw Object.assign(new Error("Workout is already completed"), {
      status: 400,
    });
  }

  if (exerciseIndex < 0 || exerciseIndex >= workout.exercises.length) {
    throw Object.assign(new Error("Invalid exercise index"), { status: 400 });
  }

  const ex = workout.exercises[exerciseIndex];
  const setsCompleted = data.setsCompleted != null ? parseInt(data.setsCompleted, 10) : 0;
  const totalSets = ex.sets ?? 0;

  if (setsCompleted < 0 || setsCompleted > totalSets) {
    throw Object.assign(new Error(`Sets completed must be between 0 and ${totalSets}`), {
      status: 400,
    });
  }

  // Build updated progress
  const progress = workout.progress.map((p, i) => {
    if (i !== exerciseIndex) return p;
    const updatedSets = data.sets
      ? p.sets.map((s, si) => data.sets[si] ? { ...s, ...data.sets[si] } : s)
      : p.sets;
    return {
      ...p,
      setsCompleted,
      completed: setsCompleted >= totalSets,
      weight: data.weight ?? p.weight,
      duration: data.duration ?? p.duration,
      distance: data.distance ?? p.distance,
      sets: updatedSets,
      notes: data.notes !== undefined ? data.notes : p.notes,
    };
  });

  // Upsert WorkoutLog
  if (workout.logId) {
    await prisma.workoutLog.update({
      where: { id: workout.logId },
      data: { progress, exercises: workout.exercises },
    });
  } else {
    const created = await prisma.workoutLog.create({
      data: {
        traineeId,
        day: today,
        exercises: workout.exercises,
        progress,
        completed: false,
      },
    });
    workout.logId = created.id;
  }

  return { progress };
}

async function completeWorkout(traineeId) {
  const workout = await getTodayWorkout(traineeId);
  const today = getTodayDate();

  if (workout.completed) {
    return { message: "Workout was already marked as completed." };
  }

  // Validate all exercises are complete
  const allDone = workout.progress.every((p) => p.completed);
  if (!allDone) {
    const remaining = workout.progress.filter((p) => !p.completed).length;
    throw Object.assign(
      new Error(`Complete all exercises first (${remaining} remaining)`),
      { status: 400 },
    );
  }

  const data = {
    completed: true,
    completedAt: new Date(),
    exercises: workout.exercises,
    progress: workout.progress,
  };

  if (workout.logId) {
    await prisma.workoutLog.update({ where: { id: workout.logId }, data });
  } else {
    await prisma.workoutLog.create({ data: { traineeId, day: today, ...data } });
  }

  return { message: "Workout completed!" };
}

const DEFAULT_DIET_PROGRESS = {
  breakfast: { completed: false, note: "" },
  lunch: { completed: false, note: "" },
  dinner: { completed: false, note: "" },
  snack: { completed: false, note: "" },
  preWorkout: { completed: false, note: "" },
  postWorkout: { completed: false, note: "" },
};

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
    select: { id: true, meals: true, progress: true, completed: true, completedAt: true },
  });

  if (!diet) {
    throw Object.assign(new Error("No diet assigned for today."), {
      status: 404,
    });
  }

  const progress = diet.progress || DEFAULT_DIET_PROGRESS;

  return {
    day: dayName,
    meals: diet.meals,
    progress,
    completed: diet.completed,
    completedAt: diet.completedAt,
    logId: diet.id,
  };
}

async function updateMealProgress(traineeId, mealType, data) {
  const validMeals = ["breakfast", "lunch", "dinner", "snack", "preWorkout", "postWorkout"];
  if (!validMeals.includes(mealType)) {
    throw Object.assign(new Error("Invalid meal type"), { status: 400 });
  }

  const today = getTodayDate();
  const diet = await prisma.dietPlan.findFirst({
    where: { traineeId, day: today },
    select: { id: true, progress: true, completed: true },
  });

  if (!diet) {
    throw Object.assign(new Error("No diet assigned for today"), { status: 404 });
  }

  if (diet.completed) {
    throw Object.assign(new Error("Diet is already completed for today"), { status: 400 });
  }

  const progress = diet.progress || { ...DEFAULT_DIET_PROGRESS };
  progress[mealType] = {
    completed: data.completed !== undefined ? data.completed : progress[mealType]?.completed || false,
    note: data.note !== undefined ? data.note : progress[mealType]?.note || "",
  };

  await prisma.dietPlan.update({
    where: { id: diet.id },
    data: { progress },
  });

  return { progress };
}

async function completeDiet(traineeId) {
  const today = getTodayDate();
  const diet = await prisma.dietPlan.findFirst({
    where: { traineeId, day: today },
    select: { id: true, progress: true, completed: true },
  });

  if (!diet) {
    throw Object.assign(new Error("No diet assigned for today"), { status: 404 });
  }

  if (diet.completed) {
    return { message: "Diet was already marked as completed." };
  }

  const progress = diet.progress || { ...DEFAULT_DIET_PROGRESS };
  const allDone = Object.values(progress).every((p) => p.completed);
  if (!allDone) {
    const remaining = Object.entries(progress).filter(([, p]) => !p.completed).length;
    throw Object.assign(
      new Error(`Complete all meals first (${remaining} remaining)`),
      { status: 400 },
    );
  }

  await prisma.dietPlan.update({
    where: { id: diet.id },
    data: { completed: true, completedAt: new Date(), progress },
  });

  return { message: "Diet completed!" };
}

async function getFeedback(traineeId) {
  const link = await prisma.trainerLink.findUnique({
    where: { traineeId },
    select: { trainerId: true },
  });

  if (!link) return [];

  const feedback = await prisma.feedback.findMany({
    where: { traineeId },
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

module.exports = {
  linkTrainer,
  getTodayWorkout,
  updateExerciseProgress,
  completeWorkout,
  getTodayDiet,
  updateMealProgress,
  completeDiet,
  getFeedback,
};
