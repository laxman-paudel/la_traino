import { useState, useEffect } from "react";
import {
  getGlobalWorkoutPresets, createGlobalWorkoutPreset, updateGlobalWorkoutPreset, deleteGlobalWorkoutPreset,
  getGlobalDietPresets, createGlobalDietPreset, updateGlobalDietPreset, deleteGlobalDietPreset,
} from "../../api/admin";
import { useToast } from "../../context/ToastContext";
import PageHeader from "../../components/PageHeader";
import EmptyState from "../../components/EmptyState";
import ConfirmDialog from "../../components/ConfirmDialog";

const TABS = [
  { value: "workout", label: "Workout Templates" },
  { value: "diet", label: "Diet Templates" },
];

const emptyWorkout = {
  name: "", description: "", category: "", difficulty: "", tags: "", estimatedDuration: "",
  exercises: [{ name: "", sets: "", reps: "" }],
};

const emptyDiet = {
  name: "", description: "", category: "", difficulty: "", tags: "",
  meals: [{ time: "", items: "" }],
};

export default function GlobalPresets() {
  const { addToast } = useToast();
  const [tab, setTab] = useState("workout");
  const [workoutPresets, setWorkoutPresets] = useState([]);
  const [dietPresets, setDietPresets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyWorkout);
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  function fetchAll() {
    setLoading(true);
    setError("");
    Promise.all([
      getGlobalWorkoutPresets().then((r) => setWorkoutPresets(r.data)).catch(() => {}),
      getGlobalDietPresets().then((r) => setDietPresets(r.data)).catch(() => {}),
    ]).catch(() => setError("Failed to load presets"))
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetchAll(); }, []);

  const presets = tab === "workout" ? workoutPresets : dietPresets;
  const isWorkout = tab === "workout";

  function openAdd() {
    setForm(isWorkout ? { ...emptyWorkout, exercises: [{ name: "", sets: "", reps: "" }] } : { ...emptyDiet, meals: [{ time: "", items: "" }] });
    setFieldErrors({});
    setError("");
    setModal("add");
  }

  function openEdit(preset) {
    if (isWorkout) {
      setForm({
        name: preset.name,
        description: preset.description || "",
        category: preset.category || "",
        difficulty: preset.difficulty || "",
        tags: Array.isArray(preset.tags) ? preset.tags.join(", ") : "",
        estimatedDuration: preset.estimatedDuration || "",
        exercises: preset.exercises.map((ex) => ({
          name: ex.name,
          sets: String(ex.sets),
          reps: String(ex.reps),
        })),
      });
    } else {
      setForm({
        name: preset.name,
        description: preset.description || "",
        category: preset.category || "",
        difficulty: preset.difficulty || "",
        tags: Array.isArray(preset.tags) ? preset.tags.join(", ") : "",
        meals: preset.meals.map((m) => ({
          time: m.time,
          items: Array.isArray(m.items) ? m.items.join(", ") : "",
        })),
      });
    }
    setFieldErrors({});
    setError("");
    setModal({ type: "edit", id: preset.id });
  }

  function handleExerciseChange(index, field, value) {
    setForm((prev) => ({
      ...prev,
      exercises: prev.exercises.map((ex, i) => (i === index ? { ...ex, [field]: value } : ex)),
    }));
  }

  function addExercise() {
    setForm((prev) => ({
      ...prev,
      exercises: [...prev.exercises, { name: "", sets: "", reps: "" }],
    }));
  }

  function removeExercise(index) {
    setForm((prev) => ({
      ...prev,
      exercises: prev.exercises.filter((_, i) => i !== index),
    }));
  }

  function handleMealChange(index, field, value) {
    setForm((prev) => ({
      ...prev,
      meals: prev.meals.map((m, i) => (i === index ? { ...m, [field]: value } : m)),
    }));
  }

  function addMeal() {
    setForm((prev) => ({
      ...prev,
      meals: [...prev.meals, { time: "", items: "" }],
    }));
  }

  function removeMeal(index) {
    setForm((prev) => ({
      ...prev,
      meals: prev.meals.filter((_, i) => i !== index),
    }));
  }

  function validate() {
    const errs = {};
    if (!form.name.trim()) errs.name = "Name is required";

    if (isWorkout) {
      const exerciseErrors = form.exercises.map((ex) => {
        const f = {};
        if (!ex.name.trim()) f.name = "Required";
        if (!ex.sets || parseInt(ex.sets, 10) <= 0) f.sets = "Must be > 0";
        if (!ex.reps || parseInt(ex.reps, 10) <= 0) f.reps = "Must be > 0";
        return Object.keys(f).length > 0 ? f : null;
      });
      if (exerciseErrors.some((e) => e !== null)) errs.exerciseErrors = exerciseErrors;
    } else {
      const mealErrors = form.meals.map((m) => {
        const f = {};
        if (!m.time.trim()) f.time = "Required";
        const items = m.items.split(",").map((i) => i.trim()).filter(Boolean);
        if (items.length === 0) f.items = "At least one item";
        return Object.keys(f).length > 0 ? f : null;
      });
      if (mealErrors.some((e) => e !== null)) errs.mealErrors = mealErrors;
    }

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function buildPayload() {
    const base = {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      category: form.category.trim() || undefined,
      difficulty: form.difficulty.trim() || undefined,
      tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : undefined,
    };

    if (isWorkout) {
      return {
        ...base,
        estimatedDuration: form.estimatedDuration ? parseInt(form.estimatedDuration, 10) : undefined,
        exercises: form.exercises.map((ex) => ({
          name: ex.name.trim(),
          sets: parseInt(ex.sets, 10),
          reps: parseInt(ex.reps, 10),
        })),
      };
    }

    return {
      ...base,
      meals: form.meals.map((m) => ({
        time: m.time.trim(),
        items: m.items.split(",").map((i) => i.trim()).filter(Boolean),
      })),
    };
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    setError("");
    const payload = buildPayload();

    try {
      if (isWorkout) {
        if (modal === "add") {
          const res = await createGlobalWorkoutPreset(payload);
          setWorkoutPresets((prev) => [...prev, res.data]);
        } else {
          const res = await updateGlobalWorkoutPreset(modal.id, payload);
          setWorkoutPresets((prev) => prev.map((p) => (p.id === modal.id ? res.data : p)));
        }
      } else {
        if (modal === "add") {
          const res = await createGlobalDietPreset(payload);
          setDietPresets((prev) => [...prev, res.data]);
        } else {
          const res = await updateGlobalDietPreset(modal.id, payload);
          setDietPresets((prev) => prev.map((p) => (p.id === modal.id ? res.data : p)));
        }
      }
      addToast("Template saved successfully", "success");
      setModal(null);
    } catch (err) {
      const msg = err.response?.data?.error || "Failed to save template";
      setError(msg);
      addToast(msg, "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    setDeleting(true);
    try {
      if (isWorkout) {
        await deleteGlobalWorkoutPreset(id);
        setWorkoutPresets((prev) => prev.filter((p) => p.id !== id));
      } else {
        await deleteGlobalDietPreset(id);
        setDietPresets((prev) => prev.filter((p) => p.id !== id));
      }
      setDeleteTarget(null);
      addToast("Template deleted", "success");
    } catch (err) {
      addToast(err.response?.data?.error || "Delete failed", "error");
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-56 bg-gray-200 rounded animate-pulse" />
        <div className="flex gap-2"><div className="h-10 w-36 bg-gray-200 rounded-xl animate-pulse" /><div className="h-10 w-36 bg-gray-200 rounded-xl animate-pulse" /></div>
        <div className="h-32 bg-gray-100 rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Global Preset Library"
        subtitle="Manage workout and diet templates available to all trainers"
        actions={
          <button
            type="button"
            onClick={openAdd}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition text-sm font-semibold shadow-sm shadow-indigo-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Template
          </button>
        }
      />

      <div className="flex gap-2">
        {TABS.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => { setTab(t.value); setModal(null); setDeleteTarget(null); }}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
              tab === t.value
                ? "bg-indigo-600 text-white shadow-sm shadow-indigo-200"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error && (
        <div role="alert" className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>
      )}

      {presets.length === 0 ? (
        <EmptyState
          icon="Presets"
          title="No templates yet"
          message={`Create your first ${isWorkout ? "workout" : "diet"} template for trainers to import.`}
          action={
            <button type="button" onClick={openAdd} className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition text-sm font-semibold">
              + Add Template
            </button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {presets.map((preset) => (
            <div key={preset.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">{preset.name}</h3>
                  {preset.description && <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{preset.description}</p>}
                </div>
                <div className="flex gap-2 shrink-0">
                  <button type="button" onClick={() => openEdit(preset)} className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition text-xs font-semibold">Edit</button>
                  <button type="button" onClick={() => setDeleteTarget(preset)} className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition text-xs font-semibold">Delete</button>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {preset.category && <span className="inline-flex px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-xs font-medium">{preset.category}</span>}
                {preset.difficulty && <span className="inline-flex px-2 py-0.5 bg-amber-50 text-amber-600 rounded-full text-xs font-medium">{preset.difficulty}</span>}
                {isWorkout && preset.estimatedDuration && <span className="inline-flex px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">~{preset.estimatedDuration}min</span>}
                {isWorkout && <span className="inline-flex px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full text-xs font-medium">{Array.isArray(preset.exercises) ? preset.exercises.length : 0} exercises</span>}
                {!isWorkout && <span className="inline-flex px-2 py-0.5 bg-purple-50 text-purple-600 rounded-full text-xs font-medium">{Array.isArray(preset.meals) ? preset.meals.length : 0} meals</span>}
                {Array.isArray(preset.tags) && preset.tags.map((tag, i) => (
                  <span key={i} className="inline-flex px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-xs">{tag}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" role="dialog" aria-modal="true">
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              {modal === "add" ? `Add ${isWorkout ? "Workout" : "Diet"} Template` : "Edit Template"}
            </h2>
            <p className="text-sm text-gray-500 mb-5">
              {modal === "add" ? `Create a new global ${isWorkout ? "workout" : "diet"} template` : "Update the template details"}
            </p>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Name <span className="text-red-400">*</span></label>
                <input type="text" value={form.name} onChange={(e) => { setForm((f) => ({ ...f, name: e.target.value })); setFieldErrors((prev) => ({ ...prev, name: "" })); }} className={`w-full px-3 py-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-gray-900 ${fieldErrors.name ? "border-red-300 bg-red-50" : "border-gray-300"}`} placeholder="e.g. Beginner Full Body" autoFocus />
                {fieldErrors.name && <p className="mt-1 text-xs text-red-500">{fieldErrors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                <textarea rows={2} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 resize-none" placeholder="Brief description..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
                  <input type="text" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900" placeholder="e.g. Strength, Cardio" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Difficulty</label>
                  <input type="text" value={form.difficulty} onChange={(e) => setForm((f) => ({ ...f, difficulty: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900" placeholder="e.g. Beginner, Advanced" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Tags (comma separated)</label>
                <input type="text" value={form.tags} onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900" placeholder="e.g. upper body, no equipment, beginner" />
              </div>

              {isWorkout && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Estimated Duration (minutes)</label>
                    <input type="number" min="1" value={form.estimatedDuration} onChange={(e) => setForm((f) => ({ ...f, estimatedDuration: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900" placeholder="e.g. 45" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Exercises</span>
                      <button type="button" onClick={addExercise} className="text-xs px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition font-semibold">+ Add</button>
                    </div>
                    <div className="space-y-3">
                      {form.exercises.map((ex, i) => {
                        const exErr = fieldErrors.exerciseErrors?.[i];
                        return (
                          <div key={i} className="border border-gray-200 rounded-xl p-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-semibold text-gray-500">Exercise {i + 1}</span>
                              {form.exercises.length > 1 && <button type="button" onClick={() => removeExercise(i)} className="text-xs text-red-500 hover:text-red-700 font-medium">Remove</button>}
                            </div>
                            <div className="space-y-2">
                              <input type="text" placeholder="Name" value={ex.name} onChange={(e) => handleExerciseChange(i, "name", e.target.value)} className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 ${exErr?.name ? "border-red-300 bg-red-50" : "border-gray-300"}`} />
                              <div className="grid grid-cols-2 gap-2">
                                <input type="number" placeholder="Sets" min="1" value={ex.sets} onChange={(e) => handleExerciseChange(i, "sets", e.target.value)} className={`px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 ${exErr?.sets ? "border-red-300 bg-red-50" : "border-gray-300"}`} />
                                <input type="number" placeholder="Reps" min="1" value={ex.reps} onChange={(e) => handleExerciseChange(i, "reps", e.target.value)} className={`px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 ${exErr?.reps ? "border-red-300 bg-red-50" : "border-gray-300"}`} />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              {!isWorkout && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Meals</span>
                    <button type="button" onClick={addMeal} className="text-xs px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition font-semibold">+ Add</button>
                  </div>
                  <div className="space-y-3">
                    {form.meals.map((meal, i) => {
                      const mErr = fieldErrors.mealErrors?.[i];
                      return (
                        <div key={i} className="border border-gray-200 rounded-xl p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-gray-500">Meal {i + 1}</span>
                            {form.meals.length > 1 && <button type="button" onClick={() => removeMeal(i)} className="text-xs text-red-500 hover:text-red-700 font-medium">Remove</button>}
                          </div>
                          <div className="space-y-2">
                            <input type="text" placeholder="Time (e.g. Breakfast)" value={meal.time} onChange={(e) => handleMealChange(i, "time", e.target.value)} className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 ${mErr?.time ? "border-red-300 bg-red-50" : "border-gray-300"}`} />
                            <input type="text" placeholder="Items, comma separated (e.g. Oats, Banana, Milk)" value={meal.items} onChange={(e) => handleMealChange(i, "items", e.target.value)} className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 ${mErr?.items ? "border-red-300 bg-red-50" : "border-gray-300"}`} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

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
        title="Delete Template"
        message={deleteTarget ? `Are you sure you want to delete "${deleteTarget.name}"? Trainers who imported this will keep their copy.` : ""}
        confirmLabel={deleting ? "Deleting..." : "Delete"}
        cancelLabel="Cancel"
        danger
        onConfirm={() => handleDelete(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
