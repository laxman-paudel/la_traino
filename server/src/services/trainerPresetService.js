const prisma = require("../config/db");

async function listWorkoutPresets(trainerId) {
  return prisma.trainerWorkoutPreset.findMany({
    where: { trainerId },
    orderBy: { createdAt: "desc" },
  });
}

async function createWorkoutPreset(trainerId, body) {
  const { name, description, difficulty, estimatedDuration, exercises } = body;
  if (!name || !name.trim()) {
    throw Object.assign(new Error("Name is required"), { status: 400 });
  }
  if (!Array.isArray(exercises) || exercises.length === 0) {
    throw Object.assign(new Error("exercises must be a non-empty array"), { status: 400 });
  }
  return prisma.trainerWorkoutPreset.create({
    data: {
      trainerId,
      name: name.trim(),
      description: description?.trim() || null,
      difficulty: difficulty?.trim() || null,
      estimatedDuration: estimatedDuration ? Number(estimatedDuration) : null,
      exercises,
    },
  });
}

async function updateWorkoutPreset(trainerId, presetId, body) {
  const preset = await prisma.trainerWorkoutPreset.findUnique({
    where: { id: presetId },
    select: { trainerId: true },
  });
  if (!preset || preset.trainerId !== trainerId) {
    throw Object.assign(new Error("Preset not found"), { status: 404 });
  }
  const { name, description, difficulty, estimatedDuration, exercises } = body;
  return prisma.trainerWorkoutPreset.update({
    where: { id: presetId },
    data: {
      ...(name?.trim() ? { name: name.trim() } : {}),
      ...(description !== undefined ? { description: description?.trim() || null } : {}),
      ...(difficulty !== undefined ? { difficulty: difficulty?.trim() || null } : {}),
      ...(estimatedDuration !== undefined ? { estimatedDuration: Number(estimatedDuration) || null } : {}),
      ...(exercises !== undefined ? { exercises } : {}),
    },
  });
}

async function deleteWorkoutPreset(trainerId, presetId) {
  const preset = await prisma.trainerWorkoutPreset.findUnique({
    where: { id: presetId },
    select: { trainerId: true },
  });
  if (!preset || preset.trainerId !== trainerId) {
    throw Object.assign(new Error("Preset not found"), { status: 404 });
  }
  await prisma.trainerWorkoutPreset.delete({ where: { id: presetId } });
}

async function duplicateWorkoutPreset(trainerId, presetId) {
  const original = await prisma.trainerWorkoutPreset.findUnique({
    where: { id: presetId },
  });
  if (!original || original.trainerId !== trainerId) {
    throw Object.assign(new Error("Preset not found"), { status: 404 });
  }
  return prisma.trainerWorkoutPreset.create({
    data: {
      trainerId,
      name: `${original.name} (Copy)`,
      description: original.description,
      difficulty: original.difficulty,
      estimatedDuration: original.estimatedDuration,
      exercises: original.exercises,
    },
  });
}

async function listDietPresets(trainerId) {
  return prisma.trainerDietPreset.findMany({
    where: { trainerId },
    orderBy: { createdAt: "desc" },
  });
}

async function createDietPreset(trainerId, body) {
  const { name, description, meals } = body;
  if (!name || !name.trim()) {
    throw Object.assign(new Error("Name is required"), { status: 400 });
  }
  if (!Array.isArray(meals) || meals.length === 0) {
    throw Object.assign(new Error("meals must be a non-empty array"), { status: 400 });
  }
  return prisma.trainerDietPreset.create({
    data: {
      trainerId,
      name: name.trim(),
      description: description?.trim() || null,
      meals,
    },
  });
}

async function updateDietPreset(trainerId, presetId, body) {
  const preset = await prisma.trainerDietPreset.findUnique({
    where: { id: presetId },
    select: { trainerId: true },
  });
  if (!preset || preset.trainerId !== trainerId) {
    throw Object.assign(new Error("Preset not found"), { status: 404 });
  }
  const { name, description, meals } = body;
  return prisma.trainerDietPreset.update({
    where: { id: presetId },
    data: {
      ...(name?.trim() ? { name: name.trim() } : {}),
      ...(description !== undefined ? { description: description?.trim() || null } : {}),
      ...(meals !== undefined ? { meals } : {}),
    },
  });
}

async function deleteDietPreset(trainerId, presetId) {
  const preset = await prisma.trainerDietPreset.findUnique({
    where: { id: presetId },
    select: { trainerId: true },
  });
  if (!preset || preset.trainerId !== trainerId) {
    throw Object.assign(new Error("Preset not found"), { status: 404 });
  }
  await prisma.trainerDietPreset.delete({ where: { id: presetId } });
}

async function duplicateDietPreset(trainerId, presetId) {
  const original = await prisma.trainerDietPreset.findUnique({
    where: { id: presetId },
  });
  if (!original || original.trainerId !== trainerId) {
    throw Object.assign(new Error("Preset not found"), { status: 404 });
  }
  return prisma.trainerDietPreset.create({
    data: {
      trainerId,
      name: `${original.name} (Copy)`,
      description: original.description,
      meals: original.meals,
    },
  });
}

module.exports = {
  listWorkoutPresets,
  createWorkoutPreset,
  updateWorkoutPreset,
  deleteWorkoutPreset,
  duplicateWorkoutPreset,
  listDietPresets,
  createDietPreset,
  updateDietPreset,
  deleteDietPreset,
  duplicateDietPreset,
};
