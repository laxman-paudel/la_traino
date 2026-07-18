const exerciseService = require("../services/exerciseService");

const listExercises = async (req, res) => {
  const { search, category, difficulty, owner, page, limit } = req.query;
  const result = await exerciseService.listExercises({
    search,
    category,
    difficulty,
    owner,
    userId: req.user.userId,
    page: page ? parseInt(page, 10) : 1,
    limit: limit ? parseInt(limit, 10) : 50,
  });
  res.json(result);
};

const getExercise = async (req, res) => {
  const exercise = await exerciseService.getExercise(parseInt(req.params.id, 10));
  res.json(exercise);
};

const createExercise = async (req, res) => {
  const exercise = await exerciseService.createExercise(req.body, req.user.userId);
  res.status(201).json(exercise);
};

const updateExercise = async (req, res) => {
  const exercise = await exerciseService.updateExercise(
    parseInt(req.params.id, 10),
    req.body,
    req.user.userId,
  );
  res.json(exercise);
};

const deleteExercise = async (req, res) => {
  await exerciseService.deleteExercise(parseInt(req.params.id, 10), req.user.userId);
  res.status(204).end();
};

module.exports = { listExercises, getExercise, createExercise, updateExercise, deleteExercise };