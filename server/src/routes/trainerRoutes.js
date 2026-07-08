const { Router } = require("express");
const trainerController = require("../controllers/trainerController");
const trainerPresetController = require("../controllers/trainerPresetController");
const globalPresetController = require("../controllers/globalPresetController");
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
  "/bulk/workout",
  protect,
  restrictTo("TRAINER"),
  trainerController.bulkAssignWorkout,
);

router.post(
  "/bulk/diet",
  protect,
  restrictTo("TRAINER"),
  trainerController.bulkAssignDiet,
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
  "/analytics",
  protect,
  restrictTo("TRAINER"),
  trainerController.getAnalytics,
);

router.get(
  "/global-presets/workout",
  protect,
  restrictTo("TRAINER"),
  globalPresetController.listGlobalWorkoutPresets,
);

router.post(
  "/global-presets/workout/import",
  protect,
  restrictTo("TRAINER"),
  globalPresetController.importWorkoutPreset,
);

router.get(
  "/global-presets/diet",
  protect,
  restrictTo("TRAINER"),
  globalPresetController.listGlobalDietPresets,
);

router.post(
  "/global-presets/diet/import",
  protect,
  restrictTo("TRAINER"),
  globalPresetController.importDietPreset,
);

router.get(
  "/history/workout",
  protect,
  restrictTo("TRAINER"),
  trainerController.getWorkoutHistory,
);

router.get(
  "/history/diet",
  protect,
  restrictTo("TRAINER"),
  trainerController.getDietHistory,
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

router.get(
  "/presets/workout",
  protect,
  restrictTo("TRAINER"),
  trainerPresetController.listWorkoutPresets,
);

router.post(
  "/presets/workout",
  protect,
  restrictTo("TRAINER"),
  trainerPresetController.createWorkoutPreset,
);

router.put(
  "/presets/workout/:id",
  protect,
  restrictTo("TRAINER"),
  trainerPresetController.updateWorkoutPreset,
);

router.delete(
  "/presets/workout/:id",
  protect,
  restrictTo("TRAINER"),
  trainerPresetController.deleteWorkoutPreset,
);

router.post(
  "/presets/workout/:id/duplicate",
  protect,
  restrictTo("TRAINER"),
  trainerPresetController.duplicateWorkoutPreset,
);

router.get(
  "/presets/diet",
  protect,
  restrictTo("TRAINER"),
  trainerPresetController.listDietPresets,
);

router.post(
  "/presets/diet",
  protect,
  restrictTo("TRAINER"),
  trainerPresetController.createDietPreset,
);

router.put(
  "/presets/diet/:id",
  protect,
  restrictTo("TRAINER"),
  trainerPresetController.updateDietPreset,
);

router.delete(
  "/presets/diet/:id",
  protect,
  restrictTo("TRAINER"),
  trainerPresetController.deleteDietPreset,
);

router.post(
  "/presets/diet/:id/duplicate",
  protect,
  restrictTo("TRAINER"),
  trainerPresetController.duplicateDietPreset,
);

module.exports = router;
