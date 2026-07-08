import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getTodayWorkout, getTodayDiet, fetchFeedback } from "../../api/trainee";
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

export default function TraineeDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

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
    ]).then(([workoutRes, dietRes, progressRes, feedbackRes]) => {
      const todayWorkout =
        workoutRes.status === "fulfilled" ? workoutRes.value.data : null;
      const todayDiet =
        dietRes.status === "fulfilled" ? dietRes.value.data : null;
      const progress =
        progressRes.status === "fulfilled" ? progressRes.value.data : null;
      const feedbackList =
        feedbackRes.status === "fulfilled" ? feedbackRes.value.data : [];

      setExtra({
        todayWorkout,
        todayDiet,
        progress,
        latestFeedback: feedbackList.length > 0 ? feedbackList[0] : null,
      });
      setLoadingExtra(false);
    });
  }, [linkedTrainer]);

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
            <p className="text-sm text-gray-500 mb-1">Trainer</p>
            <p className="text-lg font-bold text-indigo-600 truncate">
              {linkedTrainer.name}
            </p>
            <p className="text-xs text-gray-400 mt-1 font-mono">
              {linkedTrainer.trainerProfile.trainerCode}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 -mr-6 -mt-6 rounded-full bg-purple-50 opacity-30" />
            <p className="text-sm text-gray-500 mb-1">Today's Workout</p>
            {extra?.todayWorkout ? (
              <>
                <p className="text-lg font-bold text-purple-600">
                  {extra.todayWorkout.exercises?.length || 0} exercises
                </p>
                <p className="text-xs text-gray-400 mt-1 capitalize">
                  {extra.todayWorkout.source} · {extra.todayWorkout.day}
                </p>
              </>
            ) : (
              <p className="text-sm text-gray-400 mt-1">No workout scheduled</p>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 -mr-6 -mt-6 rounded-full bg-green-50 opacity-30" />
            <p className="text-sm text-gray-500 mb-1">Today's Diet</p>
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
              <p className="text-sm text-gray-400 mt-1">No diet assigned</p>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 -mr-6 -mt-6 rounded-full bg-emerald-50 opacity-30" />
            <p className="text-sm text-gray-500 mb-1">Weekly Progress</p>
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
              <p className="text-sm text-gray-400 mt-1">No data yet</p>
            )}
          </div>
        </div>

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
                  ? "View and complete your workout"
                  : "Check your scheduled routine"}
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
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Latest Feedback
            </h3>
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
              <p className="text-sm text-gray-400">No feedback yet from your trainer.</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome, ${user?.name}`}
        subtitle="Get started by setting up your training routine"
      />

      {selectedPreset ? (
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white">
          <p className="text-sm text-indigo-200 mb-1">Selected Preset</p>
          <h2 className="text-2xl font-bold mb-1">{selectedPreset.name}</h2>
          {selectedPreset.description && (
            <p className="text-sm text-indigo-100 mb-4">{selectedPreset.description}</p>
          )}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate("/trainee/workouts")}
              className="px-5 py-2.5 bg-white text-indigo-600 rounded-lg hover:bg-indigo-50 transition font-medium text-sm"
            >
              View Today's Workout
            </button>
            <button
              type="button"
              onClick={() => navigate("/trainee/progress")}
              className="px-5 py-2.5 bg-white/20 text-white rounded-lg hover:bg-white/30 transition font-medium text-sm"
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
                Choose a workout preset to begin training on your own, or link to a trainer for a personalized experience.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
