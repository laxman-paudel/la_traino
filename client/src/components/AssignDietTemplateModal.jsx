import { useState, useEffect } from "react";
import { getDashboard } from "../api/trainer";
import { assignDietTemplate } from "../api/dietTemplates";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const STEPS = { SELECT_TRAINEES: 0, SELECT_DAY: 1, PREVIEW: 2, RESULT: 3 };

export default function AssignDietTemplateModal({ template, isOpen, onClose, onComplete }) {
  const [step, setStep] = useState(STEPS.SELECT_TRAINEES);
  const [trainees, setTrainees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [search, setSearch] = useState("");
  const [day, setDay] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    setStep(STEPS.SELECT_TRAINEES); setSelectedIds([]); setSearch(""); setDay(""); setSubmitting(false); setResult(null);
    setLoading(true);
    getDashboard()
      .then((res) => setTrainees(res.data.trainees || []))
      .catch(() => setTrainees([]))
      .finally(() => setLoading(false));
  }, [isOpen]);

  if (!isOpen || !template) return null;

  const filtered = trainees.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()) || t.email.toLowerCase().includes(search.toLowerCase())
  );

  function toggleTrainee(id) {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  }

  function toggleAll() {
    if (selectedIds.length === filtered.length) setSelectedIds([]);
    else setSelectedIds(filtered.map((t) => t.id));
  }

  function nameForId(id) {
    const t = trainees.find((tr) => tr.id === id);
    return t ? t.name : `Trainee #${id}`;
  }

  function countFoods() {
    const meals = template.meals || {};
    return Object.values(meals).reduce((sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0), 0);
  }

  async function handleConfirm() {
    if (!day || selectedIds.length === 0) return;
    setSubmitting(true);
    try {
      const res = await assignDietTemplate(template.id, { traineeIds: selectedIds, day });
      setResult(res.data);
      setStep(STEPS.RESULT);
      onComplete?.(res.data);
    } catch (err) {
      setResult({
        total: selectedIds.length, succeeded: 0, failed: selectedIds.length,
        results: selectedIds.map((id) => ({ traineeId: id, success: false, error: err.response?.data?.error || "Request failed" })),
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
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {step === STEPS.RESULT ? "Assignment Result"
                : step === STEPS.PREVIEW ? "Preview Assignment"
                : step === STEPS.SELECT_DAY ? "Select Day"
                : `Assign: ${template.name}`}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {step === STEPS.SELECT_TRAINEES ? "Choose trainees for this diet plan"
                : step === STEPS.SELECT_DAY ? `Selected ${selectedIds.length} trainee${selectedIds.length !== 1 ? "s" : ""}`
                : "Review before assigning"}
            </p>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-5">
          <div className="flex items-center gap-2 mb-5">
            {["Select Trainees", "Select Day", "Preview"].map((label, i) => (
              <div key={label} className="flex items-center gap-2">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  i < step ? "bg-green-500 text-white" : i === step ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-500"
                }`}>
                  {i < step ? (
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  ) : i + 1}
                </span>
                <span className={`text-xs font-medium ${i === step ? "text-gray-900" : "text-gray-400"}`}>{label}</span>
                {i < 2 && <span className="text-gray-300 text-xs">→</span>}
              </div>
            ))}
          </div>

          {step === STEPS.SELECT_TRAINEES && (
            <div>
              {loading ? (
                <div className="flex items-center justify-center py-8"><div className="animate-spin h-6 w-6 border-2 border-indigo-600 border-t-transparent rounded-full" /></div>
              ) : trainees.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No linked trainees found.</p>
              ) : (
                <div>
                  <div className="relative mb-3">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search trainees..."
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm" />
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={filtered.length > 0 && selectedIds.length === filtered.length} onChange={toggleAll}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                      <span className="text-gray-600 font-medium">Select All ({filtered.length})</span>
                    </label>
                    <span className="text-xs text-gray-400">{selectedIds.length} selected</span>
                  </div>
                  <div className="max-h-56 overflow-y-auto space-y-1.5">
                    {filtered.map((t) => (
                      <label key={t.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${
                        selectedIds.includes(t.id) ? "border-indigo-200 bg-indigo-50" : "border-gray-100 hover:border-gray-200"
                      }`}>
                        <input type="checkbox" checked={selectedIds.includes(t.id)} onChange={() => toggleTrainee(t.id)}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900">{t.name}</p>
                          <p className="text-xs text-gray-400 truncate">{t.email}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {step === STEPS.SELECT_DAY && (
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Select Day <span className="text-red-400">*</span></label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {DAYS.map((d) => (
                  <button key={d} type="button" onClick={() => setDay(d)}
                    className={`py-3 px-3 rounded-xl text-sm font-medium border transition ${
                      day === d ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-gray-700 border-gray-200 hover:border-indigo-300"
                    }`}>{d}</button>
                ))}
              </div>
            </div>
          )}

          {step === STEPS.PREVIEW && (
            <div className="space-y-4">
              <div className="bg-indigo-50 rounded-xl p-4">
                <p className="text-sm font-semibold text-gray-900">Diet Template</p>
                <p className="text-sm text-gray-600">{template.name}</p>
                <p className="text-xs text-gray-400 mt-1">{countFoods()} foods across multiple meals</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Assigning to ({selectedIds.length})</p>
                <div className="max-h-28 overflow-y-auto space-y-1">
                  {selectedIds.map((id) => (
                    <div key={id} className="flex items-center gap-2 text-sm text-gray-600">
                      <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {nameForId(id)}
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-amber-50 rounded-xl p-3">
                <p className="text-sm text-amber-800"><span className="font-medium">Day:</span> {day}</p>
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
                  {result.results.filter((r) => !r.success).map((r) => (
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
            </div>
          )}

          {step !== STEPS.RESULT && (
            <div className="flex gap-3 pt-4 border-t border-gray-100 mt-4">
              {step > STEPS.SELECT_TRAINEES && (
                <button type="button" onClick={() => setStep((s) => s - 1)} disabled={submitting}
                  className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition font-medium text-sm">Back</button>
              )}
              <button type="button"
                onClick={step === STEPS.PREVIEW ? handleConfirm : () => setStep((s) => s + 1)}
                disabled={(step === STEPS.SELECT_TRAINEES && selectedIds.length === 0) || (step === STEPS.SELECT_DAY && !day) || submitting}
                className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold text-sm shadow-sm shadow-indigo-200">
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                    Assigning...
                  </span>
                ) : step === STEPS.PREVIEW ? `Assign to ${selectedIds.length} Trainee${selectedIds.length !== 1 ? "s" : ""}` : "Next"}
              </button>
            </div>
          )}

          {step === STEPS.RESULT && (
            <button type="button" onClick={onClose}
              className="w-full py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition font-semibold text-sm mt-4">Done</button>
          )}
        </div>
      </div>
    </div>
  );
}
