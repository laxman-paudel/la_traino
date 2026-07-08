const trainerPresetService = require("../services/trainerPresetService");

async function listWorkoutPresets(req, res) {
  const result = await trainerPresetService.listWorkoutPresets(req.user.userId);
  res.json(result);
}

async function createWorkoutPreset(req, res) {
  const result = await trainerPresetService.createWorkoutPreset(req.user.userId, req.body);
  res.status(201).json(result);
}

async function updateWorkoutPreset(req, res) {
  const presetId = parseInt(req.params.id, 10);
  const result = await trainerPresetService.updateWorkoutPreset(req.user.userId, presetId, req.body);
  res.json(result);
}

async function deleteWorkoutPreset(req, res) {
  const presetId = parseInt(req.params.id, 10);
  await trainerPresetService.deleteWorkoutPreset(req.user.userId, presetId);
  res.json({ message: "Workout preset deleted" });
}

async function duplicateWorkoutPreset(req, res) {
  const presetId = parseInt(req.params.id, 10);
  const result = await trainerPresetService.duplicateWorkoutPreset(req.user.userId, presetId);
  res.status(201).json(result);
}

async function listDietPresets(req, res) {
  const result = await trainerPresetService.listDietPresets(req.user.userId);
  res.json(result);
}

async function createDietPreset(req, res) {
  const result = await trainerPresetService.createDietPreset(req.user.userId, req.body);
  res.status(201).json(result);
}

async function updateDietPreset(req, res) {
  const presetId = parseInt(req.params.id, 10);
  const result = await trainerPresetService.updateDietPreset(req.user.userId, presetId, req.body);
  res.json(result);
}

async function deleteDietPreset(req, res) {
  const presetId = parseInt(req.params.id, 10);
  await trainerPresetService.deleteDietPreset(req.user.userId, presetId);
  res.json({ message: "Diet preset deleted" });
}

async function duplicateDietPreset(req, res) {
  const presetId = parseInt(req.params.id, 10);
  const result = await trainerPresetService.duplicateDietPreset(req.user.userId, presetId);
  res.status(201).json(result);
}

module.exports = {
  listWorkoutPresets,
  createWorkoutPreset,
  updateWorkoutPreset,
  deleteWorkoutPreset,
  duplicateWorkoutPreset,
  listDietPresets,
  createDietPreset,
  updateDietPreset,
  deleteDietPreset,
  duplicateDietPreset,
};
