import api from "./auth";

export function getTraineeExerciseHistory(exerciseName, params) {
  return api.get(`/trainee/exercise-history/${encodeURIComponent(exerciseName)}`, { params });
}

export function getTrainerExerciseHistory(traineeId, exerciseName, params) {
  return api.get(`/trainer/trainees/${traineeId}/exercise-history/${encodeURIComponent(exerciseName)}`, { params });
}
