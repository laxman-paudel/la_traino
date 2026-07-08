import { useState, useEffect } from "react";
import {
  getPresets,
  createPreset,
  updatePreset,
  deletePreset,
} from "../../api/admin";
import PageHeader from "../../components/PageHeader";
import EmptyState from "../../components/EmptyState";
import { SkeletonCard } from "../../components/Skeleton";

export default function AdminPresets() {
  const [presets, setPresets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ name: "", description: "" });
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);

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
      } else {
        const res = await updatePreset(modal.id, {
          name: form.name.trim(),
          description: form.description.trim() || undefined,
        });
        setPresets((prev) =>
          prev.map((p) => (p.id === modal.id ? res.data : p)),
        );
      }
      setModal(null);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to save preset");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    setDeleting(true);
    try {
      await deletePreset(id);
      setPresets((prev) => prev.filter((p) => p.id !== id));
      setDeleteConfirm(null);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to delete preset");
      setDeleteConfirm(null);
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <SkeletonCard rows={3} />
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
          className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-start gap-2.5"
        >
          <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {presets.length === 0 ? (
        <EmptyState
          icon="dumbbell"
          title="No presets yet"
          message="Create your first preset workout to get started."
          action={
            <button
              type="button"
              onClick={openAdd}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition text-sm font-semibold"
            >
              + Add Preset
            </button>
          }
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {presets.map((preset) => (
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
                  onClick={() => setDeleteConfirm(preset)}
                  className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition text-xs font-semibold"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

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
                {fieldErrors.name && (
                  <p className="mt-1 text-xs text-red-500">{fieldErrors.name}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-gray-900 resize-none"
                  placeholder="Brief description of this preset..."
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModal(null)}
                  className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition font-medium text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold text-sm shadow-sm shadow-indigo-200"
                >
                  {saving ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Saving...
                    </span>
                  ) : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm" role="alertdialog" aria-modal="true">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-gray-900 text-center mb-1">
              Delete Preset
            </h2>
            <p className="text-sm text-gray-500 text-center mb-6">
              Are you sure you want to delete <strong className="text-gray-700">{deleteConfirm.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition font-medium text-sm"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteConfirm.id)}
                disabled={deleting}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold text-sm shadow-sm shadow-red-200"
              >
                {deleting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Deleting...
                  </span>
                ) : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
