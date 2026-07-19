import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { getTodayWorkout, getTodayDiet, fetchFeedback, unlinkTrainer } from "../../api/trainee";
import { getTraineeUpcoming } from "../../api/calendar";
import { getWeeklyProgress } from "../../api/progress";
import { SkeletonCard, SkeletonStatCard } from "../../components/Skeleton";
import PageHeader from "../../components/PageHeader";

function SkeletonLinked() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => <SkeletonStatCard key={i} />)}
      </div>
      <SkeletonCard rows={4} />
    </div>
  );
}

function StatusBadge({ assigned, label }) {
  return assigned ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 rounded-full text-xs font-medium">
      <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
      {label}
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-xs font-medium">
      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
      Not Assigned
    </span>
  );
}

export default function TraineeDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();

  const [showUnlinkModal, setShowUnlinkModal] = useState(false);
  const [unlinking, setUnlinking] = useState(false);

  const linkedTrainer = user?.traineeLinks?.[0]?.trainer;
  const selectedPreset = user?.traineeProfile?.selectedPreset;

  const [extra, setExtra] = useState(null);
  const [loadingExtra, setLoadingExtra] = useState(!!linkedTrainer);

  useEffect(() => {
    if (!linkedTrainer) {
      setExtra(null);
      setLoadingExtra(false);
      return;
    }

    setLoadingExtra(true);

    Promise.allSettled([
      getTodayWorkout(),
      getTodayDiet(),
      getWeeklyProgress(),
      fetchFeedback(),
      getTraineeUpcoming(),
    ]).then(([workoutRes, dietRes, progressRes, feedbackRes, upcomingRes]) => {
      const todayWorkout =
        workoutRes.status === "fulfilled" ? workoutRes.value.data : null;
      const todayDiet =
        dietRes.status === "fulfilled" ? dietRes.value.data : null;
      const progress =
        progressRes.status === "fulfilled" ? progressRes.value.data : null;
      const feedbackList =
        feedbackRes.status === "fulfilled" ? feedbackRes.value.data : [];

      const upcoming =
        upcomingRes.status === "fulfilled" ? upcomingRes.value.data.schedule : [];

      setExtra({
        todayWorkout,
        todayDiet,
        progress,
        latestFeedback: feedbackList.length > 0 ? feedbackList[0] : null,
        upcoming,
      });
      setLoadingExtra(false);
    });
  }, [linkedTrainer]);

  async function handleUnlink() {
    setUnlinking(true);
    try {
      await unlinkTrainer();
      addToast("Successfully left your trainer", "success");
      setShowUnlinkModal(false);
      navigate("/trainee/dashboard", { replace: true });
    } catch {
      addToast("Failed to unlink from trainer", "error");
    } finally {
      setUnlinking(false);
    }
  }

  if (linkedTrainer) {
    if (loadingExtra) return <SkeletonLinked />;

    return (
      <div className="space-y-6">
        <PageHeader
          title={`Welcome back, ${user?.name}`}
          subtitle="Here is your training overview for today"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 -mr-6 -mt-6 rounded-full bg-indigo-50 opacity-30" />
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500">Your Trainer</p>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full text-xs font-medium">
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                Linked
              </span>
            </div>
            <p className="text-lg font-bold text-gray-900 truncate">
              {linkedTrainer.name}
            </p>
            <p className="text-xs text-gray-400 mt-1 font-mono">
              Code: {linkedTrainer.trainerProfile.trainerCode}
            </p>
            <button
              type="button"
              onClick={() => setShowUnlinkModal(true)}
              className="mt-3 text-xs text-red-500 hover:text-red-700 underline underline-offset-2"
            >
              Leave Trainer
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 -mr-6 -mt-6 rounded-full bg-purple-50 opacity-30" />
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500">Today's Workout</p>
              <StatusBadge assigned={!!extra?.todayWorkout} label="Assigned" />
            </div>
            {extra?.todayWorkout ? (
              <>
                <p className="text-lg font-bold text-purple-600">
                  {extra.todayWorkout.exercises?.length || 0} exercises
                </p>
                <p className="text-xs text-gray-400 mt-1 capitalize">
                  {extra.todayWorkout.source === "trainer"
                    ? "Trainer Assigned"
                    : "Preset Workout"}{" "}
                  · {extra.todayWorkout.day}
                </p>
              </>
            ) : (
              <p className="text-sm text-gray-400 mt-2">
                No workout scheduled for today
              </p>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 -mr-6 -mt-6 rounded-full bg-green-50 opacity-30" />
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500">Today's Diet</p>
              <StatusBadge assigned={!!extra?.todayDiet} label="Assigned" />
            </div>
            {extra?.todayDiet ? (
              <>
                <p className="text-lg font-bold text-green-600">
                  {extra.todayDiet.meals?.length || 0} meals
                </p>
                <p className="text-xs text-gray-400 mt-1 capitalize">
                  {extra.todayDiet.day}
                </p>
              </>
            ) : (
              <p className="text-sm text-gray-400 mt-2">
                No diet assigned for today
              </p>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 -mr-6 -mt-6 rounded-full bg-emerald-50 opacity-30" />
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500">Weekly Progress</p>
            </div>
            {extra?.progress ? (
              <>
                <p className="text-lg font-bold text-emerald-600">
                  {extra.progress.completionRate}%
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {extra.progress.daysCompleted}/{extra.progress.totalDays} days
                </p>
              </>
            ) : (
              <p className="text-sm text-gray-400 mt-2">No activity yet</p>
            )}
          </div>
        </div>

        {extra?.upcoming && extra.upcoming.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Upcoming Schedule</h3>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 snap-x">
              {extra.upcoming.map((day) => {
                const isToday = day.status === "today";
                const isTomorrow = day.status === "tomorrow";
                const isCompleted = day.status === "completed";
                const isAssigned = day.status === "assigned";
                const isRest = day.status === "rest_day";

                let cardStyle;
                let statusLabel;
                let statusStyle;
                if (isToday) {
                  cardStyle = "bg-indigo-50 border-indigo-200 ring-1 ring-indigo-300";
                  statusLabel = "Today";
                  statusStyle = "bg-indigo-100 text-indigo-700";
                } else if (isTomorrow) {
                  cardStyle = "bg-blue-50 border-blue-200";
                  statusLabel = "Tomorrow";
                  statusStyle = "bg-blue-100 text-blue-700";
                } else if (isCompleted) {
                  cardStyle = "bg-green-50 border-green-200";
                  statusLabel = "Completed";
                  statusStyle = "bg-green-100 text-green-700";
                } else if (isAssigned) {
                  cardStyle = "bg-white border-gray-200";
                  statusLabel = "Assigned";
                  statusStyle = "bg-indigo-50 text-indigo-600";
                } else {
                  cardStyle = "bg-gray-50 border-gray-100";
                  statusLabel = "Rest Day";
                  statusStyle = "bg-gray-100 text-gray-500";
                }

                return (
                  <button
                    key={day.date}
                    type="button"
                    onClick={() => navigate("/trainee/workouts")}
                    className={`snap-start shrink-0 w-[140px] rounded-xl border p-3 text-left transition hover:shadow-sm cursor-pointer ${cardStyle}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-gray-400 uppercase">{day.dayName}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${statusStyle}`}>
                        {statusLabel}
                      </span>
                    </div>
                    <p className={`text-sm font-bold mb-0.5 ${isRest ? "text-gray-300" : "text-gray-900"}`}>
                      {day.monthDay}
                    </p>
                    {!isRest && day.workoutName ? (
                      <p className="text-[11px] text-gray-500 truncate">{day.workoutName}</p>
                    ) : !isRest ? (
                      <p className="text-[11px] text-gray-500">Workout</p>
                    ) : null}
                    {!isRest && (
                      <p className="text-[10px] text-gray-400 mt-0.5">{day.exerciseCount} exercise{day.exerciseCount !== 1 ? "s" : ""}</p>
                    )}
                    {isRest && (
                      <p className="text-[11px] text-gray-300 italic mt-1">No workout</p>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 flex gap-4">
            <button
              type="button"
              onClick={() => navigate("/trainee/workouts")}
              className="flex-1 bg-indigo-600 text-white rounded-2xl p-6 hover:bg-indigo-700 transition text-left"
            >
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 6.75V3.5a.5.5 0 00-.5-.5h-8a.5.5 0 00-.5.5v3.25m9 0l3 3v7.5l-3 3m-9-13.5L4.5 9.75v7.5l3 3m9-13.5V3.5m0 3.25H7.5m9 0v7.5m-9-7.5v7.5" />
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-1">Today's Workout</h3>
              <p className="text-sm text-indigo-200">
                {extra?.todayWorkout
                  ? `${extra.todayWorkout.exercises?.length || 0} exercises · ${extra.todayWorkout.source === "trainer" ? "Trainer" : "Preset"}`
                  : "No workout scheduled today"}
              </p>
            </button>
            <button
              type="button"
              onClick={() => navigate("/trainee/progress")}
              className="flex-1 bg-white rounded-2xl border border-gray-200 p-6 hover:border-indigo-300 hover:shadow-sm transition text-left"
            >
              <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Weekly Progress</h3>
              <p className="text-sm text-gray-500">
                {extra?.progress
                  ? `${extra.progress.daysCompleted}/${extra.progress.totalDays} days completed`
                  : "View your training stats"}
              </p>
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">
                Latest Feedback
              </h3>
              {extra?.latestFeedback && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 rounded-full text-xs font-medium">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                  Available
                </span>
              )}
            </div>
            {extra?.latestFeedback ? (
              <>
                <p className="text-xs text-gray-400 mb-2">
                  Week starting {new Date(extra.latestFeedback.weekStart).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-600 line-clamp-4">
                  {extra.latestFeedback.message}
                </p>
              </>
            ) : (
              <div className="flex flex-col items-center py-4 text-center">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <p className="text-sm text-gray-400">No feedback yet.</p>
              </div>
            )}
          </div>
        </div>

        {showUnlinkModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full mx-4">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Leave Trainer</h3>
              <p className="text-sm text-gray-600 mb-6">
                Are you sure? This will remove your trainer link and all assigned workouts, diet plans, and feedback. Your workout history will be preserved.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowUnlinkModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={unlinking}
                  onClick={handleUnlink}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 disabled:opacity-50"
                >
                  {unlinking ? "Leaving..." : "Leave Trainer"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 sm:p-8 text-white">
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
            <svg className="w-7 h-7 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
            </svg>
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl font-bold mb-1">You are currently training independently</h2>
            <p className="text-sm text-indigo-100">You are not connected to a trainer. You can follow preset workout programs or join a trainer at any time.</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 mt-6 justify-center sm:justify-start">
          <button
            type="button"
            onClick={() => navigate("/trainee/presets")}
            className="px-5 py-2.5 bg-white text-indigo-600 rounded-xl hover:bg-indigo-50 transition font-medium text-sm"
          >
            Browse Presets
          </button>
          <button
            type="button"
            onClick={() => navigate("/trainee/link-trainer")}
            className="px-5 py-2.5 bg-white/20 text-white rounded-xl hover:bg-white/30 transition font-medium text-sm"
          >
            Join a Trainer
          </button>
        </div>
      </div>

      <PageHeader
        title={`Welcome, ${user?.name}`}
        subtitle="Get started by setting up your training routine"
      />

      {selectedPreset ? (
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-white/20 text-white rounded-full text-xs font-medium">
              <span className="w-1.5 h-1.5 bg-white rounded-full" />
              Preset Selected
            </span>
          </div>
          <h2 className="text-2xl font-bold mb-1">{selectedPreset.name}</h2>
          {selectedPreset.description && (
            <p className="text-sm text-indigo-100 mb-4">{selectedPreset.description}</p>
          )}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate("/trainee/workouts")}
              className="px-5 py-2.5 bg-white text-indigo-600 rounded-xl hover:bg-indigo-50 transition font-medium text-sm"
            >
              View Today's Workout
            </button>
            <button
              type="button"
              onClick={() => navigate("/trainee/progress")}
              className="px-5 py-2.5 bg-white/20 text-white rounded-xl hover:bg-white/30 transition font-medium text-sm"
            >
              Weekly Progress
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => navigate("/trainee/presets")}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-left hover:shadow-md hover:border-indigo-200 transition group"
          >
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-200 transition">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 6.75V3.5a.5.5 0 00-.5-.5h-8a.5.5 0 00-.5.5v3.25m9 0l3 3v7.5l-3 3m-9-13.5L4.5 9.75v7.5l3 3m9-13.5V3.5m0 3.25H7.5m9 0v7.5m-9-7.5v7.5" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              Browse Workout Presets
            </h3>
            <p className="text-sm text-gray-500">
              Choose a pre-built routine or explore available programs
            </p>
          </button>
          <button
            type="button"
            onClick={() => navigate("/trainee/link-trainer")}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-left hover:shadow-md hover:border-green-200 transition group"
          >
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-green-200 transition">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              Link to Trainer
            </h3>
            <p className="text-sm text-gray-500">
              Enter your trainer's code to get personalized guidance
            </p>
          </button>
        </div>
      )}

      {!linkedTrainer && !selectedPreset && (
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200 p-5">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-amber-800 mb-1">Get Started</h4>
              <p className="text-sm text-amber-700">
                Choose a workout preset to begin training on your own, or link to a trainer for a personalized experience with workout and diet plans.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
