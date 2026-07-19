import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { assignDiet } from "../../api/trainer";
import { getDietPresets } from "../../api/trainerPresets";
import { useToast } from "../../context/ToastContext";
import PageHeader from "../../components/PageHeader";
import DatePicker, { todayStr } from "../../components/DatePicker";

function FoodChips({ items }) {
  const parsed = items
    .split(",")
    .map((i) => i.trim())
    .filter(Boolean);
  if (parsed.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5 mt-1.5">
      {parsed.map((item, i) => (
        <span
          key={i}
          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-600"
        >
          {item}
        </span>
      ))}
    </div>
  );
}

export default function AssignDiet() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state: locationState } = useLocation();
  const { addToast } = useToast();

  const [mode, setMode] = useState("custom");
  const [presets, setPresets] = useState([]);
  const [presetsLoading, setPresetsLoading] = useState(false);

  const [day, setDay] = useState(locationState?.prefillDay || todayStr());
  const [meals, setMeals] = useState(
    locationState?.prefillMeals || [{ time: "", items: "" }],
  );
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (mode !== "preset") return;
    setPresetsLoading(true);
    getDietPresets()
      .then((res) => setPresets(res.data))
      .catch(() => {})
      .finally(() => setPresetsLoading(false));
  }, [mode]);

  function handleMealChange(index, field, value) {
    setMeals((prev) =>
      prev.map((meal, i) => (i === index ? { ...meal, [field]: value } : meal)),
    );
  }

  function addMeal() {
    setMeals((prev) => [...prev, { time: "", items: "" }]);
  }

  function removeMeal(index) {
    setMeals((prev) => prev.filter((_, i) => i !== index));
  }

  function loadPreset(preset) {
    setMeals(
      preset.meals.map((m) => ({
        time: m.time,
        items: Array.isArray(m.items) ? m.items.join(", ") : "",
      })),
    );
  }

  function validate() {
    const errs = {};
    if (!day) errs.day = "Please select a date";
    if (meals.length === 0) errs.meals = "At least one meal is required";
    const mealErrors = [];
    for (let i = 0; i < meals.length; i++) {
      const m = meals[i];
      const fields = {};
      if (!m.time.trim()) fields.time = "Meal time is required";
      const items = m.items
        .split(",")
        .map((i) => i.trim())
        .filter(Boolean);
      if (items.length === 0) fields.items = "At least one food item";
      mealErrors[i] = Object.keys(fields).length > 0 ? fields : null;
    }
    if (mealErrors.some((e) => e !== null)) {
      errs.mealErrors = mealErrors;
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
      await assignDiet(id, {
        day,
        meals: meals.map((meal) => ({
          time: meal.time,
          items: meal.items
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
        })),
      });
      addToast("Diet plan assigned successfully", "success");
      navigate("/trainer/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to assign diet plan");
      addToast(err.response?.data?.error || "Failed to assign diet plan", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assign Diet Plan"
        subtitle="Create a diet plan for this trainee"
      />

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => { setMode("custom"); setMeals([{ time: "", items: "" }]); }}
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
              No diet presets yet.{" "}
              <button type="button" onClick={() => navigate("/trainer/presets/diet")}
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
                    {Array.isArray(p.meals) ? p.meals.length : 0} meals
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
          <DatePicker
            label="Date"
            value={day}
            onChange={(v) => { setDay(v); setFieldErrors((prev) => ({ ...prev, day: "" })); }}
            required
            error={fieldErrors.day}
          />
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Meals</h2>
              <p className="text-sm text-gray-500">
                Add meals for this day ({meals.length} added)
              </p>
            </div>
            <button
              type="button"
              onClick={addMeal}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition text-sm font-semibold"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              Add Meal
            </button>
          </div>

          <div className="space-y-4">
            {meals.map((meal, index) => {
              const mErr = fieldErrors.mealErrors?.[index];
              return (
                <div
                  key={index}
                  className="border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-semibold text-gray-700">
                      Meal {index + 1}
                    </span>
                    {meals.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeMeal(index)}
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
                        Meal Time <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Breakfast, Lunch, Dinner"
                        value={meal.time}
                        onChange={(e) => handleMealChange(index, "time", e.target.value)}
                        className={`w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-gray-900 ${
                          mErr?.time ? "border-red-300 bg-red-50" : "border-gray-300"
                        }`}
                      />
                      {mErr?.time && <p className="mt-1 text-xs text-red-500">{mErr.time}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Food Items <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Oats, Banana, Milk"
                        value={meal.items}
                        onChange={(e) => handleMealChange(index, "items", e.target.value)}
                        className={`w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-gray-900 ${
                          mErr?.items ? "border-red-300 bg-red-50" : "border-gray-300"
                        }`}
                      />
                      <FoodChips items={meal.items} />
                      {mErr?.items && <p className="mt-1 text-xs text-red-500">{mErr.items}</p>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {fieldErrors.meals && (
            <p className="mt-3 text-xs text-red-500">{fieldErrors.meals}</p>
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
            ) : "Save Diet Plan"}
          </button>
        </div>
      </form>
    </div>
  );
}
