const { Router } = require("express");
const authController = require("../controllers/authController");
const protect = require("../middleware/protect");

const router = Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/google", authController.googleAuth);
router.get("/me", protect, authController.getMe);

module.exports = router;
