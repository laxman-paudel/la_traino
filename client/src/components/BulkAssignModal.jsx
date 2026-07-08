import { useState, useEffect } from "react";
import { getWorkoutPresets, getDietPresets } from "../api/trainerPresets";
import { bulkAssignWorkout, bulkAssignDiet } from "../api/trainer";

const DAYS = [
  "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday",
];

const STEPS = { SELECT_PRESET: 0, PREVIEW: 1, RESULT: 2 };

export default function BulkAssignModal({ isOpen, onClose, type, trainees, onComplete }) {
  const [step, setStep] = useState(STEPS.SELECT_PRESET);
  const [presets, setPresets] = useState([]);
  const [presetsLoading, setPresetsLoading] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [day, setDay] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    setStep(STEPS.SELECT_PRESET);
    setSelectedPreset(null);
    setDay("");
    setSubmitting(false);
    setResult(null);
    setPresetsLoading(true);
    const fetcher = type === "workout" ? getWorkoutPresets : getDietPresets;
    fetcher()
      .then((res) => setPresets(res.data))
      .catch(() => setPresets([]))
      .finally(() => setPresetsLoading(false));
  }, [isOpen, type]);

  if (!isOpen) return null;

  const label = type === "workout" ? "Workout" : "Diet";

  function handleSelectPreset(preset) {
    setSelectedPreset(preset);
    setStep(STEPS.PREVIEW);
  }

  function handleBack() {
    setStep(STEPS.SELECT_PRESET);
    setSelectedPreset(null);
  }

  function nameForId(id) {
    const t = trainees.find((tr) => tr.id === id);
    return t ? t.name : `Trainee #${id}`;
  }

  async function handleConfirm() {
    if (!day || !selectedPreset) return;
    setSubmitting(true);
    const assigner = type === "workout" ? bulkAssignWorkout : bulkAssignDiet;
    const data = type === "workout"
      ? { day, exercises: selectedPreset.exercises }
      : { day, meals: selectedPreset.meals };
    try {
      const res = await assigner(
        trainees.map((t) => t.id),
        data,
      );
      setResult(res.data);
      setStep(STEPS.RESULT);
      onComplete?.(res.data);
    } catch (err) {
      setResult({
        total: trainees.length,
        succeeded: 0,
        failed: trainees.length,
        results: trainees.map((t) => ({
          traineeId: t.id,
          success: false,
          error: err.response?.data?.error || "Request failed",
        })),
      });
      setStep(STEPS.RESULT);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto" role="dialog" aria-modal="true">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">
            {step === STEPS.RESULT
              ? "Assignment Result"
              : step === STEPS.PREVIEW
                ? "Preview"
                : `Assign ${label} to ${trainees.length} Trainees`}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-5">
          {step === STEPS.SELECT_PRESET && (
            <div>
              {presetsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin h-6 w-6 border-2 border-indigo-600 border-t-transparent rounded-full" />
                </div>
              ) : presets.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  No {label.toLowerCase()} presets found.
                </p>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {presets.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleSelectPreset(p)}
                      className="w-full text-left border border-gray-200 rounded-xl p-3.5 hover:border-indigo-300 hover:bg-indigo-50/50 transition"
                    >
                      <p className="text-sm font-semibold text-gray-900">{p.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {type === "workout"
                          ? `${Array.isArray(p.exercises) ? p.exercises.length : 0} exercises`
                          : `${Array.isArray(p.meals) ? p.meals.length : 0} meals`}
                        {p.difficulty ? ` · ${p.difficulty}` : ""}
                        {p.estimatedDuration ? ` · ~${p.estimatedDuration}min` : ""}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === STEPS.PREVIEW && selectedPreset && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">
                  Selected Trainees ({trainees.length})
                </p>
                <div className="max-h-24 overflow-y-auto space-y-1">
                  {trainees.map((t) => (
                    <div key={t.id} className="flex items-center gap-2 text-sm text-gray-600">
                      <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {t.name}
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-100 pt-3">
                <p className="text-sm font-semibold text-gray-700 mb-2">
                  Preset: {selectedPreset.name}
                </p>
                {type === "workout" ? (
                  <div className="text-xs text-gray-500 space-y-1 max-h-28 overflow-y-auto">
                    {(selectedPreset.exercises || []).map((ex, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="w-5 h-5 bg-indigo-100 text-indigo-600 rounded flex items-center justify-center text-[10px] font-bold shrink-0">
                          {i + 1}
                        </span>
                        <span>
                          {ex.name} — {ex.sets}×{ex.reps}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-gray-500 space-y-1 max-h-28 overflow-y-auto">
                    {(selectedPreset.meals || []).map((meal, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="w-5 h-5 bg-indigo-100 text-indigo-600 rounded flex items-center justify-center text-[10px] font-bold shrink-0 mt-px">
                          {i + 1}
                        </span>
                        <div>
                          <span className="font-medium">{meal.time}</span>
                          <span className="text-gray-400">: </span>
                          <span>{Array.isArray(meal.items) ? meal.items.join(", ") : meal.items}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-gray-100 pt-3">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Select Day <span className="text-red-400">*</span>
                </label>
                <select
                  value={day}
                  onChange={(e) => setDay(e.target.value)}
                  className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-gray-900"
                >
                  <option value="">Choose a day</option>
                  {DAYS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={submitting}
                  className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition font-medium text-sm"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={!day || submitting}
                  className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold text-sm shadow-sm shadow-indigo-200"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Assigning...
                    </span>
                  ) : (
                    `Assign to ${trainees.length} Trainees`
                  )}
                </button>
              </div>
            </div>
          )}

          {step === STEPS.RESULT && result && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-green-50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-green-600">{result.succeeded}</p>
                  <p className="text-xs text-green-600/80">Succeeded</p>
                </div>
                <div className="flex-1 bg-red-50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-red-600">{result.failed}</p>
                  <p className="text-xs text-red-600/80">Failed</p>
                </div>
              </div>

              {result.failed > 0 && (
                <div className="max-h-48 overflow-y-auto space-y-1.5">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Failures</p>
                  {result.results
                    .filter((r) => !r.success)
                    .map((r) => (
                      <div key={r.traineeId} className="flex items-start gap-2 bg-red-50 rounded-lg p-2.5 text-sm">
                        <svg className="w-4 h-4 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <p className="font-medium text-red-700">{nameForId(r.traineeId)}</p>
                          <p className="text-red-500">{r.error}</p>
                        </div>
                      </div>
                    ))}
                </div>
              )}

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition font-semibold text-sm"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
