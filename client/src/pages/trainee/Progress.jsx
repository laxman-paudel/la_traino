import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getWeeklyProgress } from "../../api/progress";
import { fetchFeedback } from "../../api/trainee";
import PageHeader from "../../components/PageHeader";
import EmptyState from "../../components/EmptyState";
import { SkeletonCard, SkeletonStatCard } from "../../components/Skeleton";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function Progress() {
  const [data, setData] = useState(null);
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([getWeeklyProgress(), fetchFeedback()])
      .then(([progressRes, feedbackRes]) => {
        setData(progressRes.data);
        setFeedback(feedbackRes.data);
      })
      .catch((err) =>
        setError(err.response?.data?.error || "Failed to load progress"),
      )
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-2 gap-4">
          <SkeletonStatCard />
          <SkeletonStatCard />
        </div>
        <SkeletonCard rows={4} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Weekly Progress" />
        <EmptyState
          icon="chart"
          title="Unable to Load Progress"
          message={error}
        />
      </div>
    );
  }

  const chartData = (data?.logs || []).map((log) => ({
    day: DAY_LABELS[new Date(log.day).getDay()],
    Completed: log.completed ? 1 : 0,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Weekly Progress"
        subtitle={
          data
            ? `${data.weekStart} — ${data.weekEnd}`
            : "Your training progress for this week"
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 -mr-6 -mt-6 rounded-full bg-indigo-50 opacity-30" />
          <p className="text-sm text-gray-500 mb-1">Days Completed</p>
          <p className="text-3xl font-bold text-gray-900">
            {data?.daysCompleted ?? 0}
            <span className="text-lg text-gray-400 font-normal">
              {" "}/ {data?.totalDays ?? 7}
            </span>
          </p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 -mr-6 -mt-6 rounded-full bg-emerald-50 opacity-30" />
          <p className="text-sm text-gray-500 mb-1">Completion Rate</p>
          <p className="text-3xl font-bold text-emerald-600">
            {data?.completionRate ?? 0}%
          </p>
        </div>
      </div>

      {chartData.length > 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Daily Overview
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <XAxis
                dataKey="day"
                tick={{ fontSize: 12, fill: "#6b7280" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[0, 1]}
                ticks={[0, 1]}
                tick={{ fontSize: 12, fill: "#6b7280" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip />
              <Bar
                dataKey="Completed"
                fill="#4f46e5"
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <EmptyState
          icon="chart"
          title="No Activity Yet"
          message="Complete your first workout to see your weekly progress chart."
          compact
        />
      )}

      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          Weekly Feedback
        </h2>
        {feedback.length === 0 ? (
          <EmptyState
            icon="clipboard"
            title="No Feedback Yet"
            message="Your trainer hasn't shared any feedback yet. Feedback appears here after your trainer reviews your progress."
            compact
          />
        ) : (
          <div className="space-y-3">
            {feedback.map((fb, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5"
              >
                <p className="text-sm text-gray-500 mb-1">
                  Week of {new Date(fb.weekStart).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                <p className="text-gray-900 leading-relaxed">{fb.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
