import { useState, useEffect } from "react";
import { getGlobalWorkoutPresets } from "../api/trainer";
import { getGlobalDietPresets } from "../api/trainer";
import { importFromGlobalWorkout } from "../api/templates";
import { importFromGlobalDiet } from "../api/dietTemplates";

export default function GlobalImportModal({ isOpen, onClose, type, onImportComplete, onImportError }) {
  const [globalPresets, setGlobalPresets] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedGlobal, setSelectedGlobal] = useState(null);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setSearch("");
    setSelectedGlobal(null);
    const fetcher = type === "workout" ? getGlobalWorkoutPresets : getGlobalDietPresets;
    fetcher()
      .then((res) => setGlobalPresets(res.data || []))
      .catch(() => setGlobalPresets([]));
  }, [isOpen, type]);

  if (!isOpen) return null;

  const isWorkout = type === "workout";

  function matchesSearch(g) {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      g.name?.toLowerCase().includes(q) ||
      g.description?.toLowerCase().includes(q) ||
      g.difficulty?.toLowerCase().includes(q) ||
      g.category?.toLowerCase().includes(q)
    );
  }

  async function handleImport() {
    if (!selectedGlobal) return;
    setImporting(true);
    try {
      const importer = isWorkout ? importFromGlobalWorkout : importFromGlobalDiet;
      const res = await importer(selectedGlobal.id);
      onImportComplete?.(res.data);
      onClose();
    } catch (err) {
      onImportError?.(err);
    } finally {
      setImporting(false);
    }
  }

  const filtered = globalPresets.filter(matchesSearch);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
          <h3 className="text-lg font-bold text-gray-900">Import from Global Library</h3>
          <button type="button" onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition cursor-pointer">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 border-b border-gray-100">
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search global ${isWorkout ? "workout" : "diet"} presets...`}
            className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm" />
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filtered.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No matching presets found</p>
          ) : filtered.map((g) => (
            <button key={g.id} type="button" onClick={() => setSelectedGlobal(g)}
              className={`w-full text-left p-4 rounded-xl border-2 transition cursor-pointer ${
                selectedGlobal?.id === g.id ? "border-indigo-500 bg-indigo-50" : "border-gray-100 hover:border-gray-200"
              }`}>
              <p className="text-sm font-semibold text-gray-900">{g.name}</p>
              {g.description && <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{g.description}</p>}
              <div className="flex gap-2 mt-1.5">
                {g.category && <span className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded">{g.category}</span>}
                {g.difficulty && <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 rounded text-gray-500">{g.difficulty}</span>}
                {isWorkout
                  ? g.exercises && <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 rounded text-gray-500">{g.exercises.length} exercises</span>
                  : g.meals && <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 rounded text-gray-500">{g.meals.length} meals</span>
                }
              </div>
            </button>
          ))}
        </div>

        {selectedGlobal && (
          <div className="px-6 py-3 border-t border-gray-100 bg-gray-50">
            <p className="text-xs font-semibold text-gray-500 mb-1">Preview: {selectedGlobal.name}</p>
            {isWorkout ? (
              selectedGlobal.exercises?.slice(0, 5).map((ex, i) => (
                <p key={i} className="text-xs text-gray-600">&bull; {ex.name} ({ex.sets}x{ex.reps})</p>
              ))
            ) : (
              (selectedGlobal.meals || []).slice(0, 5).map((m, i) => (
                <p key={i} className="text-xs text-gray-600">&bull; {m.time}: {(m.items || []).join(", ")}</p>
              ))
            )}
            {(isWorkout ? selectedGlobal.exercises?.length > 5 : selectedGlobal.meals?.length > 5) && (
              <p className="text-xs text-gray-400 italic mt-0.5">
                +{(isWorkout ? selectedGlobal.exercises.length : selectedGlobal.meals.length) - 5} more
              </p>
            )}
          </div>
        )}

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 shrink-0">
          <button type="button" onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200">
            Cancel
          </button>
          <button type="button" disabled={!selectedGlobal || importing} onClick={handleImport}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed">
            {importing ? "Importing..." : "Import"}
          </button>
        </div>
      </div>
    </div>
  );
}
