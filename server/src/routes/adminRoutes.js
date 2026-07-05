const { Router } = require("express");
const adminController = require("../controllers/adminController");
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

module.exports = router;
