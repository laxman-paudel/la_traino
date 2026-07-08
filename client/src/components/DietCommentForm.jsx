import { useState, useEffect } from "react";
import { getDietComments, upsertDietComment } from "../api/coaching";

const MEAL_TYPES = [
  { value: "breakfast", label: "Breakfast" },
  { value: "lunch", label: "Lunch" },
  { value: "dinner", label: "Dinner" },
  { value: "snack", label: "Snack" },
  { value: "preWorkout", label: "Pre-Workout" },
  { value: "postWorkout", label: "Post-Workout" },
];

export default function DietCommentForm({ traineeId, onClose, onSaved }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mealType, setMealType] = useState("breakfast");
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getDietComments(traineeId)
      .then((res) => setComments(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [traineeId]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!comment.trim()) {
      setError("Comment is required");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await upsertDietComment(traineeId, { mealType, comment: comment.trim() });
      setComments((prev) => {
        const idx = prev.findIndex((c) => c.mealType === mealType);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = res.data;
          return next;
        }
        return [...prev, res.data];
      });
      setComment("");
      if (onSaved) onSaved();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to save comment");
    } finally {
      setSaving(false);
    }
  }

  const existingComment = comments.find((c) => c.mealType === mealType);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Diet Comments</h2>
          <p className="text-xs text-gray-500 mt-1">Comments appear on the trainee's meal cards.</p>
        </div>

        {/* Existing comments */}
        <div className="flex-1 overflow-y-auto p-6 space-y-2">
          {loading ? (
            <p className="text-sm text-gray-400">Loading...</p>
          ) : comments.length === 0 ? (
            <p className="text-sm text-gray-400 italic">No diet comments yet.</p>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="bg-amber-50 rounded-xl px-4 py-3 border border-amber-200">
                <p className="text-sm font-semibold text-amber-800 capitalize">{c.mealType}</p>
                <p className="text-sm text-amber-700 mt-0.5">"{c.comment}"</p>
              </div>
            ))
          )}
        </div>

        {/* Add form */}
        <form onSubmit={handleSubmit} className="p-6 border-t border-gray-100 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <select value={mealType} onChange={(e) => {
              setMealType(e.target.value);
              const existing = comments.find((c) => c.mealType === e.target.value);
              if (existing) setComment(existing.comment);
              else setComment("");
            }}
              className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300">
              {MEAL_TYPES.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Comment"
              className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>
          {existingComment && (
            <p className="text-xs text-amber-600">
              Existing comment for {mealType}: "{existingComment.comment}"
            </p>
          )}
          {error && <p className="text-xs text-red-600">{error}</p>}
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition">Close</button>
            <button type="submit" disabled={saving || !comment.trim()}
              className="px-4 py-2 text-sm font-semibold text-white bg-amber-600 rounded-xl hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition">
              {saving ? "Saving..." : existingComment ? "Update" : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
