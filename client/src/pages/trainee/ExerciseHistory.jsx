import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getTraineeExerciseHistory } from "../../api/exerciseHistory";
import { useAuth } from "../../context/AuthContext";
import PageHeader from "../../components/PageHeader";
import PersonalBestCard from "../../components/PersonalBestCard";
import ExerciseChart from "../../components/ExerciseChart";
import { SkeletonCard } from "../../components/Skeleton";
import StatusBadge from "../../components/StatusBadge";

const PERIODS = [
  { value: "7", label: "7 days" },
  { value: "30", label: "30 days" },
  { value: "90", label: "90 days" },
  { value: "all", label: "All time" },
];

const categoryColors = {
  chest: "bg-red-100 text-red-700", back: "bg-blue-100 text-blue-700",
  legs: "bg-purple-100 text-purple-700", glutes: "bg-pink-100 text-pink-700",
  calves: "bg-teal-100 text-teal-700", shoulders: "bg-orange-100 text-orange-700",
  biceps: "bg-cyan-100 text-cyan-700", triceps: "bg-indigo-100 text-indigo-700",
  forearms: "bg-amber-100 text-amber-700", core: "bg-green-100 text-green-700",
  cardio: "bg-rose-100 text-rose-700", mobility: "bg-sky-100 text-sky-700",
  stretching: "bg-lime-100 text-lime-700", neck: "bg-gray-100 text-gray-700",
  "full-body": "bg-violet-100 text-violet-700",
};

function ComparisonBadge({ change }) {
  if (!change) return null;
  if (change.direction === "same") {
    return <span className="text-xs text-gray-400">Same as last session</span>;
  }
  const isUp = change.direction === "up";
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${isUp ? "text-green-600" : "text-red-600"}`}>
      {isUp ? (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
      ) : (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
      )}
      {change.metric.replace(/_/g, " ")}: {change.from} → {change.to} {change.unit || ""}
    </span>
  );
}

export default function ExerciseHistory() {
  const { exerciseName } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const printRef = useRef(null);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [period, setPeriod] = useState("all");

  const decodedName = decodeURIComponent(exerciseName);

  useEffect(() => {
    setLoading(true);
    setError("");
    getTraineeExerciseHistory(decodedName, { period })
      .then((res) => setData(res.data))
      .catch((err) => setError(err.response?.data?.error || "Failed to load exercise history"))
      .finally(() => setLoading(false));
  }, [decodedName, period]);

  function handlePrint() {
    window.print();
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
        <SkeletonCard rows={5} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Exercise History" />
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <p className="text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { exerciseDetails, personalBests, comparison, history, trainerComments } = data;
  const isFirstSession = history.length <= 1;

  return (
    <div ref={printRef} className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <PageHeader title={decodedName} />
        <button
          type="button"
          onClick={handlePrint}
          className="px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition text-xs font-semibold text-gray-600 flex items-center gap-1.5"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Export PDF
        </button>
      </div>

      {/* Exercise summary */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {exerciseDetails?.imageUrl && (
          <div className="h-40 bg-gray-100">
            <img src={exerciseDetails.imageUrl} alt={decodedName} className="w-full h-full object-cover"
              onError={(e) => { e.currentTarget.style.display = "none"; }} />
          </div>
        )}
        <div className="p-5">
          <div className="flex items-center gap-3 mb-3">
            <h2 className="text-xl font-bold text-gray-900">{decodedName}</h2>
            {exerciseDetails?.category && (
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${categoryColors[exerciseDetails.category] || "bg-gray-100 text-gray-700"}`}>
                {exerciseDetails.category}
              </span>
            )}
            {exerciseDetails?.difficulty && (
              <StatusBadge variant="gray">{exerciseDetails.difficulty}</StatusBadge>
            )}
          </div>
          {exerciseDetails?.primaryMuscles?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {exerciseDetails.primaryMuscles.map((m) => (
                <span key={m} className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full">{m}</span>
              ))}
            </div>
          )}
          {exerciseDetails?.instructions && (
            <p className="text-sm text-gray-500 mt-3">{exerciseDetails.instructions}</p>
          )}
          <p className="text-xs text-gray-400 mt-2">{data.totalSessions} session{data.totalSessions !== 1 ? "s" : ""} completed</p>
        </div>
      </div>

      {/* Personal Bests */}
      {personalBests && Object.keys(personalBests).length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-3">Personal Bests</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {Object.entries(personalBests).map(([key, best]) => (
              <PersonalBestCard key={key} bestKey={key} best={best} />
            ))}
          </div>
        </div>
      )}

      {/* Comparison */}
      {comparison && comparison.changes.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-bold text-gray-900 mb-3">Progress vs Last Session</h3>
          <div className="flex flex-wrap gap-3">
            {comparison.changes.map((c, i) => (
              <ComparisonBadge key={i} change={c} />
            ))}
          </div>
          {comparison.changes.length === 0 && (
            <p className="text-sm text-gray-400">No changes detected between last two sessions.</p>
          )}
        </div>
      )}

      {/* Progress Chart */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h3 className="text-sm font-bold text-gray-900 mb-4">Progression</h3>
        <ExerciseChart history={history} />
      </div>

      {/* Filters + History Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-900">Session History</h3>
          <div className="flex gap-1.5">
            {PERIODS.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => setPeriod(p.value)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                  period === p.value
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {history.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-400">No sessions in this period.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-50 text-xs text-gray-500 uppercase">
                  <th className="text-left px-5 py-3 font-semibold">Date</th>
                  <th className="text-center px-3 py-3 font-semibold">Sets</th>
                  <th className="text-center px-3 py-3 font-semibold">Reps</th>
                  <th className="text-center px-3 py-3 font-semibold">Weight</th>
                  <th className="text-center px-3 py-3 font-semibold">Duration</th>
                  <th className="text-center px-3 py-3 font-semibold">Distance</th>
                  <th className="text-left px-3 py-3 font-semibold">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {history.map((h) => {
                  const maxRep = Array.isArray(h.sets)
                    ? Math.max(...h.sets.map((s) => parseInt(s.reps, 10) || 0), 0)
                    : 0;
                  return (
                    <tr key={h.logId} className="hover:bg-gray-50/50 transition">
                      <td className="px-5 py-3 text-gray-900 font-medium whitespace-nowrap">{h.day}</td>
                      <td className="px-3 py-3 text-center text-gray-700">{h.actual.setsCompleted}/{h.actual.totalSets}</td>
                      <td className="px-3 py-3 text-center text-gray-700">{maxRep || h.assigned.reps || "-"}</td>
                      <td className="px-3 py-3 text-center text-gray-700">{h.actual.weight || h.assigned.weight || "-"}</td>
                      <td className="px-3 py-3 text-center text-gray-700">{h.actual.duration || "-"}</td>
                      <td className="px-3 py-3 text-center text-gray-700">{h.actual.distance || "-"}</td>
                      <td className="px-3 py-3 text-gray-500 text-xs max-w-[150px] truncate">{h.actual.notes || "-"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Trainer comments */}
      {trainerComments?.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-bold text-gray-900 mb-3">Coach Comments</h3>
          <div className="space-y-2">
            {trainerComments.map((c, i) => (
              <div key={i} className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
                <p className="text-sm text-emerald-800">"{c.comment}"</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
