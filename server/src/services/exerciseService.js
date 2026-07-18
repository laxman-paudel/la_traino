const prisma = require("../config/db");

const listExercises = async ({ search, category, difficulty, owner, userId, page = 1, limit = 50 }) => {
  const where = {};

  if (search) {
    where.name = { contains: search, mode: "insensitive" };
  }
  if (category) {
    where.category = { equals: category, mode: "insensitive" };
  }
  if (difficulty) {
    where.difficulty = { equals: difficulty, mode: "insensitive" };
  }
  if (owner === "official") {
    where.trainerId = null;
  } else if (owner === "mine") {
    where.trainerId = userId;
  }

  const skip = (page - 1) * limit;

  const [exercises, total] = await Promise.all([
    prisma.exercise.findMany({
      where,
      orderBy: { name: "asc" },
      skip,
      take: limit,
    }),
    prisma.exercise.count({ where }),
  ]);

  return {
    exercises,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

const getExercise = async (id) => {
  const exercise = await prisma.exercise.findUnique({ where: { id } });
  if (!exercise) {
    const err = new Error("Exercise not found");
    err.status = 404;
    throw err;
  }
  return exercise;
};

const createExercise = async (data, trainerId) => {
  return prisma.exercise.create({
    data: {
      name: data.name,
      category: data.category,
      description: data.description || null,
      equipment: data.equipment || null,
      difficulty: data.difficulty || null,
      primaryMuscles: data.primaryMuscles || null,
      secondaryMuscles: data.secondaryMuscles || null,
      instructions: data.instructions || null,
      tips: data.tips || null,
      commonMistakes: data.commonMistakes || null,
      imageUrl: data.imageUrl || null,
      youtubeUrl: data.youtubeUrl || null,
      trainerId,
    },
  });
};

const updateExercise = async (id, data, userId) => {
  const existing = await prisma.exercise.findUnique({ where: { id } });
  if (!existing) {
    const err = new Error("Exercise not found");
    err.status = 404;
    throw err;
  }
  if (existing.trainerId !== userId) {
    const err = new Error("You can only edit your own custom exercises");
    err.status = 403;
    throw err;
  }

  return prisma.exercise.update({
    where: { id },
    data: {
      name: data.name,
      category: data.category,
      description: data.description,
      equipment: data.equipment,
      difficulty: data.difficulty,
      primaryMuscles: data.primaryMuscles,
      secondaryMuscles: data.secondaryMuscles,
      instructions: data.instructions,
      tips: data.tips,
      commonMistakes: data.commonMistakes,
      imageUrl: data.imageUrl,
      youtubeUrl: data.youtubeUrl,
    },
  });
};

const deleteExercise = async (id, userId) => {
  const existing = await prisma.exercise.findUnique({ where: { id } });
  if (!existing) {
    const err = new Error("Exercise not found");
    err.status = 404;
    throw err;
  }
  if (existing.trainerId !== userId) {
    const err = new Error("You can only delete your own custom exercises");
    err.status = 403;
    throw err;
  }

  await prisma.exercise.delete({ where: { id } });
};

module.exports = { listExercises, getExercise, createExercise, updateExercise, deleteExercise };