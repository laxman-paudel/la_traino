const { Router } = require("express");
const trainerController = require("../controllers/trainerController");
const globalPresetController = require("../controllers/globalPresetController");
const exerciseHistoryController = require("../controllers/exerciseHistoryController");
const protect = require("../middleware/protect");
const restrictTo = require("../middleware/restrictTo");

const router = Router();

router.get("/dashboard", protect, restrictTo("TRAINER"), trainerController.getDashboard);
router.post("/bulk/workout", protect, restrictTo("TRAINER"), trainerController.bulkAssignWorkout);
router.post("/bulk/diet", protect, restrictTo("TRAINER"), trainerController.bulkAssignDiet);
router.post("/trainees/:id/workout", protect, restrictTo("TRAINER"), trainerController.assignWorkout);
router.post("/trainees/:id/diet", protect, restrictTo("TRAINER"), trainerController.assignDiet);
router.get("/analytics", protect, restrictTo("TRAINER"), trainerController.getAnalytics);
router.get("/global-presets/workout", protect, restrictTo("TRAINER"), globalPresetController.listGlobalWorkoutPresets);
router.get("/global-presets/diet", protect, restrictTo("TRAINER"), globalPresetController.listGlobalDietPresets);
router.get("/history/workout", protect, restrictTo("TRAINER"), trainerController.getWorkoutHistory);
router.get("/history/diet", protect, restrictTo("TRAINER"), trainerController.getDietHistory);
router.get("/trainees/:id/logs", protect, restrictTo("TRAINER"), trainerController.getTraineeLogs);
router.get("/trainees/:id/feedback", protect, restrictTo("TRAINER"), trainerController.getFeedback);
router.post("/trainees/:id/feedback", protect, restrictTo("TRAINER"), trainerController.giveFeedback);
router.get("/trainees/:id/exercise-history/:exerciseName", protect, restrictTo("TRAINER"), exerciseHistoryController.getTrainerHistory);
router.delete("/trainees/:id", protect, restrictTo("TRAINER"), trainerController.unlinkTrainee);

module.exports = router;
