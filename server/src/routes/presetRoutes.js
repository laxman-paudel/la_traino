const { Router } = require("express");
const presetController = require("../controllers/presetController");
const protect = require("../middleware/protect");
const restrictTo = require("../middleware/restrictTo");

const router = Router();

router.get(
  "/presets",
  protect,
  restrictTo("TRAINEE"),
  presetController.listPresets,
);
router.post(
  "/select-preset",
  protect,
  restrictTo("TRAINEE"),
  presetController.selectPreset,
);

module.exports = router;
