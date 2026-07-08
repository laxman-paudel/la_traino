const exerciseHistoryService = require("../services/exerciseHistoryService");

async function getTraineeHistory(req, res) {
  const { exerciseName } = req.params;
  const { period } = req.query;
  const result = await exerciseHistoryService.getExerciseHistory(
    req.user.userId,
    exerciseName,
    period,
  );
  res.json(result);
}

async function getTrainerHistory(req, res) {
  const traineeId = parseInt(req.params.id, 10);
  const { exerciseName } = req.params;
  const { period } = req.query;
  const result = await exerciseHistoryService.getExerciseHistory(
    traineeId,
    exerciseName,
    period,
    req.user.userId,
  );
  res.json(result);
}

module.exports = { getTraineeHistory, getTrainerHistory };
