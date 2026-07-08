const prisma = require("../config/db");

function getPeriodDate(period) {
  if (!period || period === "all") return null;
  const days = parseInt(period, 10);
  if (isNaN(days)) return null;
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(0, 0, 0, 0);
  return d;
}

async function verifyTraineeAccess(trainerId, traineeId) {
  const link = await prisma.trainerLink.findUnique({
    where: { traineeId },
    select: { trainerId: true },
  });
  if (!link || link.trainerId !== trainerId) {
    throw Object.assign(new Error("Trainee not linked to you"), { status: 403 });
  }
}

async function getExerciseHistory(traineeId, exerciseName, period = "all", trainerId = null) {
  if (trainerId) {
    await verifyTraineeAccess(trainerId, traineeId);
  }

  const logs = await prisma.workoutLog.findMany({
    where: { traineeId, completed: true },
    orderBy: { day: "desc" },
    select: {
      id: true,
      day: true,
      completedAt: true,
      createdAt: true,
      exercises: true,
      progress: true,
    },
  });

  const history = [];
  const exercises = Array.isArray(logs) ? logs : [];

  for (const log of exercises) {
    const exList = Array.isArray(log.exercises) ? log.exercises : [];
    const progList = Array.isArray(log.progress) ? log.progress : [];

    const exIndex = exList.findIndex(
      (e) => e.name?.toLowerCase() === exerciseName.toLowerCase(),
    );
    if (exIndex === -1) continue;

    const assigned = exList[exIndex] || {};
    const actual = progList[exIndex] || {};

    history.push({
      logId: log.id,
      day: log.day.toISOString().split("T")[0],
      completedAt: log.completedAt?.toISOString() ?? null,
      assigned: {
        sets: assigned.sets ?? null,
        reps: assigned.reps ?? null,
        weight: assigned.weight ?? "",
        restTime: assigned.restTime ?? "",
        tempo: assigned.tempo ?? "",
      },
      actual: {
        setsCompleted: actual.setsCompleted ?? 0,
        totalSets: actual.totalSets ?? 0,
        completed: actual.completed ?? false,
        weight: actual.weight ?? "",
        duration: actual.duration ?? "",
        distance: actual.distance ?? "",
        notes: actual.notes ?? "",
      },
      sets: Array.isArray(actual.sets) ? actual.sets : [],
    });
  }

  const periodDate = getPeriodDate(period);
  const filtered = periodDate
    ? history.filter((h) => new Date(h.day) >= periodDate)
    : history;

  const personalBests = computePersonalBests(history);
  const comparison = history.length >= 2 ? compareSessions(history[0], history[1]) : null;

  const exerciseDetails = await prisma.exercise.findFirst({
    where: { name: { equals: exerciseName, mode: "insensitive" } },
    select: {
      name: true,
      category: true,
      primaryMuscles: true,
      imageUrl: true,
      difficulty: true,
      equipment: true,
      instructions: true,
    },
  });

  const comments = await prisma.exerciseComment.findMany({
    where: { traineeId, exerciseName: { equals: exerciseName, mode: "insensitive" } },
    select: { comment: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  return {
    exerciseName,
    exerciseDetails,
    trainerComments: comments,
    personalBests,
    comparison,
    history: filtered,
    totalSessions: history.length,
  };
}

function computePersonalBests(history) {
  let highestWeight = null;
  let mostReps = null;
  let longestDuration = null;
  let longestDistance = null;

  for (const h of history) {
    const weight = parseFloat(h.actual.weight);
    if (!isNaN(weight) && weight > 0) {
      if (!highestWeight || weight > highestWeight.value) {
        highestWeight = { value: weight, day: h.day, unit: "kg" };
      }
    }

    if (Array.isArray(h.sets) && h.sets.length > 0) {
      const maxRepsInSession = Math.max(...h.sets.map((s) => parseInt(s.reps, 10) || 0));
      if (maxRepsInSession > 0 && (!mostReps || maxRepsInSession > mostReps.value)) {
        mostReps = { value: maxRepsInSession, day: h.day, unit: "reps" };
      }
    }

    if (h.actual.duration && h.actual.duration.trim()) {
      const dur = h.actual.duration.trim();
      if (!longestDuration) {
        longestDuration = { value: dur, day: h.day, unit: "min" };
      }
    }

    if (h.actual.distance && h.actual.distance.trim()) {
      const dist = parseFloat(h.actual.distance);
      if (!isNaN(dist) && dist > 0) {
        if (!longestDistance || dist > longestDistance.value) {
          longestDistance = { value: dist, day: h.day, unit: "km" };
        }
      }
    }
  }

  const bests = {};
  if (highestWeight) bests.highestWeight = highestWeight;
  if (mostReps) bests.mostReps = mostReps;
  if (longestDuration) bests.longestDuration = longestDuration;
  if (longestDistance) bests.longestDistance = longestDistance;
  return bests;
}

function compareSessions(current, previous) {
  const changes = [];

  const curW = parseFloat(current.actual.weight);
  const prevW = parseFloat(previous.actual.weight);
  if (!isNaN(curW) && !isNaN(prevW) && curW > 0 && prevW > 0) {
    if (curW > prevW) changes.push({ metric: "weight", direction: "up", from: prevW, to: curW, unit: "kg" });
    else if (curW < prevW) changes.push({ metric: "weight", direction: "down", from: prevW, to: curW, unit: "kg" });
    else changes.push({ metric: "weight", direction: "same", from: prevW, to: curW, unit: "kg" });
  }

  const curSets = current.actual.setsCompleted || 0;
  const prevSets = previous.actual.setsCompleted || 0;

  if (curSets > 0 || prevSets > 0) {
    if (curSets > prevSets) changes.push({ metric: "sets_completed", direction: "up", from: prevSets, to: curSets, unit: "sets" });
    else if (curSets < prevSets) changes.push({ metric: "sets_completed", direction: "down", from: prevSets, to: curSets, unit: "sets" });
    else changes.push({ metric: "sets_completed", direction: "same", from: prevSets, to: curSets, unit: "sets" });
  }

  if (current.assigned.reps && previous.assigned.reps) {
    const curR = parseInt(current.assigned.reps, 10);
    const prevR = parseInt(previous.assigned.reps, 10);
    if (!isNaN(curR) && !isNaN(prevR) && curR > 0 && prevR > 0) {
      if (curR > prevR) changes.push({ metric: "reps", direction: "up", from: prevR, to: curR, unit: "reps" });
      else if (curR < prevR) changes.push({ metric: "reps", direction: "down", from: prevR, to: curR, unit: "reps" });
      else changes.push({ metric: "reps", direction: "same", from: prevR, to: curR, unit: "reps" });
    }

    const curActualReps = Array.isArray(current.sets) ? Math.max(...current.sets.map((s) => parseInt(s.reps, 10) || 0)) : 0;
    const prevActualReps = Array.isArray(previous.sets) ? Math.max(...previous.sets.map((s) => parseInt(s.reps, 10) || 0)) : 0;
    if (curActualReps > 0 && prevActualReps > 0) {
      if (curActualReps > prevActualReps) changes.push({ metric: "max_reps", direction: "up", from: prevActualReps, to: curActualReps, unit: "reps" });
      else if (curActualReps < prevActualReps) changes.push({ metric: "max_reps", direction: "down", from: prevActualReps, to: curActualReps, unit: "reps" });
      else changes.push({ metric: "max_reps", direction: "same", from: prevActualReps, to: curActualReps, unit: "reps" });
    }
  }

  const curDur = current.actual.duration?.trim();
  const prevDur = previous.actual.duration?.trim();
  if (curDur && prevDur) {
    changes.push({ metric: "duration", direction: "info", from: prevDur, to: curDur, unit: "min" });
  }

  const curDist = parseFloat(current.actual.distance);
  const prevDist = parseFloat(previous.actual.distance);
  if (!isNaN(curDist) && !isNaN(prevDist) && curDist > 0 && prevDist > 0) {
    if (curDist > prevDist) changes.push({ metric: "distance", direction: "up", from: prevDist, to: curDist, unit: "km" });
    else if (curDist < prevDist) changes.push({ metric: "distance", direction: "down", from: prevDist, to: curDist, unit: "km" });
    else changes.push({ metric: "distance", direction: "same", from: prevDist, to: curDist, unit: "km" });
  }

  return {
    current: current,
    previous: previous,
    changes,
  };
}

module.exports = { getExerciseHistory };
