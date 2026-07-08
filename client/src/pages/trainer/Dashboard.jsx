import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getDashboard } from "../../api/trainer";
import { useAuth } from "../../context/AuthContext";

export default function TrainerDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

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

  return (
    <div className="px-4 py-10">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Trainer Dashboard
        </h1>
        <p className="text-gray-500 mb-8">Welcome, {user?.name}</p>

        {error && (
          <div
            role="alert"
            className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
          >
            {error}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <p className="text-sm text-gray-500 mb-1">Trainer Code</p>
              <p className="text-2xl font-mono font-bold text-gray-900">
                {data?.trainerCode}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Trainees</p>
              <p className="text-2xl font-bold text-gray-900">
                {data?.totalTrainees}
              </p>
            </div>
          </div>
        </div>

        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Linked Trainees
        </h2>

        {data?.trainees?.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
            <p className="text-gray-500">
              No trainees have linked to your trainer code yet.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {data?.trainees?.map((trainee) => (
              <div
                key={trainee.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {trainee.name}
                </h3>
                <p className="text-sm text-gray-500 mb-1">{trainee.email}</p>
                <p className="text-xs text-gray-400 mb-4">
                  Linked: {new Date(trainee.linkedAt).toLocaleDateString()}
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      navigate(`/trainer/trainees/${trainee.id}/workout`)
                    }
                    className="flex-1 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
                  >
                    Assign Workout
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      navigate(`/trainer/trainees/${trainee.id}/diet`)
                    }
                    className="flex-1 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
                  >
                    Assign Diet
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      navigate(`/trainer/trainees/${trainee.id}/logs`)
                    }
                    className="flex-1 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
                  >
                    View Logs
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
