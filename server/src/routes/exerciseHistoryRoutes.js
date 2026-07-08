const { Router } = require("express");
const historyController = require("../controllers/exerciseHistoryController");
const protect = require("../middleware/protect");
const restrictTo = require("../middleware/restrictTo");

const router = Router();

router.get(
  "/exercise-history/:exerciseName",
  protect,
  restrictTo("TRAINEE"),
  historyController.getTraineeHistory,
);

module.exports = router;
