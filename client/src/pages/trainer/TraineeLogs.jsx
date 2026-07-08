import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getWorkoutLogs } from "../../api/trainer";

export default function TraineeLogs() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getWorkoutLogs(id)
      .then((res) => setLogs(res.data))
      .catch((err) =>
        setError(err.response?.data?.error || "Failed to load workout logs"),
      )
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center flex-1">
        <div className="animate-spin h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="px-4 py-10">
      <div className="max-w-xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Workout Logs</h1>
        <p className="text-gray-500 mb-4">
          View trainee workout completion history.
        </p>

        <button
          type="button"
          onClick={() => navigate(`/trainer/trainees/${id}/feedback`)}
          className="mb-8 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
        >
          Weekly Feedback
        </button>

        {error ? (
          <div
            role="alert"
            className="p-4 bg-white rounded-2xl shadow-sm border border-gray-100 text-center"
          >
            <p className="text-gray-500">{error}</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-8 bg-white rounded-2xl shadow-sm border border-gray-100 text-center">
            <p className="text-gray-500">No workout logs available.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {logs.map((log, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5"
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="text-lg font-semibold text-gray-900">
                    {log.day}
                  </p>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      log.completed
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {log.completed ? "Completed" : "Not Completed"}
                  </span>
                </div>
                <div className="flex gap-4 text-sm">
                  <div className="bg-gray-50 rounded-lg px-3 py-2">
                    <span className="text-gray-500">Exercises: </span>
                    <span className="font-semibold text-gray-900">
                      {log.exerciseCount}
                    </span>
                  </div>
                  {log.completedAt && (
                    <div className="bg-gray-50 rounded-lg px-3 py-2">
                      <span className="text-gray-500">Completed at: </span>
                      <span className="font-semibold text-gray-900">
                        {new Date(log.completedAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
