import api from "./auth";

export function getTrainerCalendar(month) {
  return api.get(`/calendar/trainer?month=${month}`);
}

export function getTraineeCalendar(month) {
  return api.get(`/calendar/trainee?month=${month}`);
}

export function getTraineeUpcoming() {
  return api.get("/calendar/trainee/upcoming");
}
