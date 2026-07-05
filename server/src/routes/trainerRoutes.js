const { Router } = require("express");
const trainerController = require("../controllers/trainerController");
const protect = require("../middleware/protect");
const restrictTo = require("../middleware/restrictTo");

const router = Router();

router.get(
  "/dashboard",
  protect,
  restrictTo("TRAINER"),
  trainerController.getDashboard,
);

router.post(
  "/trainees/:id/workout",
  protect,
  restrictTo("TRAINER"),
  trainerController.assignWorkout,
);

router.post(
  "/trainees/:id/diet",
  protect,
  restrictTo("TRAINER"),
  trainerController.assignDiet,
);

router.get(
  "/trainees/:id/logs",
  protect,
  restrictTo("TRAINER"),
  trainerController.getTraineeLogs,
);

router.get(
  "/trainees/:id/feedback",
  protect,
  restrictTo("TRAINER"),
  trainerController.getFeedback,
);

router.post(
  "/trainees/:id/feedback",
  protect,
  restrictTo("TRAINER"),
  trainerController.giveFeedback,
);

module.exports = router;
