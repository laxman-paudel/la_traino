const prisma = require("../config/db");

async function verifyTrainerLink(trainerId, traineeId) {
  const link = await prisma.trainerLink.findUnique({
    where: { traineeId },
    select: { trainerId: true },
  });
  if (!link || link.trainerId !== trainerId) {
    throw Object.assign(new Error("Trainee not linked to you"), { status: 403 });
  }
  return true;
}

async function verifyTrainee(traineeId) {
  const trainee = await prisma.user.findUnique({
    where: { id: traineeId },
    select: { id: true, role: true },
  });
  if (!trainee || trainee.role !== "TRAINEE") {
    throw Object.assign(new Error("Trainee not found"), { status: 404 });
  }
  return trainee;
}

async function getTimeline(trainerId, traineeId, filters = {}) {
  await verifyTrainee(traineeId);
  await verifyTrainerLink(trainerId, traineeId);

  const { type, page = 1, limit = 50 } = filters;
  const skip = (page - 1) * limit;
  const take = parseInt(limit, 10);

  const promises = [];

  if (!type || type === "all" || type === "feedback") {
    promises.push(
      prisma.coachingNote.findMany({
        where: { trainerId, traineeId },
        select: {
          id: true, title: true, message: true, priority: true,
          category: true, read: true, createdAt: true,
        },
      }).then((items) => items.map((i) => ({ ...i, _type: "feedback" }))),
    );
  }

  if (!type || type === "all" || type === "exercise") {
    promises.push(
      prisma.exerciseComment.findMany({
        where: { trainerId, traineeId },
        select: { id: true, exerciseName: true, comment: true, createdAt: true },
      }).then((items) => items.map((i) => ({ ...i, _type: "exercise_comment" }))),
    );
  }

  if (!type || type === "all" || type === "diet") {
    promises.push(
      prisma.dietComment.findMany({
        where: { trainerId, traineeId },
        select: { id: true, mealType: true, comment: true, createdAt: true },
      }).then((items) => items.map((i) => ({ ...i, _type: "diet_comment" }))),
    );
  }

  if (!type || type === "all" || type === "workout") {
    promises.push(
      prisma.workoutLog.findMany({
        where: { traineeId, completed: true },
        select: { id: true, day: true, completedAt: true, createdAt: true },
        orderBy: { day: "desc" },
      }).then((items) => items.map((i) => ({
        id: i.id, _type: "workout_complete",
        day: i.day.toISOString().split("T")[0],
        completedAt: i.completedAt?.toISOString() ?? null,
        createdAt: i.createdAt,
      }))),
    );
  }

  if (!type || type === "all" || type === "workout") {
    promises.push(
      prisma.dietPlan.findMany({
        where: { traineeId, completed: true },
        select: { id: true, day: true, completedAt: true, createdAt: true },
        orderBy: { day: "desc" },
      }).then((items) => items.map((i) => ({
        id: i.id, _type: "diet_complete",
        day: i.day.toISOString().split("T")[0],
        completedAt: i.completedAt?.toISOString() ?? null,
        createdAt: i.createdAt,
      }))),
    );
  }

  if (!type || type === "all" || type === "notes") {
    promises.push(
      prisma.workoutLog.findMany({
        where: { traineeId },
        select: { id: true, day: true, progress: true, createdAt: true },
        orderBy: { day: "desc" },
      }).then((items) => {
        const notes = [];
        for (const log of items) {
          if (Array.isArray(log.progress)) {
            for (const p of log.progress) {
              if (p.notes && p.notes.trim()) {
                notes.push({
                  id: log.id,
                  _type: "trainee_note",
                  source: "exercise",
                  exerciseName: p.exerciseName || "Exercise",
                  note: p.notes,
                  day: log.day.toISOString().split("T")[0],
                  createdAt: log.createdAt,
                });
              }
            }
          }
        }
        return notes;
      }),
    );
  }

  if (!type || type === "all" || type === "notes") {
    promises.push(
      prisma.dietPlan.findMany({
        where: { traineeId },
        select: { id: true, day: true, progress: true, createdAt: true },
        orderBy: { day: "desc" },
      }).then((items) => {
        const notes = [];
        for (const plan of items) {
          const progress = plan.progress || {};
          for (const [mealType, data] of Object.entries(progress)) {
            if (data?.note && data.note.trim()) {
              notes.push({
                id: plan.id,
                _type: "trainee_note",
                source: "meal",
                mealType,
                note: data.note,
                day: plan.day.toISOString().split("T")[0],
                createdAt: plan.createdAt,
              });
            }
          }
        }
        return notes;
      }),
    );
  }

  const results = await Promise.all(promises);
  const flat = results.flat();

  flat.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const total = flat.length;
  const paginated = flat.slice(skip, skip + take);

  return { items: paginated, total, page: parseInt(page, 10), limit: take };
}

async function getFeedbacks(trainerId, traineeId) {
  await verifyTrainee(traineeId);
  await verifyTrainerLink(trainerId, traineeId);

  return prisma.coachingNote.findMany({
    where: { trainerId, traineeId },
    orderBy: { createdAt: "desc" },
  });
}

async function createFeedback(trainerId, traineeId, data) {
  await verifyTrainee(traineeId);
  await verifyTrainerLink(trainerId, traineeId);

  if (!data.title || !data.title.trim()) {
    throw Object.assign(new Error("Title is required"), { status: 400 });
  }
  if (!data.message || !data.message.trim()) {
    throw Object.assign(new Error("Message is required"), { status: 400 });
  }

  const validPriorities = ["low", "medium", "high"];
  if (data.priority && !validPriorities.includes(data.priority)) {
    throw Object.assign(new Error("Invalid priority"), { status: 400 });
  }

  const validCategories = ["motivation", "technique", "nutrition", "recovery", "general"];
  if (data.category && !validCategories.includes(data.category)) {
    throw Object.assign(new Error("Invalid category"), { status: 400 });
  }

  return prisma.coachingNote.create({
    data: {
      trainerId,
      traineeId,
      title: data.title.trim(),
      message: data.message.trim(),
      priority: data.priority || null,
      category: data.category || null,
    },
  });
}

async function updateFeedback(trainerId, traineeId, noteId, data) {
  const note = await prisma.coachingNote.findUnique({ where: { id: noteId } });
  if (!note || note.trainerId !== trainerId || note.traineeId !== traineeId) {
    throw Object.assign(new Error("Note not found"), { status: 404 });
  }

  return prisma.coachingNote.update({
    where: { id: noteId },
    data: {
      title: data.title !== undefined ? data.title.trim() : undefined,
      message: data.message !== undefined ? data.message.trim() : undefined,
      priority: data.priority !== undefined ? data.priority : undefined,
      category: data.category !== undefined ? data.category : undefined,
    },
  });
}

async function deleteFeedback(trainerId, traineeId, noteId) {
  const note = await prisma.coachingNote.findUnique({ where: { id: noteId } });
  if (!note || note.trainerId !== trainerId || note.traineeId !== traineeId) {
    throw Object.assign(new Error("Note not found"), { status: 404 });
  }

  await prisma.coachingNote.delete({ where: { id: noteId } });
}

async function markFeedbackRead(trainerId, traineeId, noteId, read) {
  const note = await prisma.coachingNote.findUnique({ where: { id: noteId } });
  if (!note || note.trainerId !== trainerId || note.traineeId !== traineeId) {
    throw Object.assign(new Error("Note not found"), { status: 404 });
  }

  return prisma.coachingNote.update({
    where: { id: noteId },
    data: { read: read !== undefined ? read : true },
  });
}

async function getExerciseComments(trainerId, traineeId) {
  await verifyTrainee(traineeId);
  await verifyTrainerLink(trainerId, traineeId);

  return prisma.exerciseComment.findMany({
    where: { trainerId, traineeId },
    orderBy: { exerciseName: "asc" },
  });
}

async function upsertExerciseComment(trainerId, traineeId, data) {
  await verifyTrainee(traineeId);
  await verifyTrainerLink(trainerId, traineeId);

  if (!data.exerciseName || !data.exerciseName.trim()) {
    throw Object.assign(new Error("Exercise name is required"), { status: 400 });
  }
  if (!data.comment || !data.comment.trim()) {
    throw Object.assign(new Error("Comment is required"), { status: 400 });
  }

  return prisma.exerciseComment.upsert({
    where: {
      trainerId_traineeId_exerciseName: {
        trainerId,
        traineeId,
        exerciseName: data.exerciseName.trim(),
      },
    },
    update: { comment: data.comment.trim() },
    create: {
      trainerId,
      traineeId,
      exerciseName: data.exerciseName.trim(),
      comment: data.comment.trim(),
    },
  });
}

async function deleteExerciseComment(trainerId, traineeId, commentId) {
  const comment = await prisma.exerciseComment.findUnique({ where: { id: commentId } });
  if (!comment || comment.trainerId !== trainerId || comment.traineeId !== traineeId) {
    throw Object.assign(new Error("Comment not found"), { status: 404 });
  }

  await prisma.exerciseComment.delete({ where: { id: commentId } });
}

async function getDietComments(trainerId, traineeId) {
  await verifyTrainee(traineeId);
  await verifyTrainerLink(trainerId, traineeId);

  return prisma.dietComment.findMany({
    where: { trainerId, traineeId },
    orderBy: { mealType: "asc" },
  });
}

async function upsertDietComment(trainerId, traineeId, data) {
  await verifyTrainee(traineeId);
  await verifyTrainerLink(trainerId, traineeId);

  const validMeals = ["breakfast", "lunch", "dinner", "snack", "preWorkout", "postWorkout"];
  if (!data.mealType || !validMeals.includes(data.mealType)) {
    throw Object.assign(new Error("Invalid meal type"), { status: 400 });
  }
  if (!data.comment || !data.comment.trim()) {
    throw Object.assign(new Error("Comment is required"), { status: 400 });
  }

  return prisma.dietComment.upsert({
    where: {
      trainerId_traineeId_mealType: {
        trainerId,
        traineeId,
        mealType: data.mealType,
      },
    },
    update: { comment: data.comment.trim() },
    create: {
      trainerId,
      traineeId,
      mealType: data.mealType,
      comment: data.comment.trim(),
    },
  });
}

async function deleteDietComment(trainerId, traineeId, commentId) {
  const comment = await prisma.dietComment.findUnique({ where: { id: commentId } });
  if (!comment || comment.trainerId !== trainerId || comment.traineeId !== traineeId) {
    throw Object.assign(new Error("Comment not found"), { status: 404 });
  }

  await prisma.dietComment.delete({ where: { id: commentId } });
}

async function getTraineeExerciseComments(traineeId) {
  const link = await prisma.trainerLink.findUnique({
    where: { traineeId },
    select: { trainerId: true },
  });
  if (!link) return [];

  return prisma.exerciseComment.findMany({
    where: { trainerId: link.trainerId, traineeId },
    select: { exerciseName: true, comment: true },
  });
}

async function getTraineeDietComments(traineeId) {
  const link = await prisma.trainerLink.findUnique({
    where: { traineeId },
    select: { trainerId: true },
  });
  if (!link) return [];

  return prisma.dietComment.findMany({
    where: { trainerId: link.trainerId, traineeId },
    select: { mealType: true, comment: true },
  });
}

module.exports = {
  getTimeline,
  getFeedbacks,
  createFeedback,
  updateFeedback,
  deleteFeedback,
  markFeedbackRead,
  getExerciseComments,
  upsertExerciseComment,
  deleteExerciseComment,
  getDietComments,
  upsertDietComment,
  deleteDietComment,
  getTraineeExerciseComments,
  getTraineeDietComments,
};
