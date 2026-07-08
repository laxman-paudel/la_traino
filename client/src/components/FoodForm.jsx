import { useState } from "react";

const CATEGORIES = ["protein", "carbs", "vegetables", "fruits", "dairy", "grains", "fats", "beverages", "snacks", "condiments"];

export default function FoodForm({ food, onSave, onClose }) {
  const isEdit = !!food?.id;
  const [form, setForm] = useState({
    name: food?.name || "",
    category: food?.category || "",
    servingSize: food?.servingSize || "",
    calories: food?.calories ?? "",
    protein: food?.protein ?? "",
    carbs: food?.carbs ?? "",
    fat: food?.fat ?? "",
    imageUrl: food?.imageUrl || "",
    description: food?.description || "",
  });
  const [saving, setSaving] = useState(false);

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.category) return;
    setSaving(true);
    try {
      await onSave({
        ...form,
        name: form.name.trim(),
        category: form.category,
        servingSize: form.servingSize || null,
        calories: form.calories || null,
        protein: form.protein || null,
        carbs: form.carbs || null,
        fat: form.fat || null,
        imageUrl: form.imageUrl || null,
        description: form.description || null,
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md max-h-[85vh] overflow-y-auto" role="dialog" aria-modal="true">
        <h2 className="text-xl font-bold text-gray-900 mb-1">
          {isEdit ? "Edit Food" : "Add New Food"}
        </h2>
        <p className="text-sm text-gray-500 mb-5">{isEdit ? "Update food details" : "Add a food to the library"}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name <span className="text-red-400">*</span></label>
            <input type="text" value={form.name} onChange={(e) => set("name", e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900" autoFocus />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category <span className="text-red-400">*</span></label>
            <select value={form.category} onChange={(e) => set("category", e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900">
              <option value="">Select...</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Serving Size</label>
              <input type="text" value={form.servingSize} onChange={(e) => set("servingSize", e.target.value)} placeholder="e.g. 100g"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Calories</label>
              <input type="number" min="0" value={form.calories} onChange={(e) => set("calories", e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Protein (g)</label>
              <input type="number" min="0" step="0.1" value={form.protein} onChange={(e) => set("protein", e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Carbs (g)</label>
              <input type="number" min="0" step="0.1" value={form.carbs} onChange={(e) => set("carbs", e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fat (g)</label>
              <input type="number" min="0" step="0.1" value={form.fat} onChange={(e) => set("fat", e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
            <input type="url" value={form.imageUrl} onChange={(e) => set("imageUrl", e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea rows={2} value={form.description} onChange={(e) => set("description", e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 resize-none" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition font-medium text-sm">Cancel</button>
            <button type="submit" disabled={saving || !form.name.trim() || !form.category}
              className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold text-sm shadow-sm shadow-indigo-200">
              {saving ? "Saving..." : isEdit ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
