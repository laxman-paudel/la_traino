import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getDashboard, getWorkoutLogs } from "../../api/trainer";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { SkeletonStatCard, SkeletonCard } from "../../components/Skeleton";
import PageHeader from "../../components/PageHeader";
import EmptyState from "../../components/EmptyState";
import Pagination from "../../components/Pagination";

const PAGE_SIZE = 6;

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

function computeProgress(logs) {
  const { weekStart, weekEnd } = computeWeekBounds();
  const weekLogs = logs.filter((l) => {
    const d = new Date(l.day);
    return d >= weekStart && d <= weekEnd;
  });
  const completedThisWeek = weekLogs.filter((l) => l.completed).length;
  return {
    total: logs.length,
    completed: logs.filter((l) => l.completed).length,
    completedThisWeek,
    rate: Math.round((completedThisWeek / 7) * 100),
    latestLog: logs.find((l) => l.completed) || null,
    completedToday: weekLogs.some((l) => {
      const today = new Date();
      const ld = new Date(l.day);
      return l.completed && ld.toDateString() === today.toDateString();
    }),
  };
}

const FILTERS = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "completed-today", label: "Completed Today" },
  { value: "needs-workout", label: "Needs Workout" },
  { value: "needs-diet", label: "Needs Diet" },
];

export default function TrainerDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();
  const [data, setData] = useState(null);
  const [traineeLogsMap, setTraineeLogsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);

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

  const traineesWithProgress = useMemo(() => {
    const trainees = (data?.trainees || []).map((t) => {
      const logs = traineeLogsMap[t.id] || [];
      return { ...t, progress: computeProgress(logs) };
    });
    return trainees;
  }, [data, traineeLogsMap]);

  const filtered = useMemo(() => {
    let result = [...traineesWithProgress];
    switch (filter) {
      case "active":
        result = result.filter((t) => t.progress.completedThisWeek > 0);
        break;
      case "inactive":
        result = result.filter((t) => t.progress.completedThisWeek === 0);
        break;
      case "completed-today":
        result = result.filter((t) => t.progress.completedToday);
        break;
      case "needs-workout":
        result = result.filter((t) => !t.preset);
        break;
      case "needs-diet":
        break;
    }
    return result;
  }, [traineesWithProgress, filter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => { setPage(1); }, [filter]);

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(data?.trainerCode || "");
      addToast("Trainer code copied to clipboard", "success");
    } catch {
      addToast("Failed to copy trainer code", "error");
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-56 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <SkeletonStatCard key={i} />)}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2].map((i) => <SkeletonCard key={i} rows={4} />)}
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
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">Your Trainer Code</p>
            <p className="text-2xl font-mono font-bold text-gray-900 tracking-wider">
              {data?.trainerCode}
            </p>
          </div>
          <button
            type="button"
            onClick={copyCode}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition text-sm font-semibold"
            aria-label="Copy trainer code to clipboard"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
            </svg>
            Copy Code
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Share this code with trainees to link them to your account
        </p>
      </div>

      <div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-gray-900">Linked Trainees</h2>
            {trainees.length > 0 && (
              <span className="text-sm text-gray-500">({trainees.length})</span>
            )}
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setFilter(f.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  filter === f.value
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon="users"
            title="No trainees match this filter"
            message="Try a different filter or wait for trainees to become active."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {paged.map((trainee) => {
              const p = trainee.progress;
              const latestDate = p.latestLog?.day
                ? new Date(p.latestLog.day).toLocaleDateString()
                : null;

              return (
                <div
                  key={trainee.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {trainee.name}
                      </h3>
                      <p className="text-sm text-gray-500 truncate">{trainee.email}</p>
                    </div>
                    <div className="flex gap-1.5 shrink-0 flex-wrap justify-end">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full text-xs font-medium">
                        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                        Linked
                      </span>
                      {p.completedToday ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 rounded-full text-xs font-medium">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                          Today
                        </span>
                      ) : p.completedThisWeek > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-xs font-medium">
                          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                          This Week
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-xs font-medium">
                          Inactive
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {trainee.preset ? (
                      <span className="inline-flex items-center px-2 py-0.5 bg-purple-50 text-purple-600 rounded-full text-xs font-medium">
                        Preset: {trainee.preset.name}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 bg-gray-100 text-gray-400 rounded-full text-xs font-medium">
                        No preset
                      </span>
                    )}
                    <span className="inline-flex items-center px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                      {new Date(trainee.linkedAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-4 text-sm">
                    <div className="bg-gray-50 rounded-xl p-2.5 text-center">
                      <p className="text-gray-500 text-xs">Workouts</p>
                      <p className="text-lg font-semibold text-gray-900">{p.total}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-2.5 text-center">
                      <p className="text-gray-500 text-xs">Completed</p>
                      <p className="text-lg font-semibold text-gray-900">{p.completed}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-2.5 text-center">
                      <p className="text-gray-500 text-xs">This Week</p>
                      <p className="text-lg font-semibold text-gray-900">{p.completedThisWeek}</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-500">Weekly completion</span>
                      <span className="font-semibold text-gray-700">{p.rate}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div
                        className="bg-indigo-500 h-1.5 rounded-full transition-all"
                        style={{ width: `${p.rate}%` }}
                      />
                    </div>
                  </div>

                  {latestDate && (
                    <p className="text-xs text-gray-400 mb-4">
                      Latest completion: {latestDate}
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => navigate(`/trainer/trainees/${trainee.id}/workout`)}
                      className="py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition text-sm font-semibold"
                    >
                      Assign Workout
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate(`/trainer/trainees/${trainee.id}/diet`)}
                      className="py-2 border border-indigo-200 text-indigo-600 rounded-xl hover:bg-indigo-50 transition text-sm font-medium"
                    >
                      Assign Diet
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate(`/trainer/trainees/${trainee.id}/logs`)}
                      className="py-2 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition text-sm font-medium"
                    >
                      View Logs
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate(`/trainer/trainees/${trainee.id}/feedback`)}
                      className="py-2 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition text-sm font-medium"
                    >
                      Feedback
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </div>
  );
}
