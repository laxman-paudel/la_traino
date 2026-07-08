import { useState, useEffect, useRef } from "react";
import { getExercises } from "../api/exercises";

const CATEGORIES = [
  "chest", "back", "legs", "glutes", "calves", "shoulders",
  "biceps", "triceps", "forearms", "core", "cardio",
  "mobility", "stretching", "neck", "full-body",
];

const DIFFICULTIES = ["Beginner", "Intermediate", "Advanced"];

const categoryColors = {
  chest: "bg-red-100 text-red-700",
  back: "bg-blue-100 text-blue-700",
  legs: "bg-purple-100 text-purple-700",
  glutes: "bg-pink-100 text-pink-700",
  calves: "bg-teal-100 text-teal-700",
  shoulders: "bg-orange-100 text-orange-700",
  biceps: "bg-cyan-100 text-cyan-700",
  triceps: "bg-indigo-100 text-indigo-700",
  forearms: "bg-amber-100 text-amber-700",
  core: "bg-green-100 text-green-700",
  cardio: "bg-rose-100 text-rose-700",
  mobility: "bg-sky-100 text-sky-700",
  stretching: "bg-lime-100 text-lime-700",
  neck: "bg-gray-100 text-gray-700",
  "full-body": "bg-violet-100 text-violet-700",
};

const diffColors = {
  Beginner: "bg-emerald-100 text-emerald-700",
  Intermediate: "bg-amber-100 text-amber-700",
  Advanced: "bg-red-100 text-red-700",
};

function FilterPill({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-[10px] font-medium px-2.5 py-1 rounded-full border transition whitespace-nowrap ${
        active
          ? "bg-indigo-600 text-white border-indigo-600"
          : "bg-white text-gray-500 border-gray-200 hover:border-indigo-300 hover:text-indigo-600"
      }`}
    >
      {label}
    </button>
  );
}

export default function ExercisePicker({ onAdd, addedIds = [] }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(search), 250);
    return () => clearTimeout(debounceRef.current);
  }, [search]);

  useEffect(() => {
    setLoading(true);
    const params = { limit: 50 };
    if (debouncedSearch) params.search = debouncedSearch;
    if (category) params.category = category;
    if (difficulty) params.difficulty = difficulty;
    getExercises(params)
      .then((res) => setExercises(res.data.exercises))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [debouncedSearch, category, difficulty]);

  const muscles = (arr) =>
    arr ? (Array.isArray(arr) ? arr : [arr]).slice(0, 2) : [];

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search exercise..."
          className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
        />
      </div>

      {/* Category pills */}
      <div className="flex flex-wrap gap-1.5">
        <FilterPill label="All" active={!category} onClick={() => setCategory("")} />
        {CATEGORIES.map((c) => (
          <FilterPill key={c} label={c} active={category === c} onClick={() => setCategory(c === category ? "" : c)} />
        ))}
      </div>

      {/* Difficulty pills */}
      <div className="flex flex-wrap gap-1.5">
        <FilterPill label="All" active={!difficulty} onClick={() => setDifficulty("")} />
        {DIFFICULTIES.map((d) => (
          <FilterPill key={d} label={d} active={difficulty === d} onClick={() => setDifficulty(d === difficulty ? "" : d)} />
        ))}
      </div>

      {/* Results */}
      <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin h-5 w-5 border-2 border-indigo-600 border-t-transparent rounded-full" />
          </div>
        ) : exercises.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">No exercises found.</p>
        ) : (
          exercises.map((ex) => {
            const added = addedIds.includes(ex.id);
            return (
              <div
                key={ex.id}
                className={`flex items-start gap-3 p-3 rounded-xl border transition ${
                  added ? "border-indigo-200 bg-indigo-50/50" : "border-gray-100 hover:border-indigo-200 hover:bg-gray-50"
                }`}
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 shrink-0 flex items-center justify-center">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{ex.name}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${categoryColors[ex.category] || "bg-gray-100 text-gray-700"}`}>
                      {ex.category}
                    </span>
                    {ex.difficulty && (
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${diffColors[ex.difficulty] || "bg-gray-100 text-gray-700"}`}>
                        {ex.difficulty}
                      </span>
                    )}
                  </div>
                  {muscles(ex.primaryMuscles).length > 0 && (
                    <p className="text-[11px] text-gray-400 mt-0.5 truncate">{muscles(ex.primaryMuscles).join(", ")}</p>
                  )}
                  {ex.equipment && (
                    <p className="text-[11px] text-gray-400">{ex.equipment}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => onAdd(ex)}
                  disabled={added}
                  className={`shrink-0 px-3 py-1.5 text-xs font-medium rounded-lg transition ${
                    added
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                  }`}
                >
                  {added ? "Added" : "Add"}
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
