const { Router } = require("express");
const coachingController = require("../controllers/coachingController");
const protect = require("../middleware/protect");
const restrictTo = require("../middleware/restrictTo");

const router = Router();

router.use(protect, restrictTo("TRAINER"));

router.get("/trainees/:id/timeline", coachingController.getTimeline);
router.get("/trainees/:id/notes", coachingController.getFeedbacks);
router.post("/trainees/:id/notes", coachingController.createFeedback);
router.put("/trainees/:id/notes/:noteId", coachingController.updateFeedback);
router.delete("/trainees/:id/notes/:noteId", coachingController.deleteFeedback);
router.patch("/trainees/:id/notes/:noteId/read", coachingController.markFeedbackRead);

router.get("/trainees/:id/exercise-comments", coachingController.getExerciseComments);
router.post("/trainees/:id/exercise-comments", coachingController.upsertExerciseComment);
router.delete("/trainees/:id/exercise-comments/:commentId", coachingController.deleteExerciseComment);

router.get("/trainees/:id/diet-comments", coachingController.getDietComments);
router.post("/trainees/:id/diet-comments", coachingController.upsertDietComment);
router.delete("/trainees/:id/diet-comments/:commentId", coachingController.deleteDietComment);

module.exports = router;
