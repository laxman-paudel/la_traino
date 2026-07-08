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

async function bulkAssignWorkout(req, res) {
  const { traineeIds, day, exercises } = req.body;
  const result = await trainerService.bulkAssignWorkout(
    req.user.userId,
    traineeIds,
    { day, exercises },
  );
  res.status(207).json(result);
}

async function bulkAssignDiet(req, res) {
  const { traineeIds, day, meals } = req.body;
  const result = await trainerService.bulkAssignDiet(
    req.user.userId,
    traineeIds,
    { day, meals },
  );
  res.status(207).json(result);
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

async function getWorkoutHistory(req, res) {
  const { traineeId, dateFrom, dateTo, sort } = req.query;
  const result = await trainerService.getWorkoutHistory(req.user.userId, {
    traineeId,
    dateFrom,
    dateTo,
    sort,
  });
  res.json(result);
}

async function getDietHistory(req, res) {
  const { traineeId, dateFrom, dateTo, sort } = req.query;
  const result = await trainerService.getDietHistory(req.user.userId, {
    traineeId,
    dateFrom,
    dateTo,
    sort,
  });
  res.json(result);
}

async function getAnalytics(req, res) {
  const result = await trainerService.getAnalytics(req.user.userId);
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
  bulkAssignWorkout,
  bulkAssignDiet,
  getWorkoutHistory,
  getDietHistory,
  getAnalytics,
  getTraineeLogs,
  getFeedback,
  giveFeedback,
};
