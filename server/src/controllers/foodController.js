const foodService = require("../services/foodService");

async function listFoods(req, res) {
  const { search, category, owner } = req.query;
  const result = await foodService.listFoods({
    search, category, owner, userId: req.user.userId,
  });
  res.json(result);
}

async function getFood(req, res) {
  const result = await foodService.getFood(parseInt(req.params.id, 10));
  res.json(result);
}

async function createFood(req, res) {
  const result = await foodService.createFood(req.body, req.user.userId);
  res.status(201).json(result);
}

async function updateFood(req, res) {
  const result = await foodService.updateFood(
    parseInt(req.params.id, 10),
    req.body,
    req.user.userId,
  );
  res.json(result);
}

async function deleteFood(req, res) {
  await foodService.deleteFood(parseInt(req.params.id, 10), req.user.userId);
  res.status(204).end();
}

module.exports = { listFoods, getFood, createFood, updateFood, deleteFood };
