import api from "./auth";

export function fetchPresets() {
  return api.get("/trainee/presets");
}

export function selectPreset(presetId) {
  return api.post("/trainee/select-preset", { presetId });
}
