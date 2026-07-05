import api from "./auth";

export function linkTrainer(trainerCode) {
  return api.post("/trainee/link-trainer", { trainerCode });
}

export function getTodayWorkout() {
  return api.get("/trainee/workout");
}

export function completeWorkout() {
  return api.post("/trainee/workout/complete");
}

export function getTodayDiet() {
  return api.get("/trainee/diet");
}

export function fetchFeedback() {
  return api.get("/trainee/feedback");
}
