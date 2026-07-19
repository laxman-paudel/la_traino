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

export function bulkAssignWorkout(traineeIds, data) {
  return api.post("/trainer/bulk/workout", { traineeIds, ...data });
}

export function bulkAssignDiet(traineeIds, data) {
  return api.post("/trainer/bulk/diet", { traineeIds, ...data });
}

export function getWorkoutHistory(params) {
  return api.get("/trainer/history/workout", { params });
}

export function getDietHistory(params) {
  return api.get("/trainer/history/diet", { params });
}

export function getAnalytics() {
  return api.get("/trainer/analytics");
}

export function getGlobalWorkoutPresets() {
  return api.get("/trainer/global-presets/workout");
}

export function importGlobalWorkoutPreset(globalId) {
  return api.post("/trainer/global-presets/workout/import", { globalId });
}

export function getGlobalDietPresets() {
  return api.get("/trainer/global-presets/diet");
}

export function importGlobalDietPreset(globalId) {
  return api.post("/trainer/global-presets/diet/import", { globalId });
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

export function removeTrainee(traineeId) {
  return api.delete(`/trainer/trainees/${traineeId}`);
}
