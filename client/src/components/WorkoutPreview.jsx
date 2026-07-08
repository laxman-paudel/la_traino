export default function WorkoutPreview({ open, day, exercises, onClose, onConfirm, saving }) {
  if (!open) return null;

  const totalSets = exercises.reduce((s, ex) => s + (parseInt(ex.sets, 10) || 0), 0);
  const estMin = exercises.reduce((s, ex) => {
    const sets = parseInt(ex.sets, 10) || 3;
    const rest = ex.restTime ? parseInt(ex.restTime, 10) || 60 : 60;
    return s + sets * (rest + 30) / 60;
  }, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto" role="dialog" aria-modal="true">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Workout Preview</h2>
          <button type="button" onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-gray-900">{day || "No day selected"}</span>
            <span className="text-gray-500">{exercises.length} exercises · ~{Math.round(estMin)} min</span>
          </div>

          <div className="divide-y divide-gray-100">
            {exercises.map((ex, i) => (
              <div key={ex._key || i} className="py-3 flex items-start gap-3">
                <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold shrink-0">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{ex._name}</p>
                  <p className="text-xs text-gray-500">
                    {ex.sets || "?"} × {ex.reps || "?"}
                    {ex.weight ? ` · ${ex.weight} kg` : ""}
                    {ex.restTime ? ` · Rest ${ex.restTime}` : ""}
                    {ex.tempo ? ` · Tempo ${ex.tempo}` : ""}
                  </p>
                  {ex.notes && <p className="text-xs text-amber-600 mt-0.5">Note: {ex.notes}</p>}
                </div>
                <span className="text-[10px] font-medium text-gray-400 capitalize px-2 py-0.5 rounded bg-gray-100">
                  {ex._category}
                </span>
              </div>
            ))}
          </div>

          <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600">
            <p className="font-medium text-gray-900 mb-1">Summary</p>
            <p>Total exercises: {exercises.length}</p>
            <p>Total sets: {totalSets}</p>
            <p>Estimated duration: ~{Math.round(estMin)} minutes</p>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={saving}
            className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : "Save Workout"}
          </button>
        </div>
      </div>
    </div>
  );
}
