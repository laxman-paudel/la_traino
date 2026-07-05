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
