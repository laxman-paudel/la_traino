import { useState, useEffect } from "react";
import { getFoods } from "../api/foods";

const MEAL_TIMES = [
  { key: "breakfast", label: "Breakfast", icon: "🌅" },
  { key: "lunch", label: "Lunch", icon: "☀️" },
  { key: "dinner", label: "Dinner", icon: "🌙" },
  { key: "snack", label: "Snack", icon: "🍪" },
  { key: "preWorkout", label: "Pre-Workout", icon: "⚡" },
  { key: "postWorkout", label: "Post-Workout", icon: "💪" },
];

export default function MealBuilder({ meals, onChange }) {
  const [foods, setFoods] = useState([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [activeMeal, setActiveMeal] = useState("breakfast");

  useEffect(() => {
    getFoods({ limit: 500 })
      .then((res) => setFoods(res.data || []))
      .catch(() => {});
  }, []);

  const filtered = foods.filter((f) => {
    if (search && !f.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (categoryFilter && f.category !== categoryFilter) return false;
    return true;
  });

  function addFood(food) {
    const current = meals[activeMeal] || [];
    const exists = current.some((f) => f.foodId === food.id);
    if (exists) return;
    onChange({
      ...meals,
      [activeMeal]: [...current, { foodId: food.id, name: food.name, quantity: food.servingSize || "1 serving" }],
    });
  }

  function removeFood(mealKey, index) {
    const current = meals[mealKey] || [];
    onChange({
      ...meals,
      [mealKey]: current.filter((_, i) => i !== index),
    });
  }

  function updateFood(mealKey, index, field, value) {
    const current = meals[mealKey] || [];
    const updated = current.map((f, i) => (i === index ? { ...f, [field]: value } : f));
    onChange({ ...meals, [mealKey]: updated });
  }

  const categories = [...new Set(foods.map((f) => f.category))];

  return (
    <div className="space-y-4">
      {/* Meal tabs */}
      <div className="flex flex-wrap gap-2">
        {MEAL_TIMES.map((mt) => {
          const count = (meals[mt.key] || []).length;
          return (
            <button key={mt.key} type="button" onClick={() => setActiveMeal(mt.key)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition ${
                activeMeal === mt.key
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300"
              }`}>
              <span>{mt.icon}</span>
              <span>{mt.label}</span>
              {count > 0 && (
                <span className={`ml-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                  activeMeal === mt.key ? "bg-white/20 text-white" : "bg-indigo-100 text-indigo-600"
                }`}>{count}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Active meal foods */}
      <div className="bg-gray-50 rounded-2xl p-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">
          {MEAL_TIMES.find((m) => m.key === activeMeal)?.label}
          {meals[activeMeal]?.length > 0 && <span className="text-gray-400 font-normal ml-1">({meals[activeMeal].length} items)</span>}
        </h4>

        {(!meals[activeMeal] || meals[activeMeal].length === 0) ? (
          <p className="text-sm text-gray-400 text-center py-4">No foods added yet. Search and add from below.</p>
        ) : (
          <div className="space-y-2">
            {meals[activeMeal].map((item, i) => (
              <div key={i} className="flex items-center gap-2 bg-white rounded-xl px-3 py-2.5 border border-gray-200">
                <span className="text-sm font-medium text-gray-900 flex-1 min-w-0 truncate">{item.name}</span>
                <input type="text" value={item.quantity || ""} onChange={(e) => updateFood(activeMeal, i, "quantity", e.target.value)}
                  placeholder="qty" className="w-20 px-2 py-1 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 text-center" />
                <button type="button" onClick={() => removeFood(activeMeal, i)} className="p-1 text-red-400 hover:text-red-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Food search */}
      <div>
        <div className="flex gap-2 mb-3">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search foods..."
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm" />
          </div>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm text-gray-700">
            <option value="">All</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="max-h-40 overflow-y-auto space-y-1">
          {filtered.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-3">No foods found</p>
          ) : (
            filtered.map((f) => {
              const added = (meals[activeMeal] || []).some((x) => x.foodId === f.id);
              return (
                <div key={f.id} className="flex items-center justify-between bg-white rounded-xl px-3 py-2 border border-gray-100 hover:border-indigo-200 transition">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{f.name}</p>
                    <p className="text-[11px] text-gray-400">
                      {f.calories && <span>{f.calories} cal</span>}
                      {f.servingSize && <span> · {f.servingSize}</span>}
                    </p>
                  </div>
                  <button type="button" onClick={() => addFood(f)} disabled={added}
                    className={`shrink-0 px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                      added ? "bg-green-50 text-green-600 border border-green-200" : "bg-indigo-600 text-white hover:bg-indigo-700"
                    }`}>
                    {added ? "Added" : "+ Add"}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
