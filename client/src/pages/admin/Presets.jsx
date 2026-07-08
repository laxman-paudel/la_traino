import { useState, useEffect, useMemo } from "react";
import {
  getPresets,
  createPreset,
  updatePreset,
  deletePreset,
} from "../../api/admin";
import { useToast } from "../../context/ToastContext";
import PageHeader from "../../components/PageHeader";
import EmptyState from "../../components/EmptyState";
import ConfirmDialog from "../../components/ConfirmDialog";
import Pagination from "../../components/Pagination";
import { SkeletonCard } from "../../components/Skeleton";

const PAGE_SIZE = 8;

export default function AdminPresets() {
  const { addToast } = useToast();
  const [presets, setPresets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ name: "", description: "" });
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);

  useEffect(() => {
    getPresets()
      .then((res) => setPresets(res.data))
      .catch((err) =>
        setError(err.response?.data?.error || "Failed to load presets"),
      )
      .finally(() => setLoading(false));
  }, []);

  function openAdd() {
    setForm({ name: "", description: "" });
    setFieldErrors({});
    setError("");
    setModal("add");
  }

  function openEdit(preset) {
    setForm({ name: preset.name, description: preset.description || "" });
    setFieldErrors({});
    setError("");
    setModal({ type: "edit", id: preset.id });
  }

  function validateForm() {
    const errs = {};
    if (!form.name.trim()) errs.name = "Preset name is required";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSave(e) {
    e.preventDefault();
    setError("");
    if (!validateForm()) return;

    setSaving(true);
    try {
      if (modal === "add") {
        const res = await createPreset({
          name: form.name.trim(),
          description: form.description.trim() || undefined,
        });
        setPresets((prev) => [...prev, res.data]);
        addToast("Preset created successfully", "success");
      } else {
        const res = await updatePreset(modal.id, {
          name: form.name.trim(),
          description: form.description.trim() || undefined,
        });
        setPresets((prev) =>
          prev.map((p) => (p.id === modal.id ? res.data : p)),
        );
        addToast("Preset updated successfully", "success");
      }
      setModal(null);
    } catch (err) {
      const msg = err.response?.data?.error || "Failed to save preset";
      setError(msg);
      addToast(msg, "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    setDeleting(true);
    try {
      await deletePreset(id);
      setPresets((prev) => prev.filter((p) => p.id !== id));
      setDeleteTarget(null);
      addToast("Preset deleted successfully", "success");
    } catch (err) {
      const msg = err.response?.data?.error || "Failed to delete preset";
      setError(msg);
      addToast(msg, "error");
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  }

  const filtered = useMemo(() => {
    let result = [...presets];
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (p) => p.name.toLowerCase().includes(q) || (p.description || "").toLowerCase().includes(q),
      );
    }
    result.sort((a, b) => {
      if (sort === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
      if (sort === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
      if (sort === "name") return a.name.localeCompare(b.name);
      return 0;
    });
    return result;
  }, [presets, search, sort]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => { setPage(1); }, [search, sort]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <SkeletonCard rows={3} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manage Presets"
        subtitle="Create, edit and delete preset workouts"
        actions={
          <button
            type="button"
            onClick={openAdd}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition text-sm font-semibold shadow-sm shadow-indigo-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Preset
          </button>
        }
      />

      {error && (
        <div
          role="alert"
          className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm"
        >
          {error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-64">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search presets..."
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
          />
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm text-gray-700"
          aria-label="Sort presets"
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="name">Alphabetical</option>
        </select>
      </div>

      {paged.length === 0 ? (
        <EmptyState
          icon="dumbbell"
          title={search ? "No presets match your search" : "No presets yet"}
          message={search ? "Try a different search term." : "Create your first preset workout to get started."}
          action={
            !search ? (
              <button
                type="button"
                onClick={openAdd}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition text-sm font-semibold"
              >
                + Add Preset
              </button>
            ) : null
          }
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {paged.map((preset) => (
            <div
              key={preset.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-start justify-between gap-4 hover:shadow-md transition"
            >
              <div className="min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {preset.name}
                </h3>
                {preset.description && (
                  <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">
                    {preset.description}
                  </p>
                )}
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => openEdit(preset)}
                  className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition text-xs font-semibold"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(preset)}
                  className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition text-xs font-semibold"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md" role="dialog" aria-modal="true">
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              {modal === "add" ? "Add Preset" : "Edit Preset"}
            </h2>
            <p className="text-sm text-gray-500 mb-5">
              {modal === "add" ? "Create a new preset workout routine" : "Update the preset workout details"}
            </p>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => { setForm((f) => ({ ...f, name: e.target.value })); setFieldErrors((prev) => ({ ...prev, name: "" })); }}
                  className={`w-full px-3 py-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-gray-900 ${
                    fieldErrors.name ? "border-red-300 bg-red-50" : "border-gray-300"
                  }`}
                  placeholder="e.g. Beginner Full Body"
                  autoFocus
                />
                {fieldErrors.name && <p className="mt-1 text-xs text-red-500">{fieldErrors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-gray-900 resize-none"
                  placeholder="Brief description of this preset..."
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModal(null)} className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition font-medium text-sm">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold text-sm shadow-sm shadow-indigo-200">
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Preset"
        message={deleteTarget ? `Are you sure you want to delete "${deleteTarget.name}"? This action cannot be undone.` : ""}
        confirmLabel={deleting ? "Deleting..." : "Delete"}
        cancelLabel="Cancel"
        danger
        onConfirm={() => handleDelete(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
