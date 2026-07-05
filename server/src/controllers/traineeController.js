const traineeService = require("../services/traineeService");

async function linkTrainer(req, res) {
  const { trainerCode } = req.body;
  const result = await traineeService.linkTrainer(req.user.userId, trainerCode);
  res.status(201).json(result);
}

async function getTodayWorkout(req, res) {
  const result = await traineeService.getTodayWorkout(req.user.userId);
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

async function getFeedback(req, res) {
  const result = await traineeService.getFeedback(req.user.userId);
  res.json(result);
}

module.exports = {
  linkTrainer,
  getTodayWorkout,
  completeWorkout,
  getTodayDiet,
  getFeedback,
};
