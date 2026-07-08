import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getDashboard } from "../../api/admin";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getDashboard()
      .then((res) => setData(res.data))
      .catch((err) =>
        setError(err.response?.data?.error || "Failed to load dashboard"),
      )
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center flex-1">
        <div className="animate-spin h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  const cards = [
    { label: "Total Users", value: data?.totalUsers, color: "text-indigo-600" },
    { label: "Trainers", value: data?.totalTrainers, color: "text-purple-600" },
    { label: "Trainees", value: data?.totalTrainees, color: "text-green-600" },
    { label: "Presets", value: data?.totalPresets, color: "text-orange-600" },
  ];

  return (
    <div className="px-4 py-10">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Admin Dashboard
        </h1>
        <p className="text-gray-500 mb-8">Overview of the system.</p>

        {error && (
          <div
            role="alert"
            className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
          >
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {cards.map((card) => (
            <div
              key={card.label}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 text-center"
            >
              <p className="text-sm text-gray-500 mb-1">{card.label}</p>
              <p className={`text-3xl font-bold ${card.color}`}>{card.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => navigate("/admin/users")}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-left hover:shadow-md transition"
          >
            <h2 className="text-lg font-bold text-gray-900 mb-1">
              Manage Users
            </h2>
            <p className="text-sm text-gray-500">View and toggle user status</p>
          </button>
          <button
            type="button"
            onClick={() => navigate("/admin/presets")}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-left hover:shadow-md transition"
          >
            <h2 className="text-lg font-bold text-gray-900 mb-1">
              Manage Presets
            </h2>
            <p className="text-sm text-gray-500">
              Create, edit and delete preset workouts
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}
