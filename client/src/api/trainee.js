import api from "./auth";

export function linkTrainer(trainerCode) {
  return api.post("/trainee/link-trainer", { trainerCode });
}

export function getTodayWorkout() {
  return api.get("/trainee/workout");
}

export function updateExerciseProgress(index, data) {
  return api.patch(`/trainee/workout/exercise/${index}/progress`, data);
}

export function completeWorkout() {
  return api.post("/trainee/workout/complete");
}

export function getTodayDiet() {
  return api.get("/trainee/diet");
}

export function updateMealProgress(mealType, data) {
  return api.patch(`/trainee/diet/meal/${mealType}/progress`, data);
}

export function completeDiet() {
  return api.post("/trainee/diet/complete");
}

export function fetchFeedback() {
  return api.get("/trainee/feedback");
}

export function unlinkTrainer() {
  return api.delete("/trainee/link-trainer");
}
