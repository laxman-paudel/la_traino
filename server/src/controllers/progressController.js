const progressService = require("../services/progressService");

async function getWeeklyProgress(req, res) {
  const result = await progressService.getWeeklyProgress(req.user.userId);
  res.json(result);
}

module.exports = { getWeeklyProgress };
