import { useState, useEffect } from "react";
import { getTodayWorkout, completeWorkout } from "../../api/trainee";

export default function Workouts() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [completed, setCompleted] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [completeError, setCompleteError] = useState("");

  useEffect(() => {
    getTodayWorkout()
      .then((res) => setData(res.data))
      .catch((err) =>
        setError(err.response?.data?.error || "Failed to load today's workout"),
      )
      .finally(() => setLoading(false));
  }, []);

  async function handleComplete() {
    setCompleteError("");
    setCompleting(true);
    try {
      await completeWorkout();
      setCompleted(true);
    } catch (err) {
      setCompleteError(
        err.response?.data?.error || "Failed to complete workout",
      );
    } finally {
      setCompleting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center flex-1">
        <div className="animate-spin h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="px-4 py-10">
      <div className="max-w-xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Today&apos;s Workout
        </h1>

        {error ? (
          <div
            role="alert"
            className="mt-6 p-4 bg-white rounded-2xl shadow-sm border border-gray-100 text-center"
          >
            <p className="text-gray-500">{error}</p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                  data?.source === "trainer"
                    ? "bg-purple-100 text-purple-700"
                    : "bg-indigo-100 text-indigo-700"
                }`}
              >
                {data?.source === "trainer"
                  ? "Trainer Assigned"
                  : "Preset Workout"}
              </span>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
              <p className="text-sm text-gray-500 mb-1">Day</p>
              <p className="text-xl font-semibold text-gray-900">{data?.day}</p>
            </div>

            <h2 className="text-lg font-bold text-gray-900 mb-4">Exercises</h2>

            <div className="space-y-3">
              {data?.exercises?.map((exercise, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    {exercise.name}
                  </h3>
                  <div className="flex gap-4 text-sm">
                    <div className="bg-gray-50 rounded-lg px-3 py-2">
                      <span className="text-gray-500">Sets: </span>
                      <span className="font-semibold text-gray-900">
                        {exercise.sets}
                      </span>
                    </div>
                    <div className="bg-gray-50 rounded-lg px-3 py-2">
                      <span className="text-gray-500">Reps: </span>
                      <span className="font-semibold text-gray-900">
                        {exercise.reps}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {completeError && (
              <div
                role="alert"
                className="mt-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
              >
                {completeError}
              </div>
            )}

            {completed && (
              <div
                role="status"
                className="mt-6 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm"
              >
                Workout marked as completed!
              </div>
            )}

            <button
              type="button"
              onClick={handleComplete}
              disabled={completing || completed}
              className={`mt-6 w-full py-2.5 rounded-lg transition font-medium text-sm ${
                completed
                  ? "bg-green-100 text-green-700 cursor-default"
                  : "bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              }`}
            >
              {completing
                ? "Completing..."
                : completed
                  ? "Workout Completed"
                  : "Mark Workout as Complete"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
