const calendarService = require("../services/calendarService");

async function getTrainerCalendar(req, res) {
  const { month } = req.query;
  const { userId } = req.user;

  if (!month || !/^\d{4}-\d{2}$/.test(month)) {
    return res.status(400).json({ error: "Invalid month format. Use YYYY-MM" });
  }

  const [year, mon] = month.split("-").map(Number);
  const startDate = new Date(year, mon - 1, 1);
  const endDate = new Date(year, mon, 0, 23, 59, 59, 999);

  const result = await calendarService.getTrainerCalendar(userId, startDate, endDate);
  res.json(result);
}

async function getTraineeCalendar(req, res) {
  const { month } = req.query;
  const { userId } = req.user;

  if (!month || !/^\d{4}-\d{2}$/.test(month)) {
    return res.status(400).json({ error: "Invalid month format. Use YYYY-MM" });
  }

  const [year, mon] = month.split("-").map(Number);
  const startDate = new Date(year, mon - 1, 1);
  const endDate = new Date(year, mon, 0, 23, 59, 59, 999);

  const result = await calendarService.getTraineeCalendar(userId, startDate, endDate);
  res.json(result);
}

async function getTraineeUpcoming(req, res) {
  const { userId } = req.user;
  const result = await calendarService.getTraineeUpcoming(userId);
  res.json(result);
}

module.exports = { getTrainerCalendar, getTraineeCalendar, getTraineeUpcoming };
