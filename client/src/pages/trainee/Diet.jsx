import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getTodayDiet } from "../../api/trainee";
import { useAuth } from "../../context/AuthContext";
import PageHeader from "../../components/PageHeader";
import EmptyState from "../../components/EmptyState";
import { SkeletonCard } from "../../components/Skeleton";

export default function Diet() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const linkedTrainer = user?.traineeLinks?.[0]?.trainer;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getTodayDiet()
      .then((res) => setData(res.data))
      .catch((err) => {
        const status = err.response?.status;
        const apiMsg = err.response?.data?.error;
        if (status === 404) {
          setError(apiMsg || "No diet has been assigned for today.");
        } else {
          setError(apiMsg || "Failed to load today's diet");
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <SkeletonCard rows={3} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Today's Diet" />
        <EmptyState
          icon="clipboard"
          title="No Diet Plan Today"
          message={
            linkedTrainer
              ? "Your trainer hasn't assigned a diet plan for today. Check back later or contact your trainer."
              : "Link to a trainer to receive personalized diet plans."
          }
          action={
            !linkedTrainer ? (
              <button
                type="button"
                onClick={() => navigate("/trainee/link-trainer")}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition text-sm font-semibold"
              >
                Link to Trainer
              </button>
            ) : null
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Today's Diet" />

      <div className="flex items-center gap-3">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Trainer Assigned
        </span>
        {linkedTrainer && (
          <span className="text-xs text-gray-400">
            by {linkedTrainer.name}
          </span>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <p className="text-sm text-gray-500 mb-1">Day</p>
        <p className="text-xl font-semibold text-gray-900">{data?.day}</p>
      </div>

      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          Meals ({data?.meals?.length || 0})
        </h2>
        <div className="space-y-3">
          {data?.meals?.map((meal, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                {meal.time}
              </h3>
              <ul className="space-y-1">
                {meal.items?.map((item, i) => (
                  <li
                    key={i}
                    className="text-gray-600 text-sm flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
