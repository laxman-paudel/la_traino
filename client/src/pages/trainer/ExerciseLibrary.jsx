import { useState, useEffect, useCallback, useRef } from "react";
import { getExercises, createExercise, updateExercise, deleteExercise } from "../../api/exercises";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import PageHeader from "../../components/PageHeader";
import EmptyState from "../../components/EmptyState";
import ExerciseCard from "../../components/ExerciseCard";
import ExerciseDetail from "../../components/ExerciseDetail";
import ExerciseForm from "../../components/ExerciseForm";
import ConfirmDialog from "../../components/ConfirmDialog";

const CATEGORIES = [
  "chest", "back", "legs", "glutes", "calves", "shoulders",
  "biceps", "triceps", "forearms", "core", "cardio",
  "mobility", "stretching", "neck", "full-body",
];

const DIFFICULTIES = ["Beginner", "Intermediate", "Advanced"];

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="h-36 bg-gray-100 animate-pulse" />
          <div className="p-4 space-y-3">
            <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
            <div className="h-3 w-1/2 bg-gray-200 rounded animate-pulse" />
            <div className="h-3 w-1/3 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

function FilterPill({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-xs font-medium px-3 py-1.5 rounded-full border transition whitespace-nowrap ${
        active
          ? "bg-indigo-600 text-white border-indigo-600"
          : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:text-indigo-600"
      }`}
    >
      {label}
    </button>
  );
}

export default function ExerciseLibrary() {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [exercises, setExercises] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [owner, setOwner] = useState(""); // "" | "official" | "mine"
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [viewExercise, setViewExercise] = useState(null);
  const [editExercise, setEditExercise] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);

  const debounceRef = useRef(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [search]);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (debouncedSearch) params.search = debouncedSearch;
      if (category) params.category = category;
      if (difficulty) params.difficulty = difficulty;
      if (owner) params.owner = owner;
      const res = await getExercises(params);
      setExercises(res.data.exercises);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
    } catch {
      addToast("Failed to load exercises", "error");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, category, difficulty, owner, page, addToast]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const handleSave = async (data) => {
    setSaving(true);
    try {
      if (editExercise) {
        await updateExercise(editExercise.id, data);
        addToast("Exercise updated", "success");
      } else {
        await createExercise(data);
        addToast("Exercise created", "success");
      }
      setShowForm(false);
      setEditExercise(null);
      fetch();
    } catch {
      addToast("Failed to save exercise", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteExercise(deleteTarget.id);
      addToast("Exercise deleted", "success");
      setDeleteTarget(null);
      fetch();
    } catch {
      addToast("Failed to delete exercise", "error");
    } finally {
      setDeleting(false);
    }
  };

  const openEdit = (ex) => {
    setEditExercise(ex);
    setShowForm(true);
  };

  const openCreate = () => {
    setEditExercise(null);
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Exercise Library"
        subtitle="Browse and manage your exercise collection."
      />

      {/* Search + Create */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search exercise..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
          />
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition whitespace-nowrap"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Exercise
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs font-medium text-gray-500 mr-1">Category:</span>
        <FilterPill label="All" active={!category} onClick={() => { setCategory(""); setPage(1); }} />
        {CATEGORIES.map((c) => (
          <FilterPill key={c} label={c} active={category === c} onClick={() => { setCategory(c === category ? "" : c); setPage(1); }} />
        ))}
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs font-medium text-gray-500 mr-1">Difficulty:</span>
        <FilterPill label="All" active={!difficulty} onClick={() => { setDifficulty(""); setPage(1); }} />
        {DIFFICULTIES.map((d) => (
          <FilterPill key={d} label={d} active={difficulty === d} onClick={() => { setDifficulty(d === difficulty ? "" : d); setPage(1); }} />
        ))}
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs font-medium text-gray-500 mr-1">Owner:</span>
        <FilterPill label="All" active={!owner} onClick={() => { setOwner(""); setPage(1); }} />
        <FilterPill label="Official" active={owner === "official"} onClick={() => { setOwner(owner === "official" ? "" : "official"); setPage(1); }} />
        <FilterPill label="My Exercises" active={owner === "mine"} onClick={() => { setOwner(owner === "mine" ? "" : "mine"); setPage(1); }} />
      </div>

      {/* Count */}
      {!loading && (
        <p className="text-sm text-gray-500">{total} exercise{total !== 1 ? "s" : ""} found</p>
      )}

      {/* Grid */}
      {loading ? (
        <SkeletonGrid />
      ) : exercises.length === 0 ? (
        <EmptyState message="No exercises found." />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {exercises.map((ex) => (
              <ExerciseCard
                key={ex.id}
                exercise={ex}
                onView={setViewExercise}
                onEdit={openEdit}
                onDelete={setDeleteTarget}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Previous
              </button>
              <span className="text-sm text-gray-500 px-3">
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Modals */}
      <ExerciseDetail exercise={viewExercise} onClose={() => setViewExercise(null)} />
      <ExerciseForm
        open={showForm}
        exercise={editExercise}
        onSave={handleSave}
        onClose={() => { setShowForm(false); setEditExercise(null); }}
        saving={saving}
      />
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Exercise"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        danger
        loading={deleting}
      />
    </div>
  );
}
