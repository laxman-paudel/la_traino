import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getDashboard, getWorkoutLogs } from "../../api/trainer";
import { useAuth } from "../../context/AuthContext";
import { SkeletonStatCard, SkeletonCard } from "../../components/Skeleton";
import PageHeader from "../../components/PageHeader";
import EmptyState from "../../components/EmptyState";

function computeWeekBounds() {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return { weekStart: monday, weekEnd: sunday };
}

export default function TrainerDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [traineeLogsMap, setTraineeLogsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    getDashboard()
      .then((res) => {
        const dash = res.data;
        setData(dash);
        const trainees = dash.trainees || [];
        if (trainees.length === 0) {
          setLoading(false);
          return;
        }
        return Promise.all(
          trainees.map((t) =>
            getWorkoutLogs(t.id)
              .then((logRes) => ({ traineeId: t.id, logs: logRes.data }))
              .catch(() => ({ traineeId: t.id, logs: [] })),
          ),
        );
      })
      .then((results) => {
        if (results) {
          const map = {};
          results.forEach((r) => {
            map[r.traineeId] = r.logs;
          });
          setTraineeLogsMap(map);
        }
      })
      .catch((err) =>
        setError(err.response?.data?.error || "Failed to load dashboard"),
      )
      .finally(() => setLoading(false));
  }, []);

  const summary = useMemo(() => {
    if (!data) return null;
    const { weekStart, weekEnd } = computeWeekBounds();
    const trainees = data.trainees || [];
    const totalTrainees = trainees.length;

    let totalWorkoutsCompleted = 0;
    let activeThisWeek = 0;
    trainees.forEach((t) => {
      const logs = traineeLogsMap[t.id] || [];
      const completed = logs.filter((l) => l.completed);
      totalWorkoutsCompleted += completed.length;
      const thisWeek = completed.filter((l) => {
        const d = new Date(l.day);
        return d >= weekStart && d <= weekEnd;
      });
      if (thisWeek.length > 0) activeThisWeek++;
    });

    return {
      linkedTrainees: totalTrainees,
      workoutsLogged: totalWorkoutsCompleted,
      activeThisWeek,
      completionRate:
        totalTrainees > 0
          ? Math.round((activeThisWeek / totalTrainees) * 100)
          : 0,
    };
  }, [data, traineeLogsMap]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-56 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <SkeletonStatCard key={i} />)}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2].map((i) => <SkeletonCard key={i} rows={3} />)}
        </div>
      </div>
    );
  }

  const trainees = data?.trainees || [];

  const statCards = [
    { label: "Linked Trainees", value: summary?.linkedTrainees ?? 0, color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "Workouts Completed", value: summary?.workoutsLogged ?? 0, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Active This Week", value: summary?.activeThisWeek ?? 0, color: "text-green-600", bg: "bg-green-50" },
    { label: "Weekly Activity Rate", value: `${summary?.completionRate ?? 0}%`, color: "text-emerald-600", bg: "bg-emerald-50" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Trainer Dashboard"
        subtitle={`Welcome, ${user?.name}`}
      />

      {error && (
        <div
          role="alert"
          className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm"
        >
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 relative overflow-hidden"
          >
            <div className={`absolute top-0 right-0 w-20 h-20 -mr-6 -mt-6 rounded-full opacity-10 ${card.bg}`} />
            <p className="text-sm text-gray-500 mb-1">{card.label}</p>
            <p className={`text-3xl font-bold ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm text-gray-500">Your Trainer Code</p>
        </div>
        <p className="text-2xl font-mono font-bold text-gray-900 tracking-wider">
          {data?.trainerCode}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Share this code with trainees to link them to your account
        </p>
      </div>

      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Linked Trainees
        </h2>

        {trainees.length === 0 ? (
          <EmptyState
            icon="users"
            title="No trainees yet"
            message="Share your trainer code with trainees so they can link to your account."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {trainees.map((trainee) => {
              const logs = traineeLogsMap[trainee.id] || [];
              const latestLog = logs.find((l) => l.completed) || null;
              const latestDate = latestLog?.day
                ? new Date(latestLog.day).toLocaleDateString()
                : null;

              return (
                <div
                  key={trainee.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {trainee.name}
                      </h3>
                      <p className="text-sm text-gray-500">{trainee.email}</p>
                    </div>
                    {latestLog ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-500 rounded-full text-xs font-medium">
                        No activity
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-gray-500 text-xs">Logs</p>
                      <p className="text-lg font-semibold text-gray-900">{logs.length}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-gray-500 text-xs">Completed</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {logs.filter((l) => l.completed).length}
                      </p>
                    </div>
                  </div>

                  {latestDate && (
                    <p className="text-xs text-gray-400 mb-4">
                      Latest completion: {latestDate}
                    </p>
                  )}

                  <div className="flex gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() =>
                        navigate(`/trainer/trainees/${trainee.id}/workout`)
                      }
                      className="flex-1 min-w-[100px] py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
                    >
                      Assign Workout
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        navigate(`/trainer/trainees/${trainee.id}/diet`)
                      }
                      className="flex-1 min-w-[100px] py-2.5 border border-indigo-200 text-indigo-600 rounded-lg hover:bg-indigo-50 transition text-sm font-medium"
                    >
                      Assign Diet
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        navigate(`/trainer/trainees/${trainee.id}/logs`)
                      }
                      className="flex-1 min-w-[100px] py-2.5 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition text-sm font-medium"
                    >
                      View Logs
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        navigate(`/trainer/trainees/${trainee.id}/feedback`)
                      }
                      className="flex-1 min-w-[100px] py-2.5 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition text-sm font-medium"
                    >
                      Feedback
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
