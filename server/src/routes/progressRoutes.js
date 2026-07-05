const { Router } = require("express");
const progressController = require("../controllers/progressController");
const protect = require("../middleware/protect");
const restrictTo = require("../middleware/restrictTo");

const router = Router();

router.get(
  "/weekly",
  protect,
  restrictTo("TRAINEE"),
  progressController.getWeeklyProgress,
);

module.exports = router;
