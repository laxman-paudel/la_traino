import api from "./auth";

export function getFoods(params) {
  return api.get("/foods", { params });
}

export function getFood(id) {
  return api.get(`/foods/${id}`);
}

export function createFood(data) {
  return api.post("/foods", data);
}

export function updateFood(id, data) {
  return api.put(`/foods/${id}`, data);
}

export function deleteFood(id) {
  return api.delete(`/foods/${id}`);
}
