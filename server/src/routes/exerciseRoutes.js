const { Router } = require("express");
const {
  listExercises,
  getExercise,
  createExercise,
  updateExercise,
  deleteExercise,
} = require("../controllers/exerciseController");
const protect = require("../middleware/protect");
const restrictTo = require("../middleware/restrictTo");

const router = Router();

router.get("/", protect, listExercises);
router.get("/:id", protect, getExercise);
router.post("/", protect, restrictTo("TRAINER", "ADMIN"), createExercise);
router.put("/:id", protect, restrictTo("TRAINER", "ADMIN"), updateExercise);
router.delete("/:id", protect, restrictTo("TRAINER", "ADMIN"), deleteExercise);

module.exports = router;