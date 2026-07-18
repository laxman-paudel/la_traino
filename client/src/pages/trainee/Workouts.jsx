import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getTodayWorkout, updateExerciseProgress, completeWorkout } from "../../api/trainee";
import { getExercises } from "../../api/exercises";
import { getTraineeExerciseComments } from "../../api/coaching";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import PageHeader from "../../components/PageHeader";
import EmptyState from "../../components/EmptyState";
import WorkoutSessionSummary from "../../components/WorkoutSessionSummary";
import { SkeletonCard } from "../../components/Skeleton";
import StatusBadge from "../../components/StatusBadge";

const categoryColors = {
  chest: "bg-red-100 text-red-700",
  back: "bg-blue-100 text-blue-700",
  legs: "bg-purple-100 text-purple-700",
  glutes: "bg-pink-100 text-pink-700",
  calves: "bg-teal-100 text-teal-700",
  shoulders: "bg-orange-100 text-orange-700",
  biceps: "bg-cyan-100 text-cyan-700",
  triceps: "bg-indigo-100 text-indigo-700",
  forearms: "bg-amber-100 text-amber-700",
  core: "bg-green-100 text-green-700",
  cardio: "bg-rose-100 text-rose-700",
  mobility: "bg-sky-100 text-sky-700",
  stretching: "bg-lime-100 text-lime-700",
  neck: "bg-gray-100 text-gray-700",
  "full-body": "bg-violet-100 text-violet-700",
};

const difficultyVariants = {
  Beginner: "success",
  Intermediate: "warning",
  Advanced: "danger",
};

// ── Progress Bar ──
function ProgressBar({ completed, total }) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const estRemaining = total > 0
    ? Math.round((total - completed) * 4)
    : 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-900">Workout Progress</h3>
        <span className="text-xs font-medium text-indigo-600">{pct}%</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
        <div
          className="h-full bg-indigo-500 rounded-full transition-all duration-700 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
        <span>{completed} / {total} exercise{total !== 1 ? "s" : ""} completed</span>
        {pct < 100 && <span>~{estRemaining} min remaining</span>}
      </div>
    </div>
  );
}

// ── Set List with per-set inputs ──
function SetList({ sets, setsCompleted, totalSets, onChange, onToggle }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: totalSets }).map((_, i) => {
        const done = i < setsCompleted;
        const isCurrent = i === setsCompleted;
        const setData = sets?.[i] || { weight: "", reps: "" };

        return (
          <div
            key={i}
            className={`flex items-center gap-2 p-2 rounded-xl border transition ${
              done
                ? "bg-green-50 border-green-200 opacity-70"
                : isCurrent
                  ? "bg-indigo-50 border-indigo-200"
                  : "bg-gray-50 border-gray-100"
            }`}
          >
            <span className="text-xs font-medium text-gray-500 w-10 shrink-0">Set {i + 1}</span>

            {done ? (
              <div className="flex-1 flex items-center gap-1.5 text-sm text-green-700 font-medium">
                {setData.weight && <span>{setData.weight} kg</span>}
                {setData.weight && setData.reps && <span>×</span>}
                {setData.reps && <span>{setData.reps} reps</span>}
                {!setData.weight && !setData.reps && <span className="text-gray-400 font-normal">Completed</span>}
                <svg className="w-4 h-4 ml-auto text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
            ) : (
              <div className="flex-1 flex items-center gap-2">
                <input
                  type="text"
                  inputMode="decimal"
                  value={setData.weight || ""}
                  onChange={(e) => onChange(i, { ...setData, weight: e.target.value })}
                  placeholder="kg"
                  disabled={!isCurrent && !done}
                  className="w-16 px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <span className="text-xs text-gray-400">×</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={setData.reps || ""}
                  onChange={(e) => onChange(i, { ...setData, reps: e.target.value })}
                  placeholder="reps"
                  disabled={!isCurrent && !done}
                  className="w-16 px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={() => onToggle(i + 1)}
                  className="ml-auto px-3 py-1.5 text-xs font-semibold rounded-lg border border-indigo-200 text-indigo-600 hover:bg-indigo-100 transition"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Exercise Card ──
function ExerciseCard({ exercise, progress, index, isActive, isCompleted, onToggleSet, onSetDataChange, exerciseDetails, cardRef, trainerComment, onViewHistory }) {
  const [expanded, setExpanded] = useState(isActive && !isCompleted);
  const [notes, setNotes] = useState(progress?.notes || "");

  useEffect(() => {
    if (isActive && !isCompleted) {
      setExpanded(true);
      cardRef?.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [isActive, isCompleted, cardRef]);

  useEffect(() => {
    if (isCompleted) {
      setExpanded(false);
    }
  }, [isCompleted]);

  const details = exerciseDetails;

  const borderColor = isCompleted
    ? "border-green-300 bg-green-50/50"
    : isActive
      ? "border-indigo-300 bg-indigo-50/30"
      : "border-gray-100";

  return (
    <div ref={cardRef} className={`bg-white rounded-2xl shadow-sm border-2 ${borderColor} overflow-hidden transition-all duration-300`}>
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left"
      >
        <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
          isCompleted ? "bg-green-500 text-white" : isActive ? "bg-indigo-500 text-white" : "bg-gray-100 text-gray-500"
        }`}>
          {isCompleted ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          ) : (
            index + 1
          )}
        </span>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold truncate ${isCompleted ? "text-green-700" : "text-gray-900"}`}>
            {exercise.name}
          </p>
          <p className="text-xs text-gray-400">
            {progress.setsCompleted}/{progress.totalSets} sets
            {exercise.weight ? ` · ${exercise.weight} kg target` : ""}
          </p>
        </div>
        <svg className={`w-4 h-4 text-gray-400 transition ${expanded ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="px-5 pb-5 pt-1 border-t border-gray-100 space-y-4">
          {/* Image from library */}
          {details?.imageUrl && (
            <div className="h-40 sm:h-48 rounded-xl overflow-hidden">
              <img
                src={details.imageUrl}
                alt={exercise.name}
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.style.display = "none"; }}
              />
            </div>
          )}

          {/* Detail chips from library */}
          {(details?.category || details?.difficulty || details?.equipment) && (
            <div className="flex flex-wrap gap-2">
              {details?.category && (
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${categoryColors[details.category] || "bg-gray-100 text-gray-700"}`}>
                  {details.category}
                </span>
              )}
              {details?.difficulty && (
                <StatusBadge variant={difficultyVariants[details.difficulty] || "gray"}>{details.difficulty}</StatusBadge>
              )}
              {details?.equipment && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
                  {details.equipment}
                </span>
              )}
            </div>
          )}

          {/* Muscle chips from library */}
          {details?.primaryMuscles?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {details.primaryMuscles.map((m) => (
                <span key={m} className="inline-flex items-center gap-1 text-xs font-medium bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  {m}
                </span>
              ))}
            </div>
          )}

          {/* Stats row */}
          <div className="flex flex-wrap gap-3 text-sm">
            {[
              { label: "Sets", value: exercise.sets },
              { label: "Reps", value: exercise.reps },
              ...(exercise.weight ? [{ label: "Target", value: `${exercise.weight} kg` }] : []),
              ...(exercise.restTime ? [{ label: "Rest", value: exercise.restTime }] : []),
              ...(exercise.tempo ? [{ label: "Tempo", value: exercise.tempo }] : []),
            ].map((s) => (
              <div key={s.label} className="bg-gray-50 rounded-lg px-3 py-1.5">
                <span className="text-gray-500 text-xs">{s.label}: </span>
                <span className="font-semibold text-gray-900 text-sm">{s.value}</span>
              </div>
            ))}
          </div>

          {/* Set Tracker with per-set inputs */}
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2">Track Sets</p>
            <SetList
              sets={progress.sets || []}
              setsCompleted={progress.setsCompleted}
              totalSets={progress.totalSets}
              onChange={(setIndex, updated) => onSetDataChange(index, setIndex, updated)}
              onToggle={(target) => onToggleSet(index, target)}
            />
          </div>

          {/* Trainer notes */}
          {exercise.notes && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-800">
              <span className="font-medium">Trainer note: </span>
              {exercise.notes}
            </div>
          )}

          {/* Trainer coaching comment */}
          {trainerComment && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-800">
              <span className="font-medium">Coach says: </span>
              "{trainerComment}"
            </div>
          )}

          {/* Trainee notes */}
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1.5">Your Notes</p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={() => {
                if (notes !== (progress?.notes || "")) {
                  onToggleSet(index, progress.setsCompleted);
                }
              }}
              placeholder="How did this feel? Any notes for your trainer..."
              rows={2}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
            />
          </div>

          {/* View History link */}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); if (onViewHistory) onViewHistory(exercise.name); }}
            className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-semibold transition"
          >
            View Performance History
          </button>

          {/* Details from library */}
          {details?.instructions && (
            <div>
              <p className="text-xs font-semibold text-gray-900 mb-1.5">Instructions</p>
              <p className="text-sm text-gray-600 whitespace-pre-line">{details.instructions}</p>
            </div>
          )}
          {details?.tips && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
              <p className="text-xs font-semibold text-emerald-800 mb-0.5">Tip</p>
              <p className="text-sm text-emerald-700">{details.tips}</p>
            </div>
          )}
          {details?.commonMistakes && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
              <p className="text-xs font-semibold text-amber-800 mb-0.5">Common Mistake</p>
              <p className="text-sm text-amber-700">{details.commonMistakes}</p>
            </div>
          )}
          {details?.youtubeUrl && (
            <a
              href={details.youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl transition"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
              Watch Tutorial
            </a>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Page ──
export default function Workouts() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();
  const linkedTrainer = user?.traineeLinks?.[0]?.trainer;
  const selectedPreset = user?.traineeProfile?.selectedPreset;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState([]);
  const [completed, setCompleted] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [savingSet, setSavingSet] = useState(null);
  const [libraryMap, setLibraryMap] = useState({});

  const [exerciseComments, setExerciseComments] = useState({});

  const cardRefs = useRef([]);

  useEffect(() => {
    let mounted = true;
    getTraineeExerciseComments()
      .then((res) => {
        if (!mounted) return;
        const map = {};
        (res.data || []).forEach((c) => {
          map[c.exerciseName.toLowerCase()] = c.comment;
        });
        setExerciseComments(map);
      })
      .catch(() => {});
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    let mounted = true;
    getTodayWorkout()
      .then((res) => {
        if (!mounted) return;
        setData(res.data);
        setProgress(res.data.progress || []);
        setCompleted(res.data.completed || false);
      })
      .catch((err) => {
        if (!mounted) return;
        const status = err.response?.status;
        const apiMsg = err.response?.data?.error;
        if (status === 404) {
          setError(apiMsg || "No workout is scheduled for today.");
        } else {
          setError(apiMsg || "Failed to load today's workout");
        }
      })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  // Fetch exercise library for detail enrichment
  useEffect(() => {
    let mounted = true;
    getExercises({ limit: 500 })
      .then((res) => {
        if (!mounted) return;
        const map = {};
        (res.data?.exercises || []).forEach((ex) => {
          if (ex.name) map[ex.name.toLowerCase()] = ex;
        });
        setLibraryMap(map);
      })
      .catch(() => {});
    return () => { mounted = false; };
  }, []);

  const completedCount = progress.filter((p) => p.completed).length;
  const totalCount = progress.length;
  const activeIndex = progress.findIndex((p) => !p.completed);

  // Refs for smooth scroll
  useEffect(() => {
    cardRefs.current = cardRefs.current.slice(0, totalCount);
  }, [totalCount]);

  const handleSetDataChange = useCallback((exIndex, setIndex, updated) => {
    setProgress((prev) => {
      const next = [...prev];
      const p = { ...next[exIndex] };
      const sets = [...(p.sets || [])];
      sets[setIndex] = { ...(sets[setIndex] || { weight: "", reps: "" }), ...updated };
      p.sets = sets;
      next[exIndex] = p;
      return next;
    });
  }, []);

  const handleToggleSet = useCallback(async (exIndex, targetSets) => {
    setSavingSet(exIndex);
    try {
      const current = progress[exIndex];
      const nextSetsCompleted = current.setsCompleted === targetSets ? targetSets - 1 : targetSets;
      const safeVal = Math.max(0, Math.min(nextSetsCompleted, current.totalSets));

      const notes = current.notes || "";
      const sets = current.sets || [];

      const res = await updateExerciseProgress(exIndex, {
        setsCompleted: safeVal,
        sets,
        notes,
      });
      setProgress(res.data.progress);
    } catch (err) {
      addToast(err.response?.data?.error || "Failed to update progress", "error");
    } finally {
      setSavingSet(null);
    }
  }, [progress, addToast]);

  const handleViewHistory = (exerciseName) => {
    navigate(`/trainee/exercise-history/${encodeURIComponent(exerciseName)}`);
  };

  const handleComplete = async () => {
    setCompleting(true);
    try {
      const res = await completeWorkout();
      setCompleted(true);
      addToast("Workout complete!", "success");
    } catch (err) {
      addToast(err.response?.data?.error || "Failed to complete workout", "error");
    } finally {
      setCompleting(false);
    }
  };

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
                <button type="button" onClick={() => navigate("/trainee/link-trainer")}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition text-sm font-semibold">Link to Trainer</button>
                <button type="button" onClick={() => navigate("/trainee/presets")}
                  className="px-4 py-2 border border-indigo-200 text-indigo-600 rounded-xl hover:bg-indigo-50 transition text-sm font-semibold">Browse Presets</button>
              </div>
            ) : null
          }
        />
      </div>
    );
  }

  if (completed) {
    return (
      <div className="space-y-6">
        <PageHeader title="Today's Workout" />
        <div className="flex items-center gap-3">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
            data?.source === "trainer" ? "bg-purple-100 text-purple-700" : "bg-indigo-100 text-indigo-700"
          }`}>
            {data?.source === "trainer" ? "Trainer Assigned" : "Preset Workout"}
          </span>
          <span className="text-xs text-gray-400">{data?.day}</span>
        </div>
        <WorkoutSessionSummary
          data={data}
          progress={progress}
          onViewDashboard={() => navigate("/trainee/dashboard")}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <PageHeader title="Today's Workout" />

      {/* Session header */}
      <div className="flex items-center gap-3">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
          data?.source === "trainer" ? "bg-purple-100 text-purple-700" : "bg-indigo-100 text-indigo-700"
        }`}>
          {data?.source === "trainer" ? "Trainer Assigned" : "Preset Workout"}
        </span>
        {data?.source === "trainer" && linkedTrainer && (
          <span className="text-xs text-gray-400">by {linkedTrainer.name}</span>
        )}
        <span className="text-xs text-gray-400">{data?.day}</span>
      </div>

      {/* Progress */}
      <ProgressBar completed={completedCount} total={totalCount} />

      {/* Exercise cards */}
      <div className="space-y-3">
        {data?.exercises?.map((ex, i) => {
          const exDetails = libraryMap[ex.name?.toLowerCase()];
          return (
            <ExerciseCard
              key={i}
              exercise={ex}
              progress={progress[i] || { setsCompleted: 0, totalSets: ex.sets || 0, completed: false, sets: [], notes: "" }}
              index={i}
              isActive={i === activeIndex}
              isCompleted={progress[i]?.completed || false}
              onToggleSet={handleToggleSet}
              onSetDataChange={handleSetDataChange}
              exerciseDetails={exDetails}
              cardRef={cardRefs.current[i] || ((el) => { cardRefs.current[i] = el; })}
              trainerComment={exerciseComments[ex.name?.toLowerCase()]}
              onViewHistory={handleViewHistory}
            />
          );
        })}
      </div>

      {/* Complete button */}
      {completedCount === totalCount && totalCount > 0 && (
        <button
          type="button"
          onClick={handleComplete}
          disabled={completing}
          className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold text-sm shadow-sm shadow-green-200 disabled:opacity-50 disabled:cursor-not-allowed transition active:scale-[0.98]"
        >
          {completing ? "Finishing..." : "Finish Workout"}
        </button>
      )}

      {completedCount < totalCount && (
        <p className="text-center text-sm text-gray-400">
          Complete all exercises to finish this workout.
        </p>
      )}
    </div>
  );
}
