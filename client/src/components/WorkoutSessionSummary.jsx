export default function WorkoutSessionSummary({ data, progress, onViewDashboard }) {
  const exercises = data?.exercises || [];
  const totalSets = progress.reduce((s, p) => s + p.setsCompleted, 0);
  const completedAt = data?.completedAt
    ? new Date(data.completedAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    : "just now";

  return (
    <div className="space-y-6 animate-bounce-in">
      {/* Hero */}
      <div className="text-center py-6 space-y-3">
        <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center animate-bounce-in">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Workout Complete!</h2>
        <p className="text-gray-500 text-sm">Finished at {completedAt}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Exercises", value: exercises.length, color: "text-indigo-600", bg: "bg-indigo-50" },
          { label: "Sets", value: totalSets, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Duration", value: `~${Math.max(1, totalSets * 2)} min`, color: "text-amber-600", bg: "bg-amber-50" },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-4 text-center`}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Exercise breakdown */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-900">Exercise Summary</h3>
        {exercises.map((ex, i) => {
          const p = progress[i] || {};
          const setData = p.sets || [];
          return (
            <div key={i} className="bg-white border border-gray-100 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-green-100 flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </span>
                  <span className="text-sm font-semibold text-gray-900">{ex.name}</span>
                </div>
                <span className="text-xs text-gray-400">{p.setsCompleted}/{p.totalSets} sets</span>
              </div>

              {/* Per-set data */}
              {setData.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {setData.slice(0, p.setsCompleted).map((s, si) => (
                    <div key={si} className="bg-gray-50 rounded-lg px-2.5 py-1.5 text-xs text-gray-600">
                      Set {si + 1}: {s.weight || "—"} kg × {s.reps || "—"} reps
                    </div>
                  ))}
                </div>
              )}

              {/* Notes */}
              {p.notes && (
                <p className="text-xs text-gray-500 italic">
                  Note: {p.notes}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* CTA */}
      <button
        type="button"
        onClick={onViewDashboard}
        className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm transition"
      >
        Back to Dashboard
      </button>
    </div>
  );
}
