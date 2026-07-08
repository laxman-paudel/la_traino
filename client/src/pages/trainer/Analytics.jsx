import { useState, useEffect } from "react";
import { getAnalytics } from "../../api/trainer";
import { useAuth } from "../../context/AuthContext";
import { SkeletonStatCard } from "../../components/Skeleton";
import PageHeader from "../../components/PageHeader";
import EmptyState from "../../components/EmptyState";

const cardConfig = [
  {
    key: "activeTrainees",
    label: "Active Trainees",
    suffix: (v, s) => `/${s.totalTrainees}`,
    color: "text-indigo-600",
    bg: "bg-indigo-50",
  },
  {
    key: "completionRate",
    label: "Completion Rate",
    suffix: "%",
    color: "text-green-600",
    bg: "bg-green-50",
  },
  {
    key: "workoutsAssignedThisWeek",
    label: "Workouts This Week",
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
  {
    key: "dietsAssignedThisWeek",
    label: "Diets This Week",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    key: "feedbackGiven",
    label: "Feedback Given",
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
];

function Bar({ value, max, label, sub }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-gray-500 w-20 shrink-0 text-right">
        {label}
      </span>
      <div className="flex-1 bg-gray-100 rounded-full h-5 relative overflow-hidden">
        <div
          className="bg-indigo-500 h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-semibold text-gray-700 w-12 shrink-0">
        {value}{sub !== undefined ? `/${sub}` : ""}
      </span>
    </div>
  );
}

function TraineeRow({ rank, name, count, isHigh }) {
  return (
    <div className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
      <span
        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
          isHigh
            ? "bg-green-100 text-green-700"
            : "bg-red-100 text-red-600"
        }`}
      >
        {rank}
      </span>
      <span className="flex-1 text-sm text-gray-900 truncate">{name}</span>
      <span className="text-xs font-semibold text-gray-500">{count} completed</span>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <h3 className="text-sm font-bold text-gray-900 mb-4">{title}</h3>
      {children}
    </div>
  );
}

export default function Analytics() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAnalytics()
      .then((res) => setData(res.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => <SkeletonStatCard key={i} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 h-48 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <PageHeader title="Analytics" subtitle="Trainer performance insights" />
        <EmptyState
          icon="Progress"
          title="No data yet"
          message="Start assigning workouts and tracking progress to see analytics."
        />
      </div>
    );
  }

  const { stats, weeklyCompletion, monthlyCompletion, mostActive, leastActive } = data;
  const maxWeeklyValue = Math.max(...weeklyCompletion.map((w) => w.assigned), 1);
  const maxMonthlyValue = Math.max(...monthlyCompletion.map((m) => m.assigned), 1);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        subtitle={`Performance insights for ${user?.name}`}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {cardConfig.map((cfg) => {
          const val = stats[cfg.key];
          const suffix = typeof cfg.suffix === "function" ? cfg.suffix(val, stats) : (cfg.suffix || "");
          return (
            <div
              key={cfg.key}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 relative overflow-hidden"
            >
              <div className={`absolute top-0 right-0 w-20 h-20 -mr-6 -mt-6 rounded-full opacity-10 ${cfg.bg}`} />
              <p className="text-sm text-gray-500 mb-1">{cfg.label}</p>
              <p className={`text-3xl font-bold ${cfg.color}`}>
                {val}{suffix}
              </p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Weekly Completion (Last 4 Weeks)">
          <div className="space-y-3">
            {weeklyCompletion.map((w) => (
              <Bar
                key={w.weekStart}
                label={new Date(w.weekStart).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                value={w.completed}
                max={maxWeeklyValue}
                sub={w.assigned}
              />
            ))}
          </div>
        </ChartCard>

        <ChartCard title="Monthly Completion (Last 6 Months)">
          <div className="space-y-3">
            {monthlyCompletion.map((m) => (
              <Bar
                key={m.month}
                label={m.label}
                value={m.completed}
                max={maxMonthlyValue}
                sub={m.assigned}
              />
            ))}
          </div>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Most Active Trainees">
          {mostActive.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No data yet</p>
          ) : (
            mostActive.map((t, i) => (
              <TraineeRow key={t.traineeId} rank={i + 1} name={t.name} count={t.completed} isHigh />
            ))
          )}
        </ChartCard>

        <ChartCard title="Least Active Trainees">
          {leastActive.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No data yet</p>
          ) : (
            leastActive.map((t, i) => (
              <TraineeRow key={t.traineeId} rank={i + 1} name={t.name} count={t.completed} isHigh={false} />
            ))
          )}
        </ChartCard>
      </div>
    </div>
  );
}
