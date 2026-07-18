const settingsService = require("../services/settingsService");

async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: "Current password and new password are required" });
  }
  const result = await settingsService.changePassword(req.user.userId, currentPassword, newPassword);
  res.json(result);
}

async function getPreferences(req, res) {
  const result = await settingsService.getPreferences(req.user.userId);
  res.json(result);
}

async function updatePreferences(req, res) {
  const result = await settingsService.updatePreferences(req.user.userId, req.body);
  res.json(result);
}

module.exports = { changePassword, getPreferences, updatePreferences };
