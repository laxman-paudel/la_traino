const templateService = require("../services/templateService");

async function listTemplates(req, res) {
  const { search, difficulty, archived, favorited } = req.query;
  const result = await templateService.listTemplates(req.user.userId, {
    search, difficulty, archived, favorited,
  });
  res.json(result);
}

async function getTemplate(req, res) {
  const result = await templateService.getTemplate(
    parseInt(req.params.id, 10),
    req.user.userId,
  );
  res.json(result);
}

async function createTemplate(req, res) {
  const result = await templateService.createTemplate(req.user.userId, req.body);
  res.status(201).json(result);
}

async function updateTemplate(req, res) {
  const result = await templateService.updateTemplate(
    parseInt(req.params.id, 10),
    req.user.userId,
    req.body,
  );
  res.json(result);
}

async function duplicateTemplate(req, res) {
  const result = await templateService.duplicateTemplate(
    parseInt(req.params.id, 10),
    req.user.userId,
  );
  res.status(201).json(result);
}

async function archiveTemplate(req, res) {
  const result = await templateService.archiveTemplate(
    parseInt(req.params.id, 10),
    req.user.userId,
  );
  res.json(result);
}

async function restoreTemplate(req, res) {
  const result = await templateService.restoreTemplate(
    parseInt(req.params.id, 10),
    req.user.userId,
  );
  res.json(result);
}

async function deleteTemplate(req, res) {
  await templateService.deleteTemplate(
    parseInt(req.params.id, 10),
    req.user.userId,
  );
  res.status(204).end();
}

async function toggleFavorite(req, res) {
  const result = await templateService.toggleFavorite(
    parseInt(req.params.id, 10),
    req.user.userId,
  );
  res.json(result);
}

async function assignTemplate(req, res) {
  const result = await templateService.assignTemplate(
    req.user.userId,
    parseInt(req.params.id, 10),
    req.body,
  );
  res.status(207).json(result);
}

async function importFromGlobal(req, res) {
  const result = await templateService.importFromGlobal(
    req.user.userId,
    parseInt(req.params.globalId, 10),
  );
  res.status(201).json(result);
}

module.exports = {
  listTemplates,
  getTemplate,
  createTemplate,
  updateTemplate,
  duplicateTemplate,
  archiveTemplate,
  restoreTemplate,
  deleteTemplate,
  toggleFavorite,
  assignTemplate,
  importFromGlobal,
};
