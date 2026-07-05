const adminService = require("../services/adminService");

async function getDashboard(req, res) {
  const result = await adminService.getDashboard();
  res.json(result);
}

async function listUsers(req, res) {
  const result = await adminService.listUsers();
  res.json(result);
}

async function toggleUserStatus(req, res) {
  const userId = parseInt(req.params.id, 10);
  const result = await adminService.toggleUserStatus(userId);
  res.json(result);
}

async function listPresets(req, res) {
  const result = await adminService.listPresets();
  res.json(result);
}

async function createPreset(req, res) {
  const result = await adminService.createPreset(req.body);
  res.status(201).json(result);
}

async function updatePreset(req, res) {
  const presetId = parseInt(req.params.id, 10);
  const result = await adminService.updatePreset(presetId, req.body);
  res.json(result);
}

async function deletePreset(req, res) {
  const presetId = parseInt(req.params.id, 10);
  const result = await adminService.deletePreset(presetId);
  res.json(result);
}

module.exports = {
  getDashboard,
  listUsers,
  toggleUserStatus,
  listPresets,
  createPreset,
  updatePreset,
  deletePreset,
};
