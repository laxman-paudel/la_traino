import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { assignDiet } from "../../api/trainer";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const MEAL_TIMES = ["Breakfast", "Lunch", "Dinner", "Snack"];

export default function AssignDiet() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [day, setDay] = useState("");
  const [meals, setMeals] = useState([{ time: "", items: "" }]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

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

  function validate() {
    if (!day.trim()) return "Day is required";
    if (meals.length === 0) return "At least one meal is required";
    for (const meal of meals) {
      if (!meal.time) return "Meal time is required";
      if (!meal.items.trim()) return "Food items are required";
    }
    return "";
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

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
      navigate("/trainer/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to assign diet plan");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="px-4 py-10">
      <div className="max-w-xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Assign Diet Plan
        </h1>
        <p className="text-gray-500 mb-8">
          Create a diet plan for this trainee.
        </p>

        {error && (
          <div
            role="alert"
            className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="day"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Day
            </label>
            <select
              id="day"
              value={day}
              onChange={(e) => setDay(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-gray-900"
            >
              <option value="">Select day</option>
              {DAYS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Meals
              </label>
              <button
                type="button"
                onClick={addMeal}
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                + Add Meal
              </button>
            </div>

            <div className="space-y-3">
              {meals.map((meal, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl border border-gray-200 p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-500">
                      Meal {index + 1}
                    </span>
                    {meals.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeMeal(index)}
                        className="text-sm text-red-500 hover:text-red-600 font-medium"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        Meal Time
                      </label>
                      <select
                        value={meal.time}
                        onChange={(e) =>
                          handleMealChange(index, "time", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-gray-900"
                      >
                        <option value="">Select time</option>
                        {MEAL_TIMES.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        Food Items{" "}
                        <span className="text-gray-400">(comma-separated)</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Oats, Banana, Milk"
                        value={meal.items}
                        onChange={(e) =>
                          handleMealChange(index, "items", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-gray-900"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
          >
            {saving ? "Saving..." : "Save Diet Plan"}
          </button>
        </form>
      </div>
    </div>
  );
}
