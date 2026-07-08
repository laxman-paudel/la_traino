import api from "./auth";

export function getDashboard() {
  return api.get("/admin/dashboard");
}

export function getUsers() {
  return api.get("/admin/users");
}

export function toggleUserStatus(id) {
  return api.patch(`/admin/users/${id}/toggle-status`);
}

export function getPresets() {
  return api.get("/admin/presets");
}

export function createPreset(data) {
  return api.post("/admin/presets", data);
}

export function updatePreset(id, data) {
  return api.put(`/admin/presets/${id}`, data);
}

export function deletePreset(id) {
  return api.delete(`/admin/presets/${id}`);
}

export function getGlobalWorkoutPresets() {
  return api.get("/admin/global-presets/workout");
}

export function createGlobalWorkoutPreset(data) {
  return api.post("/admin/global-presets/workout", data);
}

export function updateGlobalWorkoutPreset(id, data) {
  return api.put(`/admin/global-presets/workout/${id}`, data);
}

export function deleteGlobalWorkoutPreset(id) {
  return api.delete(`/admin/global-presets/workout/${id}`);
}

export function getGlobalDietPresets() {
  return api.get("/admin/global-presets/diet");
}

export function createGlobalDietPreset(data) {
  return api.post("/admin/global-presets/diet", data);
}

export function updateGlobalDietPreset(id, data) {
  return api.put(`/admin/global-presets/diet/${id}`, data);
}

export function deleteGlobalDietPreset(id) {
  return api.delete(`/admin/global-presets/diet/${id}`);
}
