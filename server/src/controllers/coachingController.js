const coachingService = require("../services/coachingService");

async function getTimeline(req, res) {
  const traineeId = parseInt(req.params.id, 10);
  const { type, page, limit } = req.query;
  const result = await coachingService.getTimeline(req.user.userId, traineeId, { type, page, limit });
  res.json(result);
}

async function getFeedbacks(req, res) {
  const traineeId = parseInt(req.params.id, 10);
  const result = await coachingService.getFeedbacks(req.user.userId, traineeId);
  res.json(result);
}

async function createFeedback(req, res) {
  const traineeId = parseInt(req.params.id, 10);
  const result = await coachingService.createFeedback(req.user.userId, traineeId, req.body);
  res.status(201).json(result);
}

async function updateFeedback(req, res) {
  const traineeId = parseInt(req.params.id, 10);
  const noteId = parseInt(req.params.noteId, 10);
  const result = await coachingService.updateFeedback(req.user.userId, traineeId, noteId, req.body);
  res.json(result);
}

async function deleteFeedback(req, res) {
  const traineeId = parseInt(req.params.id, 10);
  const noteId = parseInt(req.params.noteId, 10);
  await coachingService.deleteFeedback(req.user.userId, traineeId, noteId);
  res.status(204).end();
}

async function markFeedbackRead(req, res) {
  const traineeId = parseInt(req.params.id, 10);
  const noteId = parseInt(req.params.noteId, 10);
  const { read } = req.body;
  const result = await coachingService.markFeedbackRead(req.user.userId, traineeId, noteId, read);
  res.json(result);
}

async function getExerciseComments(req, res) {
  const traineeId = parseInt(req.params.id, 10);
  const result = await coachingService.getExerciseComments(req.user.userId, traineeId);
  res.json(result);
}

async function upsertExerciseComment(req, res) {
  const traineeId = parseInt(req.params.id, 10);
  const result = await coachingService.upsertExerciseComment(req.user.userId, traineeId, req.body);
  res.status(201).json(result);
}

async function deleteExerciseComment(req, res) {
  const traineeId = parseInt(req.params.id, 10);
  const commentId = parseInt(req.params.commentId, 10);
  await coachingService.deleteExerciseComment(req.user.userId, traineeId, commentId);
  res.status(204).end();
}

async function getDietComments(req, res) {
  const traineeId = parseInt(req.params.id, 10);
  const result = await coachingService.getDietComments(req.user.userId, traineeId);
  res.json(result);
}

async function upsertDietComment(req, res) {
  const traineeId = parseInt(req.params.id, 10);
  const result = await coachingService.upsertDietComment(req.user.userId, traineeId, req.body);
  res.status(201).json(result);
}

async function deleteDietComment(req, res) {
  const traineeId = parseInt(req.params.id, 10);
  const commentId = parseInt(req.params.commentId, 10);
  await coachingService.deleteDietComment(req.user.userId, traineeId, commentId);
  res.status(204).end();
}

async function getTraineeExerciseComments(req, res) {
  const result = await coachingService.getTraineeExerciseComments(req.user.userId);
  res.json(result);
}

async function getTraineeDietComments(req, res) {
  const result = await coachingService.getTraineeDietComments(req.user.userId);
  res.json(result);
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
