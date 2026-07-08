import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { assignWorkout } from "../../api/trainer";
import { getWorkoutPresets } from "../../api/trainerPresets";
import { useToast } from "../../context/ToastContext";
import PageHeader from "../../components/PageHeader";

const DAYS = [
  "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday",
];

export default function AssignWorkout() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state: locationState } = useLocation();
  const { addToast } = useToast();

  const [mode, setMode] = useState("custom");
  const [presets, setPresets] = useState([]);
  const [presetsLoading, setPresetsLoading] = useState(false);

  const [day, setDay] = useState(locationState?.prefillDay || "");
  const [exercises, setExercises] = useState(
    locationState?.prefillExercises || [
      { name: "", sets: "", reps: "" },
    ],
  );
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (mode !== "preset") return;
    setPresetsLoading(true);
    getWorkoutPresets()
      .then((res) => setPresets(res.data))
      .catch(() => {})
      .finally(() => setPresetsLoading(false));
  }, [mode]);

  function handleExerciseChange(index, field, value) {
    setExercises((prev) =>
      prev.map((ex, i) => (i === index ? { ...ex, [field]: value } : ex)),
    );
  }

  function addExercise() {
    setExercises((prev) => [...prev, { name: "", sets: "", reps: "" }]);
  }

  function removeExercise(index) {
    setExercises((prev) => prev.filter((_, i) => i !== index));
  }

  function loadPreset(preset) {
    setExercises(
      preset.exercises.map((ex) => ({
        name: ex.name,
        sets: ex.sets.toString(),
        reps: ex.reps.toString(),
      })),
    );
  }

  function validate() {
    const errs = {};
    if (!day.trim()) errs.day = "Please select a day";
    if (exercises.length === 0) errs.exercises = "At least one exercise is required";
    const exerciseErrors = [];
    for (let i = 0; i < exercises.length; i++) {
      const ex = exercises[i];
      const fields = {};
      if (!ex.name.trim()) fields.name = "Required";
      if (!ex.sets || parseInt(ex.sets, 10) <= 0) fields.sets = "Must be > 0";
      if (!ex.reps || parseInt(ex.reps, 10) <= 0) fields.reps = "Must be > 0";
      exerciseErrors[i] = Object.keys(fields).length > 0 ? fields : null;
    }
    if (exerciseErrors.some((e) => e !== null)) {
      errs.exerciseErrors = exerciseErrors;
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!validate()) return;

    setSaving(true);
    try {
      await assignWorkout(id, {
        day,
        exercises: exercises.map((ex) => ({
          name: ex.name.trim(),
          sets: parseInt(ex.sets, 10),
          reps: parseInt(ex.reps, 10),
        })),
      });
      addToast("Workout assigned successfully", "success");
      navigate("/trainer/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to assign workout");
      addToast(err.response?.data?.error || "Failed to assign workout", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assign Workout"
        subtitle="Create a workout plan for this trainee"
      />

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => { setMode("custom"); setExercises([{ name: "", sets: "", reps: "" }]); }}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
            mode === "custom"
              ? "bg-indigo-600 text-white shadow-sm shadow-indigo-200"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Create Custom
        </button>
        <button
          type="button"
          onClick={() => setMode("preset")}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
            mode === "preset"
              ? "bg-indigo-600 text-white shadow-sm shadow-indigo-200"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Use Preset
        </button>
      </div>

      {mode === "preset" && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Select a Preset</h2>
          {presetsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin h-6 w-6 border-2 border-indigo-600 border-t-transparent rounded-full" />
            </div>
          ) : presets.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              No workout presets yet.{" "}
              <button type="button" onClick={() => navigate("/trainer/presets/workout")}
                className="text-indigo-600 hover:text-indigo-700 font-medium">Create one</button>.
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {presets.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => loadPreset(p)}
                  className="text-left border border-gray-200 rounded-xl p-4 hover:border-indigo-300 hover:bg-indigo-50/50 transition"
                >
                  <p className="text-sm font-semibold text-gray-900">{p.name}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {Array.isArray(p.exercises) ? p.exercises.length : 0} exercises
                    {p.difficulty ? ` · ${p.difficulty}` : ""}
                    {p.estimatedDuration ? ` · ~${p.estimatedDuration}min` : ""}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {error && (
        <div role="alert" className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-start gap-2.5">
          <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Day</h2>
          <div>
            <label htmlFor="day" className="block text-sm font-medium text-gray-700 mb-1.5">
              Select Day <span className="text-red-400">*</span>
            </label>
            <select
              id="day"
              value={day}
              onChange={(e) => { setDay(e.target.value); setFieldErrors((prev) => ({ ...prev, day: "" })); }}
              className={`w-full max-w-xs px-3 py-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-gray-900 ${
                fieldErrors.day ? "border-red-300 bg-red-50" : "border-gray-300"
              }`}
            >
              <option value="">Choose a day</option>
              {DAYS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            {fieldErrors.day && (
              <p className="mt-1 text-xs text-red-500">{fieldErrors.day}</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Exercises</h2>
              <p className="text-sm text-gray-500">
                Add exercises for this day ({exercises.length} added)
              </p>
            </div>
            <button
              type="button"
              onClick={addExercise}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition text-sm font-semibold"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Add Exercise
            </button>
          </div>

          <div className="space-y-4">
            {exercises.map((exercise, index) => {
              const exErr = fieldErrors.exerciseErrors?.[index];
              return (
                <div
                  key={index}
                  className="border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </span>
                      <span className="text-sm font-semibold text-gray-700">
                        Exercise {index + 1}
                      </span>
                    </div>
                    {exercises.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeExercise(index)}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-500 hover:bg-red-50 rounded-lg transition font-medium"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Exercise Name <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Bench Press"
                        value={exercise.name}
                        onChange={(e) => handleExerciseChange(index, "name", e.target.value)}
                        className={`w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-gray-900 ${
                          exErr?.name ? "border-red-300 bg-red-50" : "border-gray-300"
                        }`}
                      />
                      {exErr?.name && <p className="mt-1 text-xs text-red-500">{exErr.name}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Sets <span className="text-red-400">*</span></label>
                        <input
                          type="number" min="1" placeholder="4"
                          value={exercise.sets}
                          onChange={(e) => handleExerciseChange(index, "sets", e.target.value)}
                          className={`w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-gray-900 ${
                            exErr?.sets ? "border-red-300 bg-red-50" : "border-gray-300"
                          }`}
                        />
                        {exErr?.sets && <p className="mt-1 text-xs text-red-500">{exErr.sets}</p>}
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Reps <span className="text-red-400">*</span></label>
                        <input
                          type="number" min="1" placeholder="10"
                          value={exercise.reps}
                          onChange={(e) => handleExerciseChange(index, "reps", e.target.value)}
                          className={`w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-gray-900 ${
                            exErr?.reps ? "border-red-300 bg-red-50" : "border-gray-300"
                          }`}
                        />
                        {exErr?.reps && <p className="mt-1 text-xs text-red-500">{exErr.reps}</p>}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {fieldErrors.exercises && (
            <p className="mt-3 text-xs text-red-500">{fieldErrors.exercises}</p>
          )}
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate("/trainer/dashboard")}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition font-medium text-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold text-sm shadow-sm shadow-indigo-200"
          >
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Saving...
              </span>
            ) : "Save Workout"}
          </button>
        </div>
      </form>
    </div>
  );
}
