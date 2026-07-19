const dietTemplateService = require("../services/dietTemplateService");

async function listTemplates(req, res) {
  const { search, archived, favorited } = req.query;
  const result = await dietTemplateService.listTemplates(req.user.userId, {
    search, archived, favorited,
  });
  res.json(result);
}

async function getTemplate(req, res) {
  const result = await dietTemplateService.getTemplate(
    parseInt(req.params.id, 10), req.user.userId,
  );
  res.json(result);
}

async function createTemplate(req, res) {
  const result = await dietTemplateService.createTemplate(req.user.userId, req.body);
  res.status(201).json(result);
}

async function updateTemplate(req, res) {
  const result = await dietTemplateService.updateTemplate(
    parseInt(req.params.id, 10), req.user.userId, req.body,
  );
  res.json(result);
}

async function duplicateTemplate(req, res) {
  const result = await dietTemplateService.duplicateTemplate(
    parseInt(req.params.id, 10), req.user.userId,
  );
  res.status(201).json(result);
}

async function archiveTemplate(req, res) {
  const result = await dietTemplateService.archiveTemplate(
    parseInt(req.params.id, 10), req.user.userId,
  );
  res.json(result);
}

async function restoreTemplate(req, res) {
  const result = await dietTemplateService.restoreTemplate(
    parseInt(req.params.id, 10), req.user.userId,
  );
  res.json(result);
}

async function deleteTemplate(req, res) {
  await dietTemplateService.deleteTemplate(
    parseInt(req.params.id, 10), req.user.userId,
  );
  res.status(204).end();
}

async function toggleFavorite(req, res) {
  const result = await dietTemplateService.toggleFavorite(
    parseInt(req.params.id, 10), req.user.userId,
  );
  res.json(result);
}

async function assignTemplate(req, res) {
  const result = await dietTemplateService.assignTemplate(
    req.user.userId, parseInt(req.params.id, 10), req.body,
  );
  res.status(207).json(result);
}

async function importFromGlobal(req, res) {
  const result = await dietTemplateService.importFromGlobal(
    req.user.userId,
    parseInt(req.params.globalId, 10),
  );
  res.status(201).json(result);
}

module.exports = {
  listTemplates, getTemplate, createTemplate, updateTemplate,
  duplicateTemplate, archiveTemplate, restoreTemplate, deleteTemplate,
  toggleFavorite, assignTemplate,
  importFromGlobal,
};
