import api from "./auth";

export function getTimeline(traineeId, params) {
  return api.get(`/trainer/coaching/trainees/${traineeId}/timeline`, { params });
}

export function getCoachingNotes(traineeId) {
  return api.get(`/trainer/coaching/trainees/${traineeId}/notes`);
}

export function createCoachingNote(traineeId, data) {
  return api.post(`/trainer/coaching/trainees/${traineeId}/notes`, data);
}

export function updateCoachingNote(traineeId, noteId, data) {
  return api.put(`/trainer/coaching/trainees/${traineeId}/notes/${noteId}`, data);
}

export function deleteCoachingNote(traineeId, noteId) {
  return api.delete(`/trainer/coaching/trainees/${traineeId}/notes/${noteId}`);
}

export function markNoteRead(traineeId, noteId, read) {
  return api.patch(`/trainer/coaching/trainees/${traineeId}/notes/${noteId}/read`, { read });
}

export function getExerciseComments(traineeId) {
  return api.get(`/trainer/coaching/trainees/${traineeId}/exercise-comments`);
}

export function upsertExerciseComment(traineeId, data) {
  return api.post(`/trainer/coaching/trainees/${traineeId}/exercise-comments`, data);
}

export function deleteExerciseComment(traineeId, commentId) {
  return api.delete(`/trainer/coaching/trainees/${traineeId}/exercise-comments/${commentId}`);
}

export function getDietComments(traineeId) {
  return api.get(`/trainer/coaching/trainees/${traineeId}/diet-comments`);
}

export function upsertDietComment(traineeId, data) {
  return api.post(`/trainer/coaching/trainees/${traineeId}/diet-comments`, data);
}

export function deleteDietComment(traineeId, commentId) {
  return api.delete(`/trainer/coaching/trainees/${traineeId}/diet-comments/${commentId}`);
}

export function getTraineeExerciseComments() {
  return api.get("/trainee/coaching/exercise-comments");
}

export function getTraineeDietComments() {
  return api.get("/trainee/coaching/diet-comments");
}
