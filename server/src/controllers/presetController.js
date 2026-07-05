const presetService = require("../services/presetService");

async function listPresets(req, res) {
  const result = await presetService.listPresets(req.user.userId);
  res.json(result);
}

async function selectPreset(req, res) {
  const { presetId } = req.body;
  const result = await presetService.selectPreset(
    req.user.userId,
    Number(presetId),
  );
  res.json(result);
}

module.exports = { listPresets, selectPreset };
