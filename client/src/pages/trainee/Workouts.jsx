import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getTodayWorkout, completeWorkout } from "../../api/trainee";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import PageHeader from "../../components/PageHeader";
import EmptyState from "../../components/EmptyState";
import { SkeletonCard } from "../../components/Skeleton";

export default function Workouts() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();
  const linkedTrainer = user?.traineeLinks?.[0]?.trainer;
  const selectedPreset = user?.traineeProfile?.selectedPreset;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [completed, setCompleted] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [completeError, setCompleteError] = useState("");

  useEffect(() => {
    getTodayWorkout()
      .then((res) => setData(res.data))
      .catch((err) => {
        const status = err.response?.status;
        const apiMsg = err.response?.data?.error;
        if (status === 404) {
          setError(apiMsg || "No workout is scheduled for today.");
        } else {
          setError(apiMsg || "Failed to load today's workout");
        }
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleComplete() {
    setCompleteError("");
    setCompleting(true);
    try {
      await completeWorkout();
      setCompleted(true);
      addToast("Workout marked as complete!", "success");
    } catch (err) {
      setCompleteError(
        err.response?.data?.error || "Failed to complete workout",
      );
      addToast(err.response?.data?.error || "Failed to complete workout", "error");
    } finally {
      setCompleting(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-56 bg-gray-200 rounded animate-pulse" />
        <SkeletonCard rows={4} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Today's Workout" />
        <EmptyState
          icon="dumbbell"
          title="No Workout Today"
          message={
            error.includes("404") || error.includes("No workout")
              ? linkedTrainer
                ? "Your trainer hasn't assigned a workout for today. Check back later or contact your trainer."
                : selectedPreset
                  ? "There's no exercise scheduled for today in your current preset. Try a different day or check back tomorrow."
                  : "Link to a trainer or select a workout preset to get started."
              : error
          }
          action={
              !linkedTrainer && !selectedPreset ? (
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/trainee/link-trainer")}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition text-sm font-semibold"
                >
                  Link to Trainer
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/trainee/presets")}
                  className="px-4 py-2 border border-indigo-200 text-indigo-600 rounded-xl hover:bg-indigo-50 transition text-sm font-semibold"
                >
                  Browse Presets
                </button>
              </div>
            ) : null
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Today's Workout" />

      <div className="flex items-center gap-3">
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
            data?.source === "trainer"
              ? "bg-purple-100 text-purple-700"
              : "bg-indigo-100 text-indigo-700"
          }`}
        >
          {data?.source === "trainer" ? (
            <>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" />
              </svg>
              Trainer Assigned
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 002.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128m0 0a3.998 3.998 0 007.22-2.746 3.998 3.998 0 00-7.22 2.746z" />
              </svg>
              Preset Workout
            </>
          )}
        </span>
        {data?.source === "trainer" && linkedTrainer && (
          <span className="text-xs text-gray-400">
            by {linkedTrainer.name}
          </span>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <p className="text-sm text-gray-500 mb-1">Day</p>
        <p className="text-xl font-semibold text-gray-900">{data?.day}</p>
      </div>

      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          Exercises ({data?.exercises?.length || 0})
        </h2>
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
      </div>

      {completeError && (
        <div
          role="alert"
          className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm"
        >
          {completeError}
        </div>
      )}

      {completed ? (
        <div
          role="status"
          className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm flex items-center gap-2.5"
        >
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Workout marked as completed!
        </div>
      ) : (
        <button
          type="button"
          onClick={handleComplete}
          disabled={completing || !data}
          className="w-full py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold text-sm shadow-sm shadow-indigo-200"
        >
          {completing ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Completing...
            </span>
          ) : "Mark Workout as Complete"}
        </button>
      )}
    </div>
  );
}
