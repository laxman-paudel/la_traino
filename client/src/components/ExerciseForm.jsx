import { useState, useEffect } from "react";

const CATEGORIES = [
  "chest", "back", "legs", "glutes", "calves", "shoulders",
  "biceps", "triceps", "forearms", "core", "cardio",
  "mobility", "stretching", "neck", "full-body",
];

const DIFFICULTIES = ["Beginner", "Intermediate", "Advanced"];

const INITIAL = {
  name: "",
  category: "chest",
  description: "",
  equipment: "",
  difficulty: "Beginner",
  primaryMuscles: "",
  secondaryMuscles: "",
  instructions: "",
  tips: "",
  commonMistakes: "",
  imageUrl: "",
  youtubeUrl: "",
};

export default function ExerciseForm({ open, exercise, onSave, onClose, saving }) {
  const [form, setForm] = useState(INITIAL);

  useEffect(() => {
    if (exercise) {
      setForm({
        name: exercise.name || "",
        category: exercise.category || "chest",
        description: exercise.description || "",
        equipment: exercise.equipment || "",
        difficulty: exercise.difficulty || "Beginner",
        primaryMuscles: Array.isArray(exercise.primaryMuscles) ? exercise.primaryMuscles.join(", ") : (exercise.primaryMuscles || ""),
        secondaryMuscles: Array.isArray(exercise.secondaryMuscles) ? exercise.secondaryMuscles.join(", ") : (exercise.secondaryMuscles || ""),
        instructions: exercise.instructions || "",
        tips: exercise.tips || "",
        commonMistakes: exercise.commonMistakes || "",
        imageUrl: exercise.imageUrl || "",
        youtubeUrl: exercise.youtubeUrl || "",
      });
    } else {
      setForm(INITIAL);
    }
  }, [exercise, open]);

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      ...form,
      primaryMuscles: form.primaryMuscles ? form.primaryMuscles.split(",").map((s) => s.trim()).filter(Boolean) : [],
      secondaryMuscles: form.secondaryMuscles ? form.secondaryMuscles.split(",").map((s) => s.trim()).filter(Boolean) : [],
    };
    onSave(data);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" role="dialog" aria-modal="true">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            {exercise ? "Edit Exercise" : "New Exercise"}
          </h2>
          <button type="button" onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={set("name")}
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <select
                value={form.category}
                onChange={set("category")}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Equipment</label>
              <input
                type="text"
                value={form.equipment}
                onChange={set("equipment")}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
              <select
                value={form.difficulty}
                onChange={set("difficulty")}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              >
                {DIFFICULTIES.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={set("description")}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Primary Muscles (comma-separated)</label>
              <input
                type="text"
                value={form.primaryMuscles}
                onChange={set("primaryMuscles")}
                placeholder="e.g. Pectoralis Major, Anterior Deltoid"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Secondary Muscles (comma-separated)</label>
              <input
                type="text"
                value={form.secondaryMuscles}
                onChange={set("secondaryMuscles")}
                placeholder="e.g. Triceps, Serratus Anterior"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Instructions</label>
            <textarea
              rows={4}
              value={form.instructions}
              onChange={set("instructions")}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none"
              placeholder="Step-by-step instructions, one per line or numbered..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tips</label>
              <textarea
                rows={3}
                value={form.tips}
                onChange={set("tips")}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Common Mistakes</label>
              <textarea
                rows={3}
                value={form.commonMistakes}
                onChange={set("commonMistakes")}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
              <input
                type="url"
                value={form.imageUrl}
                onChange={set("imageUrl")}
                placeholder="https://..."
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">YouTube URL</label>
              <input
                type="url"
                value={form.youtubeUrl}
                onChange={set("youtubeUrl")}
                placeholder="https://youtube.com/watch?v=..."
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !form.name.trim()}
              className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Saving..." : exercise ? "Update Exercise" : "Create Exercise"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
