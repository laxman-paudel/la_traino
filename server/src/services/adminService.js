const prisma = require("../config/db");

async function getDashboard() {
  const [totalUsers, totalTrainers, totalTrainees, totalPresets] =
    await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "TRAINER" } }),
      prisma.user.count({ where: { role: "TRAINEE" } }),
      prisma.presetWorkout.count(),
    ]);

  return { totalUsers, totalTrainers, totalTrainees, totalPresets };
}

async function listUsers() {
  return prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });
}

async function toggleUserStatus(userId, adminId) {
  if (userId === adminId) {
    throw Object.assign(
      new Error("Administrators cannot disable their own account"),
      { status: 400 },
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true, isActive: true },
  });

  if (!user) {
    throw Object.assign(new Error("User not found"), { status: 404 });
  }

  if (user.role === "ADMIN") {
    throw Object.assign(
      new Error("Administrator accounts cannot be disabled"),
      { status: 400 },
    );
  }

  return prisma.user.update({
    where: { id: userId },
    data: { isActive: !user.isActive },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });
}

async function listPresets() {
  return prisma.presetWorkout.findMany({
    orderBy: { id: "asc" },
  });
}

async function createPreset(body) {
  const { name, description } = body;

  if (!name || !name.trim()) {
    throw Object.assign(new Error("Name is required"), { status: 400 });
  }

  return prisma.presetWorkout.create({
    data: { name: name.trim(), description: description?.trim() || null },
  });
}

async function updatePreset(presetId, body) {
  const { name, description } = body;

  const preset = await prisma.presetWorkout.findUnique({
    where: { id: presetId },
  });

  if (!preset) {
    throw Object.assign(new Error("Preset not found"), { status: 404 });
  }

  return prisma.presetWorkout.update({
    where: { id: presetId },
    data: {
      ...(name?.trim() ? { name: name.trim() } : {}),
      ...(description !== undefined
        ? { description: description?.trim() || null }
        : {}),
    },
  });
}

async function deletePreset(presetId) {
  const preset = await prisma.presetWorkout.findUnique({
    where: { id: presetId },
  });

  if (!preset) {
    throw Object.assign(new Error("Preset not found"), { status: 404 });
  }

  await prisma.presetWorkout.delete({
    where: { id: presetId },
  });

  return { message: "Preset deleted successfully." };
}

module.exports = {
  getDashboard,
  listUsers,
  toggleUserStatus,
  listPresets,
  createPreset,
  updatePreset,
  deletePreset,
};
