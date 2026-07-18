const { Router } = require("express");
const calendarController = require("../controllers/calendarController");
const protect = require("../middleware/protect");
const restrictTo = require("../middleware/restrictTo");

const router = Router();

router.get("/trainer", protect, restrictTo("TRAINER"), calendarController.getTrainerCalendar);
router.get("/trainee", protect, restrictTo("TRAINEE"), calendarController.getTraineeCalendar);
router.get("/trainee/upcoming", protect, restrictTo("TRAINEE"), calendarController.getTraineeUpcoming);

module.exports = router;
