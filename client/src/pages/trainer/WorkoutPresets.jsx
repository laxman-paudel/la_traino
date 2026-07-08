import { useState, useEffect } from "react";
import {
  getWorkoutPresets,
  createWorkoutPreset,
  updateWorkoutPreset,
  deleteWorkoutPreset,
  duplicateWorkoutPreset,
} from "../../api/trainerPresets";
import { getGlobalWorkoutPresets, importGlobalWorkoutPreset } from "../../api/trainer";
import { useToast } from "../../context/ToastContext";
import PageHeader from "../../components/PageHeader";
import EmptyState from "../../components/EmptyState";
import ConfirmDialog from "../../components/ConfirmDialog";
import { SkeletonCard } from "../../components/Skeleton";

export default function WorkoutPresets() {
  const { addToast } = useToast();
  const [presets, setPresets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [previewPreset, setPreviewPreset] = useState(null);
  const [form, setForm] = useState({
    name: "", description: "", difficulty: "", estimatedDuration: "", exercises: [],
  });
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [importModal, setImportModal] = useState(false);
  const [globalPresets, setGlobalPresets] = useState([]);
  const [globalPresetsLoading, setGlobalPresetsLoading] = useState(false);
  const [importingId, setImportingId] = useState(null);

  useEffect(() => {
    getWorkoutPresets()
      .then((res) => setPresets(res.data))
      .catch(() => addToast("Failed to load workout presets", "error"))
      .finally(() => setLoading(false));
  }, []);

  function openAdd() {
    setForm({ name: "", description: "", difficulty: "", estimatedDuration: "", exercises: [{ name: "", sets: "", reps: "" }] });
    setModal("add");
  }

  function openEdit(preset) {
    setForm({
      name: preset.name,
      description: preset.description || "",
      difficulty: preset.difficulty || "",
      estimatedDuration: preset.estimatedDuration ?? "",
      exercises: preset.exercises.map((ex) => ({ name: ex.name, sets: ex.sets.toString(), reps: ex.reps.toString() })),
    });
    setModal({ type: "edit", id: preset.id });
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!form.name.trim()) { addToast("Preset name is required", "error"); return; }
    if (form.exercises.length === 0 || !form.exercises.some((ex) => ex.name.trim())) {
      addToast("At least one exercise is required", "error"); return;
    }
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      difficulty: form.difficulty.trim() || undefined,
      estimatedDuration: form.estimatedDuration ? Number(form.estimatedDuration) : undefined,
      exercises: form.exercises.filter((ex) => ex.name.trim()).map((ex) => ({
        name: ex.name.trim(),
        sets: parseInt(ex.sets, 10) || 1,
        reps: parseInt(ex.reps, 10) || 1,
      })),
    };
    try {
      if (modal === "add") {
        const res = await createWorkoutPreset(payload);
        setPresets((prev) => [res.data, ...prev]);
        addToast("Workout preset created", "success");
      } else {
        const res = await updateWorkoutPreset(modal.id, payload);
        setPresets((prev) => prev.map((p) => (p.id === modal.id ? res.data : p)));
        addToast("Workout preset updated", "success");
      }
      setModal(null);
    } catch (err) {
      addToast(err.response?.data?.error || "Failed to save preset", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDuplicate(id) {
    try {
      const res = await duplicateWorkoutPreset(id);
      setPresets((prev) => [res.data, ...prev]);
      addToast("Workout preset duplicated", "success");
    } catch (err) {
      addToast(err.response?.data?.error || "Failed to duplicate preset", "error");
    }
  }

  async function handleDelete(id) {
    setDeleting(true);
    try {
      await deleteWorkoutPreset(id);
      setPresets((prev) => prev.filter((p) => p.id !== id));
      setDeleteTarget(null);
      addToast("Workout preset deleted", "success");
    } catch (err) {
      addToast(err.response?.data?.error || "Failed to delete preset", "error");
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  }

  function addExercise() {
    setForm((f) => ({ ...f, exercises: [...f.exercises, { name: "", sets: "", reps: "" }] }));
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-56 bg-gray-200 rounded animate-pulse" />
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2].map((i) => <SkeletonCard key={i} rows={3} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Workout Presets"
        subtitle="Create and manage reusable workout templates"
        actions={
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setImportModal(true);
                setGlobalPresetsLoading(true);
                getGlobalWorkoutPresets()
                  .then((res) => setGlobalPresets(res.data))
                  .catch(() => addToast("Failed to load library", "error"))
                  .finally(() => setGlobalPresetsLoading(false));
              }}
              className="flex items-center gap-1.5 px-4 py-2 border border-indigo-200 text-indigo-600 rounded-xl hover:bg-indigo-50 transition text-sm font-semibold"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Import from Library
            </button>
            <button
              type="button"
              onClick={openAdd}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition text-sm font-semibold shadow-sm shadow-indigo-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              New Preset
            </button>
          </div>
        }
      />

      {presets.length === 0 ? (
        <EmptyState
          icon="dumbbell"
          title="No Workout Presets"
          message="Create your first reusable workout template to speed up assignments."
          action={
            <button
              type="button"
              onClick={openAdd}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition text-sm font-semibold"
            >
              Create Preset
            </button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {presets.map((preset) => (
            <div
              key={preset.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900 truncate">{preset.name}</h3>
                <div className="flex gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => setPreviewPreset(preset)}
                    className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
                    title="Preview"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDuplicate(preset.id)}
                    className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                    title="Duplicate"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => openEdit(preset)}
                    className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
                    title="Edit"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(preset)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="Delete"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </button>
                </div>
              </div>
              {preset.description && (
                <p className="text-sm text-gray-500 mb-2 line-clamp-2">{preset.description}</p>
              )}
              <div className="flex flex-wrap gap-2 text-xs text-gray-400">
                <span>{Array.isArray(preset.exercises) ? preset.exercises.length : 0} exercises</span>
                {preset.difficulty && <span className="capitalize">· {preset.difficulty}</span>}
                {preset.estimatedDuration && <span>· ~{preset.estimatedDuration} min</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {previewPreset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={() => setPreviewPreset(null)}>
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">{previewPreset.name}</h2>
              <button type="button" onClick={() => setPreviewPreset(null)} className="p-1 text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {previewPreset.description && <p className="text-sm text-gray-500 mb-3">{previewPreset.description}</p>}
            <div className="flex gap-3 text-xs text-gray-400 mb-4">
              {previewPreset.difficulty && <span className="capitalize">Difficulty: {previewPreset.difficulty}</span>}
              {previewPreset.estimatedDuration && <span>~{previewPreset.estimatedDuration} min</span>}
            </div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Exercises</h3>
            <div className="space-y-2">
              {Array.isArray(previewPreset.exercises) && previewPreset.exercises.map((ex, i) => (
                <div key={i} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-2.5">
                  <span className="text-sm font-medium text-gray-900">{ex.name}</span>
                  <span className="text-xs text-gray-500">{ex.sets} × {ex.reps}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto" role="dialog" aria-modal="true">
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              {modal === "add" ? "New Workout Preset" : "Edit Workout Preset"}
            </h2>
            <p className="text-sm text-gray-500 mb-5">
              {modal === "add" ? "Create a reusable workout template" : "Update your workout template"}
            </p>
            <form onSubmit={handleSave} className="space-y-4">
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
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
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
                  <label className="text-sm font-medium text-gray-700">Exercises</label>
                  <button type="button" onClick={addExercise} className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">+ Add Exercise</button>
                </div>
                <div className="space-y-2">
                  {form.exercises.map((ex, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input type="text" placeholder="Exercise" value={ex.name} onChange={(e) => updateExercise(i, "name", e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm" />
                      <input type="number" min="1" placeholder="Sets" value={ex.sets} onChange={(e) => updateExercise(i, "sets", e.target.value)}
                        className="w-16 px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm text-center" />
                      <input type="number" min="1" placeholder="Reps" value={ex.reps} onChange={(e) => updateExercise(i, "reps", e.target.value)}
                        className="w-16 px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm text-center" />
                      {form.exercises.length > 1 && (
                        <button type="button" onClick={() => removeExercise(i)} className="p-1.5 text-red-400 hover:text-red-600">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModal(null)} className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition font-medium text-sm">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold text-sm shadow-sm shadow-indigo-200">
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Workout Preset"
        message={deleteTarget ? `Are you sure you want to delete "${deleteTarget.name}"? This action cannot be undone.` : ""}
        confirmLabel={deleting ? "Deleting..." : "Delete"}
        cancelLabel="Cancel"
        danger
        onConfirm={() => handleDelete(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
      />

      {importModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" role="dialog" aria-modal="true">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Import from Library</h2>
              <button type="button" onClick={() => setImportModal(false)} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {globalPresetsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin h-6 w-6 border-2 border-indigo-600 border-t-transparent rounded-full" />
              </div>
            ) : globalPresets.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No global workout templates available.</p>
            ) : (
              <div className="space-y-2">
                {globalPresets.map((gp) => (
                  <div key={gp.id} className="border border-gray-200 rounded-xl p-4 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900">{gp.name}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {gp.category && <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full">{gp.category}</span>}
                        {gp.difficulty && <span className="text-xs px-2 py-0.5 bg-amber-50 text-amber-600 rounded-full">{gp.difficulty}</span>}
                        <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">{Array.isArray(gp.exercises) ? gp.exercises.length : 0} exercises</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={importingId === gp.id}
                      onClick={async () => {
                        setImportingId(gp.id);
                        try {
                          await importGlobalWorkoutPreset(gp.id);
                          addToast(`Imported "${gp.name}"`, "success");
                          getWorkoutPresets().then((res) => setPresets(res.data)).catch(() => {});
                        } catch (err) {
                          addToast(err.response?.data?.error || "Import failed", "error");
                        } finally {
                          setImportingId(null);
                        }
                      }}
                      className="shrink-0 px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-xs font-semibold transition"
                    >
                      {importingId === gp.id ? (
                        <span className="flex items-center gap-1"><svg className="animate-spin h-3 w-3" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>...</span>
                      ) : "Import"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
