import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getTodayDiet, updateMealProgress, completeDiet } from "../../api/trainee";
import { getTraineeDietComments } from "../../api/coaching";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import PageHeader from "../../components/PageHeader";
import EmptyState from "../../components/EmptyState";
import { SkeletonCard } from "../../components/Skeleton";
import StatusBadge from "../../components/StatusBadge";

const MEAL_CONFIG = {
  breakfast: { label: "Breakfast", icon: "🌅", color: "bg-amber-50 border-amber-200", textColor: "text-amber-800" },
  lunch: { label: "Lunch", icon: "☀️", color: "bg-orange-50 border-orange-200", textColor: "text-orange-800" },
  dinner: { label: "Dinner", icon: "🌙", color: "bg-indigo-50 border-indigo-200", textColor: "text-indigo-800" },
  snack: { label: "Snack", icon: "🍪", color: "bg-pink-50 border-pink-200", textColor: "text-pink-800" },
  preWorkout: { label: "Pre-Workout", icon: "⚡", color: "bg-yellow-50 border-yellow-200", textColor: "text-yellow-800" },
  postWorkout: { label: "Post-Workout", icon: "💪", color: "bg-green-50 border-green-200", textColor: "text-green-800" },
};

function DietProgressBar({ completed, total }) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-900">Diet Progress</h3>
        <span className="text-xs font-medium text-emerald-600">{pct}%</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
        <div className="h-full bg-emerald-500 rounded-full transition-all duration-700 ease-out" style={{ width: `${pct}%` }} />
      </div>
      <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
        <span>{completed} / {total} meal{total !== 1 ? "s" : ""} completed</span>
        {pct === 100 && <span className="text-emerald-600 font-medium">All done!</span>}
      </div>
    </div>
  );
}

function MealSection({ mealType, config, foods, progress, onToggleMeal, onNoteChange, saving, trainerComment }) {
  const [note, setNote] = useState(progress?.note || "");
  const isCompleted = progress?.completed || false;

  return (
    <div className={`bg-white rounded-2xl shadow-sm border-2 overflow-hidden transition ${isCompleted ? "border-emerald-300 bg-emerald-50/50" : "border-gray-100"}`}>
      <div className="px-5 py-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">{config.icon}</span>
            <h3 className="text-base font-semibold text-gray-900">{config.label}</h3>
            {isCompleted && (
              <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                Done
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => onToggleMeal(mealType, !isCompleted)}
            disabled={saving}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
              isCompleted
                ? "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
                : "bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700"
            }`}
          >
            {isCompleted ? "Undo" : "Mark Complete"}
          </button>
        </div>

        {foods.length === 0 ? (
          <p className="text-sm text-gray-400 italic">No foods assigned for this meal.</p>
        ) : (
          <div className="space-y-2">
            {foods.map((food, i) => (
              <div key={i} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-2.5">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0" />
                  <span className="text-sm text-gray-900 truncate">{food.name}</span>
                </div>
                <span className="text-xs text-gray-500 shrink-0 ml-2">{food.quantity || ""}</span>
              </div>
            ))}
          </div>
        )}

        {/* Trainer comment */}
        {trainerComment && (
          <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-800">
            <span className="font-medium">Coach says: </span>
            "{trainerComment}"
          </div>
        )}

        {/* Trainee note */}
        <div className="mt-3">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onBlur={() => {
              if (note !== (progress?.note || "")) {
                onNoteChange(mealType, note);
              }
            }}
            placeholder="Notes for this meal..."
            rows={1}
            className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
          />
        </div>

        {/* Nutrition summary for meal */}
        {foods.some((f) => f.calories || f.protein || f.carbs || f.fat) && (
          <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t border-gray-50 text-xs text-gray-500">
            {foods.reduce((sum, f) => sum + (f.calories || 0), 0) > 0 && (
              <span>{foods.reduce((s, f) => s + (f.calories || 0), 0)} cal</span>
            )}
            {foods.reduce((sum, f) => sum + (f.protein || 0), 0) > 0 && (
              <span>P: {foods.reduce((s, f) => s + (f.protein || 0), 0).toFixed(1)}g</span>
            )}
            {foods.reduce((sum, f) => sum + (f.carbs || 0), 0) > 0 && (
              <span>C: {foods.reduce((s, f) => s + (f.carbs || 0), 0).toFixed(1)}g</span>
            )}
            {foods.reduce((sum, f) => sum + (f.fat || 0), 0) > 0 && (
              <span>F: {foods.reduce((s, f) => s + (f.fat || 0), 0).toFixed(1)}g</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Diet() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();
  const linkedTrainer = user?.traineeLinks?.[0]?.trainer;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState({});
  const [completed, setCompleted] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [saving, setSaving] = useState(null);
  const [dietComments, setDietComments] = useState({});

  useEffect(() => {
    getTraineeDietComments()
      .then((res) => {
        const map = {};
        (res.data || []).forEach((c) => {
          map[c.mealType] = c.comment;
        });
        setDietComments(map);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    getTodayDiet()
      .then((res) => {
        setData(res.data);
        setProgress(res.data.progress || {});
        setCompleted(res.data.completed || false);
      })
      .catch((err) => {
        const status = err.response?.status;
        const apiMsg = err.response?.data?.error;
        if (status === 404) setError(apiMsg || "No diet has been assigned for today.");
        else setError(apiMsg || "Failed to load today's diet");
      })
      .finally(() => setLoading(false));
  }, []);

  const meals = data?.meals || {};
  const mealKeys = Object.keys(MEAL_CONFIG);
  const completedCount = mealKeys.filter((k) => progress[k]?.completed).length;
  const totalMeals = mealKeys.filter((k) => Array.isArray(meals[k]) && meals[k].length > 0).length;
  const activeMealCount = totalMeals > 0 ? totalMeals : mealKeys.length;

  async function handleToggleMeal(mealType, isComplete) {
    setSaving(mealType);
    try {
      const res = await updateMealProgress(mealType, { completed: isComplete });
      setProgress(res.data.progress);
    } catch (err) {
      addToast(err.response?.data?.error || "Failed to update meal", "error");
    } finally {
      setSaving(null);
    }
  }

  async function handleNoteChange(mealType, note) {
    setSaving(mealType);
    try {
      const res = await updateMealProgress(mealType, { note });
      setProgress(res.data.progress);
    } catch (err) {
      // Silent fail for notes
    } finally {
      setSaving(null);
    }
  }

  async function handleComplete() {
    setCompleting(true);
    try {
      await completeDiet();
      setCompleted(true);
      addToast("Diet complete!", "success");
    } catch (err) {
      addToast(err.response?.data?.error || "Failed to complete diet", "error");
    } finally {
      setCompleting(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <SkeletonCard rows={3} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Today's Diet" />
        <EmptyState icon="clipboard" title="No Diet Plan Today"
          message={linkedTrainer ? "Your trainer hasn't assigned a diet plan for today." : "Link to a trainer to receive personalized diet plans."}
          action={!linkedTrainer ? (
            <button type="button" onClick={() => navigate("/trainee/link-trainer")}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition text-sm font-semibold">Link to Trainer</button>
          ) : null}
        />
      </div>
    );
  }

  if (completed) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <PageHeader title="Today's Diet" />
        <div className="flex items-center gap-3">
          <StatusBadge variant="success">Completed</StatusBadge>
          {linkedTrainer && <span className="text-xs text-gray-400">by {linkedTrainer.name}</span>}
        </div>
        <div className="text-center py-10 space-y-4">
          <div className="w-20 h-20 mx-auto bg-emerald-100 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">All Meals Complete!</h2>
          <p className="text-gray-500 text-sm">Great job following your nutrition plan today.</p>
          <button type="button" onClick={() => navigate("/trainee/dashboard")}
            className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition font-semibold text-sm">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <PageHeader title="Today's Diet" />

      <div className="flex items-center gap-3">
        <StatusBadge variant="success">Trainer Assigned</StatusBadge>
        {linkedTrainer && <span className="text-xs text-gray-400">by {linkedTrainer.name}</span>}
      </div>

      <DietProgressBar completed={completedCount} total={activeMealCount} />

      <div className="space-y-3">
        {mealKeys.map((key) => {
          const foods = Array.isArray(meals[key]) ? meals[key] : [];
          return (
            <MealSection
              key={key}
              mealType={key}
              config={MEAL_CONFIG[key]}
              foods={foods}
              progress={progress[key] || { completed: false, note: "" }}
              onToggleMeal={handleToggleMeal}
              onNoteChange={handleNoteChange}
              saving={saving === key}
              trainerComment={dietComments[key]}
            />
          );
        })}
      </div>

      {completedCount === activeMealCount && activeMealCount > 0 && (
        <button
          type="button"
          onClick={handleComplete}
          disabled={completing}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm shadow-sm shadow-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {completing ? "Finishing..." : "Finish Diet"}
        </button>
      )}

      {completedCount < activeMealCount && (
        <p className="text-center text-sm text-gray-400">
          Complete all meals to finish today's diet.
        </p>
      )}
    </div>
  );
}
