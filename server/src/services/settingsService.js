const bcrypt = require("bcryptjs");
const prisma = require("../config/db");

const DEFAULT_PREFERENCES = {
  theme: "light",
  emailNotifications: true,
  workoutReminder: true,
  dietReminder: true,
};

async function changePassword(userId, currentPassword, newPassword) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { password: true, authProvider: true },
  });

  if (!user) {
    throw Object.assign(new Error("User not found"), { status: 404 });
  }

  if (user.authProvider !== "LOCAL") {
    throw Object.assign(new Error("Google accounts cannot change password here"), { status: 400 });
  }

  if (!user.password) {
    throw Object.assign(new Error("No password set for this account"), { status: 400 });
  }

  const valid = await bcrypt.compare(currentPassword, user.password);
  if (!valid) {
    throw Object.assign(new Error("Current password is incorrect"), { status: 400 });
  }

  if (newPassword.length < 6) {
    throw Object.assign(new Error("New password must be at least 6 characters"), { status: 400 });
  }

  const hashed = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashed },
  });

  return { message: "Password updated successfully" };
}

async function getPreferences(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { preferences: true },
  });

  if (!user) {
    throw Object.assign(new Error("User not found"), { status: 404 });
  }

  return { preferences: user.preferences || DEFAULT_PREFERENCES };
}

async function updatePreferences(userId, data) {
  const current = await prisma.user.findUnique({
    where: { id: userId },
    select: { preferences: true },
  });

  const merged = { ...DEFAULT_PREFERENCES, ...(current?.preferences || {}), ...data };

  await prisma.user.update({
    where: { id: userId },
    data: { preferences: merged },
  });

  return { preferences: merged };
}

module.exports = { changePassword, getPreferences, updatePreferences };
