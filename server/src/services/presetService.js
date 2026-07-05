const prisma = require("../config/db");

async function listPresets(traineeId) {
  const [presets, traineeProfile] = await Promise.all([
    prisma.presetWorkout.findMany({
      orderBy: { id: "asc" },
      include: {
        days: {
          orderBy: { dayNumber: "asc" },
          include: {
            exercises: {
              orderBy: { id: "asc" },
            },
          },
        },
      },
    }),
    prisma.traineeProfile.findUnique({
      where: { userId: traineeId },
      select: { selectedPresetId: true },
    }),
  ]);

  const selectedPresetId = traineeProfile?.selectedPresetId ?? null;

  const presetsWithSelection = presets.map((preset) => {
    const totalExercises = preset.days.reduce(
      (sum, day) => sum + day.exercises.length,
      0,
    );

    return {
      ...preset,
      isSelected: preset.id === selectedPresetId,
      totalDays: preset.days.length,
      totalExercises,
    };
  });

  return { presets: presetsWithSelection };
}

async function selectPreset(traineeId, presetId) {
  if (!presetId || typeof presetId !== "number") {
    throw Object.assign(new Error("Preset ID is required"), { status: 400 });
  }

  const preset = await prisma.presetWorkout.findUnique({
    where: { id: presetId },
  });

  if (!preset) {
    throw Object.assign(new Error("Preset not found"), { status: 404 });
  }

  const trainee = await prisma.user.findUnique({
    where: { id: traineeId },
    select: { id: true, isActive: true },
  });

  if (!trainee || !trainee.isActive) {
    throw Object.assign(new Error("Trainee account is disabled"), {
      status: 400,
    });
  }

  const updated = await prisma.traineeProfile.update({
    where: { userId: traineeId },
    data: { selectedPresetId: presetId },
    include: {
      selectedPreset: {
        include: {
          days: {
            orderBy: { dayNumber: "asc" },
            include: {
              exercises: {
                orderBy: { id: "asc" },
              },
            },
          },
        },
      },
    },
  });

  return { preset: updated.selectedPreset };
}

module.exports = { listPresets, selectPreset };
