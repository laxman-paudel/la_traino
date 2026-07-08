import api from "./auth";

export function getWorkoutPresets() {
  return api.get("/trainer/presets/workout");
}

export function createWorkoutPreset(data) {
  return api.post("/trainer/presets/workout", data);
}

export function updateWorkoutPreset(id, data) {
  return api.put(`/trainer/presets/workout/${id}`, data);
}

export function deleteWorkoutPreset(id) {
  return api.delete(`/trainer/presets/workout/${id}`);
}

export function duplicateWorkoutPreset(id) {
  return api.post(`/trainer/presets/workout/${id}/duplicate`);
}

export function getDietPresets() {
  return api.get("/trainer/presets/diet");
}

export function createDietPreset(data) {
  return api.post("/trainer/presets/diet", data);
}

export function updateDietPreset(id, data) {
  return api.put(`/trainer/presets/diet/${id}`, data);
}

export function deleteDietPreset(id) {
  return api.delete(`/trainer/presets/diet/${id}`);
}

export function duplicateDietPreset(id) {
  return api.post(`/trainer/presets/diet/${id}/duplicate`);
}
