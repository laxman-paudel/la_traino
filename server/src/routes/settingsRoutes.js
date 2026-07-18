const router = require("express").Router();
const protect = require("../middleware/protect");
const settingsController = require("../controllers/settingsController");

router.patch("/password", protect, settingsController.changePassword);
router.get("/preferences", protect, settingsController.getPreferences);
router.patch("/preferences", protect, settingsController.updatePreferences);

module.exports = router;
