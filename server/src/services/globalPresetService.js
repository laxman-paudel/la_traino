const prisma = require("../config/db");

async function listGlobalWorkoutPresets() {
  return prisma.globalWorkoutPreset.findMany({ orderBy: { createdAt: "desc" } });
}

async function createGlobalWorkoutPreset(data) {
  const { name, description, category, difficulty, tags, exercises, estimatedDuration } = data;

  if (!name || !name.trim()) {
    throw Object.assign(new Error("Name is required"), { status: 400 });
  }
  if (!exercises || !Array.isArray(exercises) || exercises.length === 0) {
    throw Object.assign(new Error("exercises must be a non-empty array"), { status: 400 });
  }

  return prisma.globalWorkoutPreset.create({
    data: {
      name: name.trim(),
      description: description?.trim() || null,
      category: category?.trim() || null,
      difficulty: difficulty?.trim() || null,
      tags: tags || undefined,
      exercises,
      estimatedDuration: estimatedDuration ? Number(estimatedDuration) : null,
    },
  });
}

async function updateGlobalWorkoutPreset(id, data) {
  const existing = await prisma.globalWorkoutPreset.findUnique({ where: { id } });
  if (!existing) {
    throw Object.assign(new Error("Global workout preset not found"), { status: 404 });
  }

  const { name, description, category, difficulty, tags, exercises, estimatedDuration } = data;

  if (name !== undefined && !name.trim()) {
    throw Object.assign(new Error("Name cannot be empty"), { status: 400 });
  }
  if (exercises !== undefined && (!Array.isArray(exercises) || exercises.length === 0)) {
    throw Object.assign(new Error("exercises must be a non-empty array"), { status: 400 });
  }

  return prisma.globalWorkoutPreset.update({
    where: { id },
    data: {
      ...(name !== undefined && { name: name.trim() }),
      ...(description !== undefined && { description: description.trim() || null }),
      ...(category !== undefined && { category: category.trim() || null }),
      ...(difficulty !== undefined && { difficulty: difficulty.trim() || null }),
      ...(tags !== undefined && { tags }),
      ...(exercises !== undefined && { exercises }),
      ...(estimatedDuration !== undefined && { estimatedDuration: Number(estimatedDuration) || null }),
    },
  });
}

async function deleteGlobalWorkoutPreset(id) {
  const existing = await prisma.globalWorkoutPreset.findUnique({ where: { id } });
  if (!existing) {
    throw Object.assign(new Error("Global workout preset not found"), { status: 404 });
  }

  await prisma.globalWorkoutPreset.delete({ where: { id } });
  return { id };
}

async function listGlobalDietPresets() {
  return prisma.globalDietPreset.findMany({ orderBy: { createdAt: "desc" } });
}

async function createGlobalDietPreset(data) {
  const { name, description, category, difficulty, tags, meals } = data;

  if (!name || !name.trim()) {
    throw Object.assign(new Error("Name is required"), { status: 400 });
  }
  if (!meals || !Array.isArray(meals) || meals.length === 0) {
    throw Object.assign(new Error("meals must be a non-empty array"), { status: 400 });
  }

  return prisma.globalDietPreset.create({
    data: {
      name: name.trim(),
      description: description?.trim() || null,
      category: category?.trim() || null,
      difficulty: difficulty?.trim() || null,
      tags: tags || undefined,
      meals,
    },
  });
}

async function updateGlobalDietPreset(id, data) {
  const existing = await prisma.globalDietPreset.findUnique({ where: { id } });
  if (!existing) {
    throw Object.assign(new Error("Global diet preset not found"), { status: 404 });
  }

  const { name, description, category, difficulty, tags, meals } = data;

  if (name !== undefined && !name.trim()) {
    throw Object.assign(new Error("Name cannot be empty"), { status: 400 });
  }
  if (meals !== undefined && (!Array.isArray(meals) || meals.length === 0)) {
    throw Object.assign(new Error("meals must be a non-empty array"), { status: 400 });
  }

  return prisma.globalDietPreset.update({
    where: { id },
    data: {
      ...(name !== undefined && { name: name.trim() }),
      ...(description !== undefined && { description: description.trim() || null }),
      ...(category !== undefined && { category: category.trim() || null }),
      ...(difficulty !== undefined && { difficulty: difficulty.trim() || null }),
      ...(tags !== undefined && { tags }),
      ...(meals !== undefined && { meals }),
    },
  });
}

async function deleteGlobalDietPreset(id) {
  const existing = await prisma.globalDietPreset.findUnique({ where: { id } });
  if (!existing) {
    throw Object.assign(new Error("Global diet preset not found"), { status: 404 });
  }

  await prisma.globalDietPreset.delete({ where: { id } });
  return { id };
}

module.exports = {
  listGlobalWorkoutPresets,
  createGlobalWorkoutPreset,
  updateGlobalWorkoutPreset,
  deleteGlobalWorkoutPreset,
  listGlobalDietPresets,
  createGlobalDietPreset,
  updateGlobalDietPreset,
  deleteGlobalDietPreset,
};
