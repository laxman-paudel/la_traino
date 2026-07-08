const globalPresetService = require("../services/globalPresetService");

async function listGlobalWorkoutPresets(req, res) {
  const result = await globalPresetService.listGlobalWorkoutPresets();
  res.json(result);
}

async function createGlobalWorkoutPreset(req, res) {
  const result = await globalPresetService.createGlobalWorkoutPreset(req.body);
  res.status(201).json(result);
}

async function updateGlobalWorkoutPreset(req, res) {
  const id = parseInt(req.params.id, 10);
  const result = await globalPresetService.updateGlobalWorkoutPreset(id, req.body);
  res.json(result);
}

async function deleteGlobalWorkoutPreset(req, res) {
  const id = parseInt(req.params.id, 10);
  const result = await globalPresetService.deleteGlobalWorkoutPreset(id);
  res.json(result);
}

async function listGlobalDietPresets(req, res) {
  const result = await globalPresetService.listGlobalDietPresets();
  res.json(result);
}

async function createGlobalDietPreset(req, res) {
  const result = await globalPresetService.createGlobalDietPreset(req.body);
  res.status(201).json(result);
}

async function updateGlobalDietPreset(req, res) {
  const id = parseInt(req.params.id, 10);
  const result = await globalPresetService.updateGlobalDietPreset(id, req.body);
  res.json(result);
}

async function deleteGlobalDietPreset(req, res) {
  const id = parseInt(req.params.id, 10);
  const result = await globalPresetService.deleteGlobalDietPreset(id);
  res.json(result);
}

async function importWorkoutPreset(req, res) {
  const { globalId } = req.body;
  const result = await globalPresetService.importWorkoutPreset(req.user.userId, globalId);
  res.status(201).json(result);
}

async function importDietPreset(req, res) {
  const { globalId } = req.body;
  const result = await globalPresetService.importDietPreset(req.user.userId, globalId);
  res.status(201).json(result);
}

module.exports = {
  listGlobalWorkoutPresets,
  createGlobalWorkoutPreset,
  updateGlobalWorkoutPreset,
  deleteGlobalWorkoutPreset,
  listGlobalDietPresets,
  createGlobalDietPreset,
  updateGlobalDietPreset,
  deleteGlobalDietPreset,
  importWorkoutPreset,
  importDietPreset,
};
