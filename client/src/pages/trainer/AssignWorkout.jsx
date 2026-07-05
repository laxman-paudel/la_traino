import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { assignWorkout } from "../../api/trainer";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function AssignWorkout() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [day, setDay] = useState("");
  const [exercises, setExercises] = useState([
    { name: "", sets: "", reps: "" },
  ]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function handleExerciseChange(index, field, value) {
    setExercises((prev) =>
      prev.map((ex, i) => (i === index ? { ...ex, [field]: value } : ex)),
    );
  }

  function addExercise() {
    setExercises((prev) => [...prev, { name: "", sets: "", reps: "" }]);
  }

  function removeExercise(index) {
    setExercises((prev) => prev.filter((_, i) => i !== index));
  }

  function validate() {
    if (!day.trim()) return "Day is required";
    if (exercises.length === 0) return "At least one exercise is required";
    for (const ex of exercises) {
      if (!ex.name.trim()) return "Exercise name is required";
      if (!ex.sets || parseInt(ex.sets, 10) <= 0)
        return "Sets must be greater than 0";
      if (!ex.reps || parseInt(ex.reps, 10) <= 0)
        return "Reps must be greater than 0";
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
      await assignWorkout(id, {
        day,
        exercises: exercises.map((ex) => ({
          name: ex.name.trim(),
          sets: parseInt(ex.sets, 10),
          reps: parseInt(ex.reps, 10),
        })),
      });
      navigate("/trainer/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to assign workout");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="max-w-xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Assign Workout
        </h1>
        <p className="text-gray-500 mb-8">Create a workout for this trainee.</p>

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
                Exercises
              </label>
              <button
                type="button"
                onClick={addExercise}
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                + Add Exercise
              </button>
            </div>

            <div className="space-y-3">
              {exercises.map((exercise, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl border border-gray-200 p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-500">
                      Exercise {index + 1}
                    </span>
                    {exercises.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeExercise(index)}
                        className="text-sm text-red-500 hover:text-red-600 font-medium"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="space-y-3">
                    <div>
                      <input
                        type="text"
                        placeholder="Exercise Name"
                        value={exercise.name}
                        onChange={(e) =>
                          handleExerciseChange(index, "name", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-gray-900"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">
                          Sets
                        </label>
                        <input
                          type="number"
                          min="1"
                          placeholder="4"
                          value={exercise.sets}
                          onChange={(e) =>
                            handleExerciseChange(index, "sets", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-gray-900"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">
                          Reps
                        </label>
                        <input
                          type="number"
                          min="1"
                          placeholder="10"
                          value={exercise.reps}
                          onChange={(e) =>
                            handleExerciseChange(index, "reps", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-gray-900"
                        />
                      </div>
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
            {saving ? "Saving..." : "Save Workout"}
          </button>
        </form>
      </div>
    </div>
  );
}
