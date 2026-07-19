const { Router } = require("express");
const traineeController = require("../controllers/traineeController");
const protect = require("../middleware/protect");
const restrictTo = require("../middleware/restrictTo");

const router = Router();

router.post("/link-trainer", protect, restrictTo("TRAINEE"), traineeController.linkTrainer);
router.delete("/link-trainer", protect, restrictTo("TRAINEE"), traineeController.unlinkTrainer);
router.get("/workout", protect, restrictTo("TRAINEE"), traineeController.getTodayWorkout);
router.patch("/workout/exercise/:index/progress", protect, restrictTo("TRAINEE"), traineeController.updateExerciseProgress);
router.post("/workout/complete", protect, restrictTo("TRAINEE"), traineeController.completeWorkout);
router.get("/diet", protect, restrictTo("TRAINEE"), traineeController.getTodayDiet);
router.patch("/diet/meal/:mealType/progress", protect, restrictTo("TRAINEE"), traineeController.updateMealProgress);
router.post("/diet/complete", protect, restrictTo("TRAINEE"), traineeController.completeDiet);
router.get("/feedback", protect, restrictTo("TRAINEE"), traineeController.getFeedback);
router.get("/coaching/exercise-comments", protect, restrictTo("TRAINEE"), traineeController.getTraineeExerciseComments);
router.get("/coaching/diet-comments", protect, restrictTo("TRAINEE"), traineeController.getTraineeDietComments);

module.exports = router;
