import { useState } from "react";
import { markNoteRead } from "../api/coaching";

const FILTERS = [
  { value: "all", label: "All" },
  { value: "feedback", label: "Feedback" },
  { value: "exercise", label: "Exercise" },
  { value: "diet", label: "Diet" },
  { value: "workout", label: "Workout" },
  { value: "notes", label: "Notes" },
];

const TYPE_CONFIG = {
  feedback: { icon: "💬", label: "Feedback", color: "border-l-indigo-400" },
  exercise_comment: { icon: "🏋️", label: "Exercise Comment", color: "border-l-emerald-400" },
  diet_comment: { icon: "🥗", label: "Diet Comment", color: "border-l-amber-400" },
  workout_complete: { icon: "✅", label: "Workout Complete", color: "border-l-green-400" },
  diet_complete: { icon: "🎯", label: "Diet Complete", color: "border-l-emerald-400" },
  trainee_note: { icon: "📝", label: "Trainee Note", color: "border-l-blue-400" },
};

function formatTime(dateStr) {
  try {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString();
  } catch {
    return "";
  }
}

function TimelineCard({ item, traineeId, onNoteUpdate }) {
  const cfg = TYPE_CONFIG[item._type] || TYPE_CONFIG.feedback;

  async function handleToggleRead() {
    try {
      await markNoteRead(traineeId, item.id, !item.read);
      if (onNoteUpdate) onNoteUpdate(item.id, !item.read);
    } catch {}
  }

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 border-l-4 ${cfg.color} p-4 transition hover:shadow-md`}>
      <div className="flex items-start gap-3">
        <span className="text-lg shrink-0 mt-0.5">{cfg.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{cfg.label}</span>
            {item._type === "feedback" && (
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                item.read ? "bg-gray-100 text-gray-500" : "bg-indigo-100 text-indigo-700"
              }`}>
                {item.read ? "Read" : "Unread"}
              </span>
            )}
            <span className="text-xs text-gray-400 ml-auto">{formatTime(item.createdAt)}</span>
          </div>

          {/* Feedback note */}
          {item._type === "feedback" && (
            <div className="mt-1.5">
              <p className="text-sm font-semibold text-gray-900">{item.title}</p>
              <p className="text-sm text-gray-600 mt-0.5">{item.message}</p>
              <div className="flex items-center gap-2 mt-1.5">
                {item.priority && (
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    item.priority === "high" ? "bg-red-100 text-red-700" :
                    item.priority === "medium" ? "bg-amber-100 text-amber-700" :
                    "bg-gray-100 text-gray-600"
                  }`}>
                    {item.priority}
                  </span>
                )}
                {item.category && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-50 text-gray-600 border border-gray-200">
                    {item.category}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Exercise comment */}
          {item._type === "exercise_comment" && (
            <div className="mt-1.5">
              <p className="text-sm font-semibold text-emerald-700">{item.exerciseName}</p>
              <p className="text-sm text-gray-600">"{item.comment}"</p>
            </div>
          )}

          {/* Diet comment */}
          {item._type === "diet_comment" && (
            <div className="mt-1.5">
              <p className="text-sm font-semibold text-amber-700 capitalize">{item.mealType}</p>
              <p className="text-sm text-gray-600">"{item.comment}"</p>
            </div>
          )}

          {/* Workout/diet complete */}
          {(item._type === "workout_complete" || item._type === "diet_complete") && (
            <div className="mt-1.5">
              <p className="text-sm text-gray-700">
                {item._type === "workout_complete" ? "Workout" : "Diet"} completed for{" "}
                <span className="font-semibold">{item.day}</span>
              </p>
            </div>
          )}

          {/* Trainee note */}
          {item._type === "trainee_note" && (
            <div className="mt-1.5">
              <p className="text-xs text-blue-600 font-medium capitalize">
                {item.source === "exercise" ? item.exerciseName : item.mealType} {item.source === "exercise" ? "exercise" : "meal"} note
              </p>
              <p className="text-sm text-gray-600 mt-0.5">"{item.note}"</p>
              <p className="text-xs text-gray-400 mt-0.5">{item.day}</p>
            </div>
          )}
        </div>
      </div>

      {/* Read toggle for feedback */}
      {item._type === "feedback" && (
        <div className="flex justify-end mt-2">
          <button
            type="button"
            onClick={handleToggleRead}
            className={`text-xs font-medium px-2.5 py-1 rounded-lg border transition ${
              item.read
                ? "border-gray-200 text-gray-500 hover:bg-gray-50"
                : "border-indigo-200 text-indigo-600 hover:bg-indigo-50"
            }`}
          >
            {item.read ? "Mark Unread" : "Mark Read"}
          </button>
        </div>
      )}
    </div>
  );
}

export default function CoachingTimeline({ traineeId, items, loading, error, onRefresh, onNoteUpdate }) {
  const [activeFilter, setActiveFilter] = useState("all");

  const filtered = activeFilter === "all"
    ? items
    : items.filter((i) => i._type === activeFilter || (activeFilter === "notes" && i._type === "trainee_note"));

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setActiveFilter(f.value)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
              activeFilter === f.value
                ? "bg-indigo-600 text-white border-indigo-600"
                : "bg-white text-gray-600 border-gray-200 hover:border-indigo-200 hover:text-indigo-600"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Timeline items */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-sm text-red-500 mb-2">{error}</p>
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 underline"
            >
              Try again
            </button>
          )}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-8 text-gray-400 text-sm">
          No timeline items to show.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item, idx) => (
            <TimelineCard
              key={`${item._type}-${item.id}-${idx}`}
              item={item}
              traineeId={traineeId}
              onNoteUpdate={onNoteUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
}
