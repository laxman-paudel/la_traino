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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  const chartData = (data?.logs || []).map((log) => ({
    day: DAY_LABELS[new Date(log.day).getDay()],
    Completed: log.completed ? 1 : 0,
  }));

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="max-w-xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Weekly Progress
        </h1>
        <p className="text-gray-500 mb-8">
          {data?.weekStart} — {data?.weekEnd}
        </p>

        {error ? (
          <div
            role="alert"
            className="p-4 bg-white rounded-2xl shadow-sm border border-gray-100 text-center"
          >
            <p className="text-gray-500">{error}</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 text-center">
                <p className="text-sm text-gray-500 mb-1">Days Completed</p>
                <p className="text-3xl font-bold text-gray-900">
                  {data?.daysCompleted}
                  <span className="text-lg text-gray-400 font-normal">
                    {" "}
                    / {data?.totalDays}
                  </span>
                </p>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 text-center">
                <p className="text-sm text-gray-500 mb-1">Completion Rate</p>
                <p className="text-3xl font-bold text-indigo-600">
                  {data?.completionRate}%
                </p>
              </div>
            </div>

            {chartData.length > 0 && (
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
            )}

            <h2 className="text-lg font-bold text-gray-900 mb-4 mt-8">
              Weekly Feedback
            </h2>

            {feedback.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
                <p className="text-gray-500">No feedback available yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {feedback.map((fb, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5"
                  >
                    <p className="text-sm text-gray-500 mb-1">
                      Week of {fb.weekStart}
                    </p>
                    <p className="text-gray-900">{fb.message}</p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
