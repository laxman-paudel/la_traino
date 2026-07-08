const prisma = require("../config/db");

const MEAL_TIMES = ["breakfast", "lunch", "dinner", "snack", "preWorkout", "postWorkout"];

async function listTemplates(trainerId, filters = {}) {
  const where = { trainerId };

  if (filters.search) {
    where.name = { contains: filters.search, mode: "insensitive" };
  }
  if (filters.archived === "true" || filters.archived === true) {
    where.archived = true;
  } else if (filters.archived === "false" || filters.archived === false) {
    where.archived = false;
  }
  if (filters.favorited === "true" || filters.favorited === true) {
    where.favorited = true;
  }

  const templates = await prisma.dietTemplate.findMany({
    where,
    orderBy: [{ favorited: "desc" }, { updatedAt: "desc" }],
  });

  return templates;
}

async function getTemplate(id, trainerId) {
  const template = await prisma.dietTemplate.findUnique({ where: { id } });
  if (!template) {
    throw Object.assign(new Error("Diet template not found"), { status: 404 });
  }
  if (template.trainerId !== trainerId) {
    throw Object.assign(new Error("Not your diet template"), { status: 403 });
  }
  return template;
}

async function createTemplate(trainerId, data) {
  if (!data.name || !data.name.trim()) {
    throw Object.assign(new Error("Diet template name is required"), { status: 400 });
  }

  const meals = data.meals || {};
  const hasAnyFood = MEAL_TIMES.some((mt) => Array.isArray(meals[mt]) && meals[mt].length > 0);
  if (!hasAnyFood) {
    throw Object.assign(new Error("Diet template must have at least one food item"), { status: 400 });
  }

  return prisma.dietTemplate.create({
    data: {
      trainerId,
      name: data.name.trim(),
      description: data.description || null,
      meals,
    },
  });
}

async function updateTemplate(id, trainerId, data) {
  const existing = await getTemplate(id, trainerId);

  return prisma.dietTemplate.update({
    where: { id },
    data: {
      name: data.name?.trim() ?? existing.name,
      description: data.description !== undefined ? data.description : existing.description,
      meals: data.meals ?? existing.meals,
    },
  });
}

async function duplicateTemplate(id, trainerId) {
  const source = await getTemplate(id, trainerId);

  return prisma.dietTemplate.create({
    data: {
      trainerId,
      name: `${source.name} (Copy)`,
      description: source.description,
      meals: source.meals,
    },
  });
}

async function archiveTemplate(id, trainerId) {
  await getTemplate(id, trainerId);
  return prisma.dietTemplate.update({ where: { id }, data: { archived: true } });
}

async function restoreTemplate(id, trainerId) {
  await getTemplate(id, trainerId);
  return prisma.dietTemplate.update({ where: { id }, data: { archived: false } });
}

async function deleteTemplate(id, trainerId) {
  await getTemplate(id, trainerId);
  await prisma.dietTemplate.delete({ where: { id } });
}

async function toggleFavorite(id, trainerId) {
  const template = await getTemplate(id, trainerId);
  return prisma.dietTemplate.update({
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
    throw Object.assign(new Error("Cannot assign an archived diet template"), { status: 400 });
  }

  function parseDayName(dayName) {
    const days = ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"];
    const index = days.indexOf(dayName.toLowerCase());
    if (index === -1) throw Object.assign(new Error("Invalid day"), { status: 400 });
    const now = new Date();
    let diff = index - now.getDay();
    if (diff < 0) diff += 7;
    const target = new Date(now);
    target.setDate(now.getDate() + diff);
    target.setHours(0, 0, 0, 0);
    return target;
  }

  const results = [];
  for (const rawId of traineeIds) {
    const traineeId = Number(rawId);
    try {
      const trainee = await prisma.user.findUnique({
        where: { id: traineeId },
        select: { id: true, role: true },
      });
      if (!trainee || trainee.role !== "TRAINEE") throw new Error("Trainee not found");

      const link = await prisma.trainerLink.findUnique({
        where: { traineeId },
        select: { trainerId: true },
      });
      if (!link || link.trainerId !== trainerId) throw new Error("Trainee not linked to you");

      const dayDate = parseDayName(day);

      const existing = await prisma.dietPlan.findFirst({
        where: { traineeId, day: dayDate },
        select: { id: true },
      });

      if (existing) {
        await prisma.dietPlan.update({
          where: { id: existing.id },
          data: { meals: template.meals },
        });
      } else {
        await prisma.dietPlan.create({
          data: { trainerId, traineeId, day: dayDate, meals: template.meals },
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

module.exports = {
  listTemplates, getTemplate, createTemplate, updateTemplate,
  duplicateTemplate, archiveTemplate, restoreTemplate, deleteTemplate,
  toggleFavorite, assignTemplate,
};
