import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export default function ExerciseConfigCard({ exercise, index, onChange, onRemove, onDuplicate }) {
  const [expanded, setExpanded] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: exercise._key });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const set = (field) => (e) => {
    const val = e.target.value;
    onChange(index, field, val === "" ? "" : val);
  };

  const ex = exercise;
  const categoryColor = {
    chest: "bg-red-100 text-red-700",
    back: "bg-blue-100 text-blue-700",
    legs: "bg-purple-100 text-purple-700",
    shoulders: "bg-orange-100 text-orange-700",
    biceps: "bg-cyan-100 text-cyan-700",
    triceps: "bg-indigo-100 text-indigo-700",
    core: "bg-green-100 text-green-700",
  }[ex.category] || "bg-gray-100 text-gray-700";

  return (
    <div ref={setNodeRef} style={style} className="border border-gray-200 rounded-xl bg-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3">
        <button type="button" className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 shrink-0" {...attributes} {...listeners}>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 6a2 2 0 110-4 2 2 0 010 4zm8 0a2 2 0 110-4 2 2 0 010 4zM8 14a2 2 0 110-4 2 2 0 010 4zm8 0a2 2 0 110-4 2 2 0 010 4zM8 22a2 2 0 110-4 2 2 0 010 4zm8 0a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>
        <span className="w-6 h-6 flex items-center justify-center text-xs font-bold text-gray-500 bg-gray-100 rounded-lg shrink-0">
          {index + 1}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{ex._name}</p>
          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${categoryColor}`}>
            {ex._category || ex.category}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onDuplicate(index)}
            className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
            title="Duplicate"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
            title="Remove"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg transition"
          >
            <svg className={`w-4 h-4 transition ${expanded ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Collapsible config */}
      {expanded && (
        <div className="px-4 pb-4 pt-1 border-t border-gray-100 space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div>
              <label className="block text-[10px] font-medium text-gray-500 mb-0.5">Sets *</label>
              <input
                type="number" min="1" placeholder="3"
                value={ex.sets}
                onChange={set("sets")}
                className={`w-full px-2 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none ${
                  ex._error?.sets ? "border-red-300 bg-red-50" : "border-gray-200"
                }`}
              />
              {ex._error?.sets && <p className="text-[10px] text-red-500 mt-0.5">{ex._error.sets}</p>}
            </div>
            <div>
              <label className="block text-[10px] font-medium text-gray-500 mb-0.5">Reps *</label>
              <input
                type="number" min="1" placeholder="10"
                value={ex.reps}
                onChange={set("reps")}
                className={`w-full px-2 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none ${
                  ex._error?.reps ? "border-red-300 bg-red-50" : "border-gray-200"
                }`}
              />
              {ex._error?.reps && <p className="text-[10px] text-red-500 mt-0.5">{ex._error.reps}</p>}
            </div>
            <div>
              <label className="block text-[10px] font-medium text-gray-500 mb-0.5">Weight (kg)</label>
              <input
                type="number" min="0" step="0.5" placeholder="—"
                value={ex.weight}
                onChange={set("weight")}
                className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-medium text-gray-500 mb-0.5">Rest</label>
              <input
                type="text" placeholder="e.g. 60s"
                value={ex.restTime}
                onChange={set("restTime")}
                className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-medium text-gray-500 mb-0.5">Tempo</label>
              <input
                type="text" placeholder="e.g. 2-0-2-0"
                value={ex.tempo}
                onChange={set("tempo")}
                className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-medium text-gray-500 mb-0.5">Notes</label>
              <input
                type="text" placeholder="Optional note"
                value={ex.notes}
                onChange={set("notes")}
                className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
