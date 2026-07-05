import api from "./auth";

export function getDashboard() {
  return api.get("/trainer/dashboard");
}

export function assignWorkout(traineeId, data) {
  return api.post(`/trainer/trainees/${traineeId}/workout`, data);
}

export function assignDiet(traineeId, data) {
  return api.post(`/trainer/trainees/${traineeId}/diet`, data);
}

export function getWorkoutLogs(traineeId) {
  return api.get(`/trainer/trainees/${traineeId}/logs`);
}

export function getFeedback(traineeId) {
  return api.get(`/trainer/trainees/${traineeId}/feedback`);
}

export function saveFeedback(traineeId, data) {
  return api.post(`/trainer/trainees/${traineeId}/feedback`, data);
}
