const { Router } = require("express");
const adminController = require("../controllers/adminController");
const globalPresetController = require("../controllers/globalPresetController");
const protect = require("../middleware/protect");
const restrictTo = require("../middleware/restrictTo");

const router = Router();

router.get(
  "/dashboard",
  protect,
  restrictTo("ADMIN"),
  adminController.getDashboard,
);

router.get("/users", protect, restrictTo("ADMIN"), adminController.listUsers);

router.patch(
  "/users/:id/toggle-status",
  protect,
  restrictTo("ADMIN"),
  adminController.toggleUserStatus,
);

router.get(
  "/presets",
  protect,
  restrictTo("ADMIN"),
  adminController.listPresets,
);

router.post(
  "/presets",
  protect,
  restrictTo("ADMIN"),
  adminController.createPreset,
);

router.put(
  "/presets/:id",
  protect,
  restrictTo("ADMIN"),
  adminController.updatePreset,
);

router.delete(
  "/presets/:id",
  protect,
  restrictTo("ADMIN"),
  adminController.deletePreset,
);

router.get(
  "/global-presets/workout",
  protect,
  restrictTo("ADMIN"),
  globalPresetController.listGlobalWorkoutPresets,
);

router.post(
  "/global-presets/workout",
  protect,
  restrictTo("ADMIN"),
  globalPresetController.createGlobalWorkoutPreset,
);

router.put(
  "/global-presets/workout/:id",
  protect,
  restrictTo("ADMIN"),
  globalPresetController.updateGlobalWorkoutPreset,
);

router.delete(
  "/global-presets/workout/:id",
  protect,
  restrictTo("ADMIN"),
  globalPresetController.deleteGlobalWorkoutPreset,
);

router.get(
  "/global-presets/diet",
  protect,
  restrictTo("ADMIN"),
  globalPresetController.listGlobalDietPresets,
);

router.post(
  "/global-presets/diet",
  protect,
  restrictTo("ADMIN"),
  globalPresetController.createGlobalDietPreset,
);

router.put(
  "/global-presets/diet/:id",
  protect,
  restrictTo("ADMIN"),
  globalPresetController.updateGlobalDietPreset,
);

router.delete(
  "/global-presets/diet/:id",
  protect,
  restrictTo("ADMIN"),
  globalPresetController.deleteGlobalDietPreset,
);

module.exports = router;
