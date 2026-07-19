const prisma = require("../config/db");
const { bulkAssignWorkout } = require("./trainerService");

async function listTemplates(trainerId, filters = {}) {
  const where = { trainerId };

  if (filters.search) {
    where.name = { contains: filters.search, mode: "insensitive" };
  }
  if (filters.difficulty) {
    where.difficulty = filters.difficulty;
  }
  if (filters.archived === "true" || filters.archived === true) {
    where.archived = true;
  } else if (filters.archived === "false" || filters.archived === false) {
    where.archived = false;
  }
  if (filters.favorited === "true" || filters.favorited === true) {
    where.favorited = true;
  }

  const templates = await prisma.workoutTemplate.findMany({
    where,
    orderBy: [{ favorited: "desc" }, { updatedAt: "desc" }],
  });

  return templates;
}

async function getTemplate(id, trainerId) {
  const template = await prisma.workoutTemplate.findUnique({ where: { id } });
  if (!template) {
    throw Object.assign(new Error("Template not found"), { status: 404 });
  }
  if (template.trainerId !== trainerId) {
    throw Object.assign(new Error("Not your template"), { status: 403 });
  }
  return template;
}

async function createTemplate(trainerId, data) {
  if (!data.name || !data.name.trim()) {
    throw Object.assign(new Error("Template name is required"), { status: 400 });
  }

  const exercises = Array.isArray(data.exercises) ? data.exercises : [];
  if (exercises.length === 0) {
    throw Object.assign(new Error("Template must have at least one exercise"), { status: 400 });
  }

  return prisma.workoutTemplate.create({
    data: {
      trainerId,
      name: data.name.trim(),
      description: data.description || null,
      difficulty: data.difficulty || null,
      estimatedDuration: data.estimatedDuration ? parseInt(data.estimatedDuration, 10) : null,
      exercises,
    },
  });
}

async function updateTemplate(id, trainerId, data) {
  const existing = await getTemplate(id, trainerId);

  return prisma.workoutTemplate.update({
    where: { id },
    data: {
      name: data.name?.trim() ?? existing.name,
      description: data.description !== undefined ? data.description : existing.description,
      difficulty: data.difficulty !== undefined ? data.difficulty : existing.difficulty,
      estimatedDuration: data.estimatedDuration !== undefined
        ? (data.estimatedDuration ? parseInt(data.estimatedDuration, 10) : null)
        : existing.estimatedDuration,
      exercises: data.exercises ?? existing.exercises,
    },
  });
}

async function duplicateTemplate(id, trainerId) {
  const source = await getTemplate(id, trainerId);

  return prisma.workoutTemplate.create({
    data: {
      trainerId,
      name: `${source.name} (Copy)`,
      description: source.description,
      difficulty: source.difficulty,
      estimatedDuration: source.estimatedDuration,
      exercises: source.exercises,
    },
  });
}

async function archiveTemplate(id, trainerId) {
  await getTemplate(id, trainerId);
  return prisma.workoutTemplate.update({
    where: { id },
    data: { archived: true },
  });
}

async function restoreTemplate(id, trainerId) {
  await getTemplate(id, trainerId);
  return prisma.workoutTemplate.update({
    where: { id },
    data: { archived: false },
  });
}

async function deleteTemplate(id, trainerId) {
  await getTemplate(id, trainerId);
  await prisma.workoutTemplate.delete({ where: { id } });
}

async function toggleFavorite(id, trainerId) {
  const template = await getTemplate(id, trainerId);
  return prisma.workoutTemplate.update({
    where: { id },
    data: { favorited: !template.favorited },
  });
}

async function assignTemplate(trainerId, templateId, body) {
  const { traineeIds, day } = body;

  if (!Array.isArray(traineeIds) || traineeIds.length === 0) {
    throw Object.assign(new Error("traineeIds must be a non-empty array"), { status: 400 });
  }
  if (!day) {
    throw Object.assign(new Error("day is required"), { status: 400 });
  }

  const template = await getTemplate(templateId, trainerId);

  if (template.archived) {
    throw Object.assign(new Error("Cannot assign an archived template"), { status: 400 });
  }

  return bulkAssignWorkout(trainerId, traineeIds, {
    day,
    exercises: template.exercises,
  });
}

async function importFromGlobal(trainerId, globalId) {
  const global = await prisma.globalWorkoutPreset.findUnique({ where: { id: globalId } });
  if (!global) {
    throw Object.assign(new Error("Global workout preset not found"), { status: 404 });
  }

  return prisma.workoutTemplate.create({
    data: {
      trainerId,
      name: global.name,
      description: global.description,
      difficulty: global.difficulty,
      estimatedDuration: global.estimatedDuration,
      exercises: global.exercises,
    },
  });
}

module.exports = {
  listTemplates,
  getTemplate,
  createTemplate,
  updateTemplate,
  duplicateTemplate,
  archiveTemplate,
  restoreTemplate,
  deleteTemplate,
  toggleFavorite,
  assignTemplate,
  importFromGlobal,
};
