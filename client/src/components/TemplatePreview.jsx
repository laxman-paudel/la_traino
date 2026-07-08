const difficultyColors = {
  Beginner: "bg-emerald-100 text-emerald-700",
  Intermediate: "bg-amber-100 text-amber-700",
  Advanced: "bg-red-100 text-red-700",
};

export default function TemplatePreview({ template, onClose }) {
  if (!template) return null;

  const exercises = Array.isArray(template.exercises) ? template.exercises : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">{template.name}</h2>
          <button type="button" onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {template.description && <p className="text-sm text-gray-500 mb-3">{template.description}</p>}

        <div className="flex flex-wrap gap-2 text-xs text-gray-400 mb-4">
          {template.difficulty && (
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${difficultyColors[template.difficulty] || "bg-gray-100 text-gray-700"}`}>
              {template.difficulty}
            </span>
          )}
          {template.estimatedDuration && <span>~{template.estimatedDuration} min</span>}
          <span>{exercises.length} exercise{exercises.length !== 1 ? "s" : ""}</span>
        </div>

        <h3 className="text-sm font-semibold text-gray-700 mb-2">Exercises</h3>
        <div className="space-y-2">
          {exercises.map((ex, i) => (
            <div key={i} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-2.5">
              <span className="text-sm font-medium text-gray-900">{ex.name}</span>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span>{ex.sets}×{ex.reps}</span>
                {ex.weight && <span>{ex.weight}</span>}
                {ex.restTime && <span>rest {ex.restTime}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
