const router = require("express").Router();
const protect = require("../middleware/protect");
const profileController = require("../controllers/profileController");

router.get("/", protect, profileController.getProfile);
router.patch("/", protect, profileController.updateProfile);
router.post("/avatar", protect, profileController.uploadAvatar);

module.exports = router;
