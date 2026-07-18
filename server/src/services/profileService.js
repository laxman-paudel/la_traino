const prisma = require("../config/db");

const PROFILE_SELECT = {
  id: true,
  name: true,
  email: true,
  role: true,
  profileImage: true,
  bio: true,
  gender: true,
  age: true,
  height: true,
  weight: true,
  location: true,
  createdAt: true,
  trainerProfile: {
    select: {
      trainerCode: true,
      specialties: true,
      yearsExperience: true,
    },
  },
  traineeProfile: {
    select: {
      fitnessGoal: true,
      selectedPreset: {
        select: { name: true },
      },
      dateOfBirth: true,
    },
  },
  traineeLinks: {
    select: {
      trainer: {
        select: {
          id: true,
          name: true,
          email: true,
          trainerProfile: {
            select: { trainerCode: true },
          },
        },
      },
    },
  },
};

async function getProfile(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: PROFILE_SELECT,
  });

  if (!user) {
    throw Object.assign(new Error("User not found"), { status: 404 });
  }

  const result = { ...user };

  if (user.role === "TRAINEE") {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [workoutLogs, dietPlans] = await Promise.all([
      prisma.workoutLog.findMany({
        where: { traineeId: userId, day: { gte: thirtyDaysAgo } },
        select: { completed: true },
      }),
      prisma.dietPlan.findMany({
        where: { traineeId: userId, day: { gte: thirtyDaysAgo } },
        select: { completed: true },
      }),
    ]);

    result.workoutCompletion = workoutLogs.length > 0
      ? Math.round((workoutLogs.filter((l) => l.completed).length / workoutLogs.length) * 100) : 0;
    result.dietCompletion = dietPlans.length > 0
      ? Math.round((dietPlans.filter((d) => d.completed).length / dietPlans.length) * 100) : 0;
    result.linkedTrainer = user.traineeLinks?.[0]?.trainer || null;
  }

  const completionFields = [
    user.name, user.email, user.profileImage,
    user.bio, user.gender, user.age, user.height, user.weight, user.location,
  ];
  const filled = completionFields.filter((f) => f != null && f !== "").length;
  result.profileCompletion = Math.round((filled / completionFields.length) * 100);

  delete result.traineeLinks;

  return { user: result };
}

async function updateProfile(userId, data) {
  const allowed = ["name", "bio", "gender", "age", "height", "weight", "location", "fitnessGoal"];
  const userUpdate = {};
  let traineeUpdate = null;

  for (const key of allowed) {
    if (data[key] !== undefined) {
      if (key === "fitnessGoal") {
        traineeUpdate = { ...traineeUpdate, fitnessGoal: data[key] };
      } else {
        userUpdate[key] = data[key];
      }
    }
  }

  if (Object.keys(userUpdate).length > 0) {
    await prisma.user.update({
      where: { id: userId },
      data: userUpdate,
    });
  }

  if (traineeUpdate) {
    await prisma.traineeProfile.update({
      where: { userId },
      data: traineeUpdate,
    });
  }

  return getProfile(userId);
}

async function uploadAvatar(userId, base64Image) {
  const updated = await prisma.user.update({
    where: { id: userId },
    data: { profileImage: base64Image },
    select: { profileImage: true },
  });
  return { profileImage: updated.profileImage };
}

module.exports = { getProfile, updateProfile, uploadAvatar };
