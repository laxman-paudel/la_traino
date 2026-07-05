const trainerService = require("../services/trainerService");

async function getDashboard(req, res) {
  const result = await trainerService.getDashboard(req.user.userId);
  res.json(result);
}

async function assignWorkout(req, res) {
  const traineeId = parseInt(req.params.id, 10);
  const result = await trainerService.assignWorkout(
    req.user.userId,
    traineeId,
    req.body,
  );
  res.status(201).json(result);
}

async function assignDiet(req, res) {
  const traineeId = parseInt(req.params.id, 10);
  const result = await trainerService.assignDiet(
    req.user.userId,
    traineeId,
    req.body,
  );
  res.status(201).json(result);
}

async function getTraineeLogs(req, res) {
  const traineeId = parseInt(req.params.id, 10);
  const result = await trainerService.getTraineeLogs(
    req.user.userId,
    traineeId,
  );
  res.json(result);
}

async function getFeedback(req, res) {
  const traineeId = parseInt(req.params.id, 10);
  const result = await trainerService.getFeedback(req.user.userId, traineeId);
  res.json(result);
}

async function giveFeedback(req, res) {
  const traineeId = parseInt(req.params.id, 10);
  const result = await trainerService.giveFeedback(
    req.user.userId,
    traineeId,
    req.body,
  );
  res.status(201).json(result);
}

module.exports = {
  getDashboard,
  assignWorkout,
  assignDiet,
  getTraineeLogs,
  getFeedback,
  giveFeedback,
};
