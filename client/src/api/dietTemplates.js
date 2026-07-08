import api from "./auth";

export function getDietTemplates(params) {
  return api.get("/trainer/diet-templates", { params });
}

export function getDietTemplate(id) {
  return api.get(`/trainer/diet-templates/${id}`);
}

export function createDietTemplate(data) {
  return api.post("/trainer/diet-templates", data);
}

export function updateDietTemplate(id, data) {
  return api.put(`/trainer/diet-templates/${id}`, data);
}

export function deleteDietTemplate(id) {
  return api.delete(`/trainer/diet-templates/${id}`);
}

export function duplicateDietTemplate(id) {
  return api.post(`/trainer/diet-templates/${id}/duplicate`);
}

export function archiveDietTemplate(id) {
  return api.patch(`/trainer/diet-templates/${id}/archive`);
}

export function restoreDietTemplate(id) {
  return api.patch(`/trainer/diet-templates/${id}/restore`);
}

export function toggleDietFavorite(id) {
  return api.patch(`/trainer/diet-templates/${id}/favorite`);
}

export function assignDietTemplate(id, data) {
  return api.post(`/trainer/diet-templates/${id}/assign`, data);
}
