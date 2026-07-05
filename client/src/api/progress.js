import api from "./auth";

export function getWeeklyProgress() {
  return api.get("/progress/weekly");
}
