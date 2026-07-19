import { useState } from "react";

export default function TemplateForm({ template, onSave, onClose }) {
  const isEdit = !!template?.id;
  const [form, setForm] = useState({
    name: template?.name || "",
    description: template?.description || "",
    difficulty: template?.difficulty || "",
    estimatedDuration: template?.estimatedDuration ?? "",
    exercises: template?.exercises?.length
      ? template.exercises.map((ex) => ({
          name: ex.name,
          sets: ex.sets?.toString() || "",
          reps: ex.reps?.toString() || "",
          weight: ex.weight || "",
          restTime: ex.restTime || "",
          tempo: ex.tempo || "",
          notes: ex.notes || "",
        }))
      : [{ name: "", sets: "", reps: "", weight: "", restTime: "", tempo: "", notes: "" }],
  });
  const [saving, setSaving] = useState(false);

  function addExercise() {
    setForm((f) => ({ ...f, exercises: [...f.exercises, { name: "", sets: "", reps: "", weight: "", restTime: "", tempo: "", notes: "" }] }));
  }

  function removeExercise(index) {
    setForm((f) => ({ ...f, exercises: f.exercises.filter((_, i) => i !== index) }));
  }

  function updateExercise(index, field, value) {
    setForm((f) => ({
      ...f,
      exercises: f.exercises.map((ex, i) => (i === index ? { ...ex, [field]: value } : ex)),
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    if (!form.exercises.some((ex) => ex.name.trim())) return;

    setSaving(true);
    try {
      await onSave({
        name: form.name.trim(),
        description: form.description.trim() || null,
        difficulty: form.difficulty || null,
        estimatedDuration: form.estimatedDuration ? Number(form.estimatedDuration) : null,
        exercises: form.exercises
          .filter((ex) => ex.name.trim())
          .map((ex) => ({
            name: ex.name.trim(),
            sets: parseInt(ex.sets, 10) || 1,
            reps: parseInt(ex.reps, 10) || 1,
            ...(ex.weight ? { weight: ex.weight } : {}),
            ...(ex.restTime ? { restTime: ex.restTime } : {}),
            ...(ex.tempo ? { tempo: ex.tempo } : {}),
            ...(ex.notes ? { notes: ex.notes } : {}),
          })),
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto" role="dialog" aria-modal="true">
        <h2 className="text-xl font-bold text-gray-900 mb-1">
          {isEdit ? "Edit Workout Template" : "New Workout Template"}
        </h2>
        <p className="text-sm text-gray-500 mb-5">
          {isEdit ? "Update your reusable workout template" : "Build a workout once, assign to many"}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name <span className="text-red-400">*</span></label>
            <input type="text" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900" autoFocus />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea rows={2} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
              <select value={form.difficulty} onChange={(e) => setForm((f) => ({ ...f, difficulty: e.target.value }))}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900">
                <option value="">Any</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Est. Duration (min)</label>
              <input type="number" min="1" value={form.estimatedDuration} onChange={(e) => setForm((f) => ({ ...f, estimatedDuration: e.target.value }))}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Exercises <span className="text-red-400">*</span></label>
              <button type="button" onClick={addExercise} className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">+ Add Exercise</button>
            </div>
            <div className="space-y-2">
              {form.exercises.map((ex, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <input type="text" placeholder="Exercise name" value={ex.name} onChange={(e) => updateExercise(i, "name", e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm" />
                    {form.exercises.length > 1 && (
                      <button type="button" onClick={() => removeExercise(i)} className="p-1.5 text-red-400 hover:text-red-600 shrink-0">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="text-[10px] text-gray-400 font-medium">Sets</label>
                      <input type="number" min="1" placeholder="3" value={ex.sets} onChange={(e) => updateExercise(i, "sets", e.target.value)}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm text-center" />
                    </div>
                    <div className="flex-1">
                      <label className="text-[10px] text-gray-400 font-medium">Reps</label>
                      <input type="number" min="1" placeholder="10" value={ex.reps} onChange={(e) => updateExercise(i, "reps", e.target.value)}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm text-center" />
                    </div>
                    <div className="flex-1">
                      <label className="text-[10px] text-gray-400 font-medium">Weight</label>
                      <input type="text" placeholder="kg" value={ex.weight} onChange={(e) => updateExercise(i, "weight", e.target.value)}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm text-center" />
                    </div>
                    <div className="flex-1">
                      <label className="text-[10px] text-gray-400 font-medium">Rest</label>
                      <input type="text" placeholder="60s" value={ex.restTime} onChange={(e) => updateExercise(i, "restTime", e.target.value)}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm text-center" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition font-medium text-sm">Cancel</button>
            <button type="submit" disabled={saving || !form.name.trim() || !form.exercises.some((ex) => ex.name.trim())}
              className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold text-sm shadow-sm shadow-indigo-200">
              {saving ? "Saving..." : isEdit ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
