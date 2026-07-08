const { Router } = require("express");
const foodController = require("../controllers/foodController");
const protect = require("../middleware/protect");
const restrictTo = require("../middleware/restrictTo");

const router = Router();

router.get("/", protect, foodController.listFoods);
router.get("/:id", protect, foodController.getFood);
router.post("/", protect, restrictTo("TRAINER"), foodController.createFood);
router.put("/:id", protect, restrictTo("TRAINER"), foodController.updateFood);
router.delete("/:id", protect, restrictTo("TRAINER"), foodController.deleteFood);

module.exports = router;
