import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getWorkoutHistory, getDietHistory } from "../../api/trainer";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { SkeletonStatCard } from "../../components/Skeleton";
import PageHeader from "../../components/PageHeader";
import EmptyState from "../../components/EmptyState";
import ErrorState from "../../components/ErrorState";

const TABS = [
  { value: "workout", label: "Workout History" },
  { value: "diet", label: "Diet History" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
];

export default function History() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const { addToast } = useToast();

  const tab = searchParams.get("tab") || "workout";
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [traineeFilter, setTraineeFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sort, setSort] = useState("newest");

  const trainees = useMemo(() => {
    const seen = new Set();
    return data.reduce((acc, r) => {
      if (!seen.has(r.trainee.id)) {
        seen.add(r.trainee.id);
        acc.push(r.trainee);
      }
      return acc;
    }, []);
  }, [data]);

  function fetchData() {
    setLoading(true);
    setError("");
    const fetcher = tab === "workout" ? getWorkoutHistory : getDietHistory;
    const params = {};
    if (traineeFilter) params.traineeId = traineeFilter;
    if (dateFrom) params.dateFrom = dateFrom;
    if (dateTo) params.dateTo = dateTo;
    if (sort) params.sort = sort;

    let mounted = true;
    fetcher(params)
      .then((res) => { if (mounted) setData(res.data); })
      .catch((err) => { if (mounted) setError(err.response?.data?.error || "Failed to load history"); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }

  useEffect(() => {
    return fetchData();
  }, [tab, traineeFilter, dateFrom, dateTo, sort]);

  function setTab(value) {
    setSearchParams({ tab: value });
    setTraineeFilter("");
    setDateFrom("");
    setDateTo("");
    setSort("newest");
  }

  function handleEdit(record) {
    if (tab === "workout") {
      navigate(`/trainer/trainees/${record.trainee.id}/workout`, {
        state: {
          prefillDay: record.dayName || record.day,
          prefillExercises: record.exercises.map((ex) => ({
            name: ex.name,
            sets: String(ex.sets),
            reps: String(ex.reps),
          })),
        },
      });
    } else {
      navigate(`/trainer/trainees/${record.trainee.id}/diet`, {
        state: {
          prefillDay: record.day,
          prefillMeals: record.meals.map((m) => ({
            time: m.time,
            items: Array.isArray(m.items) ? m.items.join(", ") : "",
          })),
        },
      });
    }
  }

  function handleDuplicate(record) {
    if (tab === "workout") {
      navigate(`/trainer/trainees/${record.trainee.id}/workout`, {
        state: {
          prefillExercises: record.exercises.map((ex) => ({
            name: ex.name,
            sets: String(ex.sets),
            reps: String(ex.reps),
          })),
        },
      });
    } else {
      navigate(`/trainer/trainees/${record.trainee.id}/diet`, {
        state: {
          prefillMeals: record.meals.map((m) => ({
            time: m.time,
            items: Array.isArray(m.items) ? m.items.join(", ") : "",
          })),
        },
      });
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assignment History"
        subtitle={`View past ${tab} assignments`}
      />

      <div className="flex gap-2">
        {TABS.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => setTab(t.value)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
              tab === t.value
                ? "bg-indigo-600 text-white shadow-sm shadow-indigo-200"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Trainee
            </label>
            <select
              value={traineeFilter}
              onChange={(e) => setTraineeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm text-gray-900"
            >
              <option value="">All Trainees</option>
              {trainees.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Date From
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm text-gray-900"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Date To
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm text-gray-900"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Sort
            </label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm text-gray-900"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => <SkeletonStatCard key={i} />)}
        </div>
      ) : error ? (
        <ErrorState title="Failed to load history" message={error} onRetry={() => fetchData()} />
      ) : data.length === 0 ? (
        <EmptyState
          icon="Presets"
          title="No history found"
          message="Try adjusting your filters or assign a workout or diet plan first."
        />
      ) : (
        <div className="space-y-3">
          {data.map((record) => (
            <div
              key={record.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-gray-900">
                      {record.day}
                    </span>
                    {record.dayName && (
                      <span className="text-xs text-gray-400">
                        ({record.dayName})
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    {record.trainee.name}
                  </p>
                </div>
                <div className="flex gap-1.5 shrink-0 flex-wrap">
                  {tab === "workout" ? (
                    <span className="inline-flex items-center px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-medium">
                      {record.exerciseCount} exercise
                      {record.exerciseCount !== 1 ? "s" : ""}
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-1 bg-purple-50 text-purple-600 rounded-full text-xs font-medium">
                      {record.mealCount} meal
                      {record.mealCount !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>
              </div>

              {tab === "workout" && (
                <div className="text-xs text-gray-500 mb-4 space-y-1 max-h-20 overflow-y-auto">
                  {(record.exercises || []).map((ex, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="w-4 h-4 bg-indigo-100 text-indigo-600 rounded flex items-center justify-center text-[10px] font-bold shrink-0">
                        {i + 1}
                      </span>
                      <span>{ex.name} — {ex.sets}&times;{ex.reps}</span>
                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/trainer/trainees/${record.trainee.id}/exercise-history/${encodeURIComponent(ex.name)}`,
                          )
                        }
                        className="ml-auto text-indigo-600 hover:text-indigo-700 font-semibold shrink-0"
                      >
                        History
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {tab === "diet" && (
                <div className="text-xs text-gray-500 mb-4 space-y-1 max-h-20 overflow-y-auto">
                  {(record.meals || []).map((meal, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="w-4 h-4 bg-purple-100 text-purple-600 rounded flex items-center justify-center text-[10px] font-bold shrink-0 mt-px">
                        {i + 1}
                      </span>
                      <span>
                        <span className="font-medium">{meal.time}</span>:{" "}
                        {Array.isArray(meal.items)
                          ? meal.items.join(", ")
                          : meal.items}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleEdit(record)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition text-xs font-semibold"
                >
                  Edit &amp; Reassign
                </button>
                <button
                  type="button"
                  onClick={() => handleDuplicate(record)}
                  className="px-4 py-2 border border-indigo-200 text-indigo-600 rounded-xl hover:bg-indigo-50 transition text-xs font-semibold"
                >
                  Duplicate
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
