const prisma = require("../config/db");

async function listFoods(filters = {}) {
  const where = {};

  if (filters.search) {
    where.name = { contains: filters.search, mode: "insensitive" };
  }
  if (filters.category) {
    where.category = { equals: filters.category, mode: "insensitive" };
  }
  if (filters.owner === "official") {
    where.trainerId = null;
  } else if (filters.owner === "mine" && filters.userId) {
    where.trainerId = filters.userId;
  }

  const foods = await prisma.foodItem.findMany({
    where,
    orderBy: { name: "asc" },
  });

  return foods;
}

async function getFood(id) {
  const food = await prisma.foodItem.findUnique({ where: { id } });
  if (!food) {
    throw Object.assign(new Error("Food not found"), { status: 404 });
  }
  return food;
}

async function createFood(data, trainerId) {
  if (!data.name || !data.name.trim()) {
    throw Object.assign(new Error("Food name is required"), { status: 400 });
  }
  if (!data.category || !data.category.trim()) {
    throw Object.assign(new Error("Food category is required"), { status: 400 });
  }

  return prisma.foodItem.create({
    data: {
      name: data.name.trim(),
      category: data.category.trim(),
      servingSize: data.servingSize || null,
      calories: data.calories ? parseInt(data.calories, 10) : null,
      protein: data.protein ? parseFloat(data.protein) : null,
      carbs: data.carbs ? parseFloat(data.carbs) : null,
      fat: data.fat ? parseFloat(data.fat) : null,
      imageUrl: data.imageUrl || null,
      description: data.description || null,
      trainerId,
    },
  });
}

async function updateFood(id, data, userId) {
  const existing = await getFood(id);
  if (existing.trainerId && existing.trainerId !== userId) {
    throw Object.assign(new Error("You can only edit your own custom foods"), { status: 403 });
  }
  if (!existing.trainerId) {
    throw Object.assign(new Error("Cannot edit official foods"), { status: 403 });
  }

  return prisma.foodItem.update({
    where: { id },
    data: {
      name: data.name?.trim() ?? existing.name,
      category: data.category?.trim() ?? existing.category,
      servingSize: data.servingSize !== undefined ? data.servingSize : existing.servingSize,
      calories: data.calories !== undefined ? parseInt(data.calories, 10) : existing.calories,
      protein: data.protein !== undefined ? parseFloat(data.protein) : existing.protein,
      carbs: data.carbs !== undefined ? parseFloat(data.carbs) : existing.carbs,
      fat: data.fat !== undefined ? parseFloat(data.fat) : existing.fat,
      imageUrl: data.imageUrl !== undefined ? data.imageUrl : existing.imageUrl,
      description: data.description !== undefined ? data.description : existing.description,
    },
  });
}

async function deleteFood(id, userId) {
  const existing = await getFood(id);
  if (existing.trainerId && existing.trainerId !== userId) {
    throw Object.assign(new Error("You can only delete your own custom foods"), { status: 403 });
  }
  if (!existing.trainerId) {
    throw Object.assign(new Error("Cannot delete official foods"), { status: 403 });
  }

  await prisma.foodItem.delete({ where: { id } });
}

module.exports = { listFoods, getFood, createFood, updateFood, deleteFood };
