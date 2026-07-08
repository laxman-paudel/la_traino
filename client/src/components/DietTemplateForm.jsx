import { useState } from "react";
import MealBuilder from "./MealBuilder";

const EMPTY_MEALS = { breakfast: [], lunch: [], dinner: [], snack: [], preWorkout: [], postWorkout: [] };

export default function DietTemplateForm({ template, onSave, onClose }) {
  const isEdit = !!template?.id;
  const [name, setName] = useState(template?.name || "");
  const [description, setDescription] = useState(template?.description || "");
  const [meals, setMeals] = useState(template?.meals || EMPTY_MEALS);
  const [saving, setSaving] = useState(false);

  function hasAnyFood() {
    return Object.values(meals).some((arr) => Array.isArray(arr) && arr.length > 0);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim() || !hasAnyFood()) return;
    setSaving(true);
    try {
      await onSave({
        name: name.trim(),
        description: description.trim() || null,
        meals,
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto" role="dialog" aria-modal="true">
        <h2 className="text-xl font-bold text-gray-900 mb-1">
          {isEdit ? "Edit Diet Template" : "New Diet Template"}
        </h2>
        <p className="text-sm text-gray-500 mb-5">Build a meal plan once, assign to many</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name <span className="text-red-400">*</span></label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900" autoFocus />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 resize-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Meals <span className="text-red-400">*</span></label>
            <MealBuilder meals={meals} onChange={setMeals} />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition font-medium text-sm">Cancel</button>
            <button type="submit" disabled={saving || !name.trim() || !hasAnyFood()}
              className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold text-sm shadow-sm shadow-indigo-200">
              {saving ? "Saving..." : isEdit ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
