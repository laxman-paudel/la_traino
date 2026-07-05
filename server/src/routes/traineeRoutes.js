const { Router } = require("express");
const traineeController = require("../controllers/traineeController");
const protect = require("../middleware/protect");
const restrictTo = require("../middleware/restrictTo");

const router = Router();

router.post(
  "/link-trainer",
  protect,
  restrictTo("TRAINEE"),
  traineeController.linkTrainer,
);

router.get(
  "/workout",
  protect,
  restrictTo("TRAINEE"),
  traineeController.getTodayWorkout,
);

router.post(
  "/workout/complete",
  protect,
  restrictTo("TRAINEE"),
  traineeController.completeWorkout,
);

router.get(
  "/diet",
  protect,
  restrictTo("TRAINEE"),
  traineeController.getTodayDiet,
);

router.get(
  "/feedback",
  protect,
  restrictTo("TRAINEE"),
  traineeController.getFeedback,
);

module.exports = router;
