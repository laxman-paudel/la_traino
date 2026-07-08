import api from "./auth";

export function getExercises(params) {
  return api.get("/exercises", { params });
}

export function getExercise(id) {
  return api.get(`/exercises/${id}`);
}

export function createExercise(data) {
  return api.post("/exercises", data);
}

export function updateExercise(id, data) {
  return api.put(`/exercises/${id}`, data);
}

export function deleteExercise(id) {
  return api.delete(`/exercises/${id}`);
}
