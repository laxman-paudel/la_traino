const traineeService = require("../services/traineeService");
const coachingService = require("../services/coachingService");

async function linkTrainer(req, res) {
  const { trainerCode } = req.body;
  const result = await traineeService.linkTrainer(req.user.userId, trainerCode);
  res.status(201).json(result);
}

async function getTodayWorkout(req, res) {
  const result = await traineeService.getTodayWorkout(req.user.userId);
  res.json(result);
}

async function updateExerciseProgress(req, res) {
  const { index } = req.params;
  const result = await traineeService.updateExerciseProgress(
    req.user.userId,
    parseInt(index, 10),
    req.body,
  );
  res.json(result);
}

async function completeWorkout(req, res) {
  const result = await traineeService.completeWorkout(req.user.userId);
  res.json(result);
}

async function getTodayDiet(req, res) {
  const result = await traineeService.getTodayDiet(req.user.userId);
  res.json(result);
}

async function updateMealProgress(req, res) {
  const { mealType } = req.params;
  const result = await traineeService.updateMealProgress(
    req.user.userId, mealType, req.body,
  );
  res.json(result);
}

async function completeDiet(req, res) {
  const result = await traineeService.completeDiet(req.user.userId);
  res.json(result);
}

async function getFeedback(req, res) {
  const result = await traineeService.getFeedback(req.user.userId);
  res.json(result);
}

async function unlinkTrainer(req, res) {
  const trainerService = require("../services/trainerService");
  const result = await trainerService.unlinkTrainerTrainee(
    req.user.userId,
    req.user.userId,
    "TRAINEE",
  );
  res.json(result);
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
  linkTrainer,
  unlinkTrainer,
  getTodayWorkout,
  updateExerciseProgress,
  completeWorkout,
  getTodayDiet,
  updateMealProgress,
  completeDiet,
  getFeedback,
  getTraineeExerciseComments,
  getTraineeDietComments,
};
