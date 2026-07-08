import { useState, useEffect } from "react";
import { getExerciseComments, upsertExerciseComment } from "../api/coaching";

export default function ExerciseCommentForm({ traineeId, onClose, onSaved }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exerciseName, setExerciseName] = useState("");
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getExerciseComments(traineeId)
      .then((res) => setComments(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [traineeId]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!exerciseName.trim() || !comment.trim()) {
      setError("Exercise name and comment are required");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await upsertExerciseComment(traineeId, {
        exerciseName: exerciseName.trim(),
        comment: comment.trim(),
      });
      setComments((prev) => {
        const idx = prev.findIndex(
          (c) => c.exerciseName.toLowerCase() === exerciseName.trim().toLowerCase(),
        );
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = res.data;
          return next;
        }
        return [...prev, res.data];
      });
      setExerciseName("");
      setComment("");
      if (onSaved) onSaved();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to save comment");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Exercise Comments</h2>
          <p className="text-xs text-gray-500 mt-1">Comments appear when the trainee opens this exercise.</p>
        </div>

        {/* Existing comments */}
        <div className="flex-1 overflow-y-auto p-6 space-y-2">
          {loading ? (
            <p className="text-sm text-gray-400">Loading...</p>
          ) : comments.length === 0 ? (
            <p className="text-sm text-gray-400 italic">No exercise comments yet.</p>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="bg-emerald-50 rounded-xl px-4 py-3 border border-emerald-200">
                <p className="text-sm font-semibold text-emerald-800">{c.exerciseName}</p>
                <p className="text-sm text-emerald-700 mt-0.5">"{c.comment}"</p>
              </div>
            ))
          )}
        </div>

        {/* Add form */}
        <form onSubmit={handleSubmit} className="p-6 border-t border-gray-100 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              value={exerciseName}
              onChange={(e) => setExerciseName(e.target.value)}
              placeholder="Exercise name"
              className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300"
              list="exercise-list"
            />
            <datalist id="exercise-list">
              {comments.map((c) => (
                <option key={c.id} value={c.exerciseName} />
              ))}
            </datalist>
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Comment"
              className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition">Close</button>
            <button type="submit" disabled={saving || !exerciseName.trim() || !comment.trim()}
              className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition">
              {saving ? "Saving..." : "Add / Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
