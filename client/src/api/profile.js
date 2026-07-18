import api from "./auth";

export function getProfile() {
  return api.get("/profile");
}

export function updateProfile(data) {
  return api.patch("/profile", data);
}

export function uploadAvatar(image) {
  return api.post("/profile/avatar", { image });
}

export function changePassword(currentPassword, newPassword) {
  return api.patch("/settings/password", { currentPassword, newPassword });
}

export function getPreferences() {
  return api.get("/settings/preferences");
}

export function updatePreferences(data) {
  return api.patch("/settings/preferences", data);
}
