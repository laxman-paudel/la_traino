const MEAL_LABELS = { breakfast: "Breakfast", lunch: "Lunch", dinner: "Dinner", snack: "Snack", preWorkout: "Pre-Workout", postWorkout: "Post-Workout" };
const MEAL_ICONS = { breakfast: "🌅", lunch: "☀️", dinner: "🌙", snack: "🍪", preWorkout: "⚡", postWorkout: "💪" };

export default function DietTemplatePreview({ template, onClose }) {
  if (!template) return null;

  const mealKeys = Object.keys(MEAL_LABELS);

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

        {template.description && <p className="text-sm text-gray-500 mb-4">{template.description}</p>}

        <div className="space-y-3">
          {mealKeys.map((key) => {
            const foods = template.meals?.[key] || [];
            if (foods.length === 0) return null;
            return (
              <div key={key} className="bg-gray-50 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">{MEAL_ICONS[key]} {MEAL_LABELS[key]}</h3>
                <div className="space-y-1.5">
                  {foods.map((f, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="text-gray-900">{f.name}</span>
                      <span className="text-xs text-gray-500">{f.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {!mealKeys.some((k) => (template.meals?.[k] || []).length > 0) && (
          <p className="text-sm text-gray-400 text-center py-4">No foods in this template</p>
        )}
      </div>
    </div>
  );
}
