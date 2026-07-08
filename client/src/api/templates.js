import api from "./auth";

export function getTemplates(params) {
  return api.get("/trainer/templates", { params });
}

export function getTemplate(id) {
  return api.get(`/trainer/templates/${id}`);
}

export function createTemplate(data) {
  return api.post("/trainer/templates", data);
}

export function updateTemplate(id, data) {
  return api.put(`/trainer/templates/${id}`, data);
}

export function deleteTemplate(id) {
  return api.delete(`/trainer/templates/${id}`);
}

export function duplicateTemplate(id) {
  return api.post(`/trainer/templates/${id}/duplicate`);
}

export function archiveTemplate(id) {
  return api.patch(`/trainer/templates/${id}/archive`);
}

export function restoreTemplate(id) {
  return api.patch(`/trainer/templates/${id}/restore`);
}

export function toggleFavorite(id) {
  return api.patch(`/trainer/templates/${id}/favorite`);
}

export function assignTemplate(id, data) {
  return api.post(`/trainer/templates/${id}/assign`, data);
}
